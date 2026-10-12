/* Uma textura, uma malha contínua. A fotografia original permanece como fallback. */
(()=>{
 window.PedroPaper=function(canvas,image,onReady){
  const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:true,depth:false});if(!gl)return null;
  let alive=true,ready=false,program,vertices,indices,texture,vs,fs;const events=new AbortController();
  const vertex=`attribute vec2 position; varying vec2 uv; varying float shade;
   uniform vec2 fit; uniform vec2 pointer; uniform float curl;
   void main(){
    uv=position*.5+.5;
    float edge=pow(abs(position.x),3.);
    float bend=edge*curl*(.65+.35*sin(position.y*2.8+pointer.x*2.));
    vec2 p=position*fit;
    p.y+=sin(position.x*2.4+pointer.y)*bend*.06*fit.y;
    shade=1.-bend*.18;
    gl_Position=vec4(p,0.,1.+bend*.32);
   }`;
  const fragment=`precision mediump float; varying vec2 uv; varying float shade; uniform sampler2D photo;
   void main(){vec4 color=texture2D(photo,uv);gl_FragColor=vec4(color.rgb*shade,color.a);}`;
  function compile(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);throw Error('Shader indisponível');}return s;}
  function release(){if(texture)gl.deleteTexture(texture);if(vertices)gl.deleteBuffer(vertices);if(indices)gl.deleteBuffer(indices);if(program)gl.deleteProgram(program);if(vs)gl.deleteShader(vs);if(fs)gl.deleteShader(fs);}
  let count=0,locations;
  try{
   vs=compile(gl.VERTEX_SHADER,vertex);fs=compile(gl.FRAGMENT_SHADER,fragment);program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Programa indisponível');gl.useProgram(program);
   const points=[],faces=[],cols=32,rows=40;
   for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++)points.push(x/cols*2-1,y/rows*2-1);
   for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const a=y*(cols+1)+x,b=a+cols+1;faces.push(a,a+1,b,b,a+1,b+1);}
   vertices=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vertices);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(points),gl.STATIC_DRAW);
   indices=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indices);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(faces),gl.STATIC_DRAW);count=faces.length;
   const a=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
   locations=Object.fromEntries(['fit','pointer','curl','photo'].map(key=>[key,gl.getUniformLocation(program,key)]));
   texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  }catch{release();return null;}
  function upload(){if(!alive||ready||!image.naturalWidth)return;try{gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);if(gl.getError()!==gl.NO_ERROR)return;ready=true;onReady(true);}catch{onReady(false);}}
  image.addEventListener('load',upload,{signal:events.signal});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();ready=false;onReady(false);},{signal:events.signal});
  if(image.complete)upload();
  return{draw(width,height,curl,x,y){if(!ready||!alive||width<=0||height<=0)return;const ratio=Math.min(devicePixelRatio||1,1.5);const w=Math.round(width*ratio),h=Math.round(height*ratio);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}const ar=image.naturalWidth/image.naturalHeight,box=width/height;gl.uniform2f(locations.fit,Math.min(1,ar/box),Math.min(1,box/ar));gl.uniform2f(locations.pointer,x,y);gl.uniform1f(locations.curl,Math.max(0,Math.min(.65,curl)));gl.uniform1i(locations.photo,0);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawElements(gl.TRIANGLES,count,gl.UNSIGNED_SHORT,0);},destroy(){alive=false;events.abort();release();gl.getExtension('WEBGL_lose_context')?.loseContext();}};
 };
})();
