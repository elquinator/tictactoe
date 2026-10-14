import { useContext } from "react"
import { StateContext } from "./App"
import Board from "./Board"
import { GameInfo } from "./GameInfo"
import Moves, { Premover, GameAutomation } from "./Moves"
import { PLAYERS  } from "./constants"

export function EndGameScreen() {
    const { gameWinner, playerIdentifier } = useContext(StateContext);
    return (
        <div>
            <h1
                style={{
                    color: `${gameWinner === '-' ? 'grey' : gameWinner === playerIdentifier ? 'green' : 'red'}`
                }}
            >
                {gameWinner === '-' ? 'Draw!' : gameWinner === playerIdentifier ? 'You Won!' : 'You Lost!'}
            </h1>
            <p1>
                {gameWinner === '-' ? 'All that time for nothing' : `${gameWinner} Won`}
            </p1>
        </div>
    )
}

export function WaitingForPlayerScreen() {
    const { playerIdentifier, username, gameId } = useContext(StateContext);
    return (
        username === '' ?
        <GameAutomation/> :
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
    const { gameDimension, boardTree, currentPlayer, playerNames, playerIdentifier } = useContext(StateContext);
    return (
        <>
            <div style={{
                    backgroundColor: "#ddd"
                }}>
                {(<h1>
                {playerNames[PLAYERS.indexOf(currentPlayer)]} turn ({playerIdentifier===currentPlayer?"make a move":"waiting for move from other guy"})
                </h1>)}
            </div>
            <div style={{
                display:"flex"
            }}>
                <Moves/>
                <GameInfo/>
                <Board depth={gameDimension} row={0} column={0} handleMove={props.handleMove} treeNode={boardTree} />
            </div>
        </>
    )
}