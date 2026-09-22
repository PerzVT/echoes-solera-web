const cache=new Map();
export function preloadImage(url,{timeout=20000}={}){
 if(cache.has(url))return cache.get(url);
 const promise=new Promise((resolve,reject)=>{const image=new Image();let settled=false;const finish=(error)=>{if(settled)return;settled=true;clearTimeout(timer);image.onload=null;image.onerror=null;error?reject(error):resolve(url);};const timer=setTimeout(()=>finish(new Error('Image loading timed out')),timeout);image.onload=()=>{(image.decode?image.decode():Promise.resolve()).then(()=>finish(),()=>finish());};image.onerror=()=>finish(new Error('Image unavailable'));image.src=url;});
 cache.set(url,promise);promise.catch(()=>cache.delete(url));if(cache.size>8)cache.delete(cache.keys().next().value);return promise;
}
export function waitForVideo(video,src,{signal,timeout=20000}={}){
 return new Promise((resolve,reject)=>{let settled=false;const finish=(error)=>{if(settled)return;settled=true;clearTimeout(timer);video.removeEventListener('loadeddata',loaded);video.removeEventListener('error',failed);signal?.removeEventListener('abort',aborted);error?reject(error):resolve();};const loaded=()=>finish(),failed=()=>finish(new Error('Video unavailable')),aborted=()=>finish(new DOMException('Scene changed','AbortError'));const timer=setTimeout(()=>finish(new Error('Video loading timed out')),timeout);video.addEventListener('loadeddata',loaded);video.addEventListener('error',failed);signal?.addEventListener('abort',aborted,{once:true});if(signal?.aborted){aborted();return;}video.preload='auto';video.src=src;video.load();if(video.readyState>=2)loaded();});
}
let warm;
export function preloadVideoMetadata(url){if(navigator.connection?.saveData)return;if(warm?.getAttribute('src')===url)return;warm=document.createElement('video');warm.preload='metadata';warm.muted=true;warm.src=url;warm.load();}
