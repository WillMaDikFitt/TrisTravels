import { cn } from "@/lib/utils";

type Block =
  | { type: "lead"; text: string }
  | { type: "day"; label: string; route?: string }
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string }
  | { type: "tips"; text: string };

const DAY_RE = /^(DAY\s+\d+)\s*[—–\-]\s*(.+)$/i;
const TIPS_RE = /^(Best time:|Ideal duration:|Fitness:|Travel responsibly)/i;

function parseBody(paragraphs: string[]): Block[] {
  if (paragraphs.length === 0) return [];

  const blocks: Block[] = [];
  const [first, ...rest] = paragraphs;
  blocks.push({ type: "lead", text: first });

  let paraIndex = 0;
  for (const raw of rest) {
    const text = raw.trim();
    if (!text) continue;

    const dayMatch = text.match(DAY_RE);
    if (dayMatch) {
      const label = dayMatch[1].toUpperCase();
      const after = dayMatch[2].trim();
      const colon = after.indexOf(":");
      if (colon > 0 && colon < 40) {
        blocks.push({ type: "day", label, route: after.slice(0, colon).trim() });
        blocks.push({ type: "paragraph", text: after.slice(colon + 1).trim() });
      } else {
        const sentenceBreak = after.search(/(?<=[.!?])\s+/);
        if (sentenceBreak > 0 && sentenceBreak < 72) {
          blocks.push({
            type: "day",
            label,
            route: after.slice(0, sentenceBreak).replace(/[.]$/, ""),
          });
          blocks.push({ type: "paragraph", text: after.slice(sentenceBreak).trim() });
        } else {
          blocks.push({ type: "day", label, route: after });
        }
      }
      continue;
    }

    if (TIPS_RE.test(text)) {
      blocks.push({ type: "tips", text });
      continue;
    }

    // Mid-story pull quote: longer lyrical paragraphs (skip first few after lead)
    paraIndex += 1;
    const isQuoteCandidate =
      paraIndex === 2 &&
      text.length > 140 &&
      text.length < 320 &&
      !text.includes("—");
    if (isQuoteCandidate) {
      blocks.push({ type: "quote", text });
      continue;
    }

    blocks.push({ type: "paragraph", text });
  }

  return blocks;
}

function TipLines({ text }: { text: string }) {
  const parts = text
    .split(/(?=(?:Best time|Ideal duration|Base stay|Fitness|Travel responsibly):)/i)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length <= 1) {
    return <p className="text-sm leading-relaxed text-on-surface md:text-[0.95rem]">{text}</p>;
  }

  return (
    <ul className="space-y-3">
      {parts.map((part) => {
        const colon = part.indexOf(":");
        if (colon < 0) {
          return (
            <li key={part.slice(0, 24)} className="text-sm leading-relaxed text-on-surface">
              {part}
            </li>
          );
        }
        return (
          <li key={part.slice(0, 24)} className="text-sm leading-relaxed text-on-surface">
            <span className="font-semibold text-primary">{part.slice(0, colon + 1)}</span>
            {part.slice(colon + 1)}
          </li>
        );
      })}
    </ul>
  );
}

export function StoryBody({ paragraphs, className }: { paragraphs: string[]; className?: string }) {
  const blocks = parseBody(paragraphs);

  return (
    <div className={cn("space-y-8 md:space-y-10", className)}>
      {blocks.map((block, i) => {
        const key = `${block.type}-${i}`;
        if (block.type === "lead") {
          return (
            <p
              key={key}
              className="font-[family-name:var(--font-playfair)] text-[1.35rem] leading-[1.45] text-primary md:text-[1.55rem] md:leading-[1.4]"
            >
              {block.text}
            </p>
          );
        }
        if (block.type === "day") {
          return (
            <div key={key} className="pt-4">
              <div className="ink-rule" />
              <p className="label-caps mt-5 text-highlight">{block.label}</p>
              {block.route ? (
                <h2 className="mt-2 font-[family-name:var(--font-playfair)] text-2xl leading-snug text-primary md:text-[1.85rem]">
                  {block.route}
                </h2>
              ) : null}
            </div>
          );
        }
        if (block.type === "quote") {
          return (
            <blockquote
              key={key}
              className="relative border-l-[3px] border-highlight/70 pl-5 md:pl-7"
            >
              <p className="font-[family-name:var(--font-playfair)] text-xl leading-snug text-primary italic md:text-[1.4rem] md:leading-snug">
                {block.text}
              </p>
            </blockquote>
          );
        }
        if (block.type === "tips") {
          return (
            <aside
              key={key}
              className="rounded-[1.25rem] border border-[#e4ddd0] bg-[#f7f3ea] px-5 py-6 shadow-[0_10px_28px_rgba(54,64,55,0.06)] md:px-7 md:py-7"
            >
              <p className="label-caps text-highlight">Good to know</p>
              <div className="mt-4">
                <TipLines text={block.text} />
              </div>
            </aside>
          );
        }
        return (
          <p
            key={key}
            className="text-[1.05rem] leading-[1.85] text-on-surface md:text-[1.1rem] md:leading-[1.9]"
          >
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
