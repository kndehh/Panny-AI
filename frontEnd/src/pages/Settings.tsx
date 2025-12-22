import { useState } from "react";
import { usePannyStore } from "../store/usePannyStore";
import Dialog from "../components/ui/Dialog";
import Switch from "../components/ui/Switch";
import { Tabs, Tab } from "../components/ui/Tabs";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Input from "../components/ui/Input";

const personas: Array<{
  key: "calm" | "funny" | "sage";
  label: string;
  detail: string;
}> = [
  {
    key: "calm",
    label: "Calm Studio",
    detail: "Slow cadence, elongated pauses, somatic cues.",
  },
  {
    key: "funny",
    label: "Playful Bloom",
    detail: "Light humor, uplifting reframes.",
  },
  {
    key: "sage",
    label: "Quiet Oracle",
    detail: "Poetic reflections, introspective tone.",
  },
];

export default function Settings() {
  const theme = usePannyStore((s) => s.theme);
  const setTheme = usePannyStore((s) => s.setTheme);
  const sound = usePannyStore((s) => s.soundEnabled);
  const setSound = usePannyStore((s) => s.setSound);

  const [open, setOpen] = useState(false);
  const [persona] = useState<"calm" | "funny" | "sage">("calm");
  const [confirmText, setConfirmText] = useState("");

  const handleResetConfirm = () => {
    if (confirmText.toLowerCase() === "confirm") {
      setOpen(false);
      setConfirmText("");
      usePannyStore.getState().reset();
    }
  };

  const handleDialogClose = () => {
    setOpen(false);
    setConfirmText("");
  };

  return (
    <div className="space-y-8">
      <header className="rounded-[28px] border border-[var(--surface-lines)] bg-[var(--surface)] p-6 text-[var(--text-primary)] dark:text-white">
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="mt-2 text-[var(--text-secondary)] dark:text-white/70">
          Tune how Panny greets you, breathes with you, and glows in your space.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-2 items-center">
        <section className="py-14 rounded-[28px] border border-[var(--surface-lines)] bg-[var(--surface)] p-6 text-sm text-[var(--text-secondary)] dark:text-white/80">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[var(--text-primary)] dark:text-white">
                Dark Theme
              </p>
              <p className="text-[var(--text-tertiary)] dark:text-white/60">
                Prefer lush midnight hues?
              </p>
            </div>
            <Switch
              checked={theme === "dark"}
              onChange={(v) => setTheme(v ? "dark" : "light")}
            />
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[var(--text-primary)] dark:text-white">
                Spatial audio
              </p>
              <p className="text-[var(--text-tertiary)] dark:text-white/60">
                Ambient pads + tactile clicks
              </p>
            </div>
            <Switch checked={sound} onChange={(v) => setSound(v)} />
          </div>
        </section>

        <section className="rounded-[28px] border border-[var(--surface-lines)] bg-[var(--surface)] p-6 opacity-60 cursor-not-allowed">
          <p className="mb-1 text-sm uppercase tracking-[0.4em] text-[var(--text-tertiary)] dark:text-white/50">
            Chat persona
          </p>
          <p className="mb-2 text-[var(--text-primary)] uppercase tracking-[0.2em] dark:text-stone-500 md:text-sm text-[10px]">
            (coming soon)
          </p>
          <Tabs>
            {personas.map((item) => (
              <Tab
                key={item.key}
                active={persona === item.key}
                onClick={() => {}} // Disabled - no action
              >
                <div className="pointer-events-none">
                  <p className="font-medium text-[var(--text-primary)] dark:text-white">
                    {item.label}
                  </p>
                  <p className="text-sm text-[var(--text-tertiary)] dark:text-white/70">
                    {item.detail}
                  </p>
                </div>
              </Tab>
            ))}
          </Tabs>
        </section>
      </div>

      <section className="rounded-[28px] border border-[var(--surface-lines)] bg-gradient-to-br from-[var(--surface)] to-[var(--surface-strong)] p-6 w-full">
        <div className="flex flex-wrap items-center justify-between gap-3 text-[var(--text-primary)] dark:text-white w-full">
          <div>
            <p className="text-lg font-semibold">Session hygiene</p>
            <p className="text-sm text-[var(--text-secondary)] dark:text-white/70">
              Clear chat history + ambient buffer
            </p>
          </div>
          <Badge className="bg-[var(--surface-muted)] dark:bg-white/10">
            Recommended
          </Badge>
        </div>
        <div className="mt-6 space-y-3 text-[var(--text-secondary)] dark:text-white/70">
          <p>Resetting the session keeps your nervous system fresh.</p>
          <Button
            variant="outline"
            className="border-red-500/50 bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:border-red-500 dark:border-red-400/50 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-all duration-200"
            onClick={() => setOpen(true)}
          >
            ⚠️ Reset conversation
          </Button>
        </div>
      </section>

      <Dialog open={open} onClose={handleDialogClose}>
        <div className="absoulte top-0">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <div className="text-xl font-semibold text-[var(--text-primary)] dark:text-white">
              Reset conversation?
            </div>
            <p className="text-sm text-[var(--text-secondary)] dark:text-white/70">
              This action cannot be undone. All chat history will be permanently
              deleted.
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-[var(--text-tertiary)] dark:text-white/60">
                Type{" "}
                <span className="font-mono font-bold text-red-500">
                  confirm
                </span>{" "}
                to proceed
              </p>
              <Input
                type="text"
                placeholder="Type 'confirm' here..."
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full text-center"
                autoFocus
              />
            </div>
            <div className="flex justify-center gap-3 mt-6">
              <Button variant="ghost" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button
                variant="solid"
                className={`transition-all duration-200 ${
                  confirmText.toLowerCase() === "confirm"
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                }`}
                onClick={handleResetConfirm}
                disabled={confirmText.toLowerCase() !== "confirm"}
              >
                Confirm Reset
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
