import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function StudentDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch student's leads
  const { data: leads } = await supabase
    .from("leads")
    .select("*, categories(name, icon)")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  const { data: userData } = await supabase
    .from("users")
    .select("name")
    .eq("id", user.id)
    .single();
  const studentName = (userData as { name?: string } | null)?.name ?? "Student";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-[#1A56DB]">Topskilly</span>
        <span className="text-sm text-gray-600">
          Welcome, {studentName}
        </span>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Leads</h1>
          <Link
            href="/post-lead"
            className="bg-[#1A56DB] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#1547C0] transition"
          >
            + Post a Lead
          </Link>
        </div>

        {!leads || leads.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border">
            <p className="text-gray-500 mb-4">You haven&apos;t posted any leads yet.</p>
            <Link
              href="/post-lead"
              className="inline-block bg-[#1A56DB] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#1547C0] transition"
            >
              Post your first lead
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead: any) => (
              <div
                key={lead.id}
                className="bg-white rounded-xl border p-5 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{lead.categories?.icon}</span>
                    <span className="font-semibold text-gray-900">{lead.subject}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        lead.active
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {lead.active ? "Active" : "Pending OTP"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate max-w-md">
                    {lead.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(lead.created_at).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#1A56DB]">
                    {lead.buyer_count}
                  </p>
                  <p className="text-xs text-gray-500">
                    of {lead.max_buyers} pros unlocked
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
