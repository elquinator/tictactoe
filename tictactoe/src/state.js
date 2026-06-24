import { hostName, port } from "./constants"

export class BoardTree {
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

//export class State {
//  constructor(moveList, currentPlayer, boardTree, previousMove, winDepth, gameStarted, username, gameId, playerIdentifier, playerNames) {
//    this.moveList = moveList
//    this.currentPlayer = currentPlayer
//    this.boardTree = boardTree
//    this.previousMove = previousMove
//    this.winDepth = winDepth
//    this.gameStarted = gameStarted
//    this.username = username
//    this.gameId = gameId
//    this.playerIdentifier = playerIdentifier
//    this.playerNames = playerNames
//    this.path = `game/${this.gameId}`;
//    this.url = `http://${hostName}:${port}/${this.path}`;
//    }
//    setPlayerNames(player1, player2) {
//        this.playerNames = [player1, player2];
//    }
//    setGameStarted(flag) {
//        this.gameStarted = flag;
//    }
//    setCurrentPlayer(player) {
//        this.currentPlayer = player;
//    }
//    setMoveList(moveList) {
//        this.moveList = moveList;
//    }
//    isOurMove() {
//        return this.currentPlayer === "X" && this.moveList.length % 2 === 0 || this.currentPlayer === "O" && this.moveList.length % 2 !== 0;
//    }
//    setWinDepth(winDepth) {
//        this.winDepth = winDepth;
//    }
//    setPreviousMove(previousMove) {
//        this.previousMove = previousMove;
//    }
//    setBoardTree(boardTree) {
//        this.boardTree = boardTree;
//    }
//    setUsername(username) {
//        this.username = username;
//    }
//    setGameId(gameId) {
//        this.gameId = gameId;
//    }
//    setPlayerIdentifier(Id) {
//        this.playerIdentifier = Id;
//    }
//}



export function checkWin(toCheck) {
  const winconditions = [[[0, 0], [0, 1], [0, 2]], [[1, 0], [1, 1], [1, 2]], [[2, 0], [2, 1], [2, 2]], [[0, 0], [1, 0], [2, 0]], [[0, 1], [1, 1], [2, 1]], [[0, 2], [1, 2], [2, 2]], [[0, 2], [1, 1], [2, 0]], [[0, 0], [1, 1], [2, 2]]]
  for (let i=0; i<winconditions.length; i++) {
    if (toCheck.children[winconditions[i][0][0]][winconditions[i][0][1]].wonBy==toCheck.children[winconditions[i][1][0]][winconditions[i][1][1]].wonBy&&toCheck.children[winconditions[i][1][0]][winconditions[i][1][1]].wonBy==toCheck.children[winconditions[i][2][0]][winconditions[i][2][1]].wonBy&&toCheck.children[winconditions[i][0][0]][winconditions[i][0][1]].wonBy!="") {
      return true;
    }
  }
  return false;
}

export const getTreeNodeForCoords = (boardTreeRoot, coordinates) => {
    if (boardTreeRoot.children) {
        return getTreeNodeForCoords(boardTreeRoot.children[coordinates[0]][coordinates[1]], coordinates.slice(2));
    } else {
        return boardTreeRoot;
    }
};

export function calculateShift(previousMove) {
  const route=previousMove[0].getFullRoute([previousMove[1],previousMove[2]]);
  const winDepth=previousMove[3];
  const length=route.length;
  const pre=route.splice(0,length-2*(winDepth+2));
  const suf=route.splice(2);
  return pre.concat(suf);
}
