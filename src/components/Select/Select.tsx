import { useEffect, useRef, useState } from 'react';

type SelectProps = {
  projectName: string;
  value: string;
  onChange: (command: string) => void;
  disabled?: boolean;
};

export const Select = ({
  projectName,
  value,
  onChange,
  disabled = false,
}: SelectProps) => {
  const [open, setOpen] = useState(false);
  const [scripts, setScripts] = useState<Record<string, string>>({});
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    void window.cockpit.getConfigProjectCommands(projectName).then((pkg) => {
      if (cancelled) {
        return;
      }
      setScripts((pkg?.scripts as Record<string, string>) ?? {});
    });

    return () => {
      cancelled = true;
    };
  }, [projectName]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const options = Object.keys(scripts);
  const selectedKey = value.replace(/^npm run\s+/, '');

  return (
    <div className="relative w-fit max-w-full" ref={rootRef}>
      <button
        type="button"
        className="min-w-48 cursor-pointer border border-[#444] bg-[#2a2a2a] px-2.5 py-1.5 text-left text-inherit disabled:cursor-not-allowed disabled:opacity-45"
        disabled={disabled || options.length === 0}
        onClick={() => setOpen((prev) => !prev)}
      >
        {selectedKey || 'Select command'}
      </button>
      {open && (
        <ul className="absolute top-[calc(100%+2px)] left-0 z-10 max-h-56 min-w-full max-w-md list-none overflow-auto border border-[#444] bg-[#252525]">
          {options.map((key) => (
            <li key={key}>
              <button
                type="button"
                className={`flex w-full cursor-pointer flex-col gap-0.5 border-0 bg-transparent px-2.5 py-1.5 text-left text-inherit hover:bg-[#333] ${
                  key === selectedKey ? 'bg-[#333]' : ''
                }`}
                onClick={() => {
                  onChange(`npm run ${key}`);
                  setOpen(false);
                }}
              >
                <span className="font-semibold">{key}</span>
                <span className="overflow-hidden font-mono text-xs text-ellipsis whitespace-nowrap text-[#9a9a9a]">
                  {scripts[key]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
