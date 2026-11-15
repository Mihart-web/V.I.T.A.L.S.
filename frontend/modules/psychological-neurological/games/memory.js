"use strict";
/* VITALS_COGNITIVE_TWIN_PROFILE_BINDING_V1 */
function vitalsActiveId(){try{const id=localStorage.getItem("vitals.activeAstronautId.v1");const list=JSON.parse(localStorage.getItem("vitals.cognitive.profiles.v1")||"[]");return Array.isArray(list)&&list.some(p=>p.id===id)?id:null;}catch{return null;}}
/* V.I.T.A.L.S. â€” Working Memory v1. Independent game; no imported legacy code.
   Experimental task results, NOT a medical diagnosis.
   Round accuracy = completed sequences / attempted sequences.
   All levels advance automatically irrespective of errors; retry is always optional. */

(() => {
  const $ = (id) => document.getElementById(id);
  const el = {
    nav: $("backTo"), level: $("level"), score: $("score"), hits: $("hits"),
    errors: $("errors"), clock: $("clock"), info: $("levelInfo"),
    board: $("memoryBoard"), phase: $("phaseLabel"), round: $("roundLabel"),
    speed: $("speedLabel"), progress: $("inputProgress"), remaining: $("timeRemaining"),
    status: $("status"), start: $("start"), pause: $("pause"),
    restart: $("restart"), next: $("next"), retry: $("retry"), review: $("review"),
    export: $("export"), results: $("results"), summary: $("summary"), mistakes: $("mistakes")
  };
  const levels = [
    {side:3, length:3, flash:820, gap:310, time:15},
    {side:4, length:4, flash:700, gap:260, time:14},
    {side:4, length:6, flash:580, gap:220, time:13},
    {side:5, length:7, flash:460, gap:170, time:12},
    {side:6, length:9, flash:340, gap:130, time:11}
  ];
  const ROUNDS_PER_LEVEL = 3;
  const HISTORY_KEY = "vitals.cognitive.working-memory.sessions.v1";
  let boardTiles = [];
  let levelIndex = 0, roundIndex = 0, correctAtLevel = 0;
  let score = 0, correctRounds = 0, errors = 0, attemptedRounds = 0;
  let sequence = [], answers = [], phase = "ready", paused = false;
  let activeMs = 0, previousFrame = performance.now(), responseDeadline = 0;
  let generation = 0, mistakes = [], roundResults = [], session = null;
  let sessionStartIso = null, sessionSaved = false, levelAttempts = 0;
  let pendingAdvance = null;

  el.nav.addEventListener("change", () => {
    if (el.nav.value) window.location.href = el.nav.value;
  });
  function formatClock(ms) {
    const s = Math.floor(ms / 1000);
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  }
  function config() { return levels[levelIndex]; }
  function updateHud() {
    el.level.textContent = `${levelIndex + 1} / ${levels.length}`;
    el.score.textContent = score.toLocaleString("en-US");
    el.hits.textContent = String(correctRounds);
    el.errors.textContent = String(errors);
    el.clock.textContent = formatClock(activeMs);
    el.round.textContent = `ROUND ${Math.min(roundIndex + 1, ROUNDS_PER_LEVEL)} / ${ROUNDS_PER_LEVEL}`;
    el.info.textContent = `${config().side} Ă— ${config().side}`;
    el.speed.textContent = `FLASH ${config().flash} ms`;
  }
  function status(msg) { el.status.textContent = msg; }
  function setPhase(next) {
    phase = next;
    const text = {ready:"READY", preview:"MEMORIZE", input:"REPEAT SEQUENCE", feedback:"RESULT", levelComplete:"LEVEL COMPLETE", finished:"SESSION COMPLETE"};
    el.phase.textContent = text[next] || next.toUpperCase();
    el.pause.disabled = next === "ready" || next === "levelComplete" || next === "finished";
    el.start.disabled = next !== "ready";
    el.next.hidden = true;
    el.retry.hidden = next === "ready" || next === "finished";
    el.export.hidden = next !== "finished";
    el.review.hidden = next !== "finished";
    if (next !== "input") el.remaining.textContent = "RESPONSE WINDOW: â€”";
    boardTiles.forEach(tile => { tile.disabled = next !== "input" || paused; });
  }
  function buildBoard() {
    el.board.replaceChildren();
    const side = config().side;
    el.board.style.setProperty("--grid-size", String(side));
    el.board.style.width = `min(100%, ${Math.min(560, side * 106)}px)`;
    boardTiles = Array.from({length:side * side}, (_, index) => {
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "memory-tile";
      tile.disabled = true;
      tile.dataset.index = String(index);
      tile.setAttribute("aria-label", `Row ${Math.floor(index / side) + 1}, column ${index % side + 1}`);
      tile.addEventListener("click", () => chooseTile(index));
      el.board.append(tile);
      return tile;
    });
  }
  function clearTiles() { boardTiles.forEach(t => t.classList.remove("lit", "correct", "wrong")); }
  function randomSequence() {
    const values = [];
    for (let n = 0; n < config().length; n++) {
      let pos;
      do { pos = Math.floor(Math.random() * boardTiles.length); }
      while (pos === values[values.length - 1] && boardTiles.length > 1);
      values.push(pos);
    }
    return values;
  }
  // All waits advance on game time, not wall time; PAUSE freezes both the preview and response deadline.
  function waitGame(ms, token) {
    const until = activeMs + ms;
    return new Promise(resolve => {
      function tick() {
        if (token !== generation) { resolve(false); return; }
        if (activeMs >= until) { resolve(true); return; }
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
  function updateProgress() {
    el.progress.textContent = `SEQUENCE: ${answers.length} / ${sequence.length}`;
  }
  async function presentRound(token) {
    if (token !== generation) return;
    const cfg = config();
    clearTiles();
    sequence = randomSequence();
    answers = [];
    updateProgress();
    setPhase("preview");
    updateHud();
    status(`Level ${levelIndex + 1}, round ${roundIndex + 1}: watch ${cfg.length} illuminated squares, in order.`);
    if (!await waitGame(600, token)) return;
    for (const index of sequence) {
      if (token !== generation) return;
      boardTiles[index].classList.add("lit");
      if (!await waitGame(cfg.flash, token)) return;
      boardTiles[index].classList.remove("lit");
      if (!await waitGame(cfg.gap, token)) return;
    }
    if (token !== generation) return;
    setPhase("input");
    responseDeadline = activeMs + cfg.time * 1000;
    status("Repeat the pattern in the SAME ORDER. Click each square once per step.");
    updateProgress();
    boardTiles.forEach(t => { t.disabled = paused; });
  }
  function startRound() { const token = generation; void presentRound(token); }
  function errorLog(reason, expectedIndex, chosenIndex, note) {
    mistakes.push({
      level:levelIndex + 1, round:roundIndex + 1, reason,
      step:answers.length + (reason === "wrong_tile" ? 0 : 1),
      expectedSquare: expectedIndex == null ? null : expectedIndex + 1,
      chosenSquare: chosenIndex == null ? null : chosenIndex + 1,
      grid: `${config().side}x${config().side}`,
      requiredSequenceLength:config().length, note
    });
  }
  function chooseTile(index) {
    if (phase !== "input" || paused) return;
    const nextExpected = sequence[answers.length];
    answers.push(index);
    const tile = boardTiles[index];
    tile.classList.add(index === nextExpected ? "correct" : "wrong");
    const token = generation;
    void (async () => {
      if (await waitGame(190, token)) tile.classList.remove("correct", "wrong");
    })();
    if (index !== nextExpected) {
      errorLog("wrong_tile", nextExpected, index, "Wrong square selected at this sequence position");
      finishRound(false, "Incorrect square. Watch the next sequence carefully.");
      return;
    }
    score += 45 + levelIndex * 15;
    updateProgress();
    if (answers.length === sequence.length) {
      score += 180 + 50 * levelIndex;
      finishRound(true, "Sequence recalled correctly.");
    }
    updateHud();
  }
  function finishRound(success, message) {
    if (phase !== "input") return;
    setPhase("feedback");
    attemptedRounds++;
    if (success) {
      correctRounds++;
      correctAtLevel++;
    } else {
      errors++;
    }
    roundResults.push({
      level:levelIndex + 1, round:roundIndex + 1, grid:config().side,
      sequenceLength:config().length, flashMs:config().flash,
      success, enteredCount:answers.length, targetCount:sequence.length
    });
    status(message + (success ? " + bonus points" : " Error recorded for review."));
    updateHud();
    const token = generation;
    void (async () => {
      if (!await waitGame(900, token)) return;
      if (token !== generation) return;
      roundIndex++;
      if (roundIndex < ROUNDS_PER_LEVEL) {
        startRound();
      } else {
        concludeLevel();
      }
    })();
  }
  // After three trials, ALWAYS progress. The player may voluntarily retry
  // the current level during the short intermission or while playing.
  function concludeLevel() {
    setPhase("levelComplete");
    clearTiles();
    const completedLevel = levelIndex + 1;
    const completedCorrect = correctAtLevel;
    status(`LEVEL ${completedLevel} COMPLETE: ${completedCorrect}/${ROUNDS_PER_LEVEL} correct. ` +
      (completedLevel < levels.length ? "Advancing automatically..." : "Preparing session results..."));
    updateHud();
    const token = generation;
    pendingAdvance = setTimeout(() => {
      pendingAdvance = null;
      if (token !== generation || phase !== "levelComplete") return;
      if (levelIndex === levels.length - 1) {
        finishSession("completed_all_five_levels");
        return;
      }
      levelIndex++;
      roundIndex = 0;
      correctAtLevel = 0;
      buildBoard();
      updateHud();
      startRound();
    }, 1400);
  }
  function saveSession(reason) {
    if (sessionSaved) return;
    sessionSaved = true;
    const record = {
      schema:"vitals.cognitive.memory.v1", game:"working-memory", version:"1.0.0",
      astronautId:null, demo:true, startTime:sessionStartIso, endTime:new Date().toISOString(),
      outcome:reason, levelReached:levelIndex + 1, levels:levels.map(c => ({...c})),
      attemptedRounds, correctRounds, errors, accuracyPercent:attemptedRounds ? +(100 * correctRounds / attemptedRounds).toFixed(1) : 0,
      score, voluntaryRetries:levelAttempts, activeTimeMs:Math.round(activeMs), roundResults, mistakes
    };
    session = record;
    try {
      const existing = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      const history = Array.isArray(existing) ? existing : [];
      record.astronautId = vitalsActiveId(); history.push(record);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-30)));
      status("SESSION COMPLETE â€” results saved locally for future Cognitive Twin integration.");
    } catch {
      status("SESSION COMPLETE â€” browser storage unavailable; use EXPORT RESULTS to keep a copy.");
    }
  }
  function renderSummary() {
    const accuracy = attemptedRounds ? (100 * correctRounds / attemptedRounds).toFixed(1) : "0.0";
    el.summary.replaceChildren();
    const heading = document.createElement("p");
    heading.textContent = `Outcome: ${session.outcome === "completed_all_five_levels" ? "ALL 5 LEVELS COMPLETED" : "SESSION ENDED"}. Score ${score.toLocaleString("en-US")}.`;
    el.summary.append(heading);
    const cards = document.createElement("div"); cards.className = "metric-grid";
    for (const [name, value] of [["ACCURACY", accuracy + "%"],["CORRECT ROUNDS",String(correctRounds)],["ROUNDS PLAYED",String(attemptedRounds)],["ERRORS",String(errors)],["LEVEL REACHED",String(levelIndex + 1) + "/5"],["ACTIVE TIME",formatClock(activeMs)]]) {
      const box = document.createElement("div");
      const label = document.createElement("small"); label.textContent = name;
      const val = document.createElement("strong"); val.textContent = value;
      box.append(label, val); cards.append(box);
    }
    el.summary.append(cards);
  }
  function finishSession(reason) {
    generation++;
    if (pendingAdvance !== null) { clearTimeout(pendingAdvance); pendingAdvance = null; }
    paused = false;
    setPhase("finished");
    el.pause.textContent = "PAUSE";
    el.start.hidden = true;
    el.next.hidden = true;
    clearTiles();
    saveSession(reason);
    renderSummary();
    el.results.hidden = false;
    el.mistakes.hidden = true;
    el.review.textContent = "REVIEW ERRORS";
    el.review.hidden = false;
    el.export.hidden = false;
  }
  function resetGame() {
    generation++;
    if (pendingAdvance !== null) { clearTimeout(pendingAdvance); pendingAdvance = null; }
    levelIndex = 0; roundIndex = 0; correctAtLevel = 0;
    score = 0; correctRounds = 0; errors = 0; attemptedRounds = 0;
    activeMs = 0; responseDeadline = 0; paused = false;
    sequence = []; answers = []; mistakes = []; roundResults = [];
    session = null; sessionStartIso = null; sessionSaved = false; levelAttempts = 0;
    el.pause.textContent = "PAUSE";
    el.start.hidden = false;
    el.results.hidden = true;
    el.summary.replaceChildren(); el.mistakes.replaceChildren();
    buildBoard(); setPhase("ready"); updateHud();
    el.progress.textContent = "SEQUENCE: â€”";
    status("Press START to begin the first memory challenge.");
  }
  function retryLevel() {
    if (phase === "ready" || phase === "finished") return;
    // Cancel preview and scheduled transitions, but preserve scores, recorded
    // mistakes, completed trials and accuracy history from earlier attempts.
    generation++;
    if (pendingAdvance !== null) { clearTimeout(pendingAdvance); pendingAdvance = null; }
    paused = false;
    responseDeadline = 0;
    levelAttempts++;
    roundIndex = 0;
    correctAtLevel = 0;
    el.pause.textContent = "PAUSE";
    buildBoard();
    updateHud();
    status(`VOLUNTARY RETRY â€” level ${levelIndex + 1}. Previous attempts and errors remain recorded.`);
    startRound();
  }
  function togglePause() {
    if (phase === "ready" || phase === "finished" || phase === "levelComplete") return;
    paused = !paused;
    el.pause.textContent = paused ? "RESUME" : "PAUSE";
    boardTiles.forEach(t => { t.disabled = paused || phase !== "input"; });
    if (paused) status("PAUSED â€” memory sequence and response timer are frozen.");
    else status(phase === "preview" ? "Watch the illuminated sequence." : phase === "input" ? "Repeat the illuminated sequence in order." : "Continuing...");
  }
  function reviewErrors() {
    if (phase !== "finished") return;
    const show = el.mistakes.hidden;
    el.mistakes.hidden = !show;
    el.review.textContent = show ? "HIDE ERROR REVIEW" : "REVIEW ERRORS";
    if (!show) return;
    el.mistakes.replaceChildren();
    const heading = document.createElement("h3"); heading.textContent = "ERROR REVIEW â€” SESSION DETAILS";
    el.mistakes.append(heading);
    if (!mistakes.length) {
      const p = document.createElement("p"); p.textContent = "No errors recorded in this session."; el.mistakes.append(p); return;
    }
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const hr = document.createElement("tr");
    for (const label of ["LEVEL", "ROUND", "ERROR", "DETAILS"]) { const th = document.createElement("th");th.textContent = label;hr.append(th); }
    thead.append(hr);table.append(thead);
    const tbody = document.createElement("tbody");
    for (const err of mistakes) {
      const tr = document.createElement("tr");
      const detail = err.reason === "wrong_tile" ? `Expected square ${err.expectedSquare}; selected square ${err.chosenSquare}. Step ${err.step}.` : `Response window expired. ${err.note}`;
      for (const value of [err.level, err.round, err.reason.replace("_", " "), detail]) { const td = document.createElement("td");td.textContent = String(value);tr.append(td); }
      tbody.append(tr);
    }
    table.append(tbody);el.mistakes.append(table);
  }
  function exportResults() {
    if (phase !== "finished" || !session) return;
    const blob = new Blob([JSON.stringify(session, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = `VITALS_working_memory_${new Date().toISOString().replace(/[:.]/g,"-")}.json`;
    document.body.append(link);link.click();link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function frame(now) {
    const elapsed = Math.min(120, Math.max(0, now - previousFrame));
    previousFrame = now;
    if (!paused && ["preview", "input", "feedback"].includes(phase)) activeMs += elapsed;
    el.clock.textContent = formatClock(activeMs);
    if (phase === "input" && !paused) {
      const left = Math.max(0, responseDeadline - activeMs);
      el.remaining.textContent = `RESPONSE WINDOW: ${(left / 1000).toFixed(1)} s`;
      if (left === 0) {
        errorLog("timeout", sequence[answers.length], null, `${answers.length} of ${sequence.length} squares recalled before time expired`);
        finishRound(false, "Time expired.");
      }
    }
    requestAnimationFrame(frame);
  }
  el.start.addEventListener("click", () => {
    if (phase !== "ready") return;
    sessionStartIso = new Date().toISOString();
    startRound();
  });
  el.pause.addEventListener("click", togglePause);
  el.restart.addEventListener("click", resetGame);
  el.retry.addEventListener("click", retryLevel);
  el.review.addEventListener("click", reviewErrors);
  el.export.addEventListener("click", exportResults);
  resetGame();
  requestAnimationFrame(frame);
})();

