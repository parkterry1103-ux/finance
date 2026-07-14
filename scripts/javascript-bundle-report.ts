import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';

const root = process.cwd();
const dist = join(root, 'dist');
const html = readFileSync(join(dist, 'index.html'), 'utf8');
const entryRelativePath = html.match(/<script[^>]+src="\/?([^"]+\.js)"/)?.[1];
if (!entryRelativePath) throw new Error('javascript bundle report failed: entry script not found');

const entryFile = entryRelativePath.split('/').pop()!;
const assetDirectory = join(dist, 'assets');
const assets = readdirSync(assetDirectory, { withFileTypes: true })
  .filter((entry) => !entry.isDirectory() && entry.name.endsWith('.js'))
  .map((entry) => {
    const path = join(assetDirectory, entry.name);
    const source = readFileSync(path, 'utf8');
    return {
      file: entry.name,
      entry: entry.name === entryFile,
      raw: statSync(path).size,
      gzip: gzipSync(source, { level: 9 }).byteLength,
      brotli: brotliCompressSync(source).byteLength,
    };
  })
  .sort((left, right) => right.raw - left.raw);

const entry = assets.find((asset) => asset.entry)!;
const report = {
  entry,
  initialJs: {
    requests: 1,
    raw: entry.raw,
    gzip: entry.gzip,
    brotli: entry.brotli,
  },
  dynamicChunkCount: assets.length - 1,
  over500KbCount: assets.filter((asset) => asset.raw > 500_000).length,
  assets,
};

if ((process.argv ?? []).includes('--json')) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`entry ${entry.file} raw=${entry.raw} gzip=${entry.gzip} brotli=${entry.brotli}`);
  console.log(`initial-js requests=1 raw=${entry.raw} gzip=${entry.gzip} brotli=${entry.brotli}`);
  console.log(`dynamic-chunks ${report.dynamicChunkCount}`);
  console.log(`over-500kb ${report.over500KbCount}`);
  assets.forEach((asset) => console.log(`${asset.entry ? 'entry' : 'dynamic'} ${asset.file} raw=${asset.raw} gzip=${asset.gzip} brotli=${asset.brotli}`));
}
