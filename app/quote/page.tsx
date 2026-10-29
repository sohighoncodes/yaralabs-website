import { withBrandMetadata } from "@/lib/brand-metadata";
import DesignPage from "@/components/pages/Home";

export const metadata = withBrandMetadata({
  title: "Get a quote | Yara Labs",
  description: "Tell us what you need to build, connect or improve. Get a custom project quote from Yara Labs.",
  alternates: { canonical: "/quote" },
  openGraph: {
    title: "Get a quote | Yara Labs",
    description: "Tell us about your project, then choose a time to talk it through.",
    url: "/quote",
  },
});

export default function Page() { return <DesignPage />; }
