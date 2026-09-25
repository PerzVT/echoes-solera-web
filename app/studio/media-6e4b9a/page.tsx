import type { Metadata } from 'next';
export const metadata: Metadata = {
 title: 'Death & Desire | Watch stories',
 description: 'A preview of a new home for episodic and interactive stories.',
 robots: { index: false, follow: false, noarchive: true, nosnippet: true, noimageindex: true },
 referrer: 'no-referrer',
 openGraph: { title: 'Death & Desire | Watch stories', description: 'Stories worth staying for.', images: [] },
 twitter: { title: 'Death & Desire | Watch stories', description: 'Stories worth staying for.', images: [] },
};
export default function Page() {
 return <iframe title="Death & Desire" src="/media-preview/index.html" allow="autoplay; fullscreen" style={{position:'fixed',inset:0,width:'100%',height:'100dvh',border:0,background:'#ffffff'}} />;
}

