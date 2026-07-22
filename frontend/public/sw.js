const CACHE = 'spettus-final-3.3.0';
const ESSENCIAIS = ['/', '/index.html', '/manifest.webmanifest', '/logo-seu-antonio.png'];

self.addEventListener('install', (evento) => {
    evento.waitUntil(
        caches.open(CACHE)
            .then((cache) => cache.addAll(ESSENCIAIS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (evento) => {
    evento.waitUntil(
        caches.keys()
            .then((chaves) => Promise.all(
                chaves.filter((chave) => chave !== CACHE).map((chave) => caches.delete(chave))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (evento) => {
    const requisicao = evento.request;
    if (requisicao.method !== 'GET') return;

    const url = new URL(requisicao.url);
    if (url.origin !== self.location.origin) return;

    if (requisicao.mode === 'navigate') {
        evento.respondWith(
            fetch(requisicao)
                .then((resposta) => {
                    const copia = resposta.clone();
                    caches.open(CACHE).then((cache) => cache.put('/index.html', copia));
                    return resposta;
                })
                .catch(() => caches.match('/index.html'))
        );
        return;
    }

    evento.respondWith(
        caches.match(requisicao).then((cacheado) => {
            const rede = fetch(requisicao).then((resposta) => {
                if (resposta.ok) {
                    const copia = resposta.clone();
                    caches.open(CACHE).then((cache) => cache.put(requisicao, copia));
                }
                return resposta;
            });
            return cacheado || rede;
        })
    );
});
