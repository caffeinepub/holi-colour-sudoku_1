# Holi Colour Sudoku

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Pre-game registration screen: participants enter their Name and SESA ID before starting
- SESA ID uniqueness check: same SESA ID cannot play twice; show an error if already registered
- Instructions screen shown before the game starts, explaining:
  - How Sudoku works (rows, columns, 3x3 boxes must each contain each colour exactly once)
  - How to use pencil/candidate mode (small colour dots inside a cell)
- Colour Sudoku board: 9x9 grid where colours replace numbers (9 distinct colours)
- 9 pre-filled clue cells (given cells that cannot be changed)
- Colour tile palette: 9 draggable colour tiles below/beside the board that players drag onto empty cells
- Pencil mode toggle: switch between "place colour" mode and "pencil/candidate" mode
  - In pencil mode, dragging/dropping a colour adds a small dot candidate inside the cell
  - In regular mode, dropping a colour fills the cell with that colour
- Double-click to remove a player-placed tile (clue cells are protected)
- 3x3 box demarcation with thick borders clearly separating the nine 3x3 sub-grids
- Colour-blind toggle: switches colours to an accessible palette with distinct patterns or labels
- Game timer: starts when the puzzle becomes visible, counts up in mm:ss
- Submit button: always visible; allows partial submission
- On submit: records name, SESA ID, board state, time taken, and whether the puzzle is complete/correct
- Admin leaderboard view (separate route `/admin`): shows all submissions sorted by time, with columns: Rank, Name, SESA ID, Time Taken, Status (Correct / Incorrect / Incomplete)

### Modify
- Nothing (new project)

### Remove
- Nothing (new project)

## Implementation Plan

### Backend (Motoko)
1. `registerParticipant(name: Text, sesaId: Text) -> Result<(), Text>`: checks if SESA ID already used; if yes, return error; if no, store participant
2. `submitPuzzle(sesaId: Text, boardState: [[Nat]], timeTakenSeconds: Nat) -> Result<(), Text>`: saves submission; computes correctness by comparing against the known solution
3. `getSubmissions() -> [Submission]`: returns all submissions for the admin view (no auth gate for now, accessed via `/admin`)
4. Store a hardcoded Sudoku puzzle (clues) and its solution in the backend

### Frontend
1. **InstructionsScreen**: shown first with rules and pencil mode explanation, "Got it, let's play!" button
2. **RegistrationScreen**: name + SESA ID input, validation, calls `registerParticipant`
3. **GameScreen**:
   - 9x9 board with thick borders for 3x3 boxes
   - Colour palette of 9 draggable tiles
   - Drag-and-drop: HTML5 drag API or react-dnd
   - Pencil mode toggle button
   - Colour-blind toggle (top-right)
   - Live timer
   - Submit button (always enabled)
   - Double-click cell to remove player-placed colour
4. **AdminScreen** at `/admin`: table of all submissions, sortable by time, shows correctness
5. Colour mapping: 9 colours (red, orange, yellow, green, teal, blue, purple, pink, brown) with colour-blind alternatives using patterns/labels
