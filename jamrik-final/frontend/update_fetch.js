const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    'app/changepasswordpage/page.tsx',
    'app/components/ShipmentsCard.tsx',
    'app/hscodeassistant/page.tsx',
    'app/newshipment/page.tsx',
    'app/profilepage/page.tsx',
    'app/shipments/page.tsx',
    'app/validationpage/page.tsx'
];

filesToUpdate.forEach(file => {
    const filePath = path.join('C:/Users/DELL/OneDrive - just.edu.jo/Desktop/Jamrik/jamrik-final/frontend', file);
    if (!fs.existsSync(filePath)) { console.log('Not found:', filePath); return; }
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (!content.includes('jamrikFetch')) {
        const parts = file.split('/');
        let depth = parts.length - 2;
        let relativePrefix = '';
        if (depth === 0) relativePrefix = './utils/apiClient';
        else relativePrefix = '../'.repeat(depth) + 'utils/apiClient';
        
        const importStatement = `import { jamrikFetch } from "${relativePrefix}";\n`;
        
        // Find last import
        const importRegex = /^import\s+.*from\s+["'].*["'];?$/gm;
        let lastImportIndex = 0;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            lastImportIndex = match.index + match[0].length;
        }
        
        if (lastImportIndex > 0) {
           content = content.slice(0, lastImportIndex) + '\n' + importStatement + content.slice(lastImportIndex);
        } else {
           if(content.includes('"use client";')) {
               content = content.replace('"use client";', '"use client";\n' + importStatement);
           } else {
               content = importStatement + content;
           }
        }
    }
    
    content = content.replace(/await fetch\(/g, 'await jamrikFetch(');
    
    fs.writeFileSync(filePath, content);
    console.log('Updated:', file);
});
console.log('Done');
