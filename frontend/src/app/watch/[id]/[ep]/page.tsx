import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string; ep: string }>;
}

export default async function WatchEpRedirect({ params }: PageProps) {
  const { id } = await params;
  redirect(`/watch/${id}`);
}
