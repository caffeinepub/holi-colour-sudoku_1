import { cn } from "@/lib/utils";
import { COLOURS } from "@/utils/colours";

export type CellState =
  | { type: "empty" }
  | { type: "clue"; colourId: number }
  | { type: "player"; colourId: number }
  | { type: "pencil"; candidates: number[] };

interface SudokuCellProps {
  index: number; // 0–35
  state: CellState;
  colourBlind: boolean;
  isDragOver: boolean;
  onDrop: (index: number, colourId: number) => void;
  onDragOver: (index: number) => void;
  onDragLeave: () => void;
  onDoubleClick: (index: number) => void;
}

const colourOf = (id: number) => COLOURS.find((c) => c.id === id);

export default function SudokuCell({
  index,
  state,
  colourBlind,
  isDragOver,
  onDrop,
  onDragOver,
  onDragLeave,
  onDoubleClick,
}: SudokuCellProps) {
  const row = Math.floor(index / 6);
  const col = index % 6;

  // 2×3 boxes: thick right after column 2 (0-indexed), thick bottom after rows 1, 3
  const thickRight = col === 2;
  const thickBottom = row === 1 || row === 3;

  const canDrop = state.type === "empty" || state.type === "pencil";
  const isClue = state.type === "clue";
  const isPlayer = state.type === "player";

  const handleDragOver = (e: React.DragEvent) => {
    if (!canDrop) return;
    e.preventDefault();
    onDragOver(index);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!canDrop) return;
    const colourId = Number.parseInt(e.dataTransfer.getData("colourId"), 10);
    if (!Number.isNaN(colourId)) {
      onDrop(index, colourId);
    }
  };

  const handleDoubleClick = () => {
    if (isPlayer) {
      onDoubleClick(index);
    }
  };

  return (
    <div
      className={cn(
        "sudoku-cell",
        isClue && "cell-clue",
        isPlayer && "cell-player",
        state.type === "empty" && "cell-empty",
        state.type === "pencil" && "cell-pencil",
        isDragOver && canDrop && "drag-over",
        thickRight && "border-right-thick",
        thickBottom && "border-bottom-thick",
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={onDragLeave}
      onDoubleClick={handleDoubleClick}
      title={isPlayer ? "Double-click to remove" : undefined}
    >
      {(state.type === "clue" || state.type === "player") &&
        (() => {
          const colour = colourOf(state.colourId);
          if (!colour) return null;
          return (
            <div
              className="w-full h-full flex items-center justify-center relative"
              style={{
                background: colour.hex,
                opacity: isClue ? 0.9 : 1,
              }}
            >
              {colourBlind && (
                <span
                  className="cb-label"
                  style={{
                    color: colour.textColour,
                    fontSize: "clamp(0.4rem, 1.2vw, 0.6rem)",
                  }}
                >
                  {colour.cbLabel}
                </span>
              )}
              {isClue && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(0,0,0,0.12) 0%, transparent 60%)",
                  }}
                />
              )}
            </div>
          );
        })()}

      {state.type === "pencil" && (
        <div className="pencil-dots">
          {Array.from({ length: 6 }, (_, i) => {
            const colourId = state.candidates[i];
            const colour = colourId ? colourOf(colourId) : null;
            // Use a stable compound key from position
            const dotKey = `dot-${index}-${i}`;
            return (
              <div
                key={dotKey}
                className="pencil-dot"
                style={{
                  background: colour ? colour.hex : "transparent",
                  opacity: colour ? 0.9 : 0,
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
