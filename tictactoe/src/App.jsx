import './App.css';
import Board from './Board';
import Moves,{Premover,GameAutomation} from './Moves';
import React, { cloneElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";

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

  const handleMove = useCallback((event,treeNode,row,column) => {
    //treeNode is always the parent board of the move played, not the move itself
    let winDepth=0;
    if (treeNode.children[row][column].wonBy!='') {
      alert("brotjer its takenm do you have eyeys");
      return
    }
    if (!treeNode.isActive) {
      alert("brotjer look at the previous move, do you even know the rulse");
      return
    }
    treeNode.children[row][column].wonBy=currentPlayer;
    setMoveList(moveList.concat([treeNode.getFullRoute([row,column])]));
    event.target.innerHTML=currentPlayer;

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
    setCurrentPlayer(players[(players.indexOf(currentPlayer)+1)%2]);
    setPreviousMove([treeNode,row,column,winDepth]);
    setBoardTree(boardTree);
  },[currentPlayer, boardTree, previousMove, players, moveList]);

  return (
    <div className="App">
      <div style={{
            backgroundColor: "#ddd"
        }}>
        <h1>
          Player {currentPlayer} turn
        </h1>
      </div>
      <div style={{
        display:"flex"
      }}>
        <Moves moveList={moveList} />
        <Premover handleMove={handleMove} currentPlayer={currentPlayer} />
        <GameAutomation />
        <Board depth={dimension} row={0} column={0} handleMove={handleMove} treeNode={boardTree} winDepth={winDepth} previousMove={previousMove} dimension={dimension} />
      </div>
    </div>
  );
}

