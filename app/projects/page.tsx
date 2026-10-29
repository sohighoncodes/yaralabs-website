import { withBrandMetadata } from "@/lib/brand-metadata";
import DesignPage from "@/components/pages/Projects";
export const metadata = withBrandMetadata({"title":"Our Projects | Yara Labs","description":"Explore the systems we built for Colliers Catering, US Medical Directors and Inka Arthouse.","alternates":{"canonical":"/projects"},"openGraph":{"title":"Our Projects | Yara Labs","description":"Explore the systems we built for Colliers Catering, US Medical Directors and Inka Arthouse.","url":"/projects"}});
export default function Page() { return <DesignPage />; }
