import './index.css';

const grid = document.getElementById('grid');

/** Nest / tsc --watch clear the terminal between rebuilds. */
const CLEAR_SCREEN = /(?:\x1b\[[0-9;]*[HJ]|\x1bc|\x1b\[3J)+/g;
/** Color / style codes — a <pre> can't render them, so strip. */
const ANSI = /\x1b(?:\[[0-9;?]*[ -/]*[@-~]|].*?(?:\x07|\x1b\\))/g;

function writeTerminalChunk(el: HTMLPreElement, chunk: string) {
  let text = chunk;
  let lastClearEnd = -1;

  CLEAR_SCREEN.lastIndex = 0;
  for (const match of chunk.matchAll(CLEAR_SCREEN)) {
    lastClearEnd = (match.index ?? 0) + match[0].length;
  }

  if (lastClearEnd >= 0) {
    el.textContent = '';
    text = chunk.slice(lastClearEnd);
  }

  text = text
    .replace(ANSI, '')
    .replace(/\r\n/g, '\n')
    // Drop incomplete lines overwritten with \r (progress-style output)
    .replace(/^[^\n]*\r/gm, '');

  if (text) {
    el.textContent += text;
  }

  el.scrollTop = el.scrollHeight;
}

async function render() {
  if (!grid) {
    return;
  }

  const config = await window.cockpit.getConfig();
  const { columns, rows } = config.layout;

  grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  document.title = config.name;

  const slotCount = columns * rows;
  const projects = config.projects.slice(0, slotCount);
  const outputs = new Map<string, HTMLPreElement>();
  const stopButtons = new Map<string, HTMLButtonElement>();
  const startButtons = new Map<string, HTMLButtonElement>();

  const setRunning = (id: string, running: boolean) => {
    const start = startButtons.get(id);
    const stop = stopButtons.get(id);
    if (start) {
      start.disabled = running;
    }
    if (stop) {
      stop.disabled = !running;
    }
  };

  grid.replaceChildren();

  for (const project of projects) {
    const pane = document.createElement('div');
    pane.className = 'pane';

    const name = document.createElement('h2');
    name.className = 'pane-name';
    name.textContent = project.name;

    const command = document.createElement('p');
    command.className = 'pane-command';
    command.textContent = project.command;

    const actions = document.createElement('div');
    actions.className = 'pane-actions';

    const startButton = document.createElement('button');
    startButton.textContent = 'Start';
    startButtons.set(project.name, startButton);

    const stopButton = document.createElement('button');
    stopButton.textContent = 'Stop';
    stopButton.disabled = true;
    stopButtons.set(project.name, stopButton);

    const output = document.createElement('pre');
    output.className = 'pane-output';
    outputs.set(project.name, output);

    startButton.addEventListener('click', async () => {
      output.textContent = '';
      setRunning(project.name, true);
      await window.cockpit.startProcess({
        id: project.name,
        path: project.path ?? '',
        command: project.command,
      });
    });

    stopButton.addEventListener('click', async () => {
      await window.cockpit.stopProcess(project.name);
    });

    actions.append(startButton, stopButton);
    pane.append(name, command, actions, output);

    grid.appendChild(pane);
  }

  const appendOutput = (id: string, data: string) => {
    const el = outputs.get(id);
    if (!el) {
      return;
    }
    writeTerminalChunk(el, data);
  };

  window.cockpit.onStdout(({ id, data }) => appendOutput(id, data));
  window.cockpit.onStderr(({ id, data }) => appendOutput(id, data));
  window.cockpit.onExit(({ id, code }) => {
    setRunning(id, false);
    appendOutput(id, `\n[exited with code ${code}]\n`);
  });
}

void render();
