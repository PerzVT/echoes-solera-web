export function protectMedia(root){
 const isMedia=target=>Boolean(target?.closest?.('img,video,.picture,.identity'));
 const prevent=event=>{if(isMedia(event.target))event.preventDefault();};
 root.addEventListener('contextmenu',prevent,{capture:true});
 root.addEventListener('dragstart',prevent,{capture:true});
 root.querySelectorAll('img,video').forEach(el=>el.setAttribute('draggable','false'));
 root.addEventListener('load',event=>{if(event.target?.matches?.('img,video'))event.target.setAttribute('draggable','false');},{capture:true});
}
