import { withBrandMetadata } from "@/lib/brand-metadata";
import DesignPage from "@/components/pages/Home";

export const metadata = withBrandMetadata({
  title: "Book a free call | Yara Labs",
  description: "Book a free 30-minute discovery call with Yara Labs about automation, AI, CRMs or custom apps.",
  alternates: { canonical: "/book" },
  openGraph: {
    title: "Book a free call | Yara Labs",
    description: "Tell us about your business and choose a time for your free 30-minute call.",
    url: "/book",
  },
});

export default function Page() { return <DesignPage />; }
