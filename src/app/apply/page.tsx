import { redirect } from "next/navigation";

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  redirect(ref ? `/questionnaire?ref=${ref}` : "/questionnaire");
}
