const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const kind = process.argv[2] || 'before-build';
const commands = {
 'before-build': ['npm run build','before/build'],
 'before-test': ['npm test -- --reporter=json --outputFile=output/redesign/before/vitest.json','before/test'],
 'after-build': ['npm run build','after/build'],
 'after-test': ['npm test -- --reporter=json --outputFile=output/redesign/after/vitest.json','after/test'],
 'after-types': ['npm run astro -- check','after/types'],
 'finance-test': ['npm test -- tests/redesign --reporter=json --outputFile=output/redesign/after/finance-tests.json','after/finance-test'],
};
if (!commands[kind]) throw new Error('Unknown verification command');
const [command, name] = commands[kind];
const file = path.join(root, 'output/redesign', name + '.log');
fs.mkdirSync(path.dirname(file), {recursive:true});
const fd = fs.openSync(file, 'w');
const child = cp.spawn('cmd.exe', ['/d','/s','/c',command], {cwd:root, stdio:['ignore',fd,fd], env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1',WRANGLER_SEND_METRICS:'false'}});
child.on('error', error => {console.error(error.message); fs.closeSync(fd); process.exitCode=1;});
child.on('exit', code => {
 fs.closeSync(fd);
 const result={command,exit:code,completedAt:new Date().toISOString(),log:file};
 fs.writeFileSync(file+'.json',JSON.stringify(result,null,2));
 console.log(JSON.stringify(result));
 console.log(fs.readFileSync(file,'utf8').split(/\r?\n/).slice(-24).join('\n'));
 process.exitCode=code || 0;
});
