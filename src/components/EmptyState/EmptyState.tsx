import type { ReactNode } from 'react';

type EmptyStateProps = {
  children?: ReactNode;
};

export const EmptyState = ({ children }: EmptyStateProps) => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[#1e1e1e]">
      <p className="text-lg text-[#9a9a9a]">No projects selected</p>
      {children != null && (
        <div className="flex flex-row items-center gap-2">{children}</div>
      )}
    </div>
  );
};
