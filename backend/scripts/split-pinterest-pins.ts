import * as fs from 'fs';
import { join } from 'path';

const inputCandidates = [
  join(process.cwd(), 'pinterest-pins.csv'),
  join(process.cwd(), 'pinterest-pins copy.csv'),
  join(process.cwd(), 'dist', 'pinterest-pins.csv'),
  join(process.cwd(), 'build', 'pinterest-pins.csv'),
];
const inputPath = inputCandidates.find((candidate) => fs.existsSync(candidate));
const maxRows = Number(process.argv.find((arg) => arg.startsWith('--rows='))?.split('=')[1] || 200);

if (!inputPath) {
  console.error('pinterest-pins.csv not found. Run npm run pinterest:export first.');
  process.exit(1);
}

function splitCsvRows(csv: string): string[] {
  const rows: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];
    const next = csv[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += char + next;
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      if (current.trim()) rows.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  if (current.trim()) rows.push(current);
  return rows;
}

const rows = splitCsvRows(fs.readFileSync(inputPath, 'utf8'));
const header = rows[0];
const dataRows = rows.slice(1);
const chunkCount = Math.ceil(dataRows.length / maxRows);

for (const dir of ['', 'dist', 'build']) {
  const targetDir = dir ? join(process.cwd(), dir) : process.cwd();
  if (!fs.existsSync(targetDir)) continue;
  for (const file of fs.readdirSync(targetDir)) {
    if (/^pinterest-pins-\d{3}\.csv$/.test(file)) {
      fs.unlinkSync(join(targetDir, file));
    }
  }
}

for (let i = 0; i < chunkCount; i += 1) {
  const chunk = dataRows.slice(i * maxRows, (i + 1) * maxRows);
  const fileName = `pinterest-pins-${String(i + 1).padStart(3, '0')}.csv`;
  const contents = [header, ...chunk].join('\n') + '\n';

  for (const dir of ['', 'dist', 'build']) {
    const targetDir = dir ? join(process.cwd(), dir) : process.cwd();
    if (!fs.existsSync(targetDir)) continue;
    fs.writeFileSync(join(targetDir, fileName), contents);
  }
}

console.log(`Created ${chunkCount} Pinterest Pins CSV chunks.`);
console.log(`Rows per file: ${maxRows}`);
console.log(`First file: pinterest-pins-001.csv`);
