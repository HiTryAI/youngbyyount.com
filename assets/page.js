/* ===========================================================================
 * Young by You – der Sprachumschalter der Unterseiten
 * ---------------------------------------------------------------------------
 * ACHTUNG: Das hier ist NICHT `script.js`. Jenes gehoert der Startseite und
 * ruft in seinem `setLang` Funktionen auf, die es nur dort gibt
 * (`renderAge`, `renderCalAge`, `renderCalSet`). Bindet man es auf einer
 * Unterseite ein, stirbt die Seite beim ersten Umschalten.
 *
 * So benutzt man es: die deutschen Texte stehen im HTML und tragen ein
 * `data-t="schluessel"`. Die englischen legt die Seite VOR diesem Skript in
 * `window.YBY_EN = { schluessel: '...' }` ab. Mehr braucht es nicht.
 * ======================================================================== */
(function () {
  'use strict';

  var en = window.YBY_EN || {};

  // Deutsch steht im Dokument. Wir merken es uns EINMAL, bevor irgendetwas
  // ersetzt wird – sonst waere der Weg zurueck nicht mehr da.
  var de = {};
  var nodes = document.querySelectorAll('[data-t]');
  for (var i = 0; i < nodes.length; i++) {
    de[nodes[i].dataset.t] = nodes[i].innerHTML;
  }

  var toggle = document.getElementById('langToggle');
  var lang = 'de';

  /* FALLE: die Startseite legt die Sprache unter "yby_lang" ab (Unterstrich),
   * aeltere Unterseiten unter "yby-lang" (Bindestrich). Wer auf der Startseite
   * EN waehlt und hierher klickt, bekaeme sonst wieder Deutsch. Also BEIDE
   * lesen – die Startseite zuerst, weil fast jeder von dort kommt – und beide
   * schreiben. */
  function readLang() {
    try {
      var saved = localStorage.getItem('yby_lang') || localStorage.getItem('yby-lang');
      if (saved === 'en' || saved === 'de') return saved;
    } catch (_) {}
    // Nichts gespeichert: wie die Startseite nach der Sprache des Geraets gehen.
    return (navigator.language || 'en').toLowerCase().indexOf('de') === 0 ? 'de' : 'en';
  }

  function setLang(next) {
    lang = next;
    document.documentElement.lang = next;
    if (toggle) toggle.textContent = next === 'de' ? 'EN' : 'DE';

    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var value = next === 'de' ? de[el.dataset.t] : en[el.dataset.t];
      if (value !== undefined) el.innerHTML = value;
    }

    // Manche Seiten zeigen beide Sprachfassungen untereinander (Recht). Dort
    // blendet der Schalter um, statt Woerter zu tauschen.
    var only = document.querySelectorAll('[data-only]');
    for (var j = 0; j < only.length; j++) {
      only[j].hidden = only[j].dataset.only !== next;
    }

    try {
      localStorage.setItem('yby_lang', next);
      localStorage.setItem('yby-lang', next);
    } catch (_) {}
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setLang(lang === 'de' ? 'en' : 'de');
    });
  }

  setLang(readLang());
})();
