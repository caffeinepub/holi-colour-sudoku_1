import { Button } from "@/components/ui/button";
import { useGetClues, useSubmitPuzzle } from "@/hooks/useQueries";
import { COLOURS } from "@/utils/colours";
import { Eraser, Eye, EyeOff, Pencil, Trophy } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import ColourTile from "./ColourTile";
import SudokuCell, { type CellState } from "./SudokuCell";

interface GameScreenProps {
  playerName: string;
  sesaId: string;
}

type GamePhase = "playing" | "confirming" | "submitted" | "error";

// Stable cell position IDs (0–35) — never reorder
const CELL_IDS = Array.from({ length: 36 }, (_, i) => i);

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function GameScreen({ playerName, sesaId }: GameScreenProps) {
  const { data: clues, isLoading: cluesLoading } = useGetClues();
  const submitMutation = useSubmitPuzzle();

  // ── Board state: 36 cells ────────────────────────────────────────────
  const [cells, setCells] = useState<CellState[]>(() =>
    Array.from({ length: 36 }, () => ({ type: "empty" }) as CellState),
  );

  // ── Initialise clue cells once loaded ────────────────────────────────
  const initialised = useRef(false);
  useEffect(() => {
    if (clues && clues.length === 36 && !initialised.current) {
      initialised.current = true;
      setCells(
        clues.map((v) => {
          const n = Number(v);
          if (n >= 1 && n <= 6)
            return { type: "clue", colourId: n } as CellState;
          return { type: "empty" } as CellState;
        }),
      );
    }
  }, [clues]);

  // ── Timer ─────────────────────────────────────────────────────────────
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<GamePhase>("playing");

  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (phaseRef.current === "playing") setElapsed((s) => s + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ── UI toggles ────────────────────────────────────────────────────────
  const [colourBlind, setColourBlind] = useState(false);
  const [pencilMode, setPencilMode] = useState(false);
  const [phase, setPhase] = useState<GamePhase>("playing");
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState("");

  const setPhaseSync = (p: GamePhase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  // ── Drag handlers ─────────────────────────────────────────────────────
  const handleDragStart = useCallback((_colourId: number) => {}, []);

  const handleDrop = useCallback(
    (index: number, colourId: number) => {
      setDragOverIndex(null);
      setCells((prev) => {
        const cell = prev[index];
        if (cell.type === "clue") return prev;
        if (cell.type === "player") return prev; // filled → can't replace

        const next = [...prev];

        if (pencilMode) {
          // Toggle pencil candidate
          const current = cell.type === "pencil" ? cell.candidates : [];
          const exists = current.includes(colourId);
          const updated = exists
            ? current.filter((c) => c !== colourId)
            : [...current, colourId].slice(0, 6);
          next[index] =
            updated.length === 0
              ? { type: "empty" }
              : { type: "pencil", candidates: updated };
        } else {
          // Place mode — commit colour, clearing any pencil marks
          next[index] = { type: "player", colourId };
        }
        return next;
      });
    },
    [pencilMode],
  );

  const handleDoubleClick = useCallback((index: number) => {
    setCells((prev) => {
      const cell = prev[index];
      if (cell.type !== "player") return prev;
      const next = [...prev];
      next[index] = { type: "empty" };
      return next;
    });
  }, []);

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmitClick = () => {
    setPhaseSync("confirming");
  };

  const handleConfirmSubmit = async () => {
    // Build 81-element bigint array; 0 for empty/pencil
    const boardState = cells.map((cell) => {
      if (cell.type === "clue" || cell.type === "player")
        return BigInt(cell.colourId);
      return 0n;
    });

    try {
      await submitMutation.mutateAsync({
        sesaId,
        boardState,
        timeTakenSeconds: BigInt(elapsed),
      });
      setPhaseSync("submitted");
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitError(String(err));
      setPhaseSync("error");
    }
  };

  const handleCancelSubmit = () => {
    setPhaseSync("playing");
  };

  // ── Submitted screen ──────────────────────────────────────────────────
  if (phase === "submitted") {
    return (
      <div className="min-h-screen holi-bg flex flex-col items-center justify-center px-4 py-8">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="w-full max-w-md text-center"
        >
          <div className="holi-gradient rounded-3xl p-8 text-white shadow-2xl">
            <Trophy className="w-16 h-16 mx-auto mb-4 drop-shadow-lg" />
            <h2 className="font-display text-3xl font-bold mb-2">
              Puzzle Submitted!
            </h2>
            <p className="font-ui text-lg opacity-90 mb-1">
              Well done, <strong>{playerName}</strong>!
            </p>
            <p className="font-ui text-4xl font-bold mt-3 mb-1">
              {formatTime(elapsed)}
            </p>
            <p className="text-sm opacity-80 font-ui">Time taken</p>
            <div className="mt-6 text-sm opacity-85 font-ui bg-white/20 rounded-xl p-3">
              Happy Holi &amp; Dhuleti! 🌈 May the colours of Holi bring joy and
              prosperity to your life. Your submission has been recorded.
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Error screen ──────────────────────────────────────────────────────
  if (phase === "error") {
    return (
      <div className="min-h-screen holi-bg flex flex-col items-center justify-center px-4">
        <div className="bg-card rounded-2xl p-8 text-center max-w-md shadow-xl">
          <h2 className="font-display text-2xl font-bold text-destructive mb-3">
            Submission Failed
          </h2>
          <p className="text-sm text-muted-foreground font-ui mb-2">
            {submitError}
          </p>
          <p className="text-sm text-muted-foreground font-ui mb-6">
            This may mean your puzzle was already submitted, or there was a
            connection issue.
          </p>
          <Button
            onClick={() => setPhaseSync("playing")}
            className="holi-gradient text-white border-0"
          >
            Back to Game
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen holi-bg flex flex-col">
      {/* ── Header ── */}
      <header className="holi-gradient text-white px-4 py-3 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h1 className="font-display text-xl md:text-2xl font-bold leading-tight">
              Holi Colour Sudoku
            </h1>
            <p className="text-xs opacity-80 font-ui">
              {playerName} · {sesaId}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Timer */}
            <div className="bg-white/20 rounded-lg px-3 py-1.5 font-ui font-bold text-lg tabular-nums">
              {formatTime(elapsed)}
            </div>
            {/* Colour-blind toggle */}
            <button
              type="button"
              data-ocid="game.colorblind.toggle"
              onClick={() => setColourBlind((v) => !v)}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1.5 text-sm font-ui font-medium transition-colors"
              aria-pressed={colourBlind}
              title={
                colourBlind
                  ? "Disable colour-blind mode"
                  : "Enable colour-blind mode"
              }
            >
              {colourBlind ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {colourBlind ? "CB: ON" : "CB: OFF"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col items-center px-2 py-4 md:py-6 gap-4">
        {cluesLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full holi-gradient animate-spin mx-auto mb-3 opacity-70" />
              <p className="font-ui text-muted-foreground">Loading puzzle…</p>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-4 lg:gap-6 items-start justify-center">
            {/* Board + controls */}
            <div className="flex flex-col items-center gap-3 w-full lg:flex-1">
              {/* Pencil mode toggle */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-ocid="game.pencil.toggle"
                  onClick={() => setPencilMode((v) => !v)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-ui font-semibold border-2 transition-all ${
                    pencilMode
                      ? "bg-amber-100 border-amber-400 text-amber-800"
                      : "bg-card border-border text-foreground hover:border-primary"
                  }`}
                  aria-pressed={pencilMode}
                >
                  {pencilMode ? (
                    <Pencil className="w-4 h-4" />
                  ) : (
                    <Eraser className="w-4 h-4" />
                  )}
                  {pencilMode ? "Pencil Mode ON" : "Place Mode"}
                </button>
                {pencilMode && (
                  <span className="text-xs text-amber-700 font-ui bg-amber-50 rounded-full px-2 py-0.5">
                    Drops add candidates
                  </span>
                )}
              </div>

              {/* The 6×6 board */}
              <div
                data-ocid="game.board.canvas_target"
                className="sudoku-grid w-full"
                style={{ maxWidth: "min(90vw, 360px)" }}
              >
                {CELL_IDS.map((pos) => (
                  <SudokuCell
                    key={`sudoku-cell-pos-${pos}`}
                    index={pos}
                    state={cells[pos]}
                    colourBlind={colourBlind}
                    isDragOver={dragOverIndex === pos}
                    onDrop={handleDrop}
                    onDragOver={setDragOverIndex}
                    onDragLeave={() => setDragOverIndex(null)}
                    onDoubleClick={handleDoubleClick}
                  />
                ))}
              </div>

              <p className="text-xs text-muted-foreground font-ui text-center max-w-xs">
                Double-click a filled cell to remove it. Clue cells (slightly
                shaded) are fixed.
              </p>
            </div>

            {/* Colour palette sidebar */}
            <aside className="w-full lg:w-auto flex flex-col items-center gap-3">
              <div className="bg-card rounded-2xl shadow-md p-4 w-full lg:w-auto">
                <h3 className="font-ui font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3 text-center">
                  Colour Palette
                </h3>
                <div className="grid grid-cols-6 lg:grid-cols-3 gap-2 lg:gap-3">
                  {COLOURS.map((colour, i) => (
                    <ColourTile
                      key={colour.id}
                      colour={colour}
                      colourBlind={colourBlind}
                      index={i + 1}
                      onDragStart={handleDragStart}
                      size="md"
                    />
                  ))}
                </div>
                <div className="mt-3 space-y-1">
                  {COLOURS.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-2 text-xs font-ui text-muted-foreground"
                    >
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ background: c.hex }}
                      />
                      <span>{c.name}</span>
                      {colourBlind && (
                        <span className="ml-auto font-bold text-foreground">
                          {c.cbLabel}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit button */}
              <Button
                data-ocid="game.submit_button"
                onClick={handleSubmitClick}
                className="w-full lg:w-auto px-8 h-11 font-ui font-semibold holi-gradient text-white border-0 shadow-lg hover:opacity-90 transition-opacity rounded-xl"
              >
                🏳️ Submit Puzzle
              </Button>
            </aside>
          </div>
        )}
      </main>

      {/* ── Confirm dialog ── */}
      <AnimatePresence>
        {phase === "confirming" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              data-ocid="game.dialog"
            >
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                Submit your puzzle?
              </h3>
              <p className="text-sm text-muted-foreground font-ui mb-5">
                You won&apos;t be able to continue after this. Your time of{" "}
                <strong className="text-foreground">
                  {formatTime(elapsed)}
                </strong>{" "}
                will be recorded.
              </p>
              <div className="flex gap-3">
                <Button
                  data-ocid="game.cancel_button"
                  variant="outline"
                  className="flex-1 font-ui"
                  onClick={handleCancelSubmit}
                  disabled={submitMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="game.confirm_button"
                  className="flex-1 font-ui holi-gradient text-white border-0"
                  onClick={handleConfirmSubmit}
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? "Submitting…" : "Submit!"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground py-3 font-ui">
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Built with ♥ using caffeine.ai
        </a>
      </footer>
    </div>
  );
}
