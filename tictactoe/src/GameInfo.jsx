export function GameInfo(props) {
    return (
        <div>
            <p style={{
                fontSize:"25px",
                position:"absolute",
            }}>
                vsync: ON<br />
                fps: 165<br/>
                ping: 25ms<br />
                {props.player1}: X<br/>
                {props.player2}: O
            </p>
        </div>
    )
}