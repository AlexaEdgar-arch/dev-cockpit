import { contextBridge, ipcRenderer } from 'electron';
import type { AppConfig } from './types/config-types';

type Process = {
  id: string;
  path: string;
  command: string;
};

type ProcessOutput = {
  id: string;
  data: string;
};

contextBridge.exposeInMainWorld('cockpit', {
  getConfig: (): Promise<AppConfig> => ipcRenderer.invoke('config:get'),

  startProcess: (process: Process) =>
    ipcRenderer.invoke('process:start', process),

  stopProcess: (id: string) => ipcRenderer.invoke('process:stop', { id }),

  onStdout: (callback: (output: ProcessOutput) => void) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      output: ProcessOutput,
    ) => {
      callback(output);
    };

    ipcRenderer.on('process:stdout', listener);

    return () => {
      ipcRenderer.removeListener('process:stdout', listener);
    };
  },

  onStderr: (callback: (output: ProcessOutput) => void) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      output: ProcessOutput,
    ) => {
      callback(output);
    };

    ipcRenderer.on('process:stderr', listener);

    return () => {
      ipcRenderer.removeListener('process:stderr', listener);
    };
  },

  onExit: (callback: (data: { id: string; code: number | null }) => void) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      data: { id: string; code: number | null },
    ) => {
      callback(data);
    };

    ipcRenderer.on('process:exit', listener);

    return () => {
      ipcRenderer.removeListener('process:exit', listener);
    };
  },
});
