import { useContext } from "react"
import { StateContext } from "./App"

export function GameInfo(props) {
    const {gameId, playerNames} = useContext(StateContext)
    return (
        <div>
            <p style={{
                fontSize:"25px",
            }}>
                vsync: ON<br />
                fps: 165<br/>
                ping: 25ms<br />
                {playerNames[0]}: X<br/>
                {playerNames[1]}: O<br/>
                ID: {gameId}
            </p>
        </div>
    )
}