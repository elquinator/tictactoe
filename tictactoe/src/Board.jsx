import { useContext } from "react";
import { StateContext } from "./App";
import O from "./O.png"
import X from "./X.png"
const IMAGES = {
    "X": X,
    "O": O
}

export default function Board(props) {
    const { dimension, winDepth, previousMove, playerIdentifier, currentPlayer } = useContext(StateContext)
    const rows=[0,1,2];
    const columns=[0,1,2];
    const letters=['A','B','C']
    let wonByFlag=false;
    const boardActiveFlag=(props.treeNode.isActive && props.depth==1);
    if (props.treeNode.wonBy!='') {
        wonByFlag=true;
    }
    return (
        <div id={"board-" + props.depth + "-" + props.row + "-" + props.column} style={{
            padding: `${(props.depth+1)*15}px`,
            border: (boardActiveFlag && currentPlayer === playerIdentifier) ? "1px solid green" : "",
            backgroundColor: (boardActiveFlag && currentPlayer === playerIdentifier) ? "green" : "#ddd",
            position: "relative"
        }}>
            <table>
                {rows.map((row) => (
                    <tr>
                        {props.depth == dimension ? <h1 style={{ display: "table-cell", height:"100%", verticalAlign: "middle", color:"rgb(134, 0, 0)"}}>{letters[row]}</h1>:''}
                        {columns.map((column)=>(
                            <td id={"cell-" + "-" + props.depth + "-" + props.row + "-" + props.column + "-" + row + "-" + column} style={{
                                borderBottom: row<2? `${props.depth*3+1}px solid black`:'',
                                borderLeft: column > 0 ? `${props.depth * 3 + 1}px solid black` : '',
                                position: "relative",
                                margin: "0px",
                                padding: "0px"
                             }}>
                                {props.depth>1 && (
                                    <>
                                        <Board depth={props.depth-1} row={row} column={column} handleMove={props.handleMove}
                                         treeNode={props.treeNode.children[row][column]} winDepth={winDepth} previousMove={previousMove} dimension={dimension}
                                         style= {{position: "absolute"}} />
                                        {props.depth>0 && (<div style={{
                                            width: "100%",
                                            height: "100%",
                                            top: "0px",
                                            left: "0px",
                                            position: "absolute",
                                            pointerEvents: "none"
                                        }}>
                                            {props.treeNode.children[row][column].wonBy !== '' && (
                                                <img src={(props.depth > 1) ? IMAGES[props.treeNode.children[row][column].wonBy] : ''} style={{ height: "100%", width: "100%" }} />)}
                                        </div>)}
                                    </>
                                )}
                              
                                {props.depth===1 && (
                                    <button id={`cell-${props.treeNode.getFullRoute([row,column]).join('-')}`} onClick={(event) => {
                                            props.handleMove(event,props.treeNode,row,column)
                                        }
                                    } 
                                    style={{
                                        width: "45px",
                                        height: "45px",
                                        border: 0,
                                        margin: "2px",
                                        fontSize: "30px"
                                        }} disabled = {!props.treeNode.children[row][column].isActive}>
                                        {props.treeNode.children[row][column].wonBy}
                                    </button>
                                )}
                                {row == 2 && props.depth == dimension ? <h1 style={{color:"rgb(134, 0, 0)"}}>{column+1}</h1> : ''}
                            </td>
                        ))}
                    </tr>
                ))}
            </table>
        </div>
    );
}
