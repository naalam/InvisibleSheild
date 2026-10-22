#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),path=require('node:path');
const [cmd,...args]=process.argv.slice(2);
try{
if(cmd==='keygen'){
 const dir=args[0]||'private-keys';fs.mkdirSync(dir,{recursive:true,mode:0o700});
 const privatePath=path.join(dir,'private.pem'),publicPath=path.join(dir,'public.pem');
 if(fs.existsSync(privatePath)||fs.existsSync(publicPath))throw Error('Key files already exist. Refusing to overwrite.');
 const pass=process.env.IMAGEDEFENDER_KEY_PASSWORD;if(!pass||pass.length<16)throw Error('Set IMAGEDEFENDER_KEY_PASSWORD to a strong password of at least 16 characters.');
 const keys=crypto.generateKeyPairSync('rsa',{modulusLength:3072,publicKeyEncoding:{type:'spki',format:'pem'},privateKeyEncoding:{type:'pkcs8',format:'pem',cipher:'aes-256-cbc',passphrase:pass}});
 fs.writeFileSync(privatePath,keys.privateKey,{mode:0o600,flag:'wx'});fs.writeFileSync(publicPath,keys.publicKey,{mode:0o644,flag:'wx'});console.log('Encrypted signing key and public verification key created. Keep the private key outside your published codebase.');
}else if(cmd==='sign'){
 const [image,keyFile,imageId]=args;if(!image||!keyFile||!imageId)throw Error('Usage: node signer.cjs sign IMAGE PRIVATE.pem IMAGE_ID');
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(imageId))throw Error('Image ID must be a UUID v4, as included in the exported filename.');
 const key=crypto.createPrivateKey({key:fs.readFileSync(keyFile),passphrase:process.env.IMAGEDEFENDER_KEY_PASSWORD});
 const payload=JSON.stringify({version:1,imageId,sha256:crypto.createHash('sha256').update(fs.readFileSync(image)).digest('hex'),createdAt:new Date().toISOString()});
 const signature=crypto.sign('sha256',Buffer.from(payload),{key,padding:crypto.constants.RSA_PKCS1_PSS_PADDING,saltLength:32}).toString('base64');
 fs.writeFileSync(image+'.manifest.json',JSON.stringify({algorithm:'RSA-PSS-SHA256',payload,signature},null,2),{flag:'wx'});console.log('Signed manifest created: '+image+'.manifest.json');
}else{throw Error('Commands: keygen [PRIVATE_DIRECTORY] | sign IMAGE PRIVATE.pem IMAGE_ID');}
}catch(e){console.error(e.message);process.exitCode=1;}
