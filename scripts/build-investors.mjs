import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
// Intentionally do NOT import investor-preview/build.mjs here. Its detailed
// funding, operating costs and catalog need approved private migration.
for(const file of ['portfolio.json','funding.json','demo-coverage.json']){if(fs.existsSync(path.join(root,'dist/investors',file)))throw new Error('Private legacy artifact in public build');}
console.log('Investor planning excluded from the public build; owner workspace routes are guarded by Pages middleware.');
