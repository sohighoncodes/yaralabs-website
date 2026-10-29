import type { Metadata } from 'next';

export const brandOpenGraph = {
  type: 'website' as const,
  siteName: 'Yara Labs',
  url: 'https://yaralabs.io',
  title: 'Yara Labs: Invisible automation. Visible results.',
  description: 'Automation, AI agents and CRM setup built on the tools you already use. Book a free 30-minute call.',
  images: [{
    url: 'https://yaralabs.io/og-image.png',
    width: 1200,
    height: 630,
    alt: 'Yara Labs: Invisible automation. Visible results.',
  }],
};

export const brandTwitter = {
  card: 'summary_large_image' as const,
  title: brandOpenGraph.title,
  description: 'Automation, AI agents and CRM setup built on the tools you already use.',
  images: ['https://yaralabs.io/og-image.png'],
};

// Nested metadata is replaced by child routes. Apply shared imagery explicitly
// to every page while retaining its own title, description and canonical URL.
export function withBrandMetadata(page: Metadata): Metadata {
  return {
    ...page,
    openGraph: { ...brandOpenGraph, ...page.openGraph },
    twitter: { ...brandTwitter, ...page.twitter },
  };
}
