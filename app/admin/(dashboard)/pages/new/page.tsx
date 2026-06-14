import { PageForm } from "@/components/admin/page-form";
import { db } from "@/lib/db";

export default async function NewPage() {
  const pages = await db.page.findMany({ orderBy: { title: "asc" } });
  return <PageForm pages={pages} />;
}
