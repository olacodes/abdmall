import type { Metadata } from "next";
import { CategoryForm } from "@/components/admin/category-form";

export const metadata: Metadata = { title: "New category" };

export default function NewCategoryPage() {
  return (
    <div className="max-w-2xl space-y-5">
      <h2 className="font-display text-2xl text-ink">New category</h2>
      <CategoryForm category={null} />
    </div>
  );
}
