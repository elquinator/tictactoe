import './App.css';
import Board from './Board';
import Moves,{Premover,GameAutomation} from './Moves';
import React, { cloneElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GameInfo } from './GameInfo';
import _ from "lodash";

const hostName = window.location.host.split(':')[0];
const port = 3030;

const NS_DEBUG_NAMES = {
    "MOVE_RECORDER": false,
    "MOVE_CLICK": false,
    "MOVER_DEBUG": false,
    "SPEC_COMPARE": false,
    "SHIFT_DEBUG": true,
    "ERROR": true,
};

export const debugLog = (namespace, message, obj = null) => {
    if (NS_DEBUG_NAMES[namespace]) {
        console.log(`[${namespace}] ${message}`, obj);
    }
};

class BoardTree {
  constructor(parent,depth,row,column) {
    this.parent=parent
    this.depth=depth
    this.row=row
    this.column=column
    this.children=0
    this.wonBy=''
    this.isActive=true
    if (depth==0) {
      return 0
    }
    this.children=[]
    for (var child1=0;child1<3;child1++) {
      var temp=[]
      for (var child2=0;child2<3;child2++) {
        temp.push(new BoardTree(this,depth-1,child1,child2))
      }
      this.children.push(temp)
    }
  }
  getFullRoute(move) {
    var route=move
    var current=this
    while (current.parent!=null) {
      route=[current.row,current.column].concat(route)
      current=current.parent
    }
    return route
  }
  adjustActiveStatus(shiftedRoute) {
    if (this.parent==null) {
      this.isActive=true;
    }
    else if (this.parent.isActive==false) {
      this.isActive=false
    }
    else if (this.wonBy!=='') {
      this.isActive=false
    }
    else if (this.parent.children[shiftedRoute[shiftedRoute.length-(this.depth*2)]][shiftedRoute[shiftedRoute.length-(this.depth*2)+1]].wonBy!=='') {
      this.isActive=true
    }
    else if (this.row==shiftedRoute[shiftedRoute.length-(this.depth*2)] && this.column==shiftedRoute[shiftedRoute.length-(this.depth*2)+1]) {
      this.isActive=true
    }
    else {
      this.isActive=false
    }
  }
  setActiveStatus(shiftedRoute) {
    this.adjustActiveStatus(shiftedRoute)
    if (this.depth>1) {
      this.children.map((row)=>{row.map((board)=>{board.setActiveStatus(shiftedRoute)})})
    }
  }
}

function checkWin(toCheck) {
  const winconditions = [[[0, 0], [0, 1], [0, 2]], [[1, 0], [1, 1], [1, 2]], [[2, 0], [2, 1], [2, 2]], [[0, 0], [1, 0], [2, 0]], [[0, 1], [1, 1], [2, 1]], [[0, 2], [1, 2], [2, 2]], [[0, 2], [1, 1], [2, 0]], [[0, 0], [1, 1], [2, 2]]]
  for (let i=0; i<winconditions.length; i++) {
    if (toCheck.children[winconditions[i][0][0]][winconditions[i][0][1]].wonBy==toCheck.children[winconditions[i][1][0]][winconditions[i][1][1]].wonBy&&toCheck.children[winconditions[i][1][0]][winconditions[i][1][1]].wonBy==toCheck.children[winconditions[i][2][0]][winconditions[i][2][1]].wonBy&&toCheck.children[winconditions[i][0][0]][winconditions[i][0][1]].wonBy!="") {
      return true;
    }
  }
  return false;
}

function calculateShift(previousMove) {
  const route=previousMove[0].getFullRoute([previousMove[1],previousMove[2]]);
  const winDepth=previousMove[3];
  const length=route.length;
  const pre=route.splice(0,length-2*(winDepth+2));
  const suf=route.splice(2);
  return pre.concat(suf);
}

export default function App() {
  //'treeNode' is the board at which the click event happens
  const dimension=3;

  const players=['X','O'];
  const [moveList, setMoveList] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(players[0]);
  const [boardTree, setBoardTree] = useState(new BoardTree(null,dimension,0,0));
  const [previousMove, setPreviousMove] = useState([]);
  const [winDepth, setWinDepth] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [username, setUsername] = useState('');
  const [gameId, setGameId] = useState('');
  //this one never actually changes, take issues up with the Big Man
  const [playerIdentifier, setPlayerIdentifier] = useState('');
  const [playerNames, setPlayerNames] = useState([]);

    const move = useCallback((coordinates) => {
      // Create a fake DOM element if the real one doesn't exist
      const cellId = `cell-${coordinates.join('-')}`;
      let targetElement = document.getElementById(cellId);
      // Log the move for debugging
      //debugLog("MOVER_DEBUG", `Executing move: ${coordinates.join(',')} with player: ${currentPlayer || 'unknown'}`);
      if (targetElement.innerHTML === '') {
        targetElement.click(); 
      }
    }, []);

  const path = `game/${gameId}`;
  const url = `http://${hostName}:${port}/${path}`;
  useEffect(() => {
    let gameStartedFlag=false;
    const interval = setInterval(async () => {
      //get status on game start
      if (username !== '' && gameId !== '' && !gameStartedFlag) {
        console.log("game started check");
        const response = await fetch(url, { method: "GET" })
        const jsonResponse = await response.json();
        setPlayerNames([jsonResponse.playerX, jsonResponse.playerO]);
        gameStartedFlag = jsonResponse.gameStarted;
        setGameStarted(gameStartedFlag);
      }
      //set necessary info for game after start
      else if (gameStartedFlag) {
        console.log("move check")
        const response = await fetch(url, { method: "GET" });
        const jsonResponse = await response.json();
        const moveList = jsonResponse.moves;
        const coordinates=moveList[moveList.length-1]
        setCurrentPlayer(jsonResponse.currentPlayer);
        try {
          move(moveList[moveList.length-1])
        }
        catch (error) {
          //console.log("move failed to move: ", error);
          return;
        }
      }
      }, 1000);
  }, [username, gameId, setGameStarted]);

  const handleMove = useCallback((event, treeNode, row, column) => {
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
    treeNode.children[row][column].wonBy = currentPlayer;
    setMoveList(moveList.concat([treeNode.getFullRoute([row, column])]));
    event.target.innerHTML = currentPlayer;
    fetch(url, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'move',
        move: treeNode.getFullRoute([row, column]),
        newPlayer: (currentPlayer === 'X') ? 'O' : 'X'
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
    setCurrentPlayer(currentPlayer==='X'?'O':'X');
    setPreviousMove([treeNode,row,column,winDepth]);
    setBoardTree(boardTree);
  },[currentPlayer, boardTree, previousMove, players, moveList]);

  return (
    <div className="App" style={{ position: "relative", fontFamily: "monospace" }}>
      <div style={{
          backgroundColor: "#ddd"
        }}>
        {gameStarted&&(<h1>
          {playerNames[players.indexOf(currentPlayer)]} turn ({playerIdentifier===currentPlayer?"make a move":"waiting for move from other guy"})
        </h1>)}
      </div>
      <div style={{
        display:"flex"
      }}>
        {gameStarted ? <Moves moveList={moveList} />:''}
        {false&&gameStarted ? <Premover move={move} handleMove={handleMove} currentPlayer={currentPlayer} />:''}
        {username === '' ? <GameAutomation setUsername={setUsername} setGameId={setGameId} setPlayerIdentifier={setPlayerIdentifier} />:''}
        {username !== '' && gameStarted && (
          <>
            <GameInfo player1={playerNames[0]} player2={playerNames[1]} />
            <Board depth={dimension} row={0} column={0} handleMove={handleMove} treeNode={boardTree} winDepth={winDepth} previousMove={previousMove} dimension={dimension} />
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
      {((currentPlayer != playerIdentifier) && gameStarted) ? <div style={{ display: 'block', position: "absolute", top: 0, left: 0, height: "100%", width: "100%" }} /> : ''}
    </div>
  );
}