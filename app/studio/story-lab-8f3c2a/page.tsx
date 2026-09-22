import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Solera: First Arrival | Story Lab',
  description: 'An interactive Solera narrative preview.',
  robots: {index:false,follow:false,noarchive:true,nosnippet:true,noimageindex:true},
  referrer:'no-referrer',
  openGraph:{title:'Solera: First Arrival',description:'An interactive narrative preview.',images:[]},
  twitter:{card:'summary',title:'Solera: First Arrival',description:'An interactive narrative preview.',images:[]},
};
export default function Page(){
  return <iframe title="Solera: First Arrival" src="/story-lab/solera/index.html" allow="autoplay; fullscreen" style={{position:'fixed',inset:0,width:'100%',height:'100dvh',border:0,background:'#10171b'}} />;
}
