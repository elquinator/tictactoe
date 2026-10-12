import './App.css';
import Board from './Board';
import Moves,{Premover,GameAutomation} from './Moves';
import React, { cloneElement, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { GameInfo } from './GameInfo';
import _ from "lodash";
import { getTreeNodeForCoords, calculateShift, checkWin, BoardTree, evaluateMovesOnBoardTree } from './util';
import { PLAYERS, URL } from './constants';

const DEFAULT_DIM = 3;
export const StateContext = createContext({
  moveList: [], currentPlayer: 'X', boardTree: new BoardTree(null, DEFAULT_DIM, 0, 0),
  winDepth: 0, gameStarted: false, username: '', gameId: '', playerIdentifier: '', playerNames: []
})


export function Game() {
  const {boardTree, url, gameId, username, setPlayerNames, setGameStarted, moveList, setMoveList, 
    currentPlayer, setWinDepth, setBoardTree, gameStarted, playerNames, playerIdentifier,
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
        if ((jsonResponse.playerWhoRequestedUndo !== username && jsonResponse.playerWhoRequestedUndo !== '') && (username === jsonResponse.playerO || username === jsonResponse.playerX)) {
          fetch(pathUrl, {
            method: "PUT",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'undoMove',
              playerWhoRequestedUndo: username,
              confirmUndo: null
            })
          })
          const undoConfirm = window.confirm(`${jsonResponse.playerWhoRequestedUndo} has requested a undo. Would you like to accept?`);
          fetch(pathUrl, {
            method: "PUT",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'undoMove',
              playerWhoRequestedUndo: username,
              confirmUndo: undoConfirm
            })
          })
        }
        else if (respMoveList.length !== moveList.length) {
          updateBoardTree(respMoveList, boardTree);
        }
      }
    }, 1000);
    return () => {
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

  const handleMoveImpl = useCallback( async (event, treeNode, row, column) => {
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
    //treeNode.children[row][column].wonBy = currentPlayer;
    const newMove = treeNode.getFullRoute([row, column]);
    const newMoveList = [...moveList, newMove];
    updateBoardTree(newMoveList, boardTree);
    const response = await fetch(pathUrl, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'move',
        move: treeNode.getFullRoute([row, column]),
      })
    })
    const jsonResponse = await response.json();
    console.log(jsonResponse);
    if (jsonResponse.error) {
      // move is invalid server side
      console.log("player cheated")

      // undo move
      newMoveList.pop()
      updateBoardTree(newMoveList, boardTree);
      alert("cheating is not acceptable.")
      return;
    }
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
  const [winDepth, setWinDepth] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [username, setUsername] = useState('');
  const [gameId, setGameId] = useState('');
  //this one never actually changes, take issues up with the Big Man
  const [playerIdentifier, setPlayerIdentifier] = useState('');
  const [playerNames, setPlayerNames] = useState([]);
  const [gameDimension, setGameDimension] = useState(DEFAULT_DIM);
  const [spectatorStatus, setSpectatorStatus] = useState(false);
  const pathUrl = useMemo(() => {
    return URL+'/'+gameId
  }, [gameId]);
  const currentPlayer = useMemo(() => {
    return (PLAYERS[moveList.length%2])
  }, [moveList])
  // ill be real i have no idea what is going on atp
  // please help
  const updateBoardTree = useCallback((respMoveList, boardTree) => {
    setMoveList(respMoveList);
    if (moveList.length > respMoveList.length) {
      const wipedTree = new BoardTree(null, gameDimension, 0, 0);
      boardTree = evaluateMovesOnBoardTree(moveList, respMoveList, wipedTree);
    }
    else {
      boardTree = evaluateMovesOnBoardTree(moveList, respMoveList, boardTree);
    }
    setBoardTree(_.cloneDeep(boardTree));
    return 0;
  }, [])

  return (
    <StateContext.Provider value={{
      moveList, currentPlayer, boardTree, winDepth, gameStarted, username, gameId, playerIdentifier, playerNames, gameDimension, pathUrl, spectatorStatus,
      setMoveList, setBoardTree, setWinDepth, setGameStarted, setUsername, setGameId, setPlayerIdentifier, setPlayerNames, setGameDimension,
      updateBoardTree, setSpectatorStatus
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
