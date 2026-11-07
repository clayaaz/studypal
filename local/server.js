// StudyPal local server: serves the app, proxies Ollama, fetches YouTube transcripts
const http=require('http'),fs=require('fs'),path=require('path');
const OLL=process.env.OLLAMA_URL||'http://localhost:11434',PORT=process.env.PORT||3000;
const send=(r,c,o)=>{r.writeHead(c,{'Content-Type':'application/json'});r.end(JSON.stringify(o))};
const dec=s=>s.replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"');
http.createServer(async(req,res)=>{
 const u=new URL(req.url,'http://x');
 try{
  if(u.pathname==='/api/chat'&&req.method==='POST'){
   let b='';for await(const c of req)b+=c;const{provider,model,key,prompt,json,search}=JSON.parse(b);
   if(provider==='gemini')return send(res,200,{text:await require('../api/_gemini.js')({model,key:key||process.env.GEMINI_API_KEY,prompt,json,search})});
   const r=await fetch(OLL+'/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({model,prompt,stream:false,format:json?'json':undefined,options:{temperature:.4}})});
   const d=await r.json();if(d.error)throw new Error(d.error);return send(res,200,{text:d.response});
  }
  if(u.pathname==='/api/models'){return send(res,200,await(await fetch(OLL+'/api/tags')).json())}
  if(u.pathname==='/api/yt'){
   const url=u.searchParams.get('url');
   let YoutubeTranscript;try{({YoutubeTranscript}=require('youtube-transcript'))}catch{throw new Error('YouTube support is not installed. In the StudyPal folder run: npm install youtube-transcript')}
   const t=await YoutubeTranscript.fetchTranscript(url);
   let title='YouTube video';
   try{title=(await(await fetch('https://www.youtube.com/oembed?format=json&url='+encodeURIComponent(url))).json()).title||title}catch{}
   return send(res,200,{text:dec(t.map(x=>x.text).join(' ')),title});
  }
  res.writeHead(200,{'Content-Type':'text/html'});res.end(fs.readFileSync(path.join(__dirname,'..','public','index.html')));
 }catch(e){send(res,500,{error:e.message.includes('fetch failed')?'Cannot reach Ollama - is it running?':e.message})}
}).listen(PORT,()=>console.log('StudyPal running at http://localhost:'+PORT));
