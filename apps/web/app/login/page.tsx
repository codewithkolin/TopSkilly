"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type Mode = "email" | "phone";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"input" | "otp">("input");
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) return toast.error(error.message);
    setStep("otp");
    toast.success("Check your email for a magic link");
  }

  async function handlePhoneSend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: phone.startsWith("+") ? phone : `+91${phone}`,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    setStep("otp");
    toast.success("OTP sent to your phone");
  }

  async function handleOtpVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phone.startsWith("+") ? phone : `+91${phone}`,
      token: otp,
      type: "sms",
    });
    setLoading(false);
    if (error) return toast.error(error.message);

    // Check user role and redirect
    if (data.user) {
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (!userData) {
        router.push("/onboarding");
      } else if (userData.role === "professional") {
        router.push("/dashboard/pro");
      } else {
        router.push("/dashboard/student");
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1A56DB]">Topskilly</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-lg border mb-6 overflow-hidden">
          <button
            onClick={() => setMode("email")}
            className={`flex-1 py-2 text-sm font-medium transition ${
              mode === "email"
                ? "bg-[#1A56DB] text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Email
          </button>
          <button
            onClick={() => setMode("phone")}
            className={`flex-1 py-2 text-sm font-medium transition ${
              mode === "phone"
                ? "bg-[#1A56DB] text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Phone OTP
          </button>
        </div>

        {mode === "email" && step === "input" && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1A56DB]"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A56DB] text-white py-2.5 rounded-lg font-medium hover:bg-[#1547C0] disabled:opacity-60 transition"
            >
              {loading ? "Sending…" : "Send Magic Link"}
            </button>
          </form>
        )}

        {mode === "phone" && step === "input" && (
          <form onSubmit={handlePhoneSend} className="space-y-4">
            <div className="flex gap-2">
              <span className="border rounded-lg px-3 py-2.5 text-sm text-gray-500 bg-gray-50">
                +91
              </span>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                maxLength={10}
                className="flex-1 border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1A56DB]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A56DB] text-white py-2.5 rounded-lg font-medium hover:bg-[#1547C0] disabled:opacity-60 transition"
            >
              {loading ? "Sending OTP…" : "Send OTP"}
            </button>
          </form>
        )}

        {step === "otp" && mode === "phone" && (
          <form onSubmit={handleOtpVerify} className="space-y-4">
            <p className="text-sm text-gray-500 text-center">
              Enter the 6-digit OTP sent to {phone}
            </p>
            <input
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              className="w-full border rounded-lg px-4 py-2.5 text-sm text-center tracking-widest outline-none focus:ring-2 focus:ring-[#1A56DB]"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A56DB] text-white py-2.5 rounded-lg font-medium hover:bg-[#1547C0] disabled:opacity-60 transition"
            >
              {loading ? "Verifying…" : "Verify OTP"}
            </button>
            <button
              type="button"
              onClick={() => setStep("input")}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          No account?{" "}
          <Link href="/signup" className="text-[#1A56DB] font-medium hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
