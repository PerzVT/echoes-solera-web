export const INTRO_ATTR = "data-nl-intro";

/**
 * Runs before first paint, first thing inside the labs root (see the labs layout). It marks that root
 * (not <html>, which the root layout owns and React would flag on hydration) as scripted,
 * which lets MediaFrame hide media until it has loaded, and decides whether this visit gets the intro:
 * a plain / only (no query, such as a deep link to ?p=cards, and no hash), once per tab session, and never under reduced motion.
 * `?intro=1` replays it. It also takes the intro away again: after it has played, or at once on a press,
 * Escape or Tab, so that works before the page has hydrated.
 */
const SOURCE = `(function(){try{var d=document.currentScript.closest('.nl');d.setAttribute('data-nl-js','');if(location.pathname!=='/'||location.hash||matchMedia('(prefers-reduced-motion: reduce)').matches)return;var again=new URLSearchParams(location.search).get('intro')==='1';if(!again&&location.search)return;if(!again&&sessionStorage.getItem('nl:intro-seen'))return;sessionStorage.setItem('nl:intro-seen','1');d.setAttribute('${INTRO_ATTR}','');var off=function(){d.removeAttribute('${INTRO_ATTR}');removeEventListener('keydown',key,true);removeEventListener('pointerdown',off,true)};var key=function(e){if(e.key==='Escape'||e.key==='Tab')off()};addEventListener('keydown',key,true);addEventListener('pointerdown',off,true);setTimeout(off,2000);}catch(e){}})();`;

/**
 * The script as markup, for `dangerouslySetInnerHTML` on a hidden wrapper. Parsed from server HTML it
 * runs; when React builds the layout on the client (arriving from outside the labs layout) it is inert
 * text, which is what we want, and React has no script element to warn about.
 */
export const INTRO_HTML = `<script>${SOURCE}</script>`;
