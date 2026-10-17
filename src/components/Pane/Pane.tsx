import { useEffect, useRef } from 'react';
import Anser from 'anser';
import type { ProjectConfig } from '../../types/config-types';
import { CloseButton } from '../CloseButton';
import { Select } from '../Select';

type PaneProps = {
  project: ProjectConfig;
  running: boolean;
  output: string;
  selectedCommand: string;
  onSelectCommand: (command: string) => void;
  onStart: () => void;
  onStop: () => void;
  onRemove: () => void;
};

export const Pane = ({
  project,
  running,
  output,
  selectedCommand,
  onSelectCommand,
  onStart,
  onStop,
  onRemove,
}: PaneProps) => {
  const outputRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const el = outputRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [output]);

  return (
    <div className="flex min-h-0 flex-col gap-2 overflow-hidden bg-[#1e1e1e] p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-2xl font-semibold">{project.name}</h2>
        <CloseButton onClick={onRemove} label={`Remove ${project.name}`} />
      </div>
      <p className="font-mono text-sm text-[#9a9a9a]">{selectedCommand}</p>
      <Select
        projectName={project.name}
        value={selectedCommand}
        onChange={onSelectCommand}
        disabled={running}
      />
      <div className="flex gap-2">
        <button
          type="button"
          className="disabled:cursor-not-allowed disabled:opacity-45"
          disabled={running || !selectedCommand}
          onClick={onStart}
        >
          Start
        </button>
        <button
          type="button"
          className="disabled:cursor-not-allowed disabled:opacity-45"
          disabled={!running}
          onClick={onStop}
        >
          Stop
        </button>
      </div>
      <pre
        ref={outputRef}
        className="m-0 min-h-0 flex-1 overflow-auto bg-[#111] p-3 font-mono text-xs break-words whitespace-pre-wrap text-[#d4d4d4]"
        dangerouslySetInnerHTML={{
          __html: Anser.ansiToHtml(output, { use_classes: false }),
        }}
      />
    </div>
  );
};
