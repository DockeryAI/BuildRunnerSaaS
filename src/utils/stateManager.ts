import fs from 'fs-extra';

export const loadState = async (p: string) => fs.readJSON(p);
export const saveState = async (p: string, data: unknown) => fs.writeJSON(p, data, { spaces: 2 });
