const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const root=__dirname,port=4174;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.avif':'image/avif','.md':'text/plain; charset=utf-8','.mp4':'video/mp4','.vtt':'text/vtt; charset=utf-8','.pdf':'application/pdf'};
http.createServer((req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
 const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)||pathname.split('/').some(p=>p.startsWith('.'))){res.writeHead(403).end();return;}
 fs.readFile(file,(err,body)=>{if(err){res.writeHead(404).end('Arquivo não encontrado');return;}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:body);});
}).listen(port,'0.0.0.0',()=>{
 console.log('Computador: http://127.0.0.1:'+port+'/');
 Object.values(os.networkInterfaces()).flat().filter(n=>n.family==='IPv4'&&!n.internal).forEach(n=>console.log('Na mesma rede Wi-Fi: http://'+n.address+':'+port+'/'));
 console.log('Mantenha este processo e o computador ligados durante o teste.');
});
