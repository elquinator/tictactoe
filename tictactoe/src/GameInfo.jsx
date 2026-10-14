import { useContext } from "react"
import { StateContext } from "./App"

export function GameInfo() {
    const {gameId, playerNames} = useContext(StateContext)
    return (
        <div style={{
            position: "relative",
            clear: "right",
            display: "block"
        }}>
            <p style={{
                fontSize: "25px"
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