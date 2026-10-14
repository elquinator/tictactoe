import {useCallback, useContext} from "react";
import { debugLog, StateContext } from "./App";
import logo from "./tictactoelogo.png"
import { URL, DEBUGMODE } from "./constants";
import { BoardTree } from "./util";
import _ from "lodash";

export function GameAutomation() {
    const {setGameId, setPlayerIdentifier, setUsername, setCurrentPlayer, setGameDimension, setBoardTree, setSpectatorStatus} = useContext(StateContext)

    const createGame = useCallback(async () => {
        const gameDimension = parseInt(prompt("dimension of game you want to create:"));
        setGameDimension(gameDimension);
        setBoardTree(_.cloneDeep(new BoardTree(null, gameDimension, 0, 0)));
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                gameDimension: gameDimension
            })
        });
        const jsonResponse = await response.json();
        const gameId = jsonResponse.gameID;
        //setGameId(gameId);
        joinGame(gameId);
    }, []);

    const joinGame = useCallback(async (gameId) => {
        if (typeof(gameId)!=="string") {
            gameId = prompt("gameID of game youre trying to join:");
        }
        let username = prompt("Username:");
        username = username === '' ? "unnamedLoser" : username;
        const response = await fetch(URL+'/'+gameId, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'join',
                playerName: username
            })
        });
        const jsonResponse = await response.json();
        console.log("Got response ", jsonResponse);
        console.log(jsonResponse.playerIdentifier)
        if (jsonResponse.error) {
            alert("Game does not exist vro.");
        }
        else if (jsonResponse.response === "game is full") {
            setSpectatorStatus(true);
        }
        else {
            setPlayerIdentifier(jsonResponse.playerIdentifier);
            setUsername(username);
            setGameId(gameId);
        }
    }, []);
    const startComputerGame = useCallback(async () => {
        const gameDimension = parseInt(prompt("dimension of game you want to create:"));
        setGameDimension(gameDimension);
        setBoardTree(_.cloneDeep(new BoardTree(null, gameDimension, 0, 0)));
        const CreateResponse = (await fetch(URL, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                gameDimension: gameDimension
            })
        }))
        const jsonCreateResponse = await CreateResponse.json();
        const gameID = jsonCreateResponse.gameID;
        let username = prompt("Username:");
        username = username === '' ? "unnamedLoser" : username;
        const joinResponse = await fetch(URL + '/' + gameID, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'playComputer',
                playerName: username
            })
        })
        const jsonJoinResponse = await joinResponse.json();
        console.log("Got response ", jsonJoinResponse);
        console.log(jsonJoinResponse.playerIdentifier)
        if (jsonJoinResponse.error) {
            alert("Game does not exist vro.");
        }
        else {
            setPlayerIdentifier(jsonJoinResponse.playerIdentifier);
            setUsername(username);
            setGameId(gameID);
        }
    }, []);

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
            <div>
                <button onClick={startComputerGame} style={{
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
    const { moveList, pathUrl, boardTree, playerNames, username } = useContext(StateContext);
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
            {DEBUGMODE && <div>
                <button onClick={undoMove}>
                    Request Undo Move
                </button>
                <button onClick={doMoves}>
                    setMoveList
                </button>
            </div>}
        </div>
    )
}

