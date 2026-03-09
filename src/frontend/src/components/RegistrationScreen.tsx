import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActor } from "@/hooks/useActor";
import { useRegisterParticipant } from "@/hooks/useQueries";
import { motion } from "motion/react";
import { useState } from "react";

interface RegistrationScreenProps {
  onRegistered: (name: string, sesaId: string) => void;
}

export default function RegistrationScreen({
  onRegistered,
}: RegistrationScreenProps) {
  const [name, setName] = useState("");
  const [sesaId, setSesaId] = useState("");
  const [error, setError] = useState("");
  const { actor } = useActor();
  const registerMutation = useRegisterParticipant();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedSesaId = sesaId.trim().toUpperCase();

    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }
    if (!trimmedSesaId) {
      setError("Please enter your SESA ID.");
      return;
    }

    if (!actor) {
      setError("Connection not ready. Please wait a moment and try again.");
      return;
    }

    try {
      // Check if already registered
      const alreadyRegistered = await actor.isRegistered(trimmedSesaId);
      if (alreadyRegistered) {
        // Check if they've submitted already
        const alreadySubmitted = await actor.hasSubmitted(trimmedSesaId);
        if (alreadySubmitted) {
          setError(
            "This SESA ID has already participated and submitted. Each participant can only play once.",
          );
          return;
        }
        // Registered but not submitted — let them continue
        onRegistered(trimmedName, trimmedSesaId);
        return;
      }

      // Register new participant
      await registerMutation.mutateAsync({
        name: trimmedName,
        sesaId: trimmedSesaId,
      });
      onRegistered(trimmedName, trimmedSesaId);
    } catch (err) {
      console.error("Registration error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  const isLoading = registerMutation.isPending;

  return (
    <div className="min-h-screen holi-bg flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo / Title */}
        <div className="holi-gradient rounded-2xl p-6 text-center text-white shadow-xl mb-6">
          <h1 className="font-display text-3xl font-bold">
            Holi Colour Sudoku
          </h1>
          <p className="text-sm opacity-85 font-ui mt-1">
            Register to start the puzzle
          </p>
        </div>

        {/* Form */}
        <div className="bg-card rounded-2xl shadow-xl p-6 md:p-8">
          <h2 className="font-display text-xl font-bold mb-5 text-foreground">
            Enter Your Details
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="participant-name"
                className="font-ui font-medium text-foreground"
              >
                Full Name
              </Label>
              <Input
                id="participant-name"
                data-ocid="registration.name.input"
                type="text"
                placeholder="e.g. Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                autoComplete="name"
                className="h-11 font-ui"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="sesa-id"
                className="font-ui font-medium text-foreground"
              >
                SESA ID
              </Label>
              <Input
                id="sesa-id"
                data-ocid="registration.sesaid.input"
                type="text"
                placeholder="e.g. SE123456"
                value={sesaId}
                onChange={(e) => setSesaId(e.target.value)}
                disabled={isLoading}
                autoComplete="off"
                className="h-11 font-ui uppercase"
              />
              <p className="text-xs text-muted-foreground font-ui">
                Your Schneider Electric employee ID. Each ID can participate
                only once.
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                data-ocid="registration.error_state"
                className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-4 py-3 text-sm font-ui"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              data-ocid="registration.submit_button"
              disabled={isLoading || !name.trim() || !sesaId.trim()}
              className="w-full h-11 font-ui font-semibold holi-gradient text-white border-0 shadow-lg hover:opacity-90 transition-opacity rounded-xl"
            >
              {isLoading ? "Registering..." : "🎨 Start the Puzzle!"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4 font-ui">
          Happy Holi &amp; Dhuleti! 🌈
        </p>
      </motion.div>
    </div>
  );
}
