import { notFound } from "next/navigation";
import { PageForm } from "@/components/admin/page-form";
import { db } from "@/lib/db";

export default async function EditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const [page, pages] = await Promise.all([
    db.page.findUnique({ where: { id } }),
    db.page.findMany({ orderBy: { title: "asc" } }),
  ]);
  if (!page) notFound();
  return <PageForm page={page} pages={pages} saved={(await searchParams).saved === "1"} />;
}
