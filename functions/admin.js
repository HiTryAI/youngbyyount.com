// youngbyyou.com/admin – die Übersicht, unter der eigenen Adresse.
//
// Die Seite selbst wohnt im Hain-Worker (dort liegen die Daten). Hier steht
// nur die Weiterreichung, damit man sich keine workers.dev-Adresse merken
// muss. Wichtig ist die Kombination: die Seite kommt von hier UND ihre
// Daten kommen von hier (siehe functions/v1/admin/[[path]].js) – käme die
// Seite von youngbyyou.com und ihre Anfragen gingen an workers.dev, wären es
// zwei Herkünfte, und der Browser würde jede Anfrage blockieren.
//
// Der Schlüssel läuft nur durch: er wird hier weder gelesen noch gespeichert.

const GROVE = 'https://yby-grove.yby-circle-worker.workers.dev';

export async function onRequestGet() {
  const res = await fetch(`${GROVE}/admin`, {
    headers: { accept: 'text/html' },
  });
  const headers = new Headers(res.headers);
  // Doppelt gemoppelt: die Seite trägt schon ein noindex-Meta. Suchmaschinen,
  // die kein HTML lesen, sehen es trotzdem.
  headers.set('x-robots-tag', 'noindex, nofollow');
  headers.set('cache-control', 'no-store');
  return new Response(res.body, { status: res.status, headers });
}
