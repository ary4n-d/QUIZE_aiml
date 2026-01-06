import React, { useEffect, useState } from "react";
import {
  createInitialGame,
  assignTeam,
  getAsker,
  getAnswerer,
  advanceTurn
} from "./gameLogic";

const GAME_KEY = "QUIZ_GAME_STATE";

export default function App() {
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);

  // 🔹 Shared game state across tabs
  const [game, setGame] = useState(() => {
    const saved = localStorage.getItem(GAME_KEY);
    return saved ? JSON.parse(saved) : createInitialGame();
  });

  const [questionInput, setQuestionInput] = useState("");
  const [answerInput, setAnswerInput] = useState("");

  // 🔹 Sync updates from other tabs
  useEffect(() => {
    function handleStorage(e) {
      if (e.key === GAME_KEY && e.newValue) {
        setGame(JSON.parse(e.newValue));
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  function syncGame(updatedGame) {
    localStorage.setItem(GAME_KEY, JSON.stringify(updatedGame));
    setGame({ ...updatedGame });
  }

  // 🔹 Join game
  function joinGame() {
    if (!name.trim()) return;

    const team = assignTeam(game.players);
    game.players.push({
      id: Date.now() + Math.random(),
      name,
      team
    });

    syncGame(game);
    setJoined(true);
  }

  const asker = getAsker(game);
  const answerer = getAnswerer(game);
  const me = game.players.find(p => p.name === name);

  // 🔹 Ask question
  function askQuestion() {
    if (!questionInput.trim()) return;
    game.current.question = questionInput;
    setQuestionInput("");
    syncGame(game);
  }

  // 🔹 Answer question
  function answerQuestion() {
    if (!answerInput.trim()) return;
    game.current.answer = answerInput;
    setAnswerInput("");
    syncGame(game);
  }

  // 🔹 Rate answer
  function rate(score) {
    const answeringTeam = game.turnTeam === "A" ? "B" : "A";
    game.scores[answeringTeam].sum += score;
    game.scores[answeringTeam].count += 1;
    advanceTurn(game);
    syncGame(game);
  }

  // 🔹 UI — Join Screen
  if (!joined) {
    return (
      <div className="box">
        <h2>Join Quiz</h2>
        <input
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <button onClick={joinGame}>Join</button>
      </div>
    );
  }

  // 🔹 UI — Game Screen
  return (
    <div className="box">
      <h3>Turn: Team {game.turnTeam}</h3>
      <p><strong>Asker:</strong> {asker?.name}</p>
      <p><strong>Answerer:</strong> {answerer?.name}</p>

      {/* Ask */}
      {me?.id === asker?.id && !game.current.question && (
        <>
          <textarea
            placeholder="Type your question"
            value={questionInput}
            onChange={e => setQuestionInput(e.target.value)}
          />
          <button onClick={askQuestion}>Ask</button>
        </>
      )}

      {/* Answer */}
      {me?.id === answerer?.id &&
        game.current.question &&
        !game.current.answer && (
          <>
            <p><strong>Question:</strong> {game.current.question}</p>
            <textarea
              placeholder="Type your answer"
              value={answerInput}
              onChange={e => setAnswerInput(e.target.value)}
            />
            <button onClick={answerQuestion}>Answer</button>
          </>
        )}

      {/* Rate */}
      {me?.id === asker?.id && game.current.answer && (
        <>
          <p><strong>Answer:</strong> {game.current.answer}</p>
          {[0, 0.5, 1].map(v => (
            <button key={v} onClick={() => rate(v)}>
              {v}
            </button>
          ))}
        </>
      )}

      <hr />

      <p>
        Team A Score:{" "}
        {game.scores.A.count
          ? (game.scores.A.sum / game.scores.A.count).toFixed(2)
          : 0}
      </p>
      <p>
        Team B Score:{" "}
        {game.scores.B.count
          ? (game.scores.B.sum / game.scores.B.count).toFixed(2)
          : 0}
      </p>
    </div>
  );
}
