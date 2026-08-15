import { useEffect, useState } from 'react';
import type { AppConfig } from './types/config-types';
import { applyTerminalChunk } from './helper/applyTerminalChunk';
import { Pane } from './components/Pane';

export default function App() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [running, setRunning] = useState<Record<string, boolean>>({});
  const [outputs, setOutputs] = useState<Record<string, string>>({});
  const [selectedCommand, setSelectedCommand] = useState<
    Record<string, string>
  >({});

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
      {projects.map((project) => {
        const command = selectedCommand[project.name] ?? '';
        const projectPath = `${config.workspace.replace(/\/$/, '')}/${project.name}`;

        return (
          <Pane
            key={project.name}
            project={project}
            running={!!running[project.name]}
            output={outputs[project.name] ?? ''}
            selectedCommand={command}
            onSelectCommand={(next) => {
              setSelectedCommand((prev) => ({
                ...prev,
                [project.name]: next,
              }));
            }}
            onStart={() => {
              if (!command) {
                return;
              }
              setOutputs((prev) => ({ ...prev, [project.name]: '' }));
              setRunning((prev) => ({ ...prev, [project.name]: true }));
              void window.cockpit.startProcess({
                id: project.name,
                path: projectPath,
                command,
              });
            }}
            onStop={() => {
              void window.cockpit.stopProcess(project.name);
            }}
          />
        );
      })}
    </main>
  );
}
