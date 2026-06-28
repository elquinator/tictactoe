import './App.css';
import Board from './Board';
import Moves,{Premover,GameAutomation} from './Moves';
import React, { cloneElement, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { GameInfo } from './GameInfo';
import _ from "lodash";
import { getTreeNodeForCoords, calculateShift, checkWin, State, BoardTree } from './util';
import { PLAYERS, URL } from './constants';

const DEFAULT_DIM = 3;
export const StateContext = createContext({
  moveList: [], currentPlayer: 'X', boardTree: new BoardTree(null, DEFAULT_DIM, 0, 0),
  previousMove: [], winDepth: 0, gameStarted: false, username: '', gameId: '', playerIdentifier: '', playerNames: []
})

export function Game() {
  const {boardTree, url, gameId, username, setPlayerNames, setGameStarted, moveList, setMoveList, 
    currentPlayer, setWinDepth, setPreviousMove, setBoardTree, previousMove, gameStarted, playerNames, playerIdentifier,
    dimension, pathUrl, updateBoardTree } = useContext(StateContext)
  
  useEffect(() => {
    const moveInterval = setInterval(async () => {
      //set necessary info for game after start
      if (username !== '' && gameId !== '') {
        const response = await fetch(pathUrl, { method: "GET" });
        const jsonResponse = await response.json();
        const respMoveList = jsonResponse.moves;
        if (!gameStarted) {
          setPlayerNames([jsonResponse.playerX, jsonResponse.playerO]);
          setGameStarted(jsonResponse.gameStarted);
        }
        if (respMoveList.length !== moveList.length) {
          try {
            updateBoardTree(respMoveList);
          }
          catch (error) {
            console.log("move failed to move: ", error);
            return;
          }
        }
      }
    }, 1000);
    return () => {
      console.log(`clearing interval..`)
      clearInterval(moveInterval);
    }
  }, [gameStarted, moveList, username, gameId, setGameStarted]);


  const handleMove = useCallback((event, treeNode, row, column) => {
    // if our turn (x on even, o on odd)
    if (playerIdentifier == currentPlayer) {
        handleMoveImpl(event, treeNode, row, column);
    } else {
        alert("it's not your turn");
    }
  });

  const handleMoveImpl = useCallback((event, treeNode, row, column) => {
    //treeNode is always the parent board of the move played, not the move itself
    if (treeNode.children[row][column].wonBy != '') {
      alert("brotjer its takenm do you have eyeys");
      return;
    }
    if (!treeNode.isActive) {
      alert("brotjer look at the previous move, do you even know the rulse");
      return;
    }
    //valid move
    console.log(`currentplayer:    ~~~ ~ ~ ~ ~    c c c:   ${currentPlayer}`)
    //treeNode.children[row][column].wonBy = currentPlayer;
    const newMove = treeNode.getFullRoute([row, column]);
    const newMoveList = [...moveList, newMove];
    updateBoardTree(newMoveList);
    console.log(`THIS IS IMMEADIATE LIST AFTER MOVES:::   ${newMoveList}`)
    fetch(pathUrl, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'move',
        move: treeNode.getFullRoute([row, column]),
      })
    })
    //console.log("this is impornatn nonw")
    //console.log(calculateShift([treeNode,row,column,winDepth]))
  },[currentPlayer, boardTree, PLAYERS, moveList, gameId]);

  return (
    <div className="App" style={{ position: "relative", fontFamily: "monospace" }}>
      <div style={{
          backgroundColor: "#ddd"
        }}>
        {gameStarted&&(<h1>
          {playerNames[PLAYERS.indexOf(currentPlayer)]} turn ({playerIdentifier===currentPlayer?"make a move":"waiting for move from other guy"})
        </h1>)}
      </div>
      <div style={{
        display:"flex"
      }}>
        {gameStarted ? <Moves/>:''}
        {false&&gameStarted ? <Premover/>:''}
        {username === '' ? <GameAutomation/>:''}
        {username !== '' && gameStarted && (
          <>
            <GameInfo/>
            <Board depth={dimension} row={0} column={0} handleMove={handleMove} treeNode={boardTree} />
          </>
        )}
        {username !== '' && !gameStarted && (
          <div style={{
            width:"100%",
            alignContent: "center"
          }}>
            <h1>username: {username}</h1>
            <h1>player: {playerIdentifier}</h1>
            <h2>waiting for another player...</h2>
            <p1>gameID: {gameId}</p1>
          </div>
        )}
      </div>
    </div>
  );
}

export function StateProvider({ children }) {
  const [moveList, setMoveList] = useState([]);
  const [boardTree, setBoardTree] = useState(new BoardTree(null,DEFAULT_DIM,0,0));
  const [previousMove, setPreviousMove] = useState([]);
  const [winDepth, setWinDepth] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [username, setUsername] = useState('');
  const [gameId, setGameId] = useState('');
  //this one never actually changes, take issues up with the Big Man
  const [playerIdentifier, setPlayerIdentifier] = useState('');
  const [playerNames, setPlayerNames] = useState([]);
  const [dimension, setDimension] = useState(DEFAULT_DIM);
  const pathUrl = useMemo(() => {
    return URL+'/'+gameId
  }, [gameId]);
  const currentPlayer = useMemo(() => {
    return (PLAYERS[moveList.length%2])
  }, [moveList])
  // ill be real i have no idea what is going on atp
  // please help
  const setNewBoardTree = useMemo(() => {
    for (let moveIndex = boardTree.movesPlayed; moveIndex < moveList.length; moveIndex++) {
      boardTree.movesPlayed = boardTree.movesPlayed + 1;
      getTreeNodeForCoords(boardTree, moveList[moveIndex]).wonBy = (moveIndex % 2 ? 'O' : 'X');
    }
    console.log(boardTree)
    setBoardTree(boardTree)
    //boardTree.setActiveStatus()
    return 0;
  }, [moveList])
  const updateBoardTree = useCallback((moveList) => {
    setMoveList(moveList);
    for (let moveIndex = boardTree.numOfMovesPlayed; moveIndex < moveList.length; moveIndex++) {
      const currentMove = moveList[moveIndex];
      const treeNode = getTreeNodeForCoords(boardTree, moveList[moveIndex].slice(0, moveList[moveIndex].length - 2));
      let currentBoard = treeNode;
      let winDepth = 0;
      let coords = [];
      currentBoard.children[currentMove[currentMove.length - 2]][currentMove[currentMove.length - 1]].wonBy = currentPlayer;
      while (checkWin(currentBoard)) {
        coords = [currentBoard.row, currentBoard.column];
        if (currentBoard.parent == null) {
          boardTree.wonBy = currentPlayer;
          break;
        }
        currentBoard = currentBoard.parent;
        //this line has changed according to "new standards":
        currentBoard.children[coords[0]][coords[1]].wonBy = currentPlayer;
        winDepth++;
      }
      boardTree.numOfMovesPlayed = boardTree.numOfMovesPlayed + 1;
      getTreeNodeForCoords(boardTree, currentMove).wonBy = currentPlayer;
      boardTree.setActiveStatus(calculateShift([treeNode, currentMove[currentMove.length - 2], currentMove[currentMove.length - 1], winDepth]));
    }
    console.log(boardTree);
    setBoardTree(_.cloneDeep(boardTree));
    return 0;
  }, [boardTree, currentPlayer])

  return (
    <StateContext.Provider value={{
      moveList, currentPlayer, boardTree, previousMove, winDepth, gameStarted, username, gameId, playerIdentifier, playerNames, dimension, pathUrl,
      setMoveList, setBoardTree, setPreviousMove, setWinDepth, setGameStarted, setUsername, setGameId, setPlayerIdentifier, setPlayerNames, setDimension,
      updateBoardTree
    }}>
      {children}
    </StateContext.Provider>
  );
}

export default function App() {
  const [dimension, setDimension] = useState(3);
  return (
    <StateProvider>
      <Game/>
    </StateProvider>
  )
}
