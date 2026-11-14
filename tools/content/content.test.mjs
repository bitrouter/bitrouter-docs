import test from 'node:test';
import assert from 'node:assert/strict';
import {snapshotRevision,sha256,validateSnapshot} from './contract.mjs';
import {contentCompiler,prepareMDX} from './compiler.mjs';
import {createContentReader,GitHubContentStore} from './github.mjs';
import {publishSnapshot} from './publish.mjs';
function fixture(text='First'){
 const content=`---\ntitle: ${text}\n---\n## Detail\n\n${text}`;
 const files={'openapi.yaml':{encoding:'utf8',content:'paths: {}',sha256:sha256('paths: {}')},'content/docs/index.mdx':{encoding:'utf8',content,sha256:sha256(content),modifiedAt:'2026-11-13T12:00:00Z'}};
 const x={schemaVersion:1,rendererContract:1,source:{repository:'bitrouter/bitrouter-docs',commit:'a'.repeat(40)},payload:{files,redirects:[]}};
 return {...x,revision:snapshotRevision(x)};
}
test('integrity binds source provenance and all file bytes',()=>{
 const x=fixture();assert.equal(validateSnapshot(x),x);
 assert.throws(()=>validateSnapshot({...x,source:{...x.source,commit:'b'.repeat(40)}}),/integrity/);
 const tampered=structuredClone(x);tampered.payload.files['content/docs/index.mdx'].content+='tamper';tampered.revision=snapshotRevision(tampered);
 assert.throws(()=>validateSnapshot(tampered),/integrity/);
});
test('redirects cannot escape content routes or loop through anchors',()=>{
 for(const redirects of [[{from:'/docs/a',to:'/docs/a#section',status:307}], [{from:'/docs/a',to:'/docs/%2e%2e/api/auth',status:307}], [{from:'/docs/a',to:'/docs/b#section',status:307},{from:'/docs/b',to:'/docs/a',status:308}]]){
  const x=fixture();x.payload.redirects=redirects;x.revision=snapshotRevision(x);assert.throws(()=>validateSnapshot(x));
 }
});
test('compiler admits static components and fenced code, rejects execution and unsupported components',async()=>{
 const c=contentCompiler();
 await c.compileFile('---\ntitle: Safe\n---\n<Tabs items={["one", "two"]}><Tab value="one">Hello</Tab></Tabs>\n\n```js\nprocess.exit()\n```');
 for(const source of ['import fs from "node:fs"','{process.exit()}','<Callout onClick={() => 1} />','<Callout {...props} />','<NewComponent />','[bad](javascript:alert(1))','<a href={"javascript:alert(1)"}>x</a>']){
  await assert.rejects(c.compileFile('---\ntitle: Unsafe\n---\n'+source));
 }
});
test('OpenAPI modules are converted into validated data descriptors',async()=>{
 const raw='---\ntitle: API\n---\nexport default function Layout(props) { return <Comp document="./openapi.yaml" operations={[{"path":"/v1/test","method":"get"}]} showDescription />; }';
 const result=prepareMDX(raw,'content/docs/reference/test.mdx',{paths:{'/v1/test':{get:{}}}});
 assert.doesNotMatch(result,/export default/);assert.match(result,/<APIPage/);
 await contentCompiler(undefined,{paths:{'/v1/test':{get:{}}}}).compileFile(result);
 await assert.rejects(contentCompiler(undefined,{paths:{}}).compileFile(result),/Unknown APIPage operation/);
 await assert.rejects(contentCompiler().compileFile('---\ntitle: Bad API\n---\n<APIPage document="https://invalid.test/spec" operations={[]} />'),/Unknown APIPage document/);
 assert.throws(()=>prepareMDX(raw,'content/docs/reference/test.mdx',{paths:{}}),/Unknown OpenAPI/);
});
test('two readers activate complete versions, preserve pinned requests, roll back and survive outage/corruption',async()=>{
 let tick=0,current='1'.repeat(40),generation=1,fail=false;
 const a=fixture('First'),b=fixture('Second');const snapshots=new Map([[current,a]]);
 const store={resolve:async()=>{if(fail)throw Error('offline');return {commit:current}},snapshot:async id=>snapshots.get(id),channelInfo:async()=>({generation,revision:snapshots.get(current).revision})};
 const make=()=>createContentReader({store,build:async x=>{validateSnapshot(x);return x},fallback:a,pollMs:10,now:()=>tick});
 const one=make(),two=make();const pinned=await one.get();await two.get();
 current='2'.repeat(40);generation++;snapshots.set(current,b);tick+=11;
 assert.equal((await one.get()).revision,b.revision);assert.equal((await two.get()).revision,b.revision);assert.equal(pinned.revision,a.revision);
 current='3'.repeat(40);generation++;snapshots.set(current,a);tick+=11;assert.equal((await one.get()).revision,a.revision);
 current='4'.repeat(40);generation++;snapshots.set(current,{...b,rendererContract:99});tick+=11;
 assert.equal((await one.get()).revision,a.revision);assert.equal(one.status.degraded,true);
 fail=true;tick+=11;assert.equal((await two.get()).revision,b.revision);assert.equal((await make().get()).revision,a.revision);
});
test('GitHub reader uses conditional authenticated ref reads and immutable content commits',async()=>{
 const calls=[];const store=new GitHubContentStore({repository:'bitrouter/bitrouter-docs',channel:'content/staging',token:'fixture-only',fetcher:async(url,options)=>{calls.push([url,options]);return new Response(null,{status:304})}});
 assert.equal(await store.resolve('"old"'),null);
 assert.match(calls[0][0],/git\/ref\/heads\/content\/staging$/);assert.equal(calls[0][1].headers['If-None-Match'],'"old"');assert.equal(calls[0][1].cache,'no-store');assert.equal(calls[0][1].redirect,'error');
 assert.equal(calls[0][1].headers.authorization,'Bearer fixture-only');
});
test('concurrent publishers cannot overwrite each other or activate partial uploads',async()=>{
 let head='1'.repeat(40),serial=1;const initial=fixture();const blobs=new Map(),trees=new Map(),commits=new Map(),tags=new Map();const snapshots=new Map([[head,initial]]);
 const response=x=>({json:async()=>x});
 const error=status=>Object.assign(Error('fake GitHub conflict'),{status});
 const store={token:'writer-fixture',channel:'content/staging',resolve:async()=>({commit:head}),snapshot:async id=>snapshots.get(id),channelInfo:async()=>({generation:1}),request:async(path,options={})=>{
  const body=options.body&&JSON.parse(options.body);const id=()=>String(++serial).padStart(40,'0');
  if(path==='/git/blobs'){const sha=id();blobs.set(sha,JSON.parse(body.content));return response({sha});}
  if(path==='/git/trees'){const sha=id();trees.set(sha,body.tree);return response({sha});}
  if(path==='/git/commits'){const sha=id();commits.set(sha,body);snapshots.set(sha,blobs.get(trees.get(body.tree).find(x=>x.path==='snapshot.json').sha));return response({sha});}
  if(path.startsWith('/git/ref/tags/')){const sha=tags.get(path.slice('/git/ref/tags/'.length));if(!sha)throw error(404);return response({object:{sha}});}
  if(path==='/git/refs'){tags.set(body.ref.slice('refs/tags/'.length),body.sha);return response({});}
  if(path==='/git/refs/heads/content/staging'){assert.equal(body.force,false);if(!commits.get(body.sha).parents.includes(head))throw error(422);head=body.sha;return response({});}
  throw Error('Unexpected request '+path);
 }};
 const outcomes=await Promise.allSettled([publishSnapshot(store,fixture('A'),{expectedHead:head}),publishSnapshot(store,fixture('B'),{expectedHead:head})]);
 assert.equal(outcomes.filter(x=>x.status==='fulfilled').length,1);assert.equal(outcomes.filter(x=>x.status==='rejected').length,1);
 assert.equal(snapshots.get(head).revision,outcomes.find(x=>x.status==='fulfilled').value.revision);
 await assert.rejects(publishSnapshot(store,fixture('Late'),{expectedHead:'1'.repeat(40)}),/Channel moved/);
});
