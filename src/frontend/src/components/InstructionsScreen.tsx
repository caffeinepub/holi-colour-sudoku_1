import { Button } from "@/components/ui/button";
import { COLOURS } from "@/utils/colours";
import { motion } from "motion/react";

interface InstructionsScreenProps {
  onContinue: () => void;
}

const colourRow = COLOURS.slice(0, 6);

export default function InstructionsScreen({
  onContinue,
}: InstructionsScreenProps) {
  return (
    <div className="min-h-screen holi-bg flex flex-col items-center justify-center px-4 py-8">
      {/* Header banner */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl mb-6 rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="holi-gradient p-6 text-center text-white">
          <p className="text-sm font-ui font-semibold uppercase tracking-widest opacity-80 mb-1">
            Engagement &amp; Collaboration Team
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold drop-shadow-lg leading-tight">
            Holi Colour Sudoku
          </h1>
          <p className="mt-2 text-sm md:text-base opacity-90 font-ui">
            🎨 Celebrate the Festival of Colours with a puzzle!
          </p>
        </div>
      </motion.div>

      {/* Instructions card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-2xl bg-card rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-6 md:p-8 space-y-6">
          <h2 className="font-display text-2xl font-bold text-foreground">
            How to Play
          </h2>

          {/* Colour legend */}
          <section>
            <h3 className="font-ui font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
              The 6 Colours
            </h3>
            <div className="flex flex-wrap gap-2">
              {colourRow.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-ui shadow"
                  style={{ background: c.hex, color: c.textColour }}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-white/40"
                    style={{ background: c.hex, filter: "brightness(0.7)" }}
                  />
                  {c.name}
                </div>
              ))}
            </div>
          </section>

          {/* Rules */}
          <section>
            <h3 className="font-ui font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
              The Rules
            </h3>
            <ul className="space-y-2 text-sm text-foreground">
              {[
                {
                  id: "rule-row",
                  text: "Every row (6 cells wide) must contain each of the 6 colours exactly once.",
                },
                {
                  id: "rule-col",
                  text: "Every column (6 cells tall) must contain each of the 6 colours exactly once.",
                },
                {
                  id: "rule-box",
                  text: "Every 2×3 box (2 rows × 3 columns, boldly outlined) must contain each of the 6 colours exactly once.",
                },
                {
                  id: "rule-clue",
                  text: "Some cells are pre-filled as clues — these cannot be changed.",
                },
              ].map(({ id, text }, i) => (
                <li key={id} className="flex gap-2.5 items-start">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
                    style={{ background: COLOURS[i % 6].hex }}
                  >
                    {i + 1}
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Drag & Drop */}
          <section>
            <h3 className="font-ui font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
              How to Place Colours
            </h3>
            <div className="bg-muted rounded-xl p-4 text-sm space-y-2 text-foreground">
              <p>
                <span className="font-semibold">Drag & Drop:</span> Grab a
                colour tile from the palette on the right and drop it onto an
                empty cell on the board.
              </p>
              <p>
                <span className="font-semibold">Remove a colour:</span>{" "}
                Double-click any cell you filled to remove it and try again.
              </p>
              <p>
                <span className="font-semibold">Clue cells</span> (slightly
                shaded) are fixed and cannot be removed.
              </p>
            </div>
          </section>

          {/* Pencil mode */}
          <section>
            <h3 className="font-ui font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
              ✏️ Pencil Mode
            </h3>
            <div className="bg-muted rounded-xl p-4 text-sm space-y-2 text-foreground">
              <p>
                Toggle <span className="font-semibold">Pencil Mode</span> (✏️
                button near the board) to make <em>candidate marks</em> — small
                coloured dots inside a cell showing possible colours for that
                position.
              </p>
              <p>
                You can add multiple candidate dots to the same cell. Pencil
                marks <em>do not count</em> as final answers.
              </p>
              <p>
                Switching back to{" "}
                <span className="font-semibold">Place Mode</span> and dropping a
                colour onto a pencil-marked cell will commit it as the final
                answer, clearing all pencil marks.
              </p>
            </div>
          </section>

          {/* Colour-blind */}
          <section>
            <h3 className="font-ui font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
              👁️ Colour-Blind Mode
            </h3>
            <p className="text-sm text-foreground">
              Use the <span className="font-semibold">Colour-Blind toggle</span>{" "}
              in the header to add short letter labels (R, O, Y, G, T, B) on all
              colour tiles and filled cells, making them distinguishable without
              relying solely on colour.
            </p>
          </section>

          {/* Scoring */}
          <section className="bg-gradient-to-r from-pink-50 to-orange-50 border border-orange-200 rounded-xl p-4">
            <h3 className="font-ui font-semibold text-sm uppercase tracking-wider text-orange-700 mb-2">
              🏆 Winning
            </h3>
            <p className="text-sm text-foreground">
              The participant who submits a{" "}
              <strong>correct, complete solution</strong> in the{" "}
              <strong>least time</strong> wins! You can submit even with some
              cells unfilled, but only fully correct submissions qualify for the
              win.
            </p>
          </section>
        </div>

        <div className="px-6 md:px-8 pb-6 md:pb-8">
          <Button
            data-ocid="instructions.button"
            onClick={onContinue}
            className="w-full h-12 text-base font-ui font-semibold rounded-xl holi-gradient text-white border-0 shadow-lg hover:opacity-90 transition-opacity"
          >
            🎉 Let&apos;s Play!
          </Button>
        </div>
      </motion.div>

      <p className="mt-6 text-xs text-muted-foreground font-ui text-center">
        Happy Holi &amp; Dhuleti! 🌈
      </p>
    </div>
  );
}
