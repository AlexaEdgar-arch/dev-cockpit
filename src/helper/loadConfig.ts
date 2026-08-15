import type { AppConfig } from '../types/config-types';
import fs from 'node:fs';
import { app } from 'electron';
import path from 'node:path';

export const loadConfig = (): AppConfig => {
  let configPath;
  if (app.isPackaged) {
    configPath = path.join(process.resourcesPath, 'config.json');
  }
  configPath = path.join(app.getAppPath(), 'config.json');

  const raw = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(raw) as AppConfig;
};
