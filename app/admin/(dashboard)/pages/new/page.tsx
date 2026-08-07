import { PageForm } from "@/components/admin/page-form";
import { db } from "@/lib/db";

export default async function NewPage() {
  const pages = (await db.page.findMany({
    select: { id: true, title: true, parentId: true },
    orderBy: { title: "asc" },
  })) as any[];
  return <PageForm pages={pages} />;
}
