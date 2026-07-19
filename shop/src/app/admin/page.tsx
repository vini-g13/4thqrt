import { requireAdmin } from "@/lib/admin";
import InventoryManager, { type AdminProduct } from "./InventoryManager";

export default async function AdminPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("products")
    .select("id, slug, name_nl, name_en, is_published, product_variants(id, sku, size, color, price_cents, available_quantity, target_quantity, is_active)")
    .order("created_at", { ascending: false });

  return <InventoryManager products={(data ?? []) as unknown as AdminProduct[]} />;
}
