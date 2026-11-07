const C='ejdeha-v2';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html','media.js','voice.mp3','manifest.json','icon-192.png','lib/three.min.js','lib/GLTFLoader.js','lib/SkeletonUtils.js'])).catch(()=>{}));});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.hostname==='api.github.com')return; // file list: always live
  const stable=u.pathname.includes('/lib/')||u.hostname.includes('fonts.')||u.searchParams.has('v');
  if(stable){ // never changes: cache first
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(n=>{if(n.ok||n.type==='opaque'){const k=n.clone();caches.open(C).then(c=>c.put(e.request,k));}return n;})));
  } else { // page, scripts, voice: network first so updates show, cache when offline
    e.respondWith(fetch(e.request).then(r=>{if(r.ok){const k=r.clone();caches.open(C).then(c=>c.put(e.request,k));}return r;}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('./'))));
  }
});
