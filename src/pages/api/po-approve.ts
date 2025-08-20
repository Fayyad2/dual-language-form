import { fetchAllPOsFromSupabase, updatePOInSupabase } from "@/utils/poSupabase";

export async function POST(req: Request) {
  try {
    const { id, status, transactionNumber } = await req.json();
    if (!id || !status) return new Response("Missing id or status", { status: 400 });
    // If approving, add transactionNumber to meta
    if (status === 'approved' && transactionNumber) {
      // Fetch current PO meta
      const all = await fetchAllPOsFromSupabase();
      const po = all.find((p: any) => p.id === id);
      let meta: Record<string, any> = {};
      if (po?.meta) {
        try { meta = JSON.parse(po.meta); } catch {}
      }
      meta.transactionNumber = transactionNumber;
      await updatePOInSupabase(id, { status, meta: JSON.stringify(meta) });
    } else {
      await updatePOInSupabase(id, { status });
    }
    await updatePOInSupabase(id, { status });
    return new Response("OK");
  } catch (e) {
    return new Response("Error", { status: 500 });
  }
}
