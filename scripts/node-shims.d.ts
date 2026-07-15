declare module 'node:fs/promises' {
  export function readFile(path: string | URL, encoding: string): Promise<string>;
  export function writeFile(path: string | URL, data: string, encoding?: string): Promise<void>;
  export function mkdir(path: string | URL, options?: { recursive?: boolean }): Promise<string | undefined>;
}

declare module 'node:fs' {
  export type Dirent = {
    name: string;
    isDirectory(): boolean;
  };

  export function existsSync(path: string | URL): boolean;
  export function mkdirSync(path: string | URL, options?: { recursive?: boolean }): string | undefined;
  export function readdirSync(path: string | URL, options: { withFileTypes: true }): Dirent[];
  export function readFileSync(path: string | URL, encoding: string): string;
  export function readFileSync(path: string | URL): unknown;
  export function rmSync(path: string | URL, options?: { recursive?: boolean; force?: boolean }): void;
  export function statSync(path: string | URL): { size: number };
  export function writeFileSync(path: string | URL, data: string, encoding?: string): void;
}

declare module 'node:zlib' {
  export function gzipSync(data: string | unknown, options?: { level?: number }): { byteLength: number };
  export function brotliCompressSync(data: string | unknown): { byteLength: number };
}

declare module 'node:path' {
  export function basename(path: string): string;
  export function extname(path: string): string;
  export function join(...paths: string[]): string;
}

declare module 'node:child_process' {
  export function spawnSync(command: string, args?: string[], options?: {
    cwd?: string;
    encoding?: string;
    env?: Record<string, string | undefined>;
    stdio?: string;
  }): {
    status: number | null;
    stdout?: string;
    stderr?: string;
    error?: { message?: string };
  };
}

type CodexNodeProcessShim = {
  argv?: string[];
  env?: Record<string, string | undefined>;
  execPath?: string;
  version?: string;
  versions?: { node?: string };
  exit?: (code?: number) => never;
  cwd(): string;
};

declare var process: CodexNodeProcessShim;
