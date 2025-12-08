import { useState } from "react";
import { usePannyStore } from "../store/usePannyStore";
import Dialog from "../components/ui/Dialog";
import Switch from "../components/ui/Switch";
import { Tabs, Tab } from "../components/ui/Tabs";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

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
  const [persona, setPersona] = useState<"calm" | "funny" | "sage">("calm");

  return (
    <div className="space-y-8">
      <header className="rounded-[28px] border border-[var(--surface-lines)] bg-[var(--surface)] p-6 text-[var(--text-primary)] dark:text-white">
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="mt-2 text-[var(--text-secondary)] dark:text-white/70">
          Tune how Panny greets you, breathes with you, and glows in your space.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[28px] border border-[var(--surface-lines)] bg-[var(--surface)] p-6 text-sm text-[var(--text-secondary)] dark:text-white/80">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[var(--text-primary)] dark:text-white">
                Dark studio
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

        <section className="rounded-[28px] border border-[var(--surface-lines)] bg-[var(--surface)] p-6">
          <p className="mb-2 text-sm uppercase tracking-[0.4em] text-[var(--text-tertiary)] dark:text-white/50">
            Chat persona
          </p>
          <Tabs>
            {personas.map((item) => (
              <Tab
                key={item.key}
                active={persona === item.key}
                onClick={() => setPersona(item.key)}
              >
                <p className="font-medium text-[var(--text-primary)] dark:text-white">
                  {item.label}
                </p>
                <p className="text-sm text-[var(--text-tertiary)] dark:text-white/70">
                  {item.detail}
                </p>
              </Tab>
            ))}
          </Tabs>
        </section>

        <section className="rounded-[28px] border border-[var(--surface-lines)] bg-gradient-to-br from-[var(--surface)] to-[var(--surface-strong)] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 text-[var(--text-primary)] dark:text-white">
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
              className="border-[var(--surface-lines)] text-[var(--text-primary)] dark:border-white/30 dark:text-white"
              onClick={() => setOpen(true)}
            >
              Reset conversation
            </Button>
          </div>
        </section>

        <section className="rounded-[28px] border border-[var(--surface-lines)] bg-[var(--surface)] p-6 text-sm text-[var(--text-secondary)] dark:text-white/80">
          <p className="text-[var(--text-primary)] dark:text-white">
            Schedule rituals
          </p>
          <p className="text-[var(--text-tertiary)] dark:text-white/60">
            Select the windows you feel most open. Panny shapes reminders there.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {["Dawn", "Noon", "Twilight"].map((slot) => (
              <button
                key={slot}
                type="button"
                className="rounded-2xl border border-[var(--surface-lines)] bg-[var(--surface-muted)] px-3 py-3 text-[var(--text-primary)] transition active:scale-95 dark:border-white/15 dark:bg-white/5 dark:text-white"
              >
                {slot}
              </button>
            ))}
          </div>
        </section>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <div className="mb-3 text-lg text-[var(--text-primary)] dark:text-white">
          Reset conversation?
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="solid"
            onClick={() => {
              setOpen(false);
              usePannyStore.getState().reset();
            }}
          >
            Confirm
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
