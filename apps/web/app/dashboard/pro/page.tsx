import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch wallet balance
  const { data: wallet } = await supabase
    .from("wallets")
    .select("coins_balance")
    .eq("user_id", user.id)
    .single();

  // Fetch active leads (available to unlock)
  const { data: leads } = await supabase
    .from("leads")
    .select("*, categories(name, icon)")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(20);

  // Fetch already unlocked lead IDs for this user
  const { data: unlocked } = await supabase
    .from("lead_unlocks")
    .select("lead_id")
    .eq("tutor_id", user.id);

  const unlockedIds = new Set(unlocked?.map((u: any) => u.lead_id));
  const coinsBalance = (wallet as { coins_balance?: number } | null)?.coins_balance ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-[#1A56DB]">Topskilly</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-blue-50 text-[#1A56DB] px-3 py-1.5 rounded-lg">
            <span className="text-sm font-semibold">
              {coinsBalance} coins
            </span>
          </div>
          <Link
            href="/wallet"
            className="text-sm text-[#1A56DB] font-medium hover:underline"
          >
            Buy coins
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Browse Leads</h1>

        {!leads || leads.length === 0 ? (
          <p className="text-center text-gray-500 py-20">No active leads right now. Check back soon.</p>
        ) : (
          <div className="space-y-4">
            {leads.map((lead: any) => {
              const isUnlocked = unlockedIds.has(lead.id);
              const isFull = lead.buyer_count >= lead.max_buyers;

              return (
                <div
                  key={lead.id}
                  className="bg-white rounded-xl border p-5 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{lead.categories?.icon}</span>
                      <span className="font-semibold text-gray-900">{lead.subject}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          lead.urgency === "urgent"
                            ? "bg-red-100 text-red-700"
                            : lead.urgency === "high"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {lead.urgency}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {lead.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {lead.buyer_count}/{lead.max_buyers} pros unlocked
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    {isUnlocked ? (
                      <Link
                        href={`/leads/${lead.id}`}
                        className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1.5 rounded-lg"
                      >
                        View contact
                      </Link>
                    ) : isFull ? (
                      <span className="text-sm text-gray-400">Sold out</span>
                    ) : (
                      <Link
                        href={`/leads/${lead.id}`}
                        className="bg-[#1A56DB] text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-[#1547C0] transition"
                      >
                        Unlock · 200 coins
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
