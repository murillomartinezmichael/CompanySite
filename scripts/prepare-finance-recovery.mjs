#!/usr/bin/env node
// Operator-only key ceremony. This command never uploads a secret, prints a raw
// key, reads .env, changes access permissions or deploys an application.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';import {Writable} from 'node:stream';import readline from 'node:readline/promises';import ts from 'typescript';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
if(args.length!==2||args[0]!=='--recovery-directory'||!path.isAbsolute(args[1])){console.error('Usage: node scripts/prepare-finance-recovery.mjs --recovery-directory <existing absolute recovery folder outside the repository>');process.exit(1);}
if(!process.stdin.isTTY||!process.stdout.isTTY){console.error('Use a local interactive terminal. Do not send a passphrase through chat, arguments or a noninteractive pipe.');process.exit(1);}
const destination=fs.realpathSync(args[1]);const lower=destination.toLowerCase();
if(!fs.statSync(destination).isDirectory()||lower.startsWith(root.toLowerCase())||lower.includes(path.sep+'github'+path.sep)){console.error('Choose a recovery folder outside source checkouts and generated build output.');process.exit(1);}
const code=ts.transpileModule(fs.readFileSync(path.join(root,'services/shared/recovery-envelope.ts'),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {sealRecoveryKey,openRecoveryKey}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
let muted=false;const quiet=new Writable({write(chunk,_encoding,done){if(!muted)process.stdout.write(chunk);done();}});
const prompt=readline.createInterface({input:process.stdin,output:quiet,terminal:true});
async function secret(label){process.stdout.write(label);muted=true;try{return await prompt.question('');}finally{muted=false;process.stdout.write('\n');}}
let raw,restored;
try{
 console.log('This prepares a portable encrypted recovery copy only. Keep the recovery passphrase in a separate password manager or other independently protected location.');
 console.log('The folder must be on your verified recovery destination. A different folder alone does not prove it is on another device.');
 const confirmed=await prompt.question('Type RECOVERY DESTINATION VERIFIED after checking that destination and password custody: ');
 if(confirmed!=='RECOVERY DESTINATION VERIFIED')throw new Error('Recovery destination was not confirmed. No key was created.');
 let first=await secret('Recovery passphrase (16+ characters; hidden): ');let second=await secret('Repeat recovery passphrase (hidden): ');
 if(first!==second)throw new Error('Passphrases did not match. No key was saved.');
 raw=crypto.getRandomValues(new Uint8Array(32));const id=crypto.randomUUID();const context='m3-companysite-finance:'+id;
 const envelope=await sealRecoveryKey(raw,first,context);restored=await openRecoveryKey(envelope,second,context);
 if(!crypto.timingSafeEqual(raw,restored))throw new Error('Recovery verification failed. No key was saved.');
 first='';second='';const filename=path.join(destination,'companysite-'+id+'.recovery-envelope.json');
 fs.writeFileSync(filename,JSON.stringify(envelope,null,2),{flag:'wx',mode:0o600});
 console.log('Encrypted recovery envelope prepared and locally decrypted for verification: '+filename);
 console.log('No key was uploaded or activated. Store the recovery passphrase separately. Production secret installation and an independent-machine restore check remain required.');
}catch(error){console.error(error instanceof Error?error.message:'Key preparation failed. No activation was performed.');process.exitCode=1;}
finally{raw?.fill(0);restored?.fill(0);prompt.close();}
