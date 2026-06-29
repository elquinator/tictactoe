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
    gameDimension, pathUrl, updateBoardTree, setGameDimension } = useContext(StateContext)
  
  useEffect(() => {
    const moveInterval = setInterval(async () => {
      //set necessary info for game after start
      if (username !== '' && gameId !== '') {
        const response = await fetch(pathUrl, { method: "GET" });
        const jsonResponse = await response.json();
        const respMoveList = jsonResponse.moves;
        if (!gameStarted) {
          const newBoardTree = _.cloneDeep(new BoardTree(null, jsonResponse.gameDimension, 0, 0));
          setPlayerNames([jsonResponse.playerX, jsonResponse.playerO]);
          setGameStarted(jsonResponse.gameStarted);
          setGameDimension(jsonResponse.gameDimension);  
          setBoardTree(newBoardTree);
          updateBoardTree(respMoveList, newBoardTree);

        }
        else if (respMoveList.length !== moveList.length) {
          updateBoardTree(respMoveList, boardTree);
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
    updateBoardTree(newMoveList, boardTree);
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
            <Board depth={gameDimension} row={0} column={0} handleMove={handleMove} treeNode={boardTree} />
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
  const [gameDimension, setGameDimension] = useState(DEFAULT_DIM);
  const pathUrl = useMemo(() => {
    return URL+'/'+gameId
  }, [gameId]);
  const currentPlayer = useMemo(() => {
    return (PLAYERS[moveList.length%2])
  }, [moveList])
  // ill be real i have no idea what is going on atp
  // please help
  const updateBoardTree = useCallback((moveList, boardTree) => {
    setMoveList(moveList);
    console.log(`movelist length: ${moveList.length}, boardtreenum: ${boardTree.numOfMovesPlayed}`)
    for (let moveIndex = boardTree.numOfMovesPlayed; moveIndex < moveList.length; moveIndex++) {
      const playerCurrent = (moveIndex % 2 === 0) ? 'X' : 'O';
      console.log(moveIndex)
      const currentMove = moveList[moveIndex];
      console.log(currentMove)
      const treeNode = getTreeNodeForCoords(boardTree, moveList[moveIndex].slice(0, moveList[moveIndex].length - 2));
      let currentBoard = treeNode;
      let winDepth = 0;
      let coords = [];
      currentBoard.children[currentMove[currentMove.length - 2]][currentMove[currentMove.length - 1]].wonBy = playerCurrent;
      while (checkWin(currentBoard)) {
        coords = [currentBoard.row, currentBoard.column];
        if (currentBoard.parent == null) {
          boardTree.wonBy = playerCurrent;
          alert(`${playerCurrent} won the game!`);
          break;
        }
        currentBoard = currentBoard.parent;
        //this line has changed according to "new standards":
        currentBoard.children[coords[0]][coords[1]].wonBy = playerCurrent;
        winDepth++;
      }
      boardTree.numOfMovesPlayed = boardTree.numOfMovesPlayed + 1;
      getTreeNodeForCoords(boardTree, currentMove).wonBy = playerCurrent;
      console.log(boardTree)
      boardTree.setActiveStatus(calculateShift([treeNode, currentMove[currentMove.length - 2], currentMove[currentMove.length - 1], winDepth]));
    }
    console.log(boardTree);
    setBoardTree(_.cloneDeep(boardTree));
    return 0;
  }, [])

  return (
    <StateContext.Provider value={{
      moveList, currentPlayer, boardTree, previousMove, winDepth, gameStarted, username, gameId, playerIdentifier, playerNames, gameDimension, pathUrl,
      setMoveList, setBoardTree, setPreviousMove, setWinDepth, setGameStarted, setUsername, setGameId, setPlayerIdentifier, setPlayerNames, setGameDimension,
      updateBoardTree
    }}>
      {children}
    </StateContext.Provider>
  );
}

export default function App() {
  return (
    <StateProvider>
      <Game/>
    </StateProvider>
  )
}
