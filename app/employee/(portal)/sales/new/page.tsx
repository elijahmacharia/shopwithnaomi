import { PosTerminal } from "@/components/pos/pos-terminal";
import { listPosProducts } from "@/services/sales";

export const metadata = { title: "New sale" };

export default async function NewSalePage() {
  const products = await listPosProducts();
  return (
    <div>
      <h1 className="mb-4 font-display text-3xl">New sale</h1>
      <PosTerminal products={products} />
    </div>
  );
}
