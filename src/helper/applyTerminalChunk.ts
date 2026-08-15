/** Nest / tsc --watch clear the terminal between rebuilds. */
const CLEAR_SCREEN = /(?:\x1b\[[0-9;]*[HJ]|\x1bc|\x1b\[3J)+/g;

export const applyTerminalChunk = (prev: string, chunk: string): string => {
  let text = chunk;
  let lastClearEnd = -1;

  CLEAR_SCREEN.lastIndex = 0;
  for (const match of chunk.matchAll(CLEAR_SCREEN)) {
    lastClearEnd = (match.index ?? 0) + match[0].length;
  }

  let next = prev;
  if (lastClearEnd >= 0) {
    next = '';
    text = chunk.slice(lastClearEnd);
  }

  text = text
    .replace(/\r\n/g, '\n')
    // Drop incomplete lines overwritten with \r (progress-style output)
    .replace(/^[^\n]*\r/gm, '');

  return text ? next + text : next;
};
