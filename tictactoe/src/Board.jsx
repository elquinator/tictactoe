export default function Board(props) {
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
                        {props.depth == props.dimension ? <h1 style={{ display: "table-cell", height:"100%", verticalAlign: "middle", color:"rgb(134, 0, 0)"}}>{letters[row]}</h1>:''}
                        {columns.map((column)=>(
                            <td id={"cell-" + "-" + props.depth + "-" + props.row + "-" + props.column + "-" + row + "-" + column} style={{
                                borderBottom: row<2? `${props.depth*3+1}px solid black`:'',
                                borderLeft: column>0? `${props.depth*3+1}px solid black`:''
                             }}>
                                {props.depth>1 && (
                                    <Board depth={props.depth-1} row={row} column={column} handleMove={props.handleMove} treeNode={props.treeNode.children[row][column]} activeBoard={props.activeBoard} winDepth={props.winDepth} previousMove={props.previousMove} dimension={props.dimension} />
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
                                    </button>
                                )}
                                {row == 2 && props.depth == props.dimension ? <h1 style={{color:"rgb(134, 0, 0)"}}>{column+1}</h1> : ''}
                            </td>
                        ))}
                    </tr>
                ))}
            </table>
        </div>
    );
}