#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dataDir = path.join(root, 'assets', 'wordle-data');
const files = ['en.answers.json', 'en.allowed.json', 'de.answers.json', 'de.allowed.json'];

function readJson(file) {
  const p = path.join(dataDir, file);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function validateWordList(name, list) {
  const bad = [];
  const seen = new Set();
  for (const w of list) {
    if (typeof w !== 'string' || !/^[a-z]{5}$/.test(w)) bad.push(w);
    if (seen.has(w)) bad.push(`${w} (duplicate)`);
    seen.add(w);
  }
  if (bad.length) {
    throw new Error(`${name} has invalid entries:\n- ${bad.join('\n- ')}`);
  }
}

function daysSinceIso(isoDate) {
  const then = new Date(`${isoDate}T00:00:00Z`).getTime();
  const now = Date.now();
  return Math.floor((now - then) / 86400000);
}

function run() {
  const data = {};
  files.forEach((f) => (data[f] = readJson(f)));

  Object.entries(data).forEach(([name, list]) => validateWordList(name, list));

  const enA = new Set(data['en.allowed.json']);
  const deA = new Set(data['de.allowed.json']);
  data['en.answers.json'].forEach((w) => {
    if (!enA.has(w)) throw new Error(`en.answers missing from en.allowed: ${w}`);
  });
  data['de.answers.json'].forEach((w) => {
    if (!deA.has(w)) throw new Error(`de.answers missing from de.allowed: ${w}`);
  });

  const manifestPath = path.join(dataDir, 'wordlist-manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const days = daysSinceIso(manifest.lastUpdatedUtc);
  const interval = manifest.updateIntervalDays || 14;

  console.log(`Word lists valid. EN answers=${data['en.answers.json'].length}, DE answers=${data['de.answers.json'].length}`);
  console.log(`Last updated: ${manifest.lastUpdatedUtc} (${days} day(s) ago), target interval=${interval} days.`);

  if (days >= interval) {
    console.log('⚠️  Word list refresh is due.');
    process.exitCode = 2;
  }
}

run();
