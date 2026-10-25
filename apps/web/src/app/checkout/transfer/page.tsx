import { getShopSettings } from "@/lib/settings";
import { TransferDetails } from "@/components/checkout/transfer-details";

/**
 * Server half of the direct-transfer screen: it exists only to read the
 * account details, which the owner edits in /admin/settings.
 *
 * The rest is a Client Component because it reads the order back from
 * sessionStorage and runs copy-to-clipboard — neither of which works on the
 * server. Keeping the fetch here means the details arrive already rendered
 * rather than after a round trip from the browser.
 */
export default async function TransferPage() {
  const settings = await getShopSettings();
  return <TransferDetails settings={settings} />;
}
