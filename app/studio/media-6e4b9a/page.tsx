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
export default async function Page({ searchParams }: { searchParams: Promise<{ series?: string | string[] }> }) {
 const params = await searchParams;
 const series = typeof params.series === "string" && /^[a-z-]+$/.test(params.series) ? params.series : "";
 const src = "/media-preview/index.html" + (series ? "#series/" + encodeURIComponent(series) : "");
 return <PreviewViewport title="Death & Desire" src={src} storageKey="death-desire-preview-layout" />;
}

