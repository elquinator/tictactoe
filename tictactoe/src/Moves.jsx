export default function Board(props) {
    const letters=['A','B','C']
    //let scaledFontSize=(16/window.devicePixelRatio)+"px";
    //document.documentElement.style["font-size"] = scaledFontSize;
    return (
        <div style={{
            border:"5px solid #031433",
            paddingRight:"50px",
            backgroundColor:"#222222",
            fontFamily:"monospace"
        }}>
            <ol>
                {props.moveList.map((move) =>
                <li style={{
                    color:"white"
                }}>{move.map((coord,index) => 
                    index%2==0?letters[coord]:coord+1
                    )}</li>
                )}
            </ol>
        </div>
    )
}