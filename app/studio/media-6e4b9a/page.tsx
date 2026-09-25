import PreviewViewport from '@/components/PreviewViewport';
import type { Metadata } from 'next';
export const metadata: Metadata = {
 title: 'Death & Desire | Watch stories',
 description: 'A preview of a new home for episodic and interactive stories.',
 robots: { index: false, follow: false, noarchive: true, nosnippet: true, noimageindex: true },
 referrer: 'no-referrer',
 icons: { icon: '/media-preview/assets/brand-icon.svg?v=6', shortcut: '/media-preview/assets/brand-icon.svg?v=6' },
 openGraph: { title: 'Death & Desire | Watch stories', description: 'Stories worth staying for.', images: [] },
 twitter: { title: 'Death & Desire | Watch stories', description: 'Stories worth staying for.', images: [] },
};
export default function Page() {
 return <PreviewViewport title="Death & Desire" src="/media-preview/index.html" storageKey="death-desire-preview-layout" />;
}

