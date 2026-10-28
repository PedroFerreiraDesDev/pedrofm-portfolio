const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/../zoom.js','utf8');
const code=source.slice(source.indexOf(' function draw(time)'),source.indexOf(" map.addEventListener('wheel'"));
function fixture(reduced=false){
 let queued,home=true,entries=0,time=0;
 const style={setProperty(){}};
 const c={value:0,target:0,frame:0,lastTime:0,settle:null,settleAllowed:true,handoff:2,settleThreshold:1.8,settleDuration:420,lastWheelAt:0,lastWheelDelta:0,motion:{matches:reduced},plane:{style,setAttribute(){}},intro:{style},nodes:[],buttons:[],accessible:false,document:{body:{classList:{contains:()=>home,add(){}}}},expandCover(){},enterGalleryFromZoom(){entries++;home=false;},requestAnimationFrame:f=>{queued=f;return 1;}};
 vm.createContext(c);vm.runInContext(code,c);
 return {c,set:v=>c.set(v),tick(){time+=16;const f=queued;queued=null;if(f)f(time);},get entries(){return entries},leave(){home=false}};
}
let f=fixture();f.set(1.79);for(let i=0;i<150;i++)f.tick();assert.equal(f.entries,0);
f.set(1.82);for(let i=0;i<150&&!f.c.settle;i++)f.tick();assert.ok(f.c.settle);let n=0;while(!f.entries&&n++<30)f.tick();assert.equal(f.entries,1);assert.ok(n<=27);
f=fixture();f.set(1.82);for(let i=0;i<150&&!f.c.settle;i++)f.tick();for(let i=0;i<5;i++)f.tick();const before=f.c.value;f.set(f.c.target-.01);for(let i=0;i<100;i++)f.tick();assert.equal(f.entries,0);assert.ok(f.c.value<before);assert.equal(f.c.settle,null);
f=fixture(true);f.set(1.8);f.tick();assert.equal(f.entries,1);
f=fixture();f.set(1.9);f.leave();f.tick();assert.equal(f.entries,0);
console.log('OK: threshold, 420ms completion, reverse cancellation, reduced motion, route exit.');
