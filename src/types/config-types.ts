export type ProjectConfig = {
  name: string;
};

export type AppConfig = {
  name: string;
  workspace: string;
  layout: {
    columns: number;
    rows: number;
  };
  projects: ProjectConfig[];
};
