import { useEffect, useRef } from 'react';
import Anser from 'anser';
import type { ProjectConfig } from '../../types/config-types';
import { Select } from '../Select';

type PaneProps = {
  project: ProjectConfig;
  running: boolean;
  output: string;
  selectedCommand: string;
  onSelectCommand: (command: string) => void;
  onStart: () => void;
  onStop: () => void;
};

export const Pane = ({
  project,
  running,
  output,
  selectedCommand,
  onSelectCommand,
  onStart,
  onStop,
}: PaneProps) => {
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
      <p className="pane-command">{selectedCommand}</p>
      <Select
        projectName={project.name}
        value={selectedCommand}
        onChange={onSelectCommand}
        disabled={running}
      />
      <div className="pane-actions">
        <button
          type="button"
          disabled={running || !selectedCommand}
          onClick={onStart}
        >
          Start
        </button>
        <button type="button" disabled={!running} onClick={onStop}>
          Stop
        </button>
      </div>
      <pre
        ref={outputRef}
        className="pane-output"
        dangerouslySetInnerHTML={{
          __html: Anser.ansiToHtml(output, { use_classes: false }),
        }}
      />
    </div>
  );
};
