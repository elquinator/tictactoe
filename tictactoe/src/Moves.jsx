import {useCallback} from "react";
import { debugLog } from "./App";
import logo from "./tictactoelogo.png"

export function GameAutomation(props) {
    const hostName = window.location.host.split(':')[0];
    const port = 3030;

    const createGame = useCallback(async() => {
        //const username = prompt("Username:");
        //props.setUsername(username);
        const path = "games";
        const url = `http://${hostName}:${port}/${path}`;
        const response = await fetch(url, {
            method: "POST",
            body: {
            
            }
        });
        const jsonResponse = await response.json();
        props.setGameId(jsonResponse.gameID);
        //joinGame(gameID);
        console.log("Got response ", jsonResponse.gameID);
    }, [props]);

    const joinGame = useCallback(async () => {
        let gameId = props.gameId;
        if (props.gameId === '') {
            gameId = prompt("gameID of game youre trying to join:");
            props.setGameId(gameId);
        }
        const username = prompt("Username:");
        props.setUsername(username);
        const path = `game/${gameId}`;
        const url = `http://${hostName}:${port}/${path}`;
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'join',
                playerName: 'me'
            })
        });
        console.log("Got response ", response);
    }, [props]);

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
                <button onClick={createGame} style={{
                    width: "250px",
                    height: "50px",
                    fontSize: "20px"
                }}>
                    create game
                </button>
                <button onClick={joinGame} style={{
                    width: "250px",
                    height: "50px",
                    fontSize: "20px"
                }}>
                    join game
                </button>
            </div>
        </div>
    );
}

export function Premover(props) {
    const premover = useCallback((moveIndex) => {
        // we're going to fake out event and then find the right treemove by coordinate
        // must assume board size since this is NOT a generic debugging tool: depth = 3
        // here's the dillio: coordinates = [topx, topy, nextx, nexty, nextx, nexty, row, column]
        // Use setTimeout to handle asynchronous state updates
        // This ensures each move is processed completely before the next one
        const moves = [
            // pattern 0: normal win move pattern: move sets super parent coord, win sets superparent coord
            [
                [0, 0, 0, 0, 2, 2],
                [0, 0, 2, 2, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 2, 0],
                [0, 0, 2, 0, 1, 0],
                [0, 0, 1, 0, 0, 0],
                [0, 0, 0, 0, 1, 1]
            ],
            // pattern 1: unrestricted grandparent board move on win BECAUSE COLLISION
            [
                [0, 0, 0, 0, 2, 2],
                [0, 0, 2, 2, 0, 0],
                [0, 0, 0, 0, 1, 1],
                [0, 0, 1, 1, 0, 0],
                [0, 0, 0, 0, 0, 0]
            ],
            // pattern 2: top left superboard win with no collision, but WITH restriction at bottom right
            [
                [0, 0, 0, 0, 2, 2],
                [0, 0, 2, 2, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 2, 0],
                [0, 0, 2, 0, 1, 1],
                [0, 0, 1, 1, 0, 0],
                [0, 0, 0, 0, 1, 1],
                [0, 0, 1, 1, 2, 2],
                [0, 0, 2, 2, 1, 1],
                [0, 0, 1, 1, 2, 1],
                [0, 0, 2, 1, 2, 1],
                [0, 0, 2, 1, 1, 1],
                [0, 0, 1, 1, 1, 1],
                [0, 0, 1, 1, 0, 2],
                [0, 0, 0, 2, 0, 0],
                [0, 0, 0, 1, 1, 1],
                [0, 0, 1, 1, 1, 2],
                [0, 0, 1, 2, 1, 1],
                [0, 0, 1, 1, 1, 0],
                [1, 1, 1, 0, 0, 2],
                [1, 1, 0, 2, 1, 1],
                [1, 1, 1, 1, 0, 0],
                [1, 1, 0, 0, 1, 1],
                [1, 1, 1, 1, 0, 2],
                [1, 1, 0, 2, 0, 2],
                [1, 1, 0, 2, 2, 2],
                [1, 1, 2, 2, 0, 2],
                [1, 1, 0, 2, 0, 0],
                [1, 1, 0, 0, 0, 0],
                [1, 1, 0, 0, 1, 2],
                [1, 1, 1, 2, 2, 0],
                [1, 1, 2, 0, 2, 2],
                [1, 1, 2, 2, 2, 2],
                [1, 1, 2, 2, 0, 0],
                [1, 1, 0, 0, 2, 2],
                [0, 0, 2, 2, 1, 0],
                [0, 0, 1, 0, 1, 0],
                [0, 0, 1, 0, 2, 2],
                [0, 0, 2, 2, 0, 2],
                [0, 0, 0, 2, 2, 2],
                [0, 0, 2, 2, 2, 0]
            ],
            // pattern 3: unrestricted, but proposed restricted, copy pattern but at super board win with double collision, NO restriction
            [
                [0, 0, 0, 0, 2, 2],
                [0, 0, 2, 2, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 2, 0],
                [0, 0, 2, 0, 1, 1],
                [0, 0, 1, 1, 0, 0],
                [0, 0, 0, 0, 1, 1],
                [0, 0, 1, 1, 2, 2],
                [0, 0, 2, 2, 1, 1],
                [0, 0, 1, 1, 2, 1],
                [0, 0, 2, 1, 2, 1],
                [0, 0, 2, 1, 1, 1],
                [0, 0, 1, 1, 1, 1],
                [0, 0, 1, 1, 0, 2],
                [0, 0, 0, 2, 0, 0],
                [0, 0, 0, 1, 1, 1],
                [0, 0, 1, 1, 1, 2],
                [0, 0, 1, 2, 1, 1],
                [0, 0, 1, 1, 1, 0],
                [1, 1, 1, 0, 0, 2],
                [1, 1, 0, 2, 1, 1],
                [1, 1, 1, 1, 0, 0],
                [1, 1, 0, 0, 1, 1],
                [1, 1, 1, 1, 0, 2],
                [1, 1, 0, 2, 0, 2],
                [1, 1, 0, 2, 2, 2],
                [1, 1, 2, 2, 0, 2],
                [1, 1, 0, 2, 0, 0],
                [1, 1, 0, 0, 0, 0],
                [1, 1, 0, 0, 1, 2],
                [1, 1, 1, 2, 2, 0],
                [1, 1, 2, 0, 2, 2],
                [1, 1, 2, 2, 2, 2],
                [1, 1, 2, 2, 0, 0],
                [1, 1, 0, 0, 2, 2],
                [0, 0, 2, 2, 1, 0],
                [0, 0, 1, 0, 1, 0],
                [0, 0, 1, 0, 2, 2],
                [0, 0, 2, 2, 0, 2],
                [0, 0, 0, 2, 2, 2],
                [0, 0, 2, 2, 2, 0],
                [2, 2, 2, 0, 0, 0],
                [2, 2, 0, 0, 0, 0],
                [2, 2, 0, 0, 2, 1],
                [2, 2, 2, 1, 2, 1],
                [2, 2, 2, 1, 0, 0],
                [2, 2, 0, 0, 2, 2],
                [2, 2, 2, 2, 0, 0]
            ],
            // pattern 3: unrestricted, but proposed restricted, copy pattern but at super board win with double collision, NO restriction
            [
                [0, 0, 0, 0, 2, 2],
                [0, 0, 2, 2, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 2, 0],
                [0, 0, 2, 0, 1, 1],
                [0, 0, 1, 1, 0, 0],
                [0, 0, 0, 0, 1, 1],
                [0, 0, 1, 1, 2, 2],
                [0, 0, 2, 2, 1, 1],
                [0, 0, 1, 1, 2, 1],
                [0, 0, 2, 1, 2, 1],
                [0, 0, 2, 1, 1, 1],
                [0, 0, 1, 1, 1, 1],
                [0, 0, 1, 1, 0, 2],
                [0, 0, 0, 2, 0, 0],
                [0, 0, 0, 1, 1, 1],
                [0, 0, 1, 1, 1, 2],
                [0, 0, 1, 2, 1, 1],
                [0, 0, 1, 1, 1, 0],
                [1, 1, 1, 0, 0, 2],
                [1, 1, 0, 2, 1, 1],
                [1, 1, 1, 1, 0, 0],
                [1, 1, 0, 0, 1, 1],
                [1, 1, 1, 1, 0, 2],
                [1, 1, 0, 2, 0, 2],
                [1, 1, 0, 2, 2, 2],
                [1, 1, 2, 2, 0, 2],
                [1, 1, 0, 2, 0, 0],
                [1, 1, 0, 0, 0, 0],
                [1, 1, 0, 0, 1, 2],
                [1, 1, 1, 2, 2, 0],
                [1, 1, 2, 0, 2, 2],
                [1, 1, 2, 2, 2, 2],
                [1, 1, 2, 2, 0, 0],
                [1, 1, 0, 0, 2, 2],
                [0, 0, 2, 2, 1, 0],
                [0, 0, 1, 0, 1, 0],
                [0, 0, 1, 0, 2, 2],
                [0, 0, 2, 2, 0, 2],
                [0, 0, 0, 2, 2, 2],
                [0, 0, 2, 2, 2, 0],
                [2, 2, 2, 0, 0, 0],
                [2, 2, 0, 0, 0, 0],
                [2, 2, 0, 0, 2, 1],
                [2, 2, 2, 1, 2, 1],
                [2, 2, 2, 1, 0, 0],
                [2, 2, 0, 0, 2, 2],
                [2, 2, 2, 2, 0, 0],
                [2, 2, 0, 0, 1, 1],
                [0, 1, 1, 1, 0, 0],
                [0, 1, 0, 0, 2, 0],
                [0, 1, 2, 0, 0, 0],
                [0, 1, 0, 0, 1, 0],
                [0, 1, 1, 0, 0, 0],
                [0, 1, 0, 0, 0, 0]
            ],
            // pattern 4: testing
            [
                [0, 0, 0, 0, 2, 2],
                [0, 0, 2, 2, 0, 0],
                [0, 0, 0, 0, 1, 1],
                [0, 0, 1, 1, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 1, 0, 1, 1],
                [0, 0, 1, 1, 0, 1],
                [0, 0, 0, 1, 1, 1],
                [0, 0, 1, 1, 0, 2],
                [0, 0, 0, 2, 1, 1],
                [0, 0, 1, 1, 1, 2],
                [0, 0, 1, 2, 1, 1],
                [0, 0, 1, 1, 2, 2],
                [1, 1, 2, 2, 0, 0],
                [1, 1, 0, 0, 0, 0],
                [1, 1, 0, 0, 2, 0],
                [1, 1, 2, 0, 2, 0],
                [1, 1, 2, 0, 0, 0],
                [1, 1, 0, 0, 0, 1],
                [1, 1, 0, 1, 0, 0],
                [1, 1, 0, 0, 0, 2],
                [0, 0, 0, 2, 2, 2],
                [0, 0, 2, 2, 2, 0],
                [0, 0, 2, 0, 2, 2],
                [0, 0, 2, 2, 2, 1],
                [0, 0, 2, 1, 2, 2],
                [0, 0, 2, 2, 2, 2],
                [2, 2, 2, 2, 0, 0]
            ],
        ];
        // store coords you want to move manually in manual and send them in with premover
        //console.log(props.manual)
        //if (props.manual !== '') {
        //    console.log("attempting premove: ",props.manual)
        //    premove(props.manual)
        //    return;
        //}
        // Execute moves with a delay between them
        moves[moveIndex].forEach((move, index) => {
            setTimeout(() => {
                props.move(move);
            }, index * 300); // 500ms delay between moves
        });
    }, [props.move])

    return (
        <div style={{
            border: "5px solid #031433",
            paddingRight: "20px",
            paddingLeft: "10px",
            backgroundColor: "#222222",
            fontFamily: "monospace",
            width: "70px"
        }}>
            <h2 style={{color: "white"}}>Premov</h2>
            <button onClick={premover.bind(this, 0)}>[0] Premove 1</button>
            <button onClick={premover.bind(this, 1)}>[1] Premove 2</button>
            <button onClick={premover.bind(this, 2)}>[2] Premove 3</button>
            <button onClick={premover.bind(this, 3)}>[3] Premove 4</button>
            <button onClick={premover.bind(this, 4)}>[4] Premove 5</button>
            <button onClick={premover.bind(this, 5)}>[5] Premove 6</button>
            <button onClick={premover.bind(this, 6)}>[6] Premove 7</button>
        </div>
    )}

export default function Moves(props) {
    const letters=['A','B','C']
    return (
        <div style={{
            border:"5px solid #031433",
            paddingRight:"50px",
            backgroundColor:"#222222",
            fontFamily:"monospace"
        }}>
            <ol>
                {props.moveList.map((move) =>
                <li key={move} style={{
                    color:"white"
                }}>{move.map((coord,index) =>
                    index%2===0?letters[coord]:coord+1
                    )}</li>
                )}
            </ol>
        </div>
    )
}

