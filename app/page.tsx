import { OfficesPageClient } from "@/components/offices/offices-page-client";
import { getInventoryData } from "@/lib/inventory-data";

/**
 * Server component wrapper that awaits params/searchParams (Next.js 16 async APIs)
 * so the client tree never receives the raw Promise that devtools enumerate.
 * See: https://nextjs.org/docs/messages/sync-dynamic-apis
 */
export default async function Page({
  params,
  searchParams,
}: {
  params?: Promise<Record<string, string | string[]>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (params) await params;
  if (searchParams) await searchParams;
  const inventoryData = await getInventoryData();
  return <OfficesPageClient inventoryData={inventoryData} />;
}
