import { useContext, useState, useCallback, useEffect } from "react"
import { StateContext } from "./App"
import Board from "./Board"
import { GameInfo } from "./GameInfo"
import Moves, { MainMenu } from "./Moves"
import { PLAYERS, HOSTURL } from "./constants"
import { BoardTree } from "./util";
import _ from "lodash"

export function EndGameScreen() {
    const { gameWinner, playerIdentifier } = useContext(StateContext);
    return (
        <div style={{
            position: "fixed",
            display: "grid",
            height: "100vh",
            width: "100vh",
            placeContent: "center",
            zIndex: "1"
        }}>
            <div style={{
                backgroundColor: "#838383dc",
                padding: "30px",
                width: "100vh",
                border: "1px solid black"
            }}>
                <h1
                    style={{
                        color: `${gameWinner === '-' ? 'grey' : gameWinner === playerIdentifier ? 'green' : '#940000'}`,
                        textShadow: "3px 4px 1px #120000",
                        fontSize: "4em"
                    }}
                >
                    {gameWinner === '-' ? 'Draw!' : gameWinner === playerIdentifier ? 'You Won!' : 'You Lost!'}
                </h1>
                <p1>
                    {gameWinner === '-' ? 'All that time for nothing' : `${gameWinner} Won`}
                </p1>
            </div>
        </div>
    )
}

export function TitleScreen() {
    return (
        <MainMenu/>
    )
}

export function WaitingForPlayerScreen() {
    const { playerIdentifier, username, gameId } = useContext(StateContext);
    return (
        <div style={{
            width:"100%",
            alignContent: "center"
        }}>
        <h1>username: {username}</h1>
        <h1>player: {playerIdentifier}</h1>
        <h2>waiting for another player...</h2>
        <p1>gameID: {gameId}</p1>
        </div>
    )
}

export function GameActiveScreen(props) {
    const { gameDimension, boardTree, currentPlayer, playerNames, playerIdentifier, gameWinner, spectatorStatus  } = useContext(StateContext);
    return (
        <>
            {!spectatorStatus ? (
                <div style={{
                    backgroundColor: "#ddd"
                }}>
                {gameWinner === '' ? (
                    <h1>
                        {`${playerNames[PLAYERS.indexOf(currentPlayer)]}'s`} turn ({playerIdentifier === currentPlayer ? "make a move" : "waiting for move from other guy"})
                    </h1>)
                    : (
                    <h1>
                        {gameWinner === '-' ? 'at least you didnt lose' : gameWinner === playerIdentifier ? "congratulations" : "better luck next time"}
                    </h1>)}
                </div>) :
                //spectator's view
                (<div style={{
                    backgroundColor: "#ddd"
                }}>
                    <h1>
                        Spectating {`${playerNames[0]} and `}{`${playerNames[1]}'s game:`} {`it is ${playerNames[PLAYERS.indexOf(currentPlayer)]}'s`} turn
                    </h1>
                </div>)
            }
            <div style={{
                display:"flex"
            }}>
                <Moves/>
                {!spectatorStatus && (<GameInfo/>)}
                <Board depth={gameDimension} row={0} column={0} handleMove={props.handleMove} treeNode={boardTree} />
            </div>
        </>
    )
}

const buttonStyle = {
    height: '10px',
    width: '10px'
}
const labelStyle = {
    fontSize: '15px',
    marginLeft: '20px'
}

function PlayerInfo() {
    return (
        <h1>
            Hello player!
        </h1>
    )
}

function GetDimension() {
    return (
        <div>
            <label>
                dimension: 
            </label>
            <input type='number' id='gameDimension' min='1' max='6' placeholder="1" required/>
        </div>
    )
}

function GetUserName() {
    return (
        <div>
            <label>
                username:                              
            </label>
            <input type='text' id='username' placeholder="username" required/>
        </div>
    )
}

function GetGameId() {
    return (
        <div>
            <label>
                game id:
            </label>
            <input type='text' id="gameId" placeholder="gameID (e.g. 123456)" pattern="^[0-9]{1,6}$" required />
        </div>
    )
}

function PlayerSelect() {
    const { playerIdentifier, setPlayerIdentifier } = useContext(StateContext);
    const handleButtonChange = (event) => {
        setPlayerIdentifier(event.target.value);
    }
    return (
        <div>
            <p>choose your symbol</p>
            <label style={labelStyle}>
                <input 
                    type="radio" 
                    name="player" 
                    value="X" 
                    checked={playerIdentifier === 'X'} 
                    onChange={handleButtonChange}
                    style={buttonStyle}
                /> X
            </label>
            <label style={labelStyle}>
                <input 
                    type="radio"
                    name="player"
                    value="O"
                    checked={playerIdentifier === 'O'}
                    onChange={handleButtonChange}
                    style={buttonStyle}     
                /> O
            </label>
            <label style={labelStyle}>
                <input 
                    type="radio" 
                    name="player" 
                    value="-" 
                    checked={playerIdentifier === '-'} 
                    onChange={handleButtonChange}
                    style={buttonStyle}
                /> random
            </label>
        </div>
    )
}

function DifficultySelect() {
    const { botDifficulty, setBotDifficulty } = useContext(StateContext)
    const handleButtonChange = (event) => {
        setBotDifficulty(event.target.value);
    }
    return (
        <div>
            <p>choose difficulty</p>
            <label style={{...labelStyle, color:'green'}}>
                <input 
                    type="radio" 
                    name="botDifficulty" 
                    value="easy" 
                    checked={botDifficulty === 'easy'} 
                    onChange={handleButtonChange}
                    style={buttonStyle}
                /> easy
            </label>
            <label style={{ ...labelStyle, color: 'orange' }}>
                <input 
                    type="radio"
                    name="botDifficulty"
                    value="medium"
                    checked={botDifficulty === 'medium'}
                    onChange={handleButtonChange}
                    style={buttonStyle}   
                /> medium
            </label>
            <label style={{...labelStyle, color:'red'}}>
                <input 
                    type="radio" 
                    name="botDifficulty" 
                    value="hard" 
                    checked={botDifficulty === 'hard'} 
                    onChange={handleButtonChange}
                    style={buttonStyle}
                /> hard
            </label>
            <label style={{...labelStyle, color:'purple'}}>
                <input 
                    type="radio" 
                    name="botDifficulty" 
                    value="insane" 
                    checked={botDifficulty === 'insane'} 
                    onChange={handleButtonChange}
                    style={buttonStyle}
                /> insane
            </label>
        </div>
    )
}

function MiscRuleSelect() {
    const { setIsUndoEnabled } = useContext(StateContext)
    return (
        <div style={{ marginTop: "25px" }}>
            <h3>
                Extra Options:
            </h3>
            <label>
                Enable Undos
            </label>
            <input type="checkbox" id="enableUndos" onChange={setIsUndoEnabled.bind(this, true)}/>
        </div>
    )
}

export function RuleSelectionScreen() {
    const { gamemodeSelected, setIsGameCreated, setGameId, setSpectatorStatus, playerIdentifier,
        setPlayerIdentifier, botDifficulty, setUsername, setGameDimension, setBoardTree, setGamemodeSelected,
        isUndoEnabled, setIsUndoEnabled } = useContext(StateContext);

    const joinGame = useCallback(async (gameId) => {
        if (!/^[0-9]{1,6}$/.test(gameId)) {
            const gameIdBox = document.getElementById('gameId').value;
            gameId = gameIdBox;
        }
        const usernameBox = document.getElementById('username').value;
        const username = usernameBox.split(' ').join('') === '' ? 'UnnamedLoser' : usernameBox;
        setUsername(username)
        setGameId(gameId);
        const response = await fetch(HOSTURL+'/'+gameId, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: gamemodeSelected === 'botGame' ? 'playComputer' : 'join',
                playerName: username,
                playerIdentifier: playerIdentifier,
                botDifficulty: botDifficulty
            })
        });
        const jsonResponse = await response.json();
        setPlayerIdentifier(jsonResponse.playerIdentifier);
        setIsUndoEnabled(jsonResponse.undoEnabled);
        if (jsonResponse.error) {
            alert("Game does not exist vro.");
        }
        else if (jsonResponse.response === "game is full") {
            setSpectatorStatus(true);
        }
    }, [botDifficulty, playerIdentifier, gamemodeSelected]);

    const createGame = useCallback(async () => {
        const dimensionBox = Number(document.getElementById('gameDimension').value);
        setGameDimension(dimensionBox);
        setBoardTree(_.cloneDeep(new BoardTree(null, dimensionBox, 0, 0)));
        const response = await fetch(HOSTURL, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                gameDimension: dimensionBox,
                undoEnabled: isUndoEnabled
            })
        });
        const jsonResponse = await response.json();
        const gameId = jsonResponse.gameID;
        joinGame(gameId);
        setIsGameCreated(true);
    }, [joinGame, isUndoEnabled]);

    const formSubmit = (event) => {
        event.preventDefault();
        switch (gamemodeSelected) {
            case "joinGame":
                joinGame()
                break;
            default: // should be both case createGame and botGame
                createGame();
                break;
        }
    }

    return (
        <form onSubmit={formSubmit} style={{
            position: "fixed",
            height: "100%",
            width: "100%"
        }}>
            <PlayerInfo />
            <GetUserName />
            {gamemodeSelected === "joinGame" ? (<GetGameId />) : (<GetDimension />)}
            {!(gamemodeSelected === "joinGame") && <PlayerSelect />}
            {(gamemodeSelected === "botGame") && <DifficultySelect />}
            {!(gamemodeSelected === "joinGame") && <MiscRuleSelect />}
            <div style={{
                position: "absolute",
                width: "100%",
                bottom: "0px",
                display: "flex",
                justifyContent: "center",
                marginBottom: "100px"
            }} >
                <button onClick={setGamemodeSelected.bind(this, "")} style={{
                    marginRight: "20px",
                    height: "25px",
                    width: "50px"
                }} >
                    Back
                </button>
                <button type="submit" style={{ 
                    justifyContent: "center",
                    height: "25px",
                    width: "50px"
            }} >
                    Start!
                </button>
            </div>
        </form>
    )
}