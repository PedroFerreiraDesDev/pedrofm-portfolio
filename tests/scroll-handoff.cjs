const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const motion=vm.runInNewContext(fs.readFileSync(__dirname+'/../cover-motion.js','utf8')+';coverMotion');
let callback=null,time=0,position=0,moves=[],small=false;
const c=motion({width:()=>1200,reduced:()=>small,raf:f=>(callback=f,1),cancel:()=>callback=null,
 paint:p=>position=p,arrive:d=>moves.push(d)});
function frames(count){while(callback&&count--){const f=callback;callback=null;time+=16;f(time)}}
c.feed(120);frames(120);assert.ok(position>0 && position<.1);assert.equal(moves.length,0);
const held=position;frames(300);assert.equal(position,held,'pause holds partial progress');
c.feed(-120);frames(120);assert.equal(position,0,'equal reverse input retraces');
c.select(1);frames(30);assert.ok(position>0 && position<.35,'visible speed is bounded');
c.feed(-80);frames(200);assert.deepEqual(moves,[],'reverse cancels settling');
c.reset();for(let i=0;i<14;i++)c.feed(120);frames(250);assert.deepEqual(moves,[1]);
c.reset();c.feed(-240,true);frames(180);assert.ok(position<0&&position>-1);
c.reset();small=true;c.select(-1);assert.deepEqual(moves,[1,-1]);
const src=fs.readFileSync(__dirname+'/../app.js','utf8');
let now=1000,handler;const inputs=[];
const ctx={mode:'gallery',waitingRoute:false,Date:{now:()=>now},lastWheel:null,wheelTail:{at:now,delta:100},
 gallery:{clientWidth:1200,clientHeight:800,addEventListener:(name,f)=>handler=f},cover:{feed:d=>inputs.push(d)}};
vm.runInNewContext(src.slice(src.indexOf("gallery.addEventListener('wheel',e=>{"),src.indexOf("gallery.addEventListener('scroll'")),ctx);
const wheel=(y,x=0,opts={})=>{now+=16;handler({deltaY:y,deltaX:x,preventDefault(){},...opts})};
wheel(80);wheel(60);assert.equal(inputs.length,0,'inertia filtered');
wheel(-40);wheel(30,80);wheel(2,0,{deltaMode:1});wheel(40,0,{ctrlKey:true});
assert.deepEqual(inputs,[-40,80,32]);
console.log('OK: incremental covers, pause, reversal, speed cap, settle, touch, motion preference and arrival.');
