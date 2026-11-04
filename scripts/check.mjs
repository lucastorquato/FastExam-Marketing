import assert from 'node:assert/strict';
import { readFile, stat, readdir, lstat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { content } from './content.mjs';
const root = resolve('dist');
const pages = ['index.html', 'support.html', 'privacy.html', 'pt/index.html', 'pt/support.html', 'pt/privacy.html'];
const expectedFiles = [...pages, '404.html', '.nojekyll', 'robots.txt', 'sitemap.xml', ...['app-icon-art.png', 'favicon.svg', 'site.css', 'site.js', '404.css', ...['en', 'pt'].flatMap(locale => ['classes', 'exams', 'results'].map(screen => `${locale}/${screen}.png`))].map(file => `assets/${file}`)];
const files = [];
for (const entry of await readdir(root, {recursive:true})) {
  const info = await lstat(resolve(root, entry));
  assert.ok(!info.isSymbolicLink(), `Symbolic link in generated site: ${entry}`);
  if (!info.isDirectory()) files.push(entry);
}
assert.deepEqual(files.sort(), expectedFiles.sort(), 'Unexpected or missing public files');
for (const file of [...pages, '404.html']) {
  const html = await readFile(resolve(root, file), 'utf8');
  assert.ok(html.includes('http-equiv="Content-Security-Policy"'), `Missing content security policy: ${file}`);
  for (const directive of ["default-src 'self'", "script-src 'self'", "style-src 'self'", "connect-src 'none'", "object-src 'none'", "base-uri 'none'", "form-action 'none'"]) {
    assert.ok(html.includes(directive), `Missing security directive ${directive}: ${file}`);
  }
  assert.ok(html.includes('<meta name="referrer" content="no-referrer">'), `Missing referrer policy: ${file}`);
  assert.ok(!/<style\b|\s(?:style|on\w+)\s*=/i.test(html), `Inline styles or event handlers: ${file}`);
  for (const [tag] of html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/gi)) {
    assert.match(tag, /^<script src="(?:\.\/|\.\.\/)assets\/site\.js" defer><\/script>$/, `Unexpected executable script: ${file}`);
  }
}
const cache = new Map();
for (const path of pages) cache.set(resolve(root,path), await readFile(resolve(root,path),'utf8'));
for (const [path, html] of cache) {
  const locale = path.includes('/pt/') ? 'pt' : 'en';
  assert.ok(html.includes(`<html lang="${content[locale].lang}">`), `Wrong language: ${path}`);
  assert.equal((html.match(/<h1[ >]/g)||[]).length,1, `Expected one main heading: ${path}`);
  assert.ok(html.includes('hreflang="en"') && html.includes('hreflang="pt-BR"'), `Missing language alternatives: ${path}`);
  assert.ok(!/\bundefined\b|\[object Object\]|\bTODO\b|\bplaceholder\b/i.test(html), `Unfinished content: ${path}`);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(ids.length,new Set(ids).size,`Duplicate IDs: ${path}`);
  for (const [,src] of html.matchAll(/(?:href|src|data-src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:)/.test(src)) continue;
    const [relative, hash] = src.split('#');
    const destination = relative ? resolve(dirname(path),relative) : path;
    assert.ok(destination.startsWith(root+'/'),`Link outside generated site: ${src}`);
    assert.ok((await stat(destination)).isFile(),`Missing target ${src} on ${path}`);
    if (hash) assert.ok((cache.get(destination)||'').includes(`id="${hash}"`),`Missing anchor ${src} on ${path}`);
  }
  for (const [tag] of html.matchAll(/<img\b[^>]+>/g)) assert.ok(/\balt="[^"]*"/.test(tag), `Image missing alternative text: ${path}`);
}
for (const file of ['assets/site.js','scripts/build.mjs','scripts/content.mjs','scripts/privacy.mjs','scripts/serve.mjs']) {
  const {execFileSync}=await import('node:child_process');
  execFileSync(process.execPath,['--check',file],{stdio:'pipe'});
}
console.log('Passed: six localized pages; links, anchors, assets, language metadata, image alternatives, JavaScript syntax, public file allowlist, and security policies on all seven pages.');
