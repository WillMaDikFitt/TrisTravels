/** Soft clip at a natural break; append … when truncated. */
export function clipClean(text: string, max: number) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;

  const window = clean.slice(0, max + 1);
  const sentenceMarks = [". ", "! ", "? "];
  let best = -1;
  for (const mark of sentenceMarks) {
    const idx = window.lastIndexOf(mark);
    if (idx > max * 0.4) best = Math.max(best, idx);
  }
  if (best >= 0) {
    const ended = window.slice(0, best + 1).trim();
    return ended.endsWith(".") || ended.endsWith("!") || ended.endsWith("?")
      ? ended
      : `${ended}…`;
  }

  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const base = (lastSpace > Math.floor(max * 0.35) ? cut.slice(0, lastSpace) : cut)
    .trim()
    .replace(/[,:;–—\-]+$/u, "")
    .trim();
  return `${base}…`;
}

const EASE = "ease-[cubic-bezier(0.22,_1,_0.36,_1)]";

/** Shared image-forward card motion. */
export const CARD_MOTION = {
  shell: `transition-[transform,box-shadow] duration-700 ${EASE} hover:-translate-y-1 hover:shadow-[0_28px_55px_-24px_rgba(42,46,31,0.55)]`,
  image: `object-cover transition-transform duration-[900ms] ${EASE} will-change-transform group-hover:scale-[1.06]`,
  dim: `absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-700 ${EASE} group-hover:opacity-100`,
};

/**
 * Collapsed on fine pointers; expands + fades in on hover.
 * Always open on touch devices.
 */
export const HOVER_REVEAL =
  `grid grid-rows-[1fr] transition-[grid-template-rows] duration-700 ${EASE} ` +
  "[@media(hover:hover)_and_(pointer:fine)]:grid-rows-[0fr] " +
  "[@media(hover:hover)_and_(pointer:fine)]:group-hover:grid-rows-[1fr]";

export const HOVER_REVEAL_INNER =
  `overflow-hidden opacity-100 translate-y-0 transition-[opacity,transform] duration-500 ${EASE} ` +
  "[@media(hover:hover)_and_(pointer:fine)]:opacity-0 " +
  "[@media(hover:hover)_and_(pointer:fine)]:-translate-y-1.5 " +
  "[@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 " +
  "[@media(hover:hover)_and_(pointer:fine)]:group-hover:translate-y-0 " +
  "[@media(hover:hover)_and_(pointer:fine)]:group-hover:delay-100";
