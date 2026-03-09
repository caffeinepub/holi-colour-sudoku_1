import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetParticipants, useGetSubmissions } from "@/hooks/useQueries";
import { COLOURS } from "@/utils/colours";
import { useQueryClient } from "@tanstack/react-query";
import { Clock, RefreshCw, Trophy, Users } from "lucide-react";
import { motion } from "motion/react";
import type { Submission } from "../backend.d";

function formatTime(seconds: bigint): string {
  const total = Number(seconds);
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function formatDate(nanos: bigint): string {
  const ms = Number(nanos / 1_000_000n);
  return new Date(ms).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getStatus(sub: Submission): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
} {
  const hasAll = sub.boardState.every((v) => v > 0n);
  if (!hasAll) return { label: "Incomplete", variant: "outline" };
  if (sub.isCorrect) return { label: "Correct ✓", variant: "default" };
  return { label: "Incorrect ✗", variant: "destructive" };
}

function sortSubmissions(subs: Submission[]): Submission[] {
  return [...subs].sort((a, b) => {
    const aCorrect = a.isCorrect;
    const bCorrect = b.isCorrect;
    const aComplete = a.boardState.every((v) => v > 0n);
    const bComplete = b.boardState.every((v) => v > 0n);

    // Correct + complete first
    const aScore = aCorrect && aComplete ? 0 : aComplete ? 1 : 2;
    const bScore = bCorrect && bComplete ? 0 : bComplete ? 1 : 2;
    if (aScore !== bScore) return aScore - bScore;

    // Then by time ascending
    return Number(a.timeTakenSeconds - b.timeTakenSeconds);
  });
}

// Stable 0–35 positions for board preview rendering
const PREVIEW_POSITIONS = Array.from({ length: 36 }, (_, i) => i);

// Mini board preview
function BoardPreview({ boardState }: { boardState: bigint[] }) {
  return (
    <div
      className="grid gap-px"
      style={{
        gridTemplateColumns: "repeat(6, 1fr)",
        width: 72,
        height: 72,
        background: "#ccc",
        border: "1px solid #999",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      {PREVIEW_POSITIONS.map((pos) => {
        const v = boardState[pos] ?? 0n;
        const id = Number(v);
        const colour = COLOURS.find((c) => c.id === id);
        const row = Math.floor(pos / 6);
        const col = pos % 6;
        const thickR = col === 2;
        const thickB = row === 1 || row === 3;
        return (
          <div
            key={`board-preview-pos-${pos}`}
            style={{
              background: colour ? colour.hex : "#f5f5f5",
              borderRight: thickR ? "2px solid #555" : undefined,
              borderBottom: thickB ? "2px solid #555" : undefined,
            }}
          />
        );
      })}
    </div>
  );
}

export default function AdminScreen() {
  const {
    data: submissions = [],
    isLoading: subsLoading,
    isError: subsError,
  } = useGetSubmissions();
  const { data: participants = [], isLoading: partsLoading } =
    useGetParticipants();
  const queryClient = useQueryClient();

  const sorted = sortSubmissions(submissions);
  const winner = sorted.find(
    (s) => s.isCorrect && s.boardState.every((v) => v > 0n),
  );

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["submissions"] });
    queryClient.invalidateQueries({ queryKey: ["participants"] });
  };

  return (
    <div className="min-h-screen holi-bg pb-12">
      {/* Header */}
      <header className="holi-gradient text-white px-4 py-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-ui opacity-80 uppercase tracking-wider">
              Engagement &amp; Collaboration Team
            </p>
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              Holi Colour Sudoku — Admin
            </h1>
          </div>
          <Button
            data-ocid="admin.refresh_button"
            onClick={handleRefresh}
            className="bg-white/20 hover:bg-white/30 text-white border-0 font-ui gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="Registered"
            value={partsLoading ? "…" : String(participants.length)}
            colour="oklch(0.62 0.17 235)"
          />
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="Submitted"
            value={subsLoading ? "…" : String(submissions.length)}
            colour="oklch(0.68 0.19 50)"
          />
          <StatCard
            icon={<Trophy className="w-5 h-5" />}
            label="Correct"
            value={
              subsLoading
                ? "…"
                : String(submissions.filter((s) => s.isCorrect).length)
            }
            colour="oklch(0.65 0.22 145)"
          />
          <StatCard
            icon={<Trophy className="w-5 h-5" />}
            label="Winner"
            value={winner ? winner.name : "TBD"}
            colour="oklch(0.68 0.28 340)"
            small
          />
        </div>

        {/* Winner highlight */}
        {winner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="holi-gradient rounded-2xl p-5 text-white shadow-xl flex items-center gap-4 flex-wrap"
          >
            <Trophy className="w-10 h-10 shrink-0 drop-shadow" />
            <div>
              <p className="font-ui text-sm opacity-85 uppercase tracking-wide">
                🏆 Winner!
              </p>
              <p className="font-display text-2xl font-bold">{winner.name}</p>
              <p className="font-ui text-sm opacity-90">
                SESA: {winner.sesaId} · Time:{" "}
                {formatTime(winner.timeTakenSeconds)}
              </p>
            </div>
          </motion.div>
        )}

        {/* Submissions table */}
        <div className="bg-card rounded-2xl shadow-md overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-foreground">
              All Submissions
            </h2>
            <span className="text-sm text-muted-foreground font-ui">
              {submissions.length} submission
              {submissions.length !== 1 ? "s" : ""}
            </span>
          </div>

          {subsLoading ? (
            <div className="p-8 text-center text-muted-foreground font-ui">
              Loading submissions…
            </div>
          ) : subsError ? (
            <div
              data-ocid="admin.error_state"
              className="p-8 text-center text-destructive font-ui"
            >
              Failed to load submissions.
            </div>
          ) : submissions.length === 0 ? (
            <div
              data-ocid="admin.empty_state"
              className="p-8 text-center text-muted-foreground font-ui"
            >
              No submissions yet. Participants are still playing!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-ocid="admin.table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-ui font-semibold w-12">
                      Rank
                    </TableHead>
                    <TableHead className="font-ui font-semibold">
                      Name
                    </TableHead>
                    <TableHead className="font-ui font-semibold">
                      SESA ID
                    </TableHead>
                    <TableHead className="font-ui font-semibold">
                      Time
                    </TableHead>
                    <TableHead className="font-ui font-semibold">
                      Status
                    </TableHead>
                    <TableHead className="font-ui font-semibold">
                      Submitted At
                    </TableHead>
                    <TableHead className="font-ui font-semibold">
                      Board Preview
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((sub, idx) => {
                    const status = getStatus(sub);
                    const isWinner = sub === winner;
                    return (
                      <TableRow
                        key={sub.sesaId}
                        className={
                          isWinner ? "bg-amber-50 dark:bg-amber-900/20" : ""
                        }
                        data-ocid={`admin.row.${idx + 1}`}
                      >
                        <TableCell className="font-ui font-bold text-center">
                          {isWinner ? "🏆" : idx + 1}
                        </TableCell>
                        <TableCell className="font-ui font-medium">
                          {sub.name}
                          {isWinner && (
                            <Badge className="ml-2 text-xs bg-amber-400 text-amber-900 border-0">
                              Winner!
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-ui text-muted-foreground text-sm">
                          {sub.sesaId}
                        </TableCell>
                        <TableCell className="font-ui tabular-nums">
                          {formatTime(sub.timeTakenSeconds)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={status.variant}
                            className="font-ui text-xs"
                          >
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-ui text-sm text-muted-foreground">
                          {formatDate(sub.submittedAt)}
                        </TableCell>
                        <TableCell>
                          <BoardPreview boardState={sub.boardState} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Registered participants */}
        <div className="bg-card rounded-2xl shadow-md overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-display text-lg font-bold text-foreground">
              Registered Participants ({participants.length})
            </h2>
          </div>
          {partsLoading ? (
            <div className="p-6 text-center text-muted-foreground font-ui">
              Loading…
            </div>
          ) : participants.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground font-ui">
              No participants registered yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-ui font-semibold">#</TableHead>
                    <TableHead className="font-ui font-semibold">
                      Name
                    </TableHead>
                    <TableHead className="font-ui font-semibold">
                      SESA ID
                    </TableHead>
                    <TableHead className="font-ui font-semibold">
                      Registered At
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((p, idx) => (
                    <TableRow key={p.sesaId}>
                      <TableCell className="font-ui text-muted-foreground">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="font-ui font-medium">
                        {p.name}
                      </TableCell>
                      <TableCell className="font-ui text-muted-foreground">
                        {p.sesaId}
                      </TableCell>
                      <TableCell className="font-ui text-sm text-muted-foreground">
                        {formatDate(p.registeredAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      <footer className="text-center text-xs text-muted-foreground py-4 font-ui">
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

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  colour: string;
  small?: boolean;
}

function StatCard({ icon, label, value, colour, small }: StatCardProps) {
  return (
    <div className="bg-card rounded-xl shadow p-4 flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
        style={{ background: colour }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-ui uppercase tracking-wide">
          {label}
        </p>
        <p
          className={`font-display font-bold ${small ? "text-sm truncate" : "text-xl"} text-foreground`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
