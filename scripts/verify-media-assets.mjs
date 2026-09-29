import { existsSync, statSync, readFileSync } from 'node:fs';
import vm from 'node:vm';
const root = new URL('../public/media-preview/', import.meta.url);
const catalog = vm.runInNewContext(`${readFileSync(new URL('data.js', root), 'utf8')}\nSERIES`);
const required = new Map([['assets/brand-icon.svg', 1], ['assets/draft-cover.svg', 1]]);
for (const series of catalog) {
  if (!series.cover.startsWith('/')) required.set(series.cover.split('?')[0], 1);
  if (!series.parts) continue;
  required.set(`assets/${series.id}-hero.jpg`, 1);
  for (const part of series.parts) {
    required.set(`assets/episodes/${series.id}-${part}.jpg`, 1);
    required.set(`media/${series.id}-${part}.mp4`, 1000000);
  }
}
const missing = [...required].filter(([path, minimum]) => {
  const file = new URL(path, root);
  return !existsSync(file) || statSync(file).size < minimum;
}).map(([path]) => path);
if (missing.length) {
  console.error(`Media deployment blocked. Missing or incomplete assets:\n${missing.join('\n')}\nDeploy from the complete local checkout; Git-only builds omit the media.`);
  process.exit(1);
}
console.log(`Verified ${required.size} required media assets.`);
