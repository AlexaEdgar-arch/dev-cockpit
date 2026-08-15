type Process = {
  id: string;
  path: string;
  command: string;
};

type ProcessOutput = {
  id: string;
  data: string;
};

interface CockpitApi {
  getConfig: () => Promise<import('./config-types').AppConfig>;
  getConfigProjectCommands: (projectName: string) => Promise<any>;
  startProcess: (process: Process) => Promise<unknown>;
  stopProcess: (id: string) => Promise<unknown>;
  onStdout: (callback: (output: ProcessOutput) => void) => () => void;
  onStderr: (callback: (output: ProcessOutput) => void) => () => void;
  onExit: (
    callback: (data: { id: string; code: number | null }) => void,
  ) => () => void;
}

interface Window {
  cockpit: CockpitApi;
}
