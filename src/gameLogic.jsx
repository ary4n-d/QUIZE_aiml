export function createInitialGame() {
  return {
    players: [],
    turnTeam: "A",
    askerIndex: { A: 0, B: 0 },
    answererIndex: { A: 0, B: 0 },
    current: { question: "", answer: "" },
    scores: {
      A: { sum: 0, count: 0 },
      B: { sum: 0, count: 0 }
    }
  };
}

export function assignTeam(players) {
  const a = players.filter(p => p.team === "A").length;
  const b = players.filter(p => p.team === "B").length;
  return a <= b ? "A" : "B";
}

export function getAsker(game) {
  const team = game.turnTeam;
  const list = game.players.filter(p => p.team === team);
  if (list.length === 0) return null;
  return list[game.askerIndex[team] % list.length];
}

export function getAnswerer(game) {
  const team = game.turnTeam === "A" ? "B" : "A";
  const list = game.players.filter(p => p.team === team);
  if (list.length === 0) return null;
  return list[game.answererIndex[team] % list.length];
}

export function advanceTurn(game) {
  const other = game.turnTeam === "A" ? "B" : "A";
  game.askerIndex[game.turnTeam]++;
  game.answererIndex[other]++;
  game.turnTeam = other;
  game.current = { question: "", answer: "" };
}
