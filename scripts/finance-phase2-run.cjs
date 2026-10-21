const fs=require('node:fs');const path=require('node:path');const cp=require('node:child_process');
const root=path.resolve(__dirname,'..');const out=path.join(root,'output/redesign/continuation-20261020');fs.mkdirSync(out,{recursive:true});
const commands={
 'service-tests':'node node_modules/vitest/vitest.mjs run tests/redesign/phase2.test.ts --reporter=json --outputFile=output/redesign/continuation-20261020/service-tests.json',
 'all-tests':'node node_modules/vitest/vitest.mjs run --reporter=json --outputFile=output/redesign/continuation-20261020/all-tests.json',
 'service-browser':'node node_modules/vitest/vitest.mjs run tests/redesign/phase2-browser.test.ts --reporter=json --outputFile=output/redesign/continuation-20261020/service-browser.json',
 'service-types':'node node_modules/typescript/bin/tsc -p services/tsconfig.json',
 'build':'npm run build',
 'a11y':'npm run test:a11y',
 'bundle-provider':'node node_modules/wrangler/bin/wrangler.js deploy --dry-run --config services/access-provider/wrangler.json --outdir output/provider-dry-run',
 'bundle-media':'node node_modules/wrangler/bin/wrangler.js deploy --dry-run --config services/private-media/wrangler.json --outdir output/media-dry-run',
 'types':'npm run astro -- check',
 'bundle-auth':'node node_modules/wrangler/bin/wrangler.js deploy --dry-run --config services/owner-auth/wrangler.json --outdir output/redesign/continuation-20261020/auth-bundle',
 'bundle-store':'node node_modules/wrangler/bin/wrangler.js deploy --dry-run --config services/private-finance/wrangler.json --outdir output/redesign/continuation-20261020/store-bundle',
 'browser':'node scripts/redesign-browser-after.mjs',
 'runtime':'node scripts/redesign-worker-check.cjs'
};
const kind=process.argv[2];if(!commands[kind])throw new Error('Unknown verification phase.');
const log=path.join(out,kind+'.log');const fd=fs.openSync(log,'w');
const child=cp.spawn('cmd.exe',['/d','/s','/c',commands[kind]],{cwd:root,stdio:['ignore',fd,fd],env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1',WRANGLER_SEND_METRICS:'false'}});
child.on('error',()=>{console.error('Could not start verification.');process.exitCode=1;});
child.on('exit',code=>{fs.closeSync(fd);fs.writeFileSync(path.join(out,kind+'.receipt.json'),JSON.stringify({command:commands[kind],exit:code,completedAt:new Date().toISOString()},null,2));console.log(JSON.stringify({kind,exit:code,log}));console.log(fs.readFileSync(log,'utf8').split(/\r?\n/).slice(-20).join('\n'));process.exitCode=code||0;});
