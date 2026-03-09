import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Participant, Submission } from "../backend.d";
import { useActor } from "./useActor";

// ── Clues ─────────────────────────────────────────────────────────────────
export function useGetClues() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint[]>({
    queryKey: ["clues"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getClues();
    },
    enabled: !!actor && !isFetching,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

// ── Check registration ────────────────────────────────────────────────────
export function useIsRegistered(sesaId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isRegistered", sesaId],
    queryFn: async () => {
      if (!actor || !sesaId) return false;
      return actor.isRegistered(sesaId);
    },
    enabled: !!actor && !isFetching && sesaId.length > 0,
    staleTime: 30_000,
  });
}

// ── Check submission ──────────────────────────────────────────────────────
export function useHasSubmitted(sesaId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["hasSubmitted", sesaId],
    queryFn: async () => {
      if (!actor || !sesaId) return false;
      return actor.hasSubmitted(sesaId);
    },
    enabled: !!actor && !isFetching && sesaId.length > 0,
    staleTime: 10_000,
  });
}

// ── Register participant ──────────────────────────────────────────────────
export function useRegisterParticipant() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, sesaId }: { name: string; sesaId: string }) => {
      if (!actor) throw new Error("No actor available");
      await actor.registerParticipant(name, sesaId);
    },
    onSuccess: (_data, { sesaId }) => {
      queryClient.invalidateQueries({ queryKey: ["isRegistered", sesaId] });
      queryClient.invalidateQueries({ queryKey: ["participants"] });
    },
  });
}

// ── Submit puzzle ─────────────────────────────────────────────────────────
export function useSubmitPuzzle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sesaId,
      boardState,
      timeTakenSeconds,
    }: {
      sesaId: string;
      boardState: bigint[];
      timeTakenSeconds: bigint;
    }) => {
      if (!actor) throw new Error("No actor available");
      await actor.submitPuzzle(sesaId, boardState, timeTakenSeconds);
    },
    onSuccess: (_data, { sesaId }) => {
      queryClient.invalidateQueries({ queryKey: ["hasSubmitted", sesaId] });
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
    },
  });
}

// ── Get submissions (admin) ───────────────────────────────────────────────
export function useGetSubmissions() {
  const { actor, isFetching } = useActor();
  return useQuery<Submission[]>({
    queryKey: ["submissions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSubmissions();
    },
    enabled: !!actor && !isFetching,
    staleTime: 15_000,
  });
}

// ── Get participants (admin) ──────────────────────────────────────────────
export function useGetParticipants() {
  const { actor, isFetching } = useActor();
  return useQuery<Participant[]>({
    queryKey: ["participants"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getParticipants();
    },
    enabled: !!actor && !isFetching,
    staleTime: 15_000,
  });
}
