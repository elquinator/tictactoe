import './App.css';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { BoardTree, evaluateMovesOnBoardTree, getAvailableMoves } from './util';
import { PLAYERS, HOSTURL } from './constants';
import { EndGameScreen, GameActiveScreen, RuleSelectionScreen, TitleScreen, WaitingForPlayerScreen } from './GameStatusScreens';

const DEFAULT_DIM = 3;
export const StateContext = createContext({
  moveList: [], currentPlayer: 'X', boardTree: new BoardTree(null, DEFAULT_DIM, 0, 0),
  winDepth: 0, gameStarted: false, username: '', gameId: '', playerIdentifier: '', playerNames: []
})

let pauseFetches = false

export function Game() {
  const { boardTree, gameId, username, setPlayerNames, playerNames, setGameStarted, moveList,
    currentPlayer, setBoardTree, gameStarted, playerIdentifier, pathUrl, updateBoardTree,
    setGameDimension, gameEnded, gamemodeSelected, isGameCreated } = useContext(StateContext);
  
  useEffect(() => {
    const moveInterval = setInterval(async () => {
      if (pauseFetches) {
        return;
      }
      //set necessary info for game after start
      if (username !== '' && gameId !== '') {
        const response = await fetch(pathUrl, { method: "GET" });
        const jsonResponse = await response.json();
        const respMoveList = jsonResponse.moves;
        if (!gameStarted) {
          const newBoardTree = _.cloneDeep(new BoardTree(null, jsonResponse.gameDimension, 0, 0));
          setPlayerNames([jsonResponse.playerX, jsonResponse.playerO]);
          setGameStarted(jsonResponse.gameStarted);
          setGameDimension(jsonResponse.gameDimension);
          setBoardTree(newBoardTree);
          updateBoardTree(respMoveList, newBoardTree);
        }
        else if (jsonResponse.playerWhoRequestedUndo === playerNames[playerIdentifier === 'X' ? 1 : 0]) {
          pauseFetches = true;
          const undoConfirm = window.confirm(`${jsonResponse.playerWhoRequestedUndo} has requested an undo. Would you like to accept it?`)
          await fetch(pathUrl, {
            method: "PUT",
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              action: 'undoMove',
              playerWhoRequestedUndo: undoConfirm ? `${playerNames[playerIdentifier === 'X' ? 0 : 1]}` : ''
            })
          })
          pauseFetches = false;
        }
        else if (respMoveList.length !== moveList.length) {
          console.log("cheacking move lists")
          console.log(moveList)
          console.log(respMoveList)
          updateBoardTree(respMoveList, boardTree);
        }
      }
    }, 1000);
    return () => {
      clearInterval(moveInterval);
    }
  }, [gameStarted, moveList, username, gameId, setGameStarted, pauseFetches]);


  const handleMove = useCallback((treeNode, row, column) => {
    // if our turn (x on even, o on odd)
    if (playerIdentifier == currentPlayer) {
        handleMoveImpl(treeNode, row, column);
    } else {
        //alert("it's not your turn")
        return;
    }
  });

  const handleMoveImpl = useCallback(async (treeNode, row, column) => {
    //treeNode is always the parent board of the move played, not the move itself
    if (treeNode.children[row][column].wonBy != '') {
      //alert("brotjer its takenm do you have eyeys");
      return;
    }
    if (!treeNode.isActive) {
      //alert("brotjer look at the previous move, do you even know the rulse");
      return;
    }
    //valid move
    //treeNode.children[row][column].wonBy = currentPlayer;
    const newMove = treeNode.getFullRoute([row, column]);
    const newMoveList = [...moveList, newMove];
    updateBoardTree(newMoveList, boardTree);
    const response = await fetch(pathUrl, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'move',
        move: treeNode.getFullRoute([row, column]),
      })
    })
    const jsonResponse = await response.json();
    console.log(jsonResponse);
    if (jsonResponse.error) {
      // move is invalid server side
      console.log("player cheated")

      // undo move
      newMoveList.pop()
      updateBoardTree(newMoveList, boardTree);
      alert("cheating is not acceptable.")
      return;
    }
  },[currentPlayer, boardTree, PLAYERS, moveList, gameId]);

  return (
    <div className="App" style={{ position: "relative", fontFamily: "monospace" }}>
      <>
        {gameEnded && (<EndGameScreen/>)}
        {!gameStarted && (gamemodeSelected === '') && !isGameCreated && (<TitleScreen />)}
        {!gameStarted && (gamemodeSelected !== '') && !isGameCreated && (<RuleSelectionScreen/>)}
        {!gameStarted && (gamemodeSelected !== '') && isGameCreated && (<WaitingForPlayerScreen/>)}
        {gameStarted && (<GameActiveScreen handleMove={handleMove} />)}
      </>
    </div>
  );
}

export function StateProvider({ children }) {
  const [moveList, setMoveList] = useState([]);
  const [boardTree, setBoardTree] = useState(new BoardTree(null,DEFAULT_DIM,0,0));
  const [winDepth, setWinDepth] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [gameWinner, setGameWinner] = useState('');
  const [username, setUsername] = useState('');
  const [gameId, setGameId] = useState('');
  const [playerIdentifier, setPlayerIdentifier] = useState('-');
  const [botDifficulty, setBotDifficulty] = useState('medium');
  const [playerNames, setPlayerNames] = useState([]);
  const [gameDimension, setGameDimension] = useState(DEFAULT_DIM);
  const [spectatorStatus, setSpectatorStatus] = useState(false);
  const [gamemodeSelected, setGamemodeSelected] = useState('');
  const [isGameCreated, setIsGameCreated] = useState(false);
  const [isUndoEnabled, setIsUndoEnabled] = useState(false);
  const pathUrl = useMemo(() => {
    return HOSTURL + '/' + gameId
  }, [gameId]);
  const currentPlayer = useMemo(() => {
    return (PLAYERS[moveList.length%2])
  }, [moveList])
  // ill be real i have no idea what is going on atp
  // please help
  const updateBoardTree = useCallback((respMoveList, boardTree) => {
    if (moveList.length > respMoveList.length) {
      console.log("resetting move list")
      const wipedTree = new BoardTree(null, gameDimension, 0, 0);
      boardTree = evaluateMovesOnBoardTree([], respMoveList, wipedTree);
    }
    else {
      boardTree = evaluateMovesOnBoardTree(moveList, respMoveList, boardTree);
    }
    if (boardTree.wonBy !== '' || getAvailableMoves(boardTree).length === 0) {
      setGameEnded(true);
      setGameWinner(boardTree.wonBy !== '' ? boardTree.wonBy : '-');
    }
    console.log('stti222222ng movelist')
    setMoveList(respMoveList);
    setBoardTree(_.cloneDeep(boardTree));
    return 0;
  }, [moveList])

  return (
    <StateContext.Provider value={{
      moveList, currentPlayer, boardTree, winDepth, gameStarted, username, gameId, playerIdentifier, playerNames, gameDimension, pathUrl, spectatorStatus, gameEnded,
      gameWinner, pauseFetches, gamemodeSelected, isGameCreated, botDifficulty, isUndoEnabled,
      setMoveList, setBoardTree, setWinDepth, setGameStarted, setUsername, setGameId, setPlayerIdentifier, setPlayerNames, setGameDimension,
      updateBoardTree, setSpectatorStatus, setGamemodeSelected, setIsGameCreated, setBotDifficulty, setIsUndoEnabled
    }}>
      {children}
    </StateContext.Provider>
  );
}

export default function App() {
  return (
    <StateProvider>
      <Game/>
    </StateProvider>
  )
}
