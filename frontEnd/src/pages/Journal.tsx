import { motion } from "framer-motion";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";

const entries = [
  {
    title: "Sat · Twilight walk",
    mood: "Grateful",
    tone: "Warm",
    excerpt:
      "I noticed the trees leaned toward the river today. Felt like an invitation.",
    time: "19:42",
    href: "/chat?session=twilight-walk",
  },
  {
    title: "Fri · Midday reset",
    mood: "Tender",
    tone: "Soft",
    excerpt:
      "Heart raced during standup. Practiced square breathing and grounded.",
    time: "12:14",
    href: "/chat?session=midday-reset",
  },
  {
    title: "Thu · Dawn pages",
    mood: "Curious",
    tone: "Hopeful",
    excerpt: "Asked Panny to mirror my future-self letter. Felt more possible.",
    time: "06:03",
    href: "/chat?session=dawn-pages",
  },
];

export default function Journal() {
  return (
    <div className="space-y-8">
      <header className="rounded-[28px] border border-[var(--surface-lines)] bg-[var(--surface)] p-6">
        <h1 className="text-3xl font-semibold text-[var(--text-primary)] dark:text-white">
          Journal constellation
        </h1>
        <p className="mt-2 text-[var(--text-secondary)] dark:text-white/70">
          Archive of every soft conversation, mood tag, and somatic check-in.
        </p>
      </header>
      <section className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-4 rounded-[28px] border border-[var(--surface-lines)] bg-[var(--surface)] p-6"
        >
          <h2 className="text-xl text-[var(--text-primary)] dark:text-white">
            Mood palette
          </h2>
          <div className="flex flex-wrap gap-3 text-sm text-[var(--text-secondary)] dark:text-white/80">
            <Badge className="bg-panny-green1/60 text-slate-900">
              Serene · 42%
            </Badge>
            <Badge className="bg-[var(--surface-muted)] dark:bg-white/15">
              Tender · 24%
            </Badge>
            <Badge className="bg-[var(--surface-muted)] dark:bg-white/15">
              Curious · 18%
            </Badge>
            <Badge className="bg-[var(--surface-muted)] dark:bg-white/15">
              Charged · 16%
            </Badge>
          </div>
          <p className="text-sm text-[var(--text-tertiary)] dark:text-white/60">
            Panny suggests pairing “Tender” with voice-notes tomorrow at dusk.
          </p>
        </motion.div>
        <div className="space-y-4">
          {entries.map((entry, idx) => (
            <motion.article
              key={entry.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-[32px] border border-[var(--surface-lines)] bg-[var(--surface)] p-6 text-[var(--text-secondary)] dark:border-white/8 dark:bg-white/6 dark:text-white/80"
            >
              <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-tertiary)] dark:text-white/50">
                <span>{entry.time}</span>
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: "var(--text-tertiary)" }}
                />
                <span>{entry.title}</span>
              </div>
              <p className="mt-3 text-2xl text-[var(--text-primary)] dark:text-white">
                {entry.excerpt}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.4em] text-[var(--text-tertiary)] dark:text-white/60">
                <span>Mood · {entry.mood}</span>
                <span>Tone · {entry.tone}</span>
              </div>
              <div className="mt-4">
                <Button
                  asChild
                  variant="outline"
                  className="border-[var(--surface-lines)] text-xs text-[var(--text-primary)] dark:border-white/20 dark:text-white"
                >
                  <a href={entry.href}>Open session</a>
                </Button>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}
