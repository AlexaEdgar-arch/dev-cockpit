import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { type ChildProcess, spawn } from 'node:child_process';
import { loadConfig } from './helper/loadConfig';
import { getAvailableCommands } from './helper/getAvailableCommands';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const processes = new Map<string, ChildProcess>();

let mainWindow: BrowserWindow | null = null;

const stopProject = (id: string) => {
  const child = processes.get(id);
  if (!child?.pid) {
    return false;
  }

  try {
    process.kill(-child.pid, 'SIGTERM');
  } catch {
    child.kill('SIGTERM');
  }

  return true;
};

const startProject = (id: string, projectPath: string, command: string) => {
  if (!mainWindow) {
    throw new Error('Main window is not available');
  }

  if (processes.has(id)) {
    stopProject(id);
  }

  const child = spawn(command, {
    cwd: projectPath,
    shell: true,
    // Own process group so stop can kill npm/nest children too.
    detached: process.platform !== 'win32',
    env: process.env,
  });

  processes.set(id, child);

  child.stdout?.on('data', (data: Buffer) => {
    mainWindow?.webContents.send('process:stdout', {
      id,
      data: data.toString(),
    });
  });

  child.stderr?.on('data', (data: Buffer) => {
    mainWindow?.webContents.send('process:stderr', {
      id,
      data: data.toString(),
    });
  });

  child.on('close', (code) => {
    mainWindow?.webContents.send('process:exit', {
      id,
      code,
    });

    processes.delete(id);
  });
};

ipcMain.handle(
  'process:start',
  (
    _event,
    {
      id,
      path,
      command,
    }: {
      id: string;
      path: string;
      command: string;
    },
  ) => {
    startProject(id, path, command);

    return { success: true };
  },
);

ipcMain.handle('process:stop', (_event, { id }: { id: string }) => {
  return { success: stopProject(id) };
});

ipcMain.handle('config:get', () => loadConfig());

ipcMain.handle(
  'config:getProjectCommands',
  (_event, { projectName }: { projectName: string }) =>
    getAvailableCommands(projectName),
);

const createWindow = () => {
  const config = loadConfig();

  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    title: config.name,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  for (const id of [...processes.keys()]) {
    stopProject(id);
  }
});
