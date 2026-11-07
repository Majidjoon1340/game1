/* Default players and music from the repo folders (public build only).
   photos/<player name>/  -> 1st image (by file name) = main photo, 2nd = joy/reward photo
   music/                  -> every audio file becomes a track in "my songs"
   The file list comes from the GitHub API (one call, cached), files are served by GitHub Pages. */
(function(){
  const REPO='Majidjoon1340/game1', BRANCH='main', CK='repo-media-v1', TTL=5*60*1000;
  const IMG=/\.(jpe?g|png|webp|gif)$/i, AUD=/\.(mp3|m4a|aac|ogg|wav)$/i;
  const enc=p=>p.split('/').map(encodeURIComponent).join('/');
  const byName=(a,b)=>a.path.localeCompare(b.path,'en',{numeric:true});

  async function listFiles(){
    let c=null;try{c=JSON.parse(localStorage.getItem(CK));}catch(e){}
    if(c&&Date.now()-c.t<TTL)return c.files;
    try{
      const r=await fetch(`https://api.github.com/repos/${REPO}/git/trees/${BRANCH}?recursive=1`,{cache:'no-store'});
      if(!r.ok)throw new Error(r.status);
      const j=await r.json();
      const files=(j.tree||[]).filter(x=>x.type==='blob'&&/^(photos|music)\//.test(x.path)).map(x=>({path:x.path,sha:x.sha}));
      try{localStorage.setItem(CK,JSON.stringify({t:Date.now(),files}));}catch(e){}
      return files;
    }catch(e){return c?c.files:null;}
  }
  const url=f=>enc(f.path)+'?v='+f.sha.slice(0,8);

  async function apply(){
    const G=window.__dr;if(!G||!G.S||!G.S.players)return;
    const {S,saveAll,mkPlayer,ensureImg,renderTitle,rebuildDragon,IDB,AU}=G;
    const files=await listFiles();if(!files)return;
    let changed=false;

    /* players */
    const groups={};
    files.filter(f=>IMG.test(f.path)).forEach(f=>{const m=f.path.match(/^photos\/([^/]+)\/[^/]+$/);if(m)(groups[m[1]]=groups[m[1]]||[]).push(f);});
    Object.keys(groups).sort().forEach(name=>{
      const imgs=groups[name].sort(byName);
      let p=S.players.find(q=>q.name===name);
      if(!p){p=mkPlayer(name,'small','math',Math.floor(Math.random()*5),0,'none');S.players.push(p);changed=true;}
      const main=imgs[0]?url(imgs[0]):null, joy=imgs[1]?url(imgs[1]):null;
      // repo photos replace only what came from the repo before (or nothing); a photo picked on the phone wins
      if(main&&(!p.photo||p.photo===p.repoPhoto)&&p.photo!==main){p.photo=main;p._img=null;changed=true;}
      if(!main&&p.repoPhoto&&p.photo===p.repoPhoto){p.photo=null;p._img=null;changed=true;}
      p.repoPhoto=main;
      if(joy&&(!p.rewardPhoto||p.rewardPhoto===p.repoReward)&&p.rewardPhoto!==joy){p.rewardPhoto=joy;changed=true;}
      if(!joy&&p.repoReward&&p.rewardPhoto===p.repoReward){p.rewardPhoto=null;changed=true;}
      p.repoReward=joy;
    });

    /* music */
    const songs=files.filter(f=>/^music\//.test(f.path)&&AUD.test(f.path)).sort(byName);
    const want=new Set(songs.map(f=>'r'+f.sha.slice(0,10)));
    S.settings.tracks=S.settings.tracks||[];
    const gone=S.settings.tracks.filter(t=>t.repo&&!want.has(t.id));
    if(gone.length){gone.forEach(t=>{IDB.del('mus:'+t.id);});S.settings.tracks=S.settings.tracks.filter(t=>!gone.includes(t));AU.tracks=AU.tracks.filter(t=>!gone.some(g=>g.id===t.id));changed=true;}
    const firstTime=!S.settings.tracks.some(t=>t.repo)&&songs.length>0;
    for(const f of songs){
      const id='r'+f.sha.slice(0,10);
      if(S.settings.tracks.some(t=>t.id===id))continue;
      try{
        const r=await fetch(url(f));if(!r.ok)continue;
        const blob=await r.blob();await IDB.put('mus:'+id,blob);
        const name=decodeURIComponent(f.path.split('/').pop()).replace(/\.[^.]+$/,'');
        S.settings.tracks.push({id,name,repo:1});AU.tracks.push({id,name,blob});changed=true;
      }catch(e){}
    }
    if(firstTime)S.settings.customMusic=true;

    if(!changed)return;
    saveAll();
    S.players.forEach(p=>ensureImg(p,()=>{if(G.P===p)rebuildDragon();if(G.curScreen==='title')renderTitle();}));
    try{if(G.curScreen==='title')renderTitle();AU.applyMusic();}catch(e){}
  }
  window.addEventListener('load',()=>setTimeout(()=>apply().catch(e=>console.warn('media',e)),300));
})();
