import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {parseArgs} from 'node:util';
import {packContent} from './pack.mjs';
import {decodeSnapshot} from './contract.mjs';
import {GitHubContentStore} from './github.mjs';
import {publishSnapshot,verifyRenderer,rollbackSnapshot} from './publish.mjs';
const {positionals,values}=parseArgs({allowPositionals:true,options:{ref:{type:'string'},output:{type:'string'},snapshot:{type:'string'},channel:{type:'string'},'expected-head':{type:'string'},initialize:{type:'boolean'},'renderer-origin':{type:'string'},revision:{type:'string'}}});
const command=positionals[0];
if(command==='pack'){
 const snapshot=await packContent({root:process.cwd(),ref:values.ref||'HEAD'});
 await writeFile(resolve(values.output||'content-snapshot.json'),JSON.stringify(snapshot));
 console.log(JSON.stringify({revision:snapshot.revision,source:snapshot.source,files:Object.keys(snapshot.payload.files).length}));
}else if(command==='publish'||command==='rollback'){
 if(!values.channel||!values['renderer-origin'])throw Error('Supply --channel and --renderer-origin');
 if(values.channel==='content/production'&&process.env.CONTENT_PRODUCTION_APPROVED!=='1')throw Error('Production promotion must use the protected production workflow environment');
 const store=new GitHubContentStore({repository:'bitrouter/bitrouter-docs',channel:values.channel,token:process.env.GITHUB_TOKEN});
 const snapshot=command==='rollback'?await store.historical(values.revision):decodeSnapshot(await readFile(values.snapshot||'content-snapshot.json','utf8'));
 await verifyRenderer(values['renderer-origin'],snapshot);
 const options={expectedHead:values['expected-head'],initialize:values.initialize};
 const result=command==='rollback'?await rollbackSnapshot(store,snapshot.revision,options):await publishSnapshot(store,snapshot,options);
 console.log(JSON.stringify(result));
}else throw Error('Use pack, publish, or rollback. See docs/CONTENT_PUBLICATION.md.');
