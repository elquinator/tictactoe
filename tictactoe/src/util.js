import { hostName, port, PLAYERS } from "./constants"

export class BoardTree {
    constructor(parent,depth,row,column) {
        this.parent=parent
        this.depth=depth
        this.row=row
        this.column=column
        this.children=0
        this.wonBy=''
        this.isActive = true
        this.numOfMovesPlayed = 0;
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
    //  target board is board to go to in reference to the rules of ultimate tictactoe
    const targetBoard = this.parent === null ? null : this.parent.children[shiftedRoute[shiftedRoute.length - (this.depth * 2)]][shiftedRoute[shiftedRoute.length - (this.depth * 2) + 1]];
    // if i am the top layer board, i am active 
    if (this.parent == null) {
      this.isActive = true;
    }
    // if my parent is not active, i cannot be active
    else if (this.parent.isActive === false) {
      this.isActive = false;
    }
    // if i am a taken board, i am not active
    else if (this.wonBy !== '') {
      this.isActive=false
    }
    // if target board is already won or fully taken, allow any board on same layer to be active except the one that is fully taken or won  
    else if (targetBoard.wonBy!=='' || (targetBoard.children.every((row) => {return row.every((board) => {return board.wonBy !== ''})}) && !(this.children.every((row) => {return row.every((board) => {return board.wonBy !== ''})})))) {
      this.isActive=true
    }
    // if i am the board that should be active by rules of the game, i am active
    else if (this.row==shiftedRoute[shiftedRoute.length-(this.depth*2)] && this.column==shiftedRoute[shiftedRoute.length-(this.depth*2)+1]) {
      this.isActive=true
    }
    // if none of these cases are true, i am not active
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
  //console.log("this is the board tree passed in")
  //console.log(boardTreeRoot)
  //console.log("COORDS::")
  //console.log(coordinates)
    if (coordinates.length>0) {
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

