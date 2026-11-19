/* MTK Visuals: קביעת שיחה, הסכמה לעוגיות, קודי פרסום ומקור הגעה.
   משותף לכל דפי האתר.
   כדי להפעיל משהו, מדביקים את הערך בין הגרשיים. שדה ריק = כבוי. */
(function(){
'use strict';

var CFG = {
  GA_ID: 'G-0VKRYYS2PD',            // Google Analytics (כבר פעיל באתר)
  BOOKING_URL: 'https://calendar.app.google/jyJXPhwFyrwLNDhs8',                  // קישור ליומן לקביעת שיחה (Google Calendar / Cal.com). ריק = הכפתור לא מוצג
  LINKEDIN_PARTNER_ID: '',          // LinkedIn Insight Tag: מספר השותף (Partner ID)
  LINKEDIN_CONVERSION_CONTACT: '',  // LinkedIn: מזהה המרה ללחיצה על וואטסאפ, טלפון או מייל
  LINKEDIN_CONVERSION_BOOKING: '',  // LinkedIn: מזהה המרה ללחיצה על קביעת שיחה
  META_PIXEL_ID: '',                // Meta Pixel (פייסבוק ואינסטגרם)
  GOOGLE_ADS_ID: '',                // Google Ads, למשל 'AW-123456789'
  GOOGLE_ADS_LABEL_CONTACT: '',     // Google Ads: תווית המרה ללחיצה על וואטסאפ, טלפון או מייל
  GOOGLE_ADS_LABEL_BOOKING: ''      // Google Ads: תווית המרה ללחיצה על קביעת שיחה
};
window.MTK_CFG = CFG;

var CONSENT_KEY = 'mtk-consent', SRC_KEY = 'mtk-src';
function local(k, v){ try{ if(v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v) }catch(e){ return null } }
function session(k, v){ try{ if(v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v) }catch(e){ return null } }
function lang(){ return document.documentElement.lang === 'en' ? 'en' : 'he' }
function $$(s){ return Array.prototype.slice.call(document.querySelectorAll(s)) }

/* מי שבחר "רק הכרחי": Google Analytics לא נטען. חייב לרוץ לפני שהדף טוען את GA. */
if(local(CONSENT_KEY) === 'essential' && CFG.GA_ID){ window['ga-disable-' + CFG.GA_ID] = true }

/* ---------- מקור ההגעה (utm_source), נשמר לכל הביקור ---------- */
var params = null;
try{ params = new URLSearchParams(location.search) }catch(e){}
if(params && params.get('utm_source')){ session(SRC_KEY, params.get('utm_source').toLowerCase().replace(/[^a-z0-9_\-]/g, '').slice(0, 40)) }
var SRC_HE = {linkedin:'LinkedIn', google:'גוגל', meta:'אינסטגרם / פייסבוק', facebook:'פייסבוק', instagram:'אינסטגרם', outreach:'המייל שקיבלתי', email:'המייל שקיבלתי', vccafe:'VC Cafe', community:'הקהילה'};
var SRC_EN = {linkedin:'LinkedIn', google:'Google', meta:'Instagram / Facebook', facebook:'Facebook', instagram:'Instagram', outreach:'your email', email:'your email', vccafe:'VC Cafe', community:'the community'};
function srcLabel(){ var s = session(SRC_KEY); if(!s) return ''; return (lang() === 'en' ? SRC_EN : SRC_HE)[s] || s }

/* מוסיף להודעת הוואטסאפ המוכנה מאיפה הגיעו, כדי שגם פנייה בוואטסאפ תגיע עם מקור */
function tagWhatsApp(){
  var label = srcLabel(); if(!label) return;
  var sfx = lang() === 'en' ? ' (via ' + label + ')' : ' (דרך ' + label + ')';
  $$('a[href^="https://wa.me"]').forEach(function(a){
    try{
      var u = new URL(a.href);
      if(!a.hasAttribute('data-wa-base')) a.setAttribute('data-wa-base', u.searchParams.get('text') || '');
      a.href = u.origin + u.pathname + '?text=' + encodeURIComponent(a.getAttribute('data-wa-base') + sfx);
    }catch(e){}
  });
}

/* ---------- כפתורי קביעת שיחה ---------- */
/* data-booking="hide": מוסתר עד שיש קישור ליומן. data-booking="fallback": בלי יומן נשאר הקישור המקורי (וואטסאפ). */
function setupBooking(){
  $$('[data-booking]').forEach(function(a){
    if(CFG.BOOKING_URL){
      a.href = CFG.BOOKING_URL; a.target = '_blank'; a.rel = 'noopener'; a.hidden = false;
      var he = a.getAttribute('data-he-book'), en = a.getAttribute('data-en-book');
      if(he && en){ a.setAttribute('data-he', he); a.setAttribute('data-en', en); a.textContent = lang() === 'en' ? en : he }
    }else if(a.getAttribute('data-booking') === 'hide'){ a.hidden = true }
  });
}

/* ---------- המרות ---------- */
function fire(kind){
  if(kind === 'booking'){ try{ if(window.gtag) window.gtag('event', 'book_call_click', {source: session(SRC_KEY) || 'direct'}) }catch(e){} }
  if(local(CONSENT_KEY) !== 'all') return;
  try{ if(window.fbq) window.fbq('track', kind === 'booking' ? 'Schedule' : 'Contact') }catch(e){}
  try{ var lid = kind === 'booking' ? CFG.LINKEDIN_CONVERSION_BOOKING : CFG.LINKEDIN_CONVERSION_CONTACT; if(lid && window.lintrk) window.lintrk('track', {conversion_id: Number(lid)}) }catch(e){}
  try{ var lbl = kind === 'booking' ? CFG.GOOGLE_ADS_LABEL_BOOKING : CFG.GOOGLE_ADS_LABEL_CONTACT; if(CFG.GOOGLE_ADS_ID && lbl && window.gtag) window.gtag('event', 'conversion', {send_to: CFG.GOOGLE_ADS_ID + '/' + lbl}) }catch(e){}
}
document.addEventListener('click', function(e){
  var a = e.target.closest && e.target.closest('a'); if(!a) return;
  if(a.hasAttribute('data-booking') && CFG.BOOKING_URL){ fire('booking'); return }
  var h = a.getAttribute('href') || '';
  if(h.indexOf('https://wa.me') === 0 || h.indexOf('tel:') === 0 || h.indexOf('mailto:') === 0) fire('contact');
}, true);

/* ---------- קודי פרסום: נטענים רק אחרי אישור ---------- */
var marketingLoaded = false;
function addScript(src){ var s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s) }
function loadMarketing(){
  if(marketingLoaded) return; marketingLoaded = true;
  if(CFG.LINKEDIN_PARTNER_ID){
    window._linkedin_partner_id = CFG.LINKEDIN_PARTNER_ID;
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(CFG.LINKEDIN_PARTNER_ID);
    if(!window.lintrk){ window.lintrk = function(a, b){ window.lintrk.q.push([a, b]) }; window.lintrk.q = [] }
    addScript('https://snap.licdn.com/li.lms-analytics/insight.min.js');
  }
  if(CFG.META_PIXEL_ID && !window.fbq){
    var n = window.fbq = function(){ n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) };
    if(!window._fbq) window._fbq = n; n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    addScript('https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', CFG.META_PIXEL_ID); window.fbq('track', 'PageView');
  }
  if(CFG.GOOGLE_ADS_ID){
    window.dataLayer = window.dataLayer || [];
    if(!window.gtag){ window.gtag = function(){ window.dataLayer.push(arguments) }; window.gtag('js', new Date()); addScript('https://www.googletagmanager.com/gtag/js?id=' + CFG.GOOGLE_ADS_ID) }
    window.gtag('config', CFG.GOOGLE_ADS_ID);
  }
}

/* ---------- הודעת עוגיות ---------- */
var TXT = {
  he: {msg:'האתר משתמש בעוגיות כדי למדוד ביקורים, ובאישורך גם כדי למדוד פרסום.', more:'מדיניות פרטיות', ok:'אישור', no:'רק הכרחי'},
  en: {msg:'This site uses cookies to measure visits and, with your consent, to measure advertising.', more:'Privacy policy', ok:'Accept', no:'Essential only'}
};
var bar = null;
function renderBar(){
  if(!bar) return; var t = TXT[lang()];
  bar.setAttribute('dir', lang() === 'en' ? 'ltr' : 'rtl');
  bar.querySelector('.c-msg').textContent = t.msg + ' ';
  bar.querySelector('.c-more').textContent = t.more;
  bar.querySelector('.ok').textContent = t.ok;
  bar.querySelector('.no').textContent = t.no;
}
function decide(v){
  local(CONSENT_KEY, v);
  try{ if(window.gtag){ var g = v === 'all' ? 'granted' : 'denied'; window.gtag('consent', 'update', {analytics_storage: g, ad_storage: g, ad_user_data: g, ad_personalization: g}) } }catch(e){}
  if(v === 'essential' && CFG.GA_ID) window['ga-disable-' + CFG.GA_ID] = true;
  if(v === 'all') loadMarketing();
  hideBar();
}
function hideBar(){ if(bar){ bar.remove(); bar = null } document.documentElement.classList.remove('mtk-consent-open') }
function showBar(){
  if(bar) return;
  bar = document.createElement('div'); bar.className = 'mtk-consent'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'cookies');
  bar.innerHTML = '<p><span class="c-msg"></span><a class="c-more" href="privacy.html"></a></p><div class="c-btns"><button type="button" class="ok"></button><button type="button" class="no"></button></div>';
  bar.querySelector('.ok').addEventListener('click', function(){ decide('all') });
  bar.querySelector('.no').addEventListener('click', function(){ decide('essential') });
  document.body.appendChild(bar); renderBar();
  document.documentElement.classList.add('mtk-consent-open');
}

/* ---------- הפעלה ---------- */
function start(){
  setupBooking(); tagWhatsApp();
  var c = local(CONSENT_KEY);
  if(!c) showBar();
  else if(c === 'all'){ if(document.readyState === 'complete') loadMarketing(); else addEventListener('load', loadMarketing) }
  document.addEventListener('click', function(e){ var o = e.target.closest && e.target.closest('[data-consent-open]'); if(o){ e.preventDefault(); showBar() } });
  document.addEventListener('mtk:lang', function(){ renderBar(); tagWhatsApp() });
  /* ?lang=en פותח את הדף באנגלית, למודעות באנגלית */
  setTimeout(function(){ if(params && params.get('lang') === 'en' && lang() !== 'en' && window.mtkToggleLanguage) window.mtkToggleLanguage() }, 0);
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
