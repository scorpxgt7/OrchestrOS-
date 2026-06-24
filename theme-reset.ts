import fs from 'fs';
import path from 'path';

function walk(dir: string, callback: (file: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace hex colors
    content = content.replace(/bg-\[\#09090b\]/g, 'bg-[var(--bg-base)]');
    content = content.replace(/bg-\[\#18181b\]/g, 'bg-[var(--bg-surface)]');
    content = content.replace(/border-\[\#27272a\]/g, 'border-[var(--border-base)]');
    content = content.replace(/text-\[\#fafafa\]/g, 'text-[var(--text-base)]');
    
    // Replace gradient stops
    content = content.replace(/via-\[\#09090b\]/g, 'via-[var(--bg-base)]');
    content = content.replace(/to-\[\#09090b\]/g, 'to-[var(--bg-base)]');
    content = content.replace(/via-\[\#18181b\]/g, 'via-[var(--bg-surface)]');
    content = content.replace(/to-\[\#18181b\]/g, 'to-[var(--bg-surface)]');
    
    // Replace zinc colors
    content = content.replace(/text-zinc-100/g, 'text-[var(--text-base)]');
    content = content.replace(/text-zinc-200/g, 'text-[var(--text-primary)]');
    content = content.replace(/text-zinc-300/g, 'text-[var(--text-secondary)]');
    content = content.replace(/text-zinc-400/g, 'text-[var(--text-muted)]');
    content = content.replace(/text-zinc-500/g, 'text-[var(--text-tertiary)]');
    content = content.replace(/text-zinc-600/g, 'text-[var(--border-base)]');
    content = content.replace(/text-zinc-700/g, 'text-[var(--border-base)]');
    
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
