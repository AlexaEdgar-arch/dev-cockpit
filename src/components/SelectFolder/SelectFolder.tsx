type SelectFolderProps = {
  label: string;
  defaultPath?: string;
  onSelect?: (path: string) => void;
};

export const SelectFolder = ({
  label,
  defaultPath,
  onSelect,
}: SelectFolderProps) => {
  const handleClick = async () => {
    const selected = await window.cockpit.openDirectory(defaultPath);
    if (selected) {
      onSelect?.(selected);
    }
  };

  return (
    <button
      type="button"
      className="cursor-pointer border border-[#444] bg-[#2a2a2a] px-2.5 py-1.5 text-sm text-inherit hover:bg-[#333]"
      onClick={() => {
        void handleClick();
      }}
    >
      {label}
    </button>
  );
};
