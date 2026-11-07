const C='ejdeha-v1';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html','voice.mp3','manifest.json','icon-192.png','lib/three.min.js','lib/GLTFLoader.js','lib/SkeletonUtils.js'])).catch(()=>{}));});
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url), html=e.request.mode==='navigate'||u.pathname.endsWith('.html');
  if(html){ // network first so updates show up, cache when offline
    e.respondWith(fetch(e.request).then(r=>{const k=r.clone();caches.open(C).then(c=>c.put(e.request,k));return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./'))));
  } else { // cache first for libraries, fonts, voice
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(n=>{if(n.ok||n.type==='opaque'){const k=n.clone();caches.open(C).then(c=>c.put(e.request,k));}return n;})));
  }
});
