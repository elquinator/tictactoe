import { useContext } from "react";
import { StateContext } from "./App";

export default function Board(props) {
    const { dimension, winDepth, previousMove, moveList } = useContext(StateContext)
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
            padding: `${(props.depth+1)*25}px`,
            border: boardActiveFlag? "1px solid green":"",
            backgroundColor: boardActiveFlag? "green":"#ddd"
        }}>
            <table>
                {rows.map((row)=>(
                    <tr>
                        {props.depth == dimension ? <h1 style={{ display: "table-cell", height:"100%", verticalAlign: "middle", color:"rgb(134, 0, 0)"}}>{letters[row]}</h1>:''}
                        {columns.map((column)=>(
                            <td id={"cell-" + "-" + props.depth + "-" + props.row + "-" + props.column + "-" + row + "-" + column} style={{
                                borderBottom: row<2? `${props.depth*3+1}px solid black`:'',
                                borderLeft: column>0? `${props.depth*3+1}px solid black`:''
                             }}>
                                {props.depth>1 && (
                                    <>
                                        <Board depth={props.depth-1} row={row} column={column} handleMove={props.handleMove} treeNode={props.treeNode.children[row][column]} winDepth={winDepth} previousMove={previousMove} dimension={dimension} />
                                        {//true && (
                                         //   <div style={{position: "absolute"}}>
                                         //       <h>{columns[column]}</h>
                                         //   </div>
                                        //)
                                        }
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
                                        }}>
                                        {moveList.findIndex((arr) => arr.join('') === props.treeNode.getFullRoute([row, column]).join('')) > -1 && (moveList.findIndex((arr) => arr.join('') === props.treeNode.getFullRoute([row, column]).join('')) % 2 ? 'O' : 'X')}
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