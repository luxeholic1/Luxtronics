import * as fs from 'fs';
import { join } from 'path';

const inputPath = join(process.cwd(), 'pinterest-pins.csv');
const outputName = process.argv.find((arg) => arg.startsWith('--out='))?.split('=')[1] || 'pinterest-gan-chargers.csv';
const boardName = process.argv.find((arg) => arg.startsWith('--board='))?.split('=')[1] || 'GaN Chargers';
const query = process.argv.find((arg) => arg.startsWith('--query='))?.split('=')[1] || 'gan-chargers';
const outputPath = join(process.cwd(), outputName);

if (!fs.existsSync(inputPath)) {
  console.error('pinterest-pins.csv not found. Run npm run pinterest:export first.');
  process.exit(1);
}

function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];
    const next = csv[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(current);
      current = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(current);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      current = '';
      continue;
    }

    current += char;
  }

  if (current || row.length) {
    row.push(current);
    rows.push(row);
  }

  return rows;
}

function csvField(value: unknown): string {
  return `"${String(value ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ').trim()}"`;
}

function cleanText(value: string, maxLength: number): string {
  const cleaned = String(value || '')
    .replace(/\?{2,}/g, ' ')
    .replace(/[^\x20-\x7E]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[,\s:;/|-]+$/g, '')
    .trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength).replace(/\s+\S*$/, '').replace(/[,\s:;/|-]+$/g, '').trim();
}

function matches(row: Record<string, string>): boolean {
  const haystack = `${row.Title} ${row.Description} ${row.Keywords}`.toLowerCase();
  if (query === 'gan-chargers') {
    return /\bgan\b/i.test(haystack) && /(charger|charging|adapter|power|usb-c|type-c|pd\b)/i.test(haystack);
  }
  return haystack.includes(query.toLowerCase());
}

const rows = parseCsv(fs.readFileSync(inputPath, 'utf8'));
const header = rows[0];
const data = rows.slice(1);
const records = data.map((row) => Object.fromEntries(header.map((column, index) => [column, row[index] || ''])));
const filtered = records.filter(matches);

const outputHeader = [
  'Title',
  'Media URL',
  'Pinterest board',
  'Thumbnail',
  'Description',
  'Link',
  'Publish date',
  'Keywords',
];

const outputRows = filtered.slice(0, 200).map((row) => [
  cleanText(row.Title, 100),
  row['Media URL'],
  boardName,
  '',
  cleanText(row.Description, 500),
  row.Link,
  '',
  cleanText(row.Keywords, 500),
]);

const contents = [outputHeader.join(','), ...outputRows.map((row) => row.map(csvField).join(','))].join('\n') + '\n';

for (const dir of ['', 'dist', 'build']) {
  const targetDir = dir ? join(process.cwd(), dir) : process.cwd();
  if (!fs.existsSync(targetDir)) continue;
  fs.writeFileSync(join(targetDir, outputName), contents);
}

console.log(`Created ${outputName}`);
console.log(`Rows: ${outputRows.length}`);
console.log(`Board: ${boardName}`);
