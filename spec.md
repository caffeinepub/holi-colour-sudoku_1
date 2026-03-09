# Holi Colour Sudoku

## Current State
A 9x9 colour-based Sudoku game with:
- 9 colours (Red, Orange, Yellow, Green, Teal, Blue, Purple, Pink, Brown)
- 9x9 grid with 3x3 internal boxes
- Backend stores 81-cell board state, solution of 81 elements
- Frontend: SudokuCell uses col%3 and row%3 for thick borders
- Palette shows 9 colours; pencil dots grid is 3x3
- Instructions mention "9 colours" and "3×3 box"
- AdminScreen BoardPreview renders 9-column grid (81 cells)
- Colour-blind labels: R, O, Y, G, T, B, P, Pi, Br

## Requested Changes (Diff)

### Add
- 6th colour entry in COLOURS array (keeping first 6: Red, Orange, Yellow, Green, Teal, Blue)
- A valid 6x6 puzzle clue grid (36 cells) with 2x3 internal boxes
- A valid 6x6 solution (36 cells)

### Modify
- Backend: `clues` and `solution` arrays from 81-cell to 36-cell (6x6). Board size validation from 81 to 36.
- `colours.ts`: trim COLOURS to 6 entries (ids 1–6)
- `SudokuCell.tsx`: Change grid from 9-wide to 6-wide; thick borders at col%3==2 (after col 3) and row%2==1 (after row 2) — i.e., thick right on col 2 only (0-indexed), thick bottom on row 1 only — forming 2x3 boxes (2 rows x 3 cols each)
- `index.css`: `.sudoku-grid` grid-template-columns from `repeat(9, 1fr)` to `repeat(6, 1fr)`. Pencil dots grid from 3x3 to 2x3 (matching 6 colours)
- `GameScreen.tsx`: CELL_IDS from 81 to 36; clues check from 81 to 36; pencil candidates cap from 9 to 6; palette grid from `grid-cols-9 lg:grid-cols-3` to `grid-cols-6 lg:grid-cols-3`; board submit boardState from 81 bigint to 36 bigint
- `InstructionsScreen.tsx`: Update colour count references from 9 to 6; box description from "3×3" to "2×3"; colour-blind labels updated
- `AdminScreen.tsx`: PREVIEW_POSITIONS from 81 to 36; BoardPreview grid from 9 columns to 6 columns; thick border logic updated for 6x6; board size check from 81 to 36

### Remove
- Colours 7 (Purple), 8 (Pink), 9 (Brown) from COLOURS array

## Implementation Plan
1. Update `main.mo`: new 36-cell clues + solution arrays, validate size 36
2. Update `colours.ts`: trim to 6 colours
3. Update `SudokuCell.tsx`: 6x6 box border logic (2-row x 3-col boxes)
4. Update `index.css`: 6-column grid, 2x3 pencil dots
5. Update `GameScreen.tsx`: 36 cells, 6-colour palette layout
6. Update `InstructionsScreen.tsx`: text references to 6 colours and 2×3 boxes
7. Update `AdminScreen.tsx`: 36-cell preview, 6-column board preview
