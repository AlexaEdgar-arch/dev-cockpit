import { useEffect, useRef, useState } from 'react';
import type { AppConfig, ProjectConfig } from './types/config-types';

/** Nest / tsc --watch clear the terminal between rebuilds. */
const CLEAR_SCREEN = /(?:\x1b\[[0-9;]*[HJ]|\x1bc|\x1b\[3J)+/g;
/** Color / style codes — a <pre> can't render them, so strip. */
const ANSI = /\x1b(?:\[[0-9;?]*[ -/]*[@-~]|].*?(?:\x07|\x1b\\))/g;

function applyTerminalChunk(prev: string, chunk: string): string {
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
    .replace(ANSI, '')
    .replace(/\r\n/g, '\n')
    // Drop incomplete lines overwritten with \r (progress-style output)
    .replace(/^[^\n]*\r/gm, '');

  return text ? next + text : next;
}

type PaneProps = {
  project: ProjectConfig;
  running: boolean;
  output: string;
  onStart: () => void;
  onStop: () => void;
};

function Pane({ project, running, output, onStart, onStop }: PaneProps) {
  const outputRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const el = outputRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [output]);

  return (
    <div className="pane">
      <h2 className="pane-name">{project.name}</h2>
      <p className="pane-command">{project.command}</p>
      <div className="pane-actions">
        <button type="button" disabled={running} onClick={onStart}>
          Start
        </button>
        <button type="button" disabled={!running} onClick={onStop}>
          Stop
        </button>
      </div>
      <pre ref={outputRef} className="pane-output">
        {output}
      </pre>
    </div>
  );
}

export default function App() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [running, setRunning] = useState<Record<string, boolean>>({});
  const [outputs, setOutputs] = useState<Record<string, string>>({});

  useEffect(() => {
    void window.cockpit.getConfig().then(setConfig);
  }, []);

  useEffect(() => {
    if (!config) {
      return;
    }

    document.title = config.name;

    const appendOutput = (id: string, data: string) => {
      setOutputs((prev) => ({
        ...prev,
        [id]: applyTerminalChunk(prev[id] ?? '', data),
      }));
    };

    const offStdout = window.cockpit.onStdout(({ id, data }) => {
      appendOutput(id, data);
    });
    const offStderr = window.cockpit.onStderr(({ id, data }) => {
      appendOutput(id, data);
    });
    const offExit = window.cockpit.onExit(({ id, code }) => {
      setRunning((prev) => ({ ...prev, [id]: false }));
      appendOutput(id, `\n[exited with code ${code}]\n`);
    });

    return () => {
      offStdout();
      offStderr();
      offExit();
    };
  }, [config]);

  if (!config) {
    return null;
  }

  const { columns, rows } = config.layout;
  const projects = config.projects.slice(0, columns * rows);

  return (
    <main
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {projects.map((project) => (
        <Pane
          key={project.name}
          project={project}
          running={!!running[project.name]}
          output={outputs[project.name] ?? ''}
          onStart={() => {
            setOutputs((prev) => ({ ...prev, [project.name]: '' }));
            setRunning((prev) => ({ ...prev, [project.name]: true }));
            void window.cockpit.startProcess({
              id: project.name,
              path: project.path ?? '',
              command: project.command,
            });
          }}
          onStop={() => {
            void window.cockpit.stopProcess(project.name);
          }}
        />
      ))}
    </main>
  );
}
