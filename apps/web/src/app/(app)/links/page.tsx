import { LinkManager } from "@/features/links/components/link-manager";
import { getLinks } from "@/features/links/services/links.server";
export default async function LinksPage() {
  return <LinkManager initialLinks={await getLinks()} />;
}
