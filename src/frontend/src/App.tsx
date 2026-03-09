import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import AdminScreen from "./components/AdminScreen";
import GameScreen from "./components/GameScreen";
import InstructionsScreen from "./components/InstructionsScreen";
import RegistrationScreen from "./components/RegistrationScreen";

type AppScreen = "instructions" | "registration" | "game" | "admin";

interface Session {
  name: string;
  sesaId: string;
}

const SESSION_KEY = "holi_sudoku_session";

export default function App() {
  // ── Simple hash-based routing for /admin ─────────────────────────────
  const isAdmin =
    window.location.hash === "#admin" || window.location.pathname === "/admin";

  const [screen, setScreen] = useState<AppScreen>(() => {
    if (isAdmin) return "admin";
    // Restore session from localStorage
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const s = JSON.parse(saved) as Session;
        if (s.name && s.sesaId) return "game";
      }
    } catch {
      // ignore
    }
    return "instructions";
  });

  const [session, setSession] = useState<Session | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) return JSON.parse(saved) as Session;
    } catch {
      // ignore
    }
    return null;
  });

  // ── Hash change listener ──────────────────────────────────────────────
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === "#admin") setScreen("admin");
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  // ── Navigation handlers ───────────────────────────────────────────────
  const handleInstructionsContinue = () => {
    setScreen("registration");
  };

  const handleRegistered = (name: string, sesaId: string) => {
    const s = { name, sesaId };
    setSession(s);
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    } catch {
      // ignore
    }
    setScreen("game");
  };

  // ── Render ────────────────────────────────────────────────────────────
  if (screen === "admin") {
    return (
      <>
        <AdminScreen />
        <Toaster richColors />
      </>
    );
  }

  if (screen === "instructions") {
    return (
      <>
        <InstructionsScreen onContinue={handleInstructionsContinue} />
        <Toaster richColors />
      </>
    );
  }

  if (screen === "registration") {
    return (
      <>
        <RegistrationScreen onRegistered={handleRegistered} />
        <Toaster richColors />
      </>
    );
  }

  if (screen === "game" && session) {
    return (
      <>
        <GameScreen playerName={session.name} sesaId={session.sesaId} />
        <Toaster richColors />
      </>
    );
  }

  // Fallback
  return (
    <>
      <InstructionsScreen onContinue={handleInstructionsContinue} />
      <Toaster richColors />
    </>
  );
}
