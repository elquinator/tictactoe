import './App.css';
import Board from './Board';
import Moves,{Premover,GameAutomation} from './Moves';
import React, { cloneElement, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { GameInfo } from './GameInfo';
import _ from "lodash";
import { getTreeNodeForCoords, calculateShift, checkWin, State, BoardTree } from './state';
import { PLAYERS, URL } from './constants';

const DEFAULT_DIM = 3;
export const StateContext = createContext({
  moveList: [], currentPlayer: 'X', boardTree: new BoardTree(null, DEFAULT_DIM, 0, 0),
  previousMove: [], winDepth: 0, gameStarted: false, username: '', gameId: '', playerIdentifier: '', playerNames: []
})

export function Game() {
  const {boardTree, url, gameId, username, setPlayerNames, setGameStarted, moveList, setMoveList, 
    currentPlayer, setWinDepth, setPreviousMove, setBoardTree, previousMove, gameStarted, playerNames, playerIdentifier,
    dimension, pathUrl } = useContext(StateContext)

  const move = useCallback((coordinates) => {
    // Create a fake DOM element if the real one doesn't exist
    const cellId = `cell-${coordinates.join('-')}`;
    let targetElement = document.getElementById(cellId);
    // Log the move for debugging
    //debugLog("MOVER_DEBUG", `Executing move: ${coordinates.join(',')} with player: ${currentPlayer || 'unknown'}`);
    // if (targetElement.innerHTML === '') {
    //   targetElement.click();
    // }
    console.log("move: ", coordinates);
    const treeNode = getTreeNodeForCoords(boardTree, coordinates).parent; // get the board the move was played on
    console.log("treeNode: ", treeNode);
    const pseudoEvent = { target: targetElement };
    console.log("pseudoEvent: ", pseudoEvent);
    handleMoveImpl(pseudoEvent, treeNode, coordinates[coordinates.length - 2], coordinates[coordinates.length - 1]);
  }, []);

  useEffect(() => {
    let gameStartedFlag = false;
    const startInterval = setInterval(async () => {
      //get status on game start
      if (username !== '' && gameId !== '' && !gameStartedFlag) {
        const response = await fetch(pathUrl, { method: "GET" })
        const jsonResponse = await response.json();
        setPlayerNames([jsonResponse.playerX, jsonResponse.playerO]);
        console.log("game started check    " + jsonResponse.playerX + '--' + jsonResponse.playerO);
        gameStartedFlag = jsonResponse.gameStarted;
        setGameStarted(gameStartedFlag);
      }
    }, 1000)
  }, [username, gameId, setGameStarted]);
  
  useEffect(() => {
    const moveInterval = setInterval(async () => {
      //set necessary info for game after start
      if (gameStarted) {
        console.log(`move check, id: ${playerIdentifier}, current player: ${currentPlayer}`);
        const response = await fetch(pathUrl, { method: "GET" });
        const jsonResponse = await response.json();
        const respMoveList = jsonResponse.moves;
        while (respMoveList.length > moveList.length) {
          try {
            console.log("updating moves....")
            console.log("movelist and resp move list")
            console.log(moveList)
            console.log(respMoveList)
            const coords = respMoveList[moveList.length];
            moveList.push(coords);
            setMoveList([...moveList]);
            console.log("moving: ", coords);
            setTimeout(() => {
              console.log("server update move")
              move(coords);
            }, 300);
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
  }, [gameStarted, moveList]);


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
    let winDepth = 0;
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
    treeNode.children[row][column].wonBy = currentPlayer;
    const newMove = treeNode.getFullRoute([row, column]);
    setMoveList([...moveList,newMove]);
    console.log(`THIS IS IMMEADIATE LIST AFTER MOVES:::   ${moveList}`)
    event.target.innerHTML = currentPlayer;
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

    let currentBoard=treeNode;
    let coords=[];
    while (checkWin(currentBoard)) {
      alert(`${currentPlayer} won!`);
      coords=[currentBoard.row,currentBoard.column];
      if (currentBoard.parent==null) {
        alert(`${currentPlayer} full win`)
        return
      }
      currentBoard=currentBoard.parent;
      //this line has changed according to "new standards":
      currentBoard.children[coords[0]][coords[1]].wonBy=currentPlayer;
      winDepth++;
    }

    boardTree.setActiveStatus(calculateShift([treeNode,row,column,winDepth]))

    setWinDepth(winDepth);
    setPreviousMove([treeNode,row,column,winDepth]);
    setBoardTree(boardTree);
  },[currentPlayer, boardTree, previousMove, PLAYERS, moveList, gameId]);

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
        {false&&gameStarted ? <Premover move={move} />:''}
        {username === '' ? <GameAutomation move={move} />:''}
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

  return (
    <StateContext.Provider value={{
      moveList, currentPlayer, boardTree, previousMove, winDepth, gameStarted, username, gameId, playerIdentifier, playerNames, dimension, pathUrl,
      setMoveList, setBoardTree, setPreviousMove, setWinDepth, setGameStarted, setUsername, setGameId, setPlayerIdentifier, setPlayerNames, setDimension
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
