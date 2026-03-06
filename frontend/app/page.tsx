// app/page.tsx
async function getPages() {
  const res = await fetch("http://localhost:1337/api/pages", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch pages");

  const json = await res.json();
  return json.data || [];
}

export default async function Home() {
  const pages = await getPages();

  return (
    <main className="max-w-4xl mx-auto py-20">
      {pages.length === 0 && <p>No pages found.</p>}

      {pages.map((page: any) => (
        <div key={page.id} className="mb-10">
          <h1 className="text-4xl font-bold">{page.Title}</h1>
          <p className="mt-4 text-gray-600">{page.content}</p>
        </div>
      ))}
    </main>
  );
}
