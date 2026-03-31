import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b">
        <span className="text-2xl font-bold text-[#1A56DB]">Topskilly</span>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-[#1A56DB] text-white px-4 py-2 rounded-lg hover:bg-[#1547C0]"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Top skills.{" "}
          <span className="text-[#1A56DB]">Verified leads.</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Post your skill request. Verified professionals pay to unlock your
          contact. No spam. No fake leads. Guaranteed authentic.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup?role=student"
            className="bg-[#1A56DB] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#1547C0] transition"
          >
            Post a Lead — Free
          </Link>
          <Link
            href="/signup?role=professional"
            className="border border-[#1A56DB] text-[#1A56DB] px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition"
          >
            Find Clients as a Pro
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            How Topskilly works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Client posts a lead",
                desc: "Describe what you need. Verify with OTP — no fake leads possible.",
              },
              {
                step: "2",
                title: "Professionals browse",
                desc: "Verified pros filter leads by subject, level, and urgency.",
              },
              {
                step: "3",
                title: "Unlock & connect",
                desc: "Spend coins to reveal contact details. Connect directly — no middleman.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-[#1A56DB] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
