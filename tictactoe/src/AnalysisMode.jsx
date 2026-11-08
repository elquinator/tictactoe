import { StateContext } from "./App"
import { useCallback, useContext, useState } from "react";
import Board from "./Board";
import { GetDimension } from "./GameStatusScreens";
import _ from "lodash"
import { HOSTURL } from "./constants";
import { evaluateMoveOnBoardTree } from "./util";

function TokenSelector() {
    const { analysisModeToken, setAnalysisModeToken, botPlayingAs, setBotPlayingAs } = useContext(StateContext);
    const handleButtonChange = (event) => {
        if (event.target.name === "player") {
            setAnalysisModeToken(event.target.value);
        }
        else {
            setBotPlayingAs(event.target.value);
        }
    }
    const buttonStyle = {
        height: '10px',
        width: '10px'
    }
    const labelStyle = {
        fontSize: '15px',
        marginLeft: '20px'
    }
    return (
        <div>
            <p>choose your symbol</p>
            <label style={labelStyle}>
                <input 
                    type="radio" 
                    name="player" 
                    value="X" 
                    checked={analysisModeToken === 'X'} 
                    onChange={handleButtonChange}
                    style={buttonStyle}
                /> X
            </label>
            <label style={labelStyle}>
                <input 
                    type="radio"
                    name="player"
                    value="O"
                    checked={analysisModeToken === 'O'}
                    onChange={handleButtonChange}
                    style={buttonStyle}     
                /> O
            </label>
            <label style={labelStyle}>
                <input 
                    type="radio" 
                    name="player" 
                    value="" 
                    checked={analysisModeToken === ''} 
                    onChange={handleButtonChange}
                    style={buttonStyle}
                /> blank
            </label>
            <p>choose bot's symbol</p>
            <label style={labelStyle}>
                <input 
                    type="radio" 
                    name="bot" 
                    value="X" 
                    checked={botPlayingAs === 'X'} 
                    onChange={handleButtonChange}
                    style={buttonStyle}
                /> X
            </label>
            <label style={labelStyle}>
                <input 
                    type="radio"
                    name="bot"
                    value="O"
                    checked={botPlayingAs === 'O'}
                    onChange={handleButtonChange}
                    style={buttonStyle}     
                /> O
            </label>
        </div>
    )
}

function boardToObject(board) {
  const obj = {
    depth: board.depth,
    row: board.row,
    column: board.column,
    wonBy: board.wonBy,
    isActive: board.isActive,
    children: board.depth === 0 ? 0 : []
  }
  if (board.children === 0) {
    return obj;
  }
  else {
    for (let row = 0; row < 3; row++) {
      const rowChildren = [];
      rowChildren.length = 0;
      for (let column = 0; column < 3; column++) {
        rowChildren.push(boardToObject(board.children[row][column]));
      }
      obj.children.push(rowChildren)
    }
    return obj;
  }
}

export function AnalysisMode() {
    const { analysisModeToken, setAnalysisMode, gameDimension, boardTree, setBoardTree, botPlayingAs } = useContext(StateContext);
    const [scores, setScores] = useState({});

    const updateBoardTree = useCallback((analysisModeToken, move, boardTree) => {
        boardTree = evaluateMoveOnBoardTree(analysisModeToken, move, boardTree);
        setBoardTree(_.cloneDeep(boardTree));
        return 0;
    }, [])

    const handleMove = useCallback((treeNode, row, column) => {
        const newMove = treeNode.getFullRoute([row, column]);
//        const newMoveList = [...moveList, newMove];
//        setMoveList(newMoveList);
        updateBoardTree(analysisModeToken, newMove, boardTree);
    }, [boardTree, analysisModeToken]);

    const analyzePosition = useCallback(async () => {
        const response = await fetch(`${HOSTURL}/analyze`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                board: boardToObject(boardTree),
                botPlayingAs: botPlayingAs
            })
        })
        const jsonResponse = await response.json()
        setScores(jsonResponse.moveScores)
    }, [gameDimension, boardTree, botPlayingAs])

    return (
        <div>
            <GetDimension />
            <TokenSelector />
            <div>
                {JSON.stringify(scores)}
            </div>
            <Board depth={gameDimension} row={0} column={0} handleMove={handleMove} treeNode={boardTree} />
            <button onClick={analyzePosition}>
                submit board for analysis
            </button>
            <button onClick={setAnalysisMode.bind(this, false)}>
                back
            </button>
        </div>
    )
}