type CloseButtonProps = {
  onClick: () => void;
  label?: string;
};

export const CloseButton = ({ onClick, label = 'Close' }: CloseButtonProps) => {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-6 w-6 cursor-pointer items-center justify-center border border-[#444] bg-[#2a2a2a] text-sm leading-none text-inherit hover:bg-[#333]"
      onClick={onClick}
    >
      ×
    </button>
  );
};
