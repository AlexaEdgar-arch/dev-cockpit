export type ProjectConfig = {
  name: string;
  command: string;
  path?: string;
};

export type AppConfig = {
  name: string;
  layout: {
    columns: number;
    rows: number;
  };
  projects: ProjectConfig[];
};
