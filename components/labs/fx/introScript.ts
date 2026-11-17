export const INTRO_ATTR = "data-nl-intro";

/**
 * Runs before first paint, first thing inside the labs root (see the labs layout). It marks that root
 * (not <html>, which the root layout owns and React would flag on hydration) as scripted,
 * which lets MediaFrame hide media until it has loaded, and decides whether this visit gets the intro:
 * every full load of the home page (no hash), and never under reduced motion. Moving between pages
 * inside the site does not replay it. It also takes the intro away again: two seconds after the first
 * painted frame, so a slow load cannot use the time up before anything shows, or at once on a press,
 * Escape or Tab, so that works before the page has hydrated.
 */
const SOURCE = `(function(){try{var d=document.currentScript.closest('.nl');d.setAttribute('data-nl-js','');if(location.pathname!=='/'||location.hash||matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.setAttribute('${INTRO_ATTR}','');var off=function(){d.removeAttribute('${INTRO_ATTR}');removeEventListener('keydown',key,true);removeEventListener('pointerdown',off,true)};var key=function(e){if(e.key==='Escape'||e.key==='Tab')off()};addEventListener('keydown',key,true);addEventListener('pointerdown',off,true);requestAnimationFrame(function(){setTimeout(off,2000)});}catch(e){}})();`;

/**
 * The script as markup, for `dangerouslySetInnerHTML` on a hidden wrapper. Parsed from server HTML it
 * runs; when React builds the layout on the client (arriving from outside the labs layout) it is inert
 * text, which is what we want, and React has no script element to warn about.
 */
export const INTRO_HTML = `<script>${SOURCE}</script>`;
