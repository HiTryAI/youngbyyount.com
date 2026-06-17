/* Young by Yount – landing page interactions
   1. Scroll-reveal animations
   2. Animated phone mockup (routine check loop → bio age ticks down)
   3. DE/EN language toggle
*/

// ───────────────── 1. Scroll reveal ─────────────────
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        // stagger siblings: each reveal in a group waits a touch longer than the last
        const sibs = [...e.target.parentElement.children].filter((c) => c.classList.contains('reveal'));
        e.target.style.setProperty('--i', Math.max(0, sibs.indexOf(e.target)));
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }
  },
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// ───────────────── 2. Phone mockup animation ─────────────────
const ageEl = document.getElementById('bioAge');    // hero dial — single source of truth
const psAgeEl = document.getElementById('psAge');   // phone mirror of the same number
const pointsEl = document.getElementById('chipPoints');
const floatEl = document.getElementById('psFloat');
const routines = Array.from(document.querySelectorAll('.ps-routine'));

let age = 34.76;
let points = 580;
let step = 0;
let lang = 'de';

function fmtAge(v) {
  return v.toFixed(2).replace('.', lang === 'de' ? ',' : '.');
}

function renderAge() {
  const s = fmtAge(age);
  if (ageEl) ageEl.textContent = s;
  if (psAgeEl) psAgeEl.textContent = s;
  if (pointsEl) pointsEl.textContent = points;
}

function tickMockup() {
  const idx = step % (routines.length + 2); // pause beats at the end
  if (idx < routines.length) {
    const r = routines[idx];
    r.classList.add('done');
    age = Math.max(20, age - 0.01);
    points += 10;
    renderAge();
    // floating "-0,01 J." chip
    floatEl.textContent = lang === 'de' ? '−0,01 J.' : '−0.01 yrs';
    floatEl.classList.remove('fly');
    void floatEl.offsetWidth; // restart animation
    floatEl.classList.add('fly');
  } else if (idx === routines.length + 1) {
    // reset loop
    routines.forEach((r) => r.classList.remove('done'));
    age = 34.76;
    points = 580;
    renderAge();
  }
  step++;
}
renderAge();

// Run the mockup loop only when it helps: respect reduced-motion, pause off-screen and on hidden tabs.
const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let phoneTimer = null;
function startPhone() { if (RM || phoneTimer) return; phoneTimer = setInterval(tickMockup, 1700); }
function stopPhone() { if (phoneTimer) { clearInterval(phoneTimer); phoneTimer = null; } }

if (RM) {
  routines.forEach((r) => r.classList.add('done')); // show a calm, finished state, never animate
} else {
  const phone = document.querySelector('.hero-phone');
  if (phone && 'IntersectionObserver' in window) {
    new IntersectionObserver(
      (es) => { es[0].isIntersecting ? startPhone() : stopPhone(); },
      { threshold: 0.2 }
    ).observe(phone);
  } else {
    startPhone();
  }
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopPhone() : startPhone();
  });
}

// ───────────────── 3. Language toggle ─────────────────
const i18n = {
  en: {
    nav_how: 'How it works',
    nav_pillars: '5 pillars',
    nav_features: 'Features',
    nav_pricing: 'Pricing',
    nav_screens: 'App',
    nav_cta: 'Get the app',
    hero_badge: 'Coming soon to the App Store & Google Play',
    hero_title: 'How old are you<br><span class="grad">really</span>?',
    hero_sub:
      'Find out in under 2 minutes how old your body really is – and watch the number drop with every healthy habit. Free, no account.',
    hero_compare: 'Example: chronological 38 · biological <b>34.76</b>',
    hero_delta: '0.04 yrs today',
    hero_answer_sr: 'Example answer: an estimated biological age of 34.76 years.',
    badge_soon: 'Download on the',
    badge_soon2: 'Get it on',
    badge_ribbon: 'Coming soon',
    trust_1: '✓ Free bio-age estimate',
    trust_2: '✓ No account needed',
    trust_3: '✓ 100% local data',
    cred_label: '7 evidence-based factors from longevity research',
    cred_1: 'Sleep',
    cred_2: 'Movement',
    cred_3: 'Nutrition',
    cred_4: 'BMI',
    cred_5: 'Stress',
    cred_6: 'Smoking',
    cred_7: 'Social connection',
    cred_cites: 'Based on recognized longevity research – incl. telomeres, cardiorespiratory fitness and social-connection studies.',
    eyebrow_how: '01 · Step by step',
    eyebrow_screens: '02 · The app',
    eyebrow_pillars: '03 · Holistic',
    eyebrow_features: '04 · Features',
    eyebrow_pricing: '05 · Pricing',
    eyebrow_faq: '06 · Good to know',
    eyebrow_cta: 'Launching soon',
    spark_cap: 'Example · projection',
    screens_title: 'Take a look inside',
    screens_sub: 'From your first estimate to your daily routine – this is how Young by Yount feels.',
    shot_1_t: 'Your free estimate',
    shot_1_b: 'Your biological age – with an honest range.',
    shot_2_t: 'Your day at a glance',
    shot_2_b: 'Bio age, streak, points and your 5 pillars.',
    shot_3_t: '24 science-backed routines',
    shot_3_b: 'Activate what fits you – each one earns points.',
    shot_4_t: 'Watch your number drop',
    shot_4_b: 'Every check counts – plus daily insights.',
    ps_label: 'YOUR BIO AGE',
    ps_unit: 'years · estimate',
    ps_today: 'yrs today',
    chip_streak: 'Streak',
    r1: '30 min movement',
    r2: '7+ hours of sleep',
    r3: '10 min meditation',
    r4: '5 servings of veg',
    how_title: 'How it works',
    how_sub: 'From your first estimate to better habits – in three steps.',
    how_1_t: 'Get your estimate',
    how_1_b:
      'Answer a few questions about sleep, movement, nutrition & more – and get your estimated biological age for free.',
    how_2_t: 'Check off routines',
    how_2_b:
      'Choose from 24 science-backed routines. Every check earns Young Points – and visibly lowers your number.',
    how_3_t: 'Watch your number drop',
    how_3_b:
      'Track your history, keep your streak alive with freeze days, and see in your projection where your estimate can go in 90 days.',
    pillars_title: 'The 5 pillars of longevity',
    pillars_sub:
      'Holistic, not one-sided – your routines cover everything that influences your biological age.',
    pil_1_t: 'Movement',
    pil_1_b: 'Walking, strength & zone 2 cardio – training for your cellular power plants.',
    pil_2_t: 'Nutrition',
    pil_2_b: 'Vegetables, protein, eating breaks – less inflammation, more repair.',
    pil_3_t: 'Sleep',
    pil_3_b: 'Deep sleep is when your body recovers and repairs itself. We help you protect it.',
    pil_4_t: 'Mind',
    pil_4_b: 'Meditation, reading, breathwork – less cortisol, longer telomeres.',
    pil_5_t: 'Social',
    pil_5_b: 'Good relationships are the strongest predictor of a long life.',
    feat_title: 'More than a habit tracker',
    feat_sub: 'Every feature is designed to keep you going.',
    f1_t: 'A living number',
    f1_b: 'Your bio age isn’t a static test result – it reacts to every single check. Instantly.',
    f2_t: 'Why it works',
    f2_b: 'Every routine explains what it does in your body – no blind box-ticking.',
    f3_t: 'Streaks with heart',
    f3_b: 'Freeze days protect your streak when life happens. Motivation, not punishment.',
    f4_t: 'Young Ranks',
    f4_b: 'From Bronze to “Ageless” – your Young Points tell your progress story.',
    f5_t: '90-day projection',
    f5_b: 'See today where your estimate could be in three months if you keep your pace.',
    f6_t: '100% private',
    f6_b: 'All data stays on your device. No account, no cloud, no sharing. Period.',
    priv_t: 'Your health data belongs to you.',
    priv_b:
      'Young by Yount works entirely without servers. What you enter never leaves your phone – that’s not a setting, that’s architecture.',
    price_title: 'Fair & transparent',
    price_sub: 'The core is free. Premium unlocks everything.',
    plan_free_t: 'Free',
    plan_free_1: 'Bio-age estimate',
    plan_free_2: 'Up to 5 active routines',
    plan_free_3: 'Young Points, streaks & ranks',
    plan_free_4: 'Weekly check-in',
    plan_cta_free: 'Start for free',
    plan_flag: 'Popular',
    per_year: '/ year',
    plan_alt: 'or €4.99 / month · €79.99 lifetime',
    plan_pro_1: 'Unlimited routines',
    plan_pro_2: 'Full catalog (24 routines)',
    plan_pro_3: 'Create custom routines',
    plan_pro_4: '90-day projection',
    plan_pro_5: 'Detailed statistics',
    plan_cta_pro: 'Get Premium',
    faq_1_q: 'How is my biological age calculated?',
    faq_1_a:
      'From your answers about your body and lifestyle (incl. BMI, sleep, movement, smoking, stress, diet, social connection) – based on widely recognized relationships from longevity research. It’s a motivating estimate, not a lab value or medical assessment.',
    faq_2_q: 'Does my number really drop when I check things off?',
    faq_2_a:
      'Yes – your Young Points lower the displayed estimate with diminishing returns, capped at several years. That mirrors what studies suggest: consistent habits are associated with younger biological markers – but nobody becomes 18 again.',
    faq_3_q: 'What happens to my data?',
    faq_3_a:
      'Nothing. It stays on your device. There is no account, no server and no analytics trackers. Delete the app and the data is gone.',
    faq_4_q: 'How much does the app cost?',
    faq_4_a:
      'The core app is free – including the estimate, 5 routines, points and streaks. Premium (€4.99/month, €29.99/year or €79.99 once) unlocks the full catalog, custom routines and the projection.',
    faq_5_q: 'Does the app replace a doctor?',
    faq_5_a:
      'No. Young by Yount is a motivational tool for a healthier everyday life. For health concerns or before major lifestyle changes, please talk to a doctor.',
    cta_title: 'Your future self starts today.',
    cta_sub: 'Get your free bio-age estimate – in under 2 minutes.',
    cta_btn: 'Start for free',
    foot_tag: 'Daily routines that lower your bio-age estimate.',
    foot_privacy: 'Privacy',
    foot_contact: 'Contact',
    foot_note:
      'The bio-age estimate is based on your input and general scientific relationships. It is not a medical assessment and does not replace professional medical advice.',
  },
};

// German texts live in the HTML – store them once so we can switch back.
const deCache = {};
document.querySelectorAll('[data-i18n]').forEach((el) => {
  deCache[el.dataset.i18n] = el.innerHTML;
});

const toggle = document.getElementById('langToggle');

function setLang(next) {
  lang = next;
  document.documentElement.lang = next;
  toggle.textContent = next === 'de' ? 'EN' : 'DE';
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    const value = next === 'de' ? deCache[key] : i18n.en[key];
    if (value) el.innerHTML = value;
  });
  // Swap screenshots to the matching language folder.
  document.querySelectorAll('[data-shot]').forEach((img) => {
    img.src = `assets/screens/${next}/${img.dataset.shot}.png`;
  });
  renderAge();
  try { localStorage.setItem('yby-lang', next); } catch (_) {}
}

toggle.addEventListener('click', () => setLang(lang === 'de' ? 'en' : 'de'));

// Initial language: saved → browser → German.
let initial = 'de';
try { initial = localStorage.getItem('yby-lang') || initial; } catch (_) {}
if (!localStorage.getItem('yby-lang') && !navigator.language.startsWith('de')) {
  initial = 'en';
}
if (initial !== 'de') setLang(initial);
