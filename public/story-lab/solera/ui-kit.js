const paths={
 arrow:['M4 12h15','m13 6 6 6-6 6'],back:['M20 12H5','m11 6-6 6 6 6'],north:['M12 20V4','m6 10 6-6 6 6'],
 crystal:['M12 2 20 12 12 22 4 12Z','M12 2v20M4 12h16'],
 replay:['M4 10a8 8 0 1 1 1 8','M4 4v6h6'],play:['m8 4 12 8-12 8Z'],pause:['M8 4v16M16 4v16'],
 volume:['M3 9h4l5-4v14l-5-4H3Z','M16 8a6 6 0 0 1 0 8','M19 5a10 10 0 0 1 0 14'],
 mute:['M3 9h4l5-4v14l-5-4H3Z','m17 9 5 6m0-6-5 6'],menu:['M4 6h16M4 12h16M4 18h16'],
 mobile:['M7 2h10v20H7Z','M10 18h4'],window:['M2 4h20v16H2ZM2 8h20'],lock:['M5 10h14v11H5Z','M8 10V6a4 4 0 0 1 8 0v4'],
 bow:['M5 3q17 9 0 18','M5 3v18M3 12h18','m17 8 4 4-4 4'],sword:['m4 20 3-3m-3-4 7 7','m7 15 10-12h4v4L9 17'],home:['m3 11 9-8 9 8','M5 10v11h14V10']};
export function makeIcon(name='crystal'){const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('class','ui-icon');svg.setAttribute('aria-hidden','true');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.6');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');for(const d of paths[name]||paths.crystal){const p=document.createElementNS(ns,'path');p.setAttribute('d',d);svg.append(p);}return svg;}
export function setButton(button,label,icon=null,trailing=false){const key=[label,icon,trailing].join('|');if(button.dataset.paint===key)return;button.dataset.paint=key;button.replaceChildren();if(icon)button.append(makeIcon(icon));const text=document.createElement('span');text.className='button-label';text.textContent=label;button.append(text);if(trailing){const arrow=makeIcon('arrow');arrow.classList.add('button-arrow');button.append(arrow);}}
