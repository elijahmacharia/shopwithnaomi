import Link from "next/link";
import { DatabaseSetup } from "@/components/database-setup";
import { readStorefront } from "@/lib/read-storefront";
import { listCategories } from "@/services/catalog";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const result = await readStorefront(() => listCategories());
  if (!result.ok) {
    return <DatabaseSetup problem={result.problem} />;
  }
  const categories = result.data;
  return (
    <div>
      <p className="text-sm text-brand-muted">Home / Categories</p>
      <h1 className="mt-1 font-display text-4xl">Categories</h1>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <li key={category.id}>
            <Link href={`/shop?category=${category.slug}`} className="flex min-h-28 flex-col justify-end rounded-2xl border border-brand-soft bg-white p-5">
              <span className="font-display text-2xl">{category.name}</span>
              {category.description && <span className="mt-1 block text-sm text-brand-muted">{category.description}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
