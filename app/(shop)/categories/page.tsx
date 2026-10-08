import Link from "next/link";
import { listCategories } from "@/services/catalog";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await listCategories();
  return (
    <div>
      <h1 className="font-display text-3xl">Categories</h1>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <li key={category.id}>
            <Link href={`/shop?category=${category.slug}`} className="block min-h-24 rounded-md border border-brand-soft bg-white p-4">
              <span className="font-display text-xl">{category.name}</span>
              {category.description && <span className="mt-1 block text-sm text-brand-muted">{category.description}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
