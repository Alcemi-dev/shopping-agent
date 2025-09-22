import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const devDir = process.cwd();
const extensionDir = path.join(devDir, '..', 'extensions', 'shopping-agent');
const extensionAssetsDir = path.join(extensionDir, 'assets');

console.log('Cleaning up old assets...');
if (fs.existsSync(extensionAssetsDir)) {
  const files = fs.readdirSync(extensionAssetsDir);
  files.forEach(file => {
    if (file.endsWith('.js') || file.endsWith('.css') || file.endsWith('.map')) {
      const filePath = path.join(extensionAssetsDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  });
}

console.log('Building React app...');
execSync('npm run build', { stdio: 'inherit' });

console.log('Moving built files to extension assets...');
const distDir = path.join(devDir, 'dist');
if (fs.existsSync(distDir)) {
  const files = fs.readdirSync(distDir);
  files.forEach(file => {
    const srcPath = path.join(distDir, file);
    const destPath = path.join(extensionAssetsDir, file);
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      if (fs.existsSync(destPath)) {
        fs.rmSync(destPath, { recursive: true, force: true });
      }
      fs.cpSync(srcPath, destPath, { recursive: true });
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
  
  // Clean up
  fs.rmSync(distDir, { recursive: true, force: true });
}

console.log('Injecting CSS custom properties...');
const cssFiles = fs.readdirSync(extensionAssetsDir).filter(file => file.endsWith('.css'));
cssFiles.forEach(cssFile => {
  const cssPath = path.join(extensionAssetsDir, cssFile);
  let cssContent = fs.readFileSync(cssPath, 'utf8');
  
  const customProperties = `
:root {
  --asset-eshop-mobile: url("{{ 'img/eshop-mobile.png' | asset_url }}");
  --asset-eshop-desktop: url("{{ 'img/eshop-desktop.png' | asset_url }}");
}
`;
  
  const importRegex = /(@import[^;]+;)/g;
  const imports = cssContent.match(importRegex);
  if (imports) {
    const lastImport = imports[imports.length - 1];
    const lastImportIndex = cssContent.lastIndexOf(lastImport) + lastImport.length;
    cssContent = cssContent.slice(0, lastImportIndex) + customProperties + cssContent.slice(lastImportIndex);
  } else {
    cssContent = customProperties + cssContent;
  }
  
  fs.writeFileSync(cssPath, cssContent);
});

console.log('Updating Liquid template...');
const liquidFile = path.join(extensionDir, 'blocks', 'shopping-agent.liquid');
if (fs.existsSync(liquidFile)) {
  let content = fs.readFileSync(liquidFile, 'utf8');
  
  if (cssFiles.length > 0) {
    const cssFile = cssFiles[0];
    content = content.replace(
      /{{ '[^']*\.css' \| asset_url \| stylesheet_tag }}/,
      `{{ '${cssFile}' | asset_url | stylesheet_tag }}`
    );
    fs.writeFileSync(liquidFile, content);
    console.log(`Updated CSS reference to: ${cssFile}`);
  }
}

const viteTagFile = path.join(extensionDir, 'snippets', 'vite-tag.liquid');
if (fs.existsSync(viteTagFile)) {
  let content = fs.readFileSync(viteTagFile, 'utf8');
  
  if (cssFiles.length > 0) {
    const cssFile = cssFiles[0];
    content = content.replace(
      /{{ '[^']*\.css' \| asset_url \| split: '\?' \| first \| stylesheet_tag: preload: preload_stylesheet }}/,
      `{{ '${cssFile}' | asset_url | split: '?' | first | stylesheet_tag: preload: preload_stylesheet }}`
    );
    fs.writeFileSync(viteTagFile, content);
    console.log(`Updated vite-tag CSS reference to: ${cssFile}`);
  }
}

console.log('Creating Vite manifest...');
const jsFiles = fs.readdirSync(extensionAssetsDir).filter(file => file.endsWith('.js'));
const manifest = {
  "src/main.tsx": {
    "file": jsFiles.length > 0 ? jsFiles[0] : "shopping-agent.js",
    "name": "shopping-agent",
    "src": "src/main.tsx",
    "isEntry": true,
    "css": cssFiles
  }
};

const manifestPath = path.join(devDir, 'vite-manifest.json');
console.log(`Created manifest with JS: ${jsFiles[0] || 'shopping-agent.js'}, CSS: ${cssFiles.join(', ')}`);

console.log('Build completed successfully!');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
