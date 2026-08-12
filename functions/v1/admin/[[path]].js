// Die Daten hinter youngbyyou.com/admin.
//
// Die Übersichtsseite fragt ausschließlich relative Adressen an (/v1/admin/…).
// Hier werden sie an den Hain-Worker weitergereicht – mit Verfahren, Kopf und
// Rumpf, wie sie kamen. Geprüft wird der Schlüssel weiterhin NUR dort: diese
// Datei kennt ihn nicht und darf ihn nicht kennen.
//
// Weitergereicht wird bewusst nur, was der Worker braucht: die Erlaubnis und
// die Art des Rumpfes. Cookies und alles andere bleiben hier.

// Bewusst noch einmal hingeschrieben statt importiert: eine Route-Datei als
// Modul zu benutzen, hängt am Bündler von Pages. Eine Adresse doppelt ist
// billiger als ein Deploy, der daran scheitert.
const GROVE = 'https://yby-grove.yby-circle-worker.workers.dev';

export async function onRequest(context) {
  const { request, params } = context;
  const rest = Array.isArray(params.path) ? params.path.join('/') : params.path;
  const url = new URL(request.url);
  const target = `${GROVE}/v1/admin/${rest}${url.search}`;

  const headers = new Headers();
  const auth = request.headers.get('authorization');
  if (auth) headers.set('authorization', auth);
  const type = request.headers.get('content-type');
  if (type) headers.set('content-type', type);

  const res = await fetch(target, {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD'
      ? undefined
      : await request.text(),
  });
  const out = new Headers(res.headers);
  out.set('cache-control', 'no-store');
  out.set('x-robots-tag', 'noindex, nofollow');
  return new Response(res.body, { status: res.status, headers: out });
}
