import {useCallback, useContext} from "react";
import { debugLog, StateContext } from "./App";
import logo from "./tictactoelogo.png"
import { HOSTURL, DEBUGMODE } from "./constants";
import { BoardTree } from "./util";
import _ from "lodash";

export function MainMenu() {
    const { setUsername, setGameDimension, setBoardTree, setButtonContext, setIsInfoRecieved } = useContext(StateContext)

    function getAndSetGameDimension() {
        const gameDimension = parseInt(prompt("dimension of game you want to create:"));
        setGameDimension(gameDimension);
        setBoardTree(_.cloneDeep(new BoardTree(null, gameDimension, 0, 0)));
    }

    function getAndSetUsername() {
        let username = prompt("Username:");
        username = username === '' ? "unnamedLoser" : username;
        setUsername(username);
    }

    function getUserInfo(callType) {
        setButtonContext(callType);
        //switch (callType) {
        //    case "createGame":
        //        getAndSetGameDimension();
        //        //getAndSetUsername();
        //        break;
        //    case "joinGame":
        //        //getAndSetUsername();
        //        break;
        //    case "botGame":
        //        getAndSetGameDimension();
        //        //getAndSetUsername();
        //        break;
        //    default:
        //        console.log("what")
        //        return;
        //}
        // this is kind of really funny if i leave this here for now
        setIsInfoRecieved(true);
    }

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
                <button onClick={getUserInfo.bind(this, 'createGame')} style={{
                    width: "250px",
                    height: "50px",
                    fontSize: "20px"
                }}>
                    create game
                </button>
                <button onClick={getUserInfo.bind(this, 'joinGame')} style={{
                    width: "250px",
                    height: "50px",
                    fontSize: "20px"
                }}>
                    join game
                </button>
            </div>
            <div>
                <button onClick={getUserInfo.bind(this, 'botGame')} style={{
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
    const { moveList, pathUrl, username, spectatorStatus } = useContext(StateContext);
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
                <button onClick={undoMove}>
                    Request Undo Move
                </button>
                {DEBUGMODE && (<button onClick={doMoves}>
                    setMoveList
                </button>)}
            </div>)}
        </div>
    )
}

