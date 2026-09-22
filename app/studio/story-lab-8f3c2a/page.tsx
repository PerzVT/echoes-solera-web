import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
export const metadata: Metadata = {
  metadataBase: new URL('https://9livesinnovation.com'),
  title: 'Solera: First Arrival | Interactive Storylab',
  description: 'Enter Solera as Nova, awaken in the spawn chamber, wield a mana sword and choose a companion in an interactive story demo.',
  robots: {index:false,follow:false,noarchive:true,nosnippet:true,noimageindex:true},
  referrer: 'no-referrer',
  icons: {icon:[{url:'/story-lab/solera/assets/favicon-96f3c74c7cd8.svg',type:'image/svg+xml'},{url:'/story-lab/solera/assets/favicon-32x32-05a70b6f57cc.png',sizes:'32x32',type:'image/png'},{url:'/story-lab/solera/assets/favicon-16x16-eb0ae242eb54.png',sizes:'16x16',type:'image/png'}],shortcut:'/story-lab/solera/assets/favicon-c468d846d8b8.ico',apple:'/story-lab/solera/assets/apple-touch-icon-dedf7d052911.png' },
  openGraph: {type:'website',url:'https://9livesinnovation.com/studio/story-lab-8f3c2a',title:'Solera: First Arrival',description:'Awaken in Solera, wield a mana sword and choose your companion.',images:[{url:'/story-lab/solera/assets/og-475bf5b6c732.jpg',width:1200,height:630,alt:'Nova arrives in a lively Solera guild foyer'}]},
  twitter: {card:'summary_large_image',title:'Solera: First Arrival',description:'An interactive Solera adventure.',images:['/story-lab/solera/assets/og-475bf5b6c732.jpg']},
};
export default function Page() {
  return <><iframe title="Solera: First Arrival" src="/story-lab/solera/index.html" allow="autoplay; fullscreen" style={{position:'fixed',inset:0,width:'100%',height:'100dvh',border:0,background:'#10171b'}} /><Analytics /></>;
}
