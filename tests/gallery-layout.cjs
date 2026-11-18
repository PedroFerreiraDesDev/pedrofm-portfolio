const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/../project-gallery.js','utf8');
const draw=source.slice(source.indexOf('  function draw(){'),source.indexOf('  function schedule(){'));
for(const [width,height] of [[1440,900],[1280,720],[1024,600],[800,600],[1024,540],[844,390],[390,844]]){
 const windowHeight=height*.71,cardHeight=windowHeight-72;
 const cards=[0,1,2].map(i=>({offsetLeft:width*.25+i*width*.8,offsetWidth:width*.44,offsetHeight:cardHeight,style:{getPropertyValue:()=>i%2?4:-5}}));
 const context={frame:1,document:{hidden:false},flat:()=>false,rail:{style:{}},cards,clamp:x=>Math.max(0,Math.min(1,x)),gallery:{scrollTop:0,clientWidth:width,clientHeight:height},sceneStart:()=>0,exitRun:200,travel:width*2,distance:width*2,viewport:{clientHeight:windowHeight},scene:{style:{setProperty(){}}}};
 vm.createContext(context);vm.runInContext(draw,context);
 for(const progress of [0,.25,.5,.75,1]){
  context.gallery.scrollTop=progress*context.travel;context.draw();
  assert.equal(context.rail.style.transform,'translate3d('+(-context.distance*progress)+'px,0,0)');
  for(const card of cards){
   const match=card.style.transform.match(/translate3d\(0,([-\d.]+)px,0\) rotate\(([-\d.]+)deg\) scale\(([-\d.]+)\)/);
   const [,shift,angle,scale]=match.map(Number);
   const half=(Math.abs(Math.cos(angle*Math.PI/180))*card.offsetHeight+Math.abs(Math.sin(angle*Math.PI/180))*card.offsetWidth)*scale/2;
   assert.ok(Math.abs(shift)+half<=windowHeight/2,`card exceeds window at ${width}x${height}`);
  }
 }
}
console.log('OK: floating image and caption bounds across seven viewport geometries; not a browser layout test.');
