import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { app } from 'electron';
import { loadConfig } from './loadConfig';

const execFileAsync = promisify(execFile);

const getProjectScriptPath = () =>
  path.join(app.getAppPath(), 'src/core/getProject.sh');

export const getAvailableCommands = async (projectName: string) => {
  const { workspace } = loadConfig();
  const script = getProjectScriptPath();

  const { stdout, stderr } = await execFileAsync(
    'bash',
    [script, workspace, projectName],
    { encoding: 'utf-8' },
  );

  if (stderr) {
    console.error(stderr);
  }

  return JSON.parse(stdout);
};
