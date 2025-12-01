#!/usr/bin/env node

/**
 * Post-process generated files to add .js extensions to relative imports
 * This is required for Node.js ESM compatibility
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GENERATED_DIR = path.join(__dirname, '..', 'src', 'generated');

function addJsExtensions(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // Match: from "./something" or from "../something"
  // But not: from "./something.gen" or from "./something.js"
  const importRegex = /from\s+['"](\.\.[\/\\][^'"]+|\.\/[^'"]+)['"]/g;
  
  content = content.replace(importRegex, (match, importPath) => {
    // Skip if already has extension
    if (importPath.endsWith('.js') || importPath.endsWith('.gen')) {
      return match;
    }
    
    modified = true;
    // Add .js extension or /index.js for directory imports
    const newPath = importPath.includes('/') && !importPath.split('/').pop().includes('.')
      ? `${importPath}/index.js`
      : `${importPath}.js`;
    
    return match.replace(importPath, newPath);
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  ✓ Fixed: ${path.relative(GENERATED_DIR, filePath)}`);
  }
}

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
      addJsExtensions(fullPath);
    }
  }
}

console.log('🔧 Post-processing generated files...');
processDirectory(GENERATED_DIR);
console.log('✅ Done!');
