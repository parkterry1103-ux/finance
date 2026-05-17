declare module 'node:fs/promises' {
  export function readFile(path: string | URL, encoding: string): Promise<string>;
  export function writeFile(path: string | URL, data: string, encoding?: string): Promise<void>;
  export function mkdir(path: string | URL, options?: { recursive?: boolean }): Promise<string | undefined>;
}
