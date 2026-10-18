import {useContext} from "react";
import { StateContext } from "./App";
import logo from "./tictactoelogo.png"
import { DEBUGMODE } from "./constants";
import _ from "lodash";

export function MainMenu() {
    const { setGamemodeSelected } = useContext(StateContext)


    return (
        <div style={{
            width: "100%",
            display: "block"
        }}>
            <div style={{
                width: "100%",
                display: "block"
            }}>
                <img src={logo} style={{
                    scale: "50%",
                    width: "100%"
                }} />
                <h1 style={{
                    marginTop:"0px"
                }}>
                    play now!
                </h1>
            </div>
            <div style={{
                marginTop: "300px",
                width:"100%",
                alignContent: "center",
              }}>
                <button onClick={setGamemodeSelected.bind(this, 'createGame')} style={{
                    width: "250px",
                    height: "50px",
                    fontSize: "20px"
                }}>
                    create game
                </button>
                <button onClick={setGamemodeSelected.bind(this, 'joinGame')} style={{
                    width: "250px",
                    height: "50px",
                    fontSize: "20px"
                }}>
                    join game
                </button>
            </div>
            <div>
                <button onClick={setGamemodeSelected.bind(this, 'botGame')} style={{
                    width: "250px",
                    height: "50px",
                    fontSize: "20px"
                }}>
                    play bot
                </button>
            </div>
        </div>
    );
}

export default function Moves() {
    const { moveList, pathUrl, username, spectatorStatus, isUndoEnabled } = useContext(StateContext);
    const letters = ['A', 'B', 'C'];
    const undoMove = () => {
        fetch(pathUrl, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'undoMove',
                playerWhoRequestedUndo: username
            })
        })
    }
    const doMoves = () => {
        let moves = prompt("moves:");
        if (!moves) {
            return;
        }
        moves = moves.split(' ');
        let newMoves = [];
        for (const move of moves) {
            newMoves.push(move.split('').map((moveToken) => { const index = letters.indexOf(moveToken); return Number(index !== -1 ? index : moveToken-1) }));
        }
        fetch(pathUrl, {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'setMoves',
            moves: newMoves
          })
        })
    }
    return (
        <div style={{
            border:"5px solid #031433",
            paddingRight:"50px",
            backgroundColor:"#222222",
            fontFamily:"monospace"
        }}>
            <ol>
                {moveList.map((move) =>
                <li key={move} style={{
                    color:"white"
                }}>{move.map((coord,index) =>
                    index%2===0?letters[coord]:coord+1
                    )}</li>
                )}
            </ol>
            {!spectatorStatus && (<div>
                {isUndoEnabled && (<button onClick={undoMove}>
                    Request Undo Move
                </button>)}
                {DEBUGMODE && (<button onClick={doMoves}>
                    setMoveList
                </button>)}
            </div>)}
        </div>
    )
}

