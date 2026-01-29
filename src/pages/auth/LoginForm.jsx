// src/features/auth/LoginForm.jsx
import { useMemo, useState } from "react";
import { Input, Button, Card } from "../../components/ui";
import { FiPhone, FiArrowLeft } from "react-icons/fi";
import useAuthStore from "../../store/authStore";

export default function LoginForm({ onSwitch, onSuccess }) {
  const { sendOtp, verifyOtp, loading, error } = useAuthStore();

  const [step, setStep] = useState("MOBILE"); // MOBILE | OTP
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState(null);

  const canSendOtp = useMemo(() => mobile.trim().length >= 8, [mobile]);
  const canVerify = useMemo(() => otp.trim().length === 6, [otp]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const res = await sendOtp({ name: "User", mobile }); // name not required for login, backend accepts it
    setDevOtp(res?.otp || null); // backend returns mock otp right now
    setStep("OTP");
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    await verifyOtp({ mobile, otp, name: "User" });
    onSuccess?.();
  };

  return (
    <Card className="border-none shadow-xl bg-white/80 backdrop-blur overflow-hidden">
      <div className="relative">
        {/* STEP 1: MOBILE */}
        <div
          className={[
            "transition-all duration-300",
            step === "MOBILE"
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-6 pointer-events-none absolute inset-0",
          ].join(" ")}
        >
          <form onSubmit={handleSendOtp} className="grid gap-4">
            <Input
              label="Mobile Number"
              placeholder="Enter your mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              leftIcon={<FiPhone />}
              required
            />

            {error && (
              <p className="text-sm text-red-600">
                {typeof error === "string" ? error : error?.message || "Failed"}
              </p>
            )}

            <Button
              type="submit"
              disabled={!canSendOtp}
              loading={loading}
              className="mt-2 bg-orange-500 hover:bg-orange-600"
              withArrow
            >
              Send OTP
            </Button>

            <div className="text-xs text-center text-slate-600">
              New here?{" "}
              <button
                type="button"
                onClick={onSwitch}
                className="font-semibold text-orange-600 hover:text-orange-700"
              >
                Create account
              </button>
            </div>
          </form>
        </div>

        {/* STEP 2: OTP */}
        <div
          className={[
            "transition-all duration-300",
            step === "OTP"
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-6 pointer-events-none absolute inset-0",
          ].join(" ")}
        >
          <form onSubmit={handleVerify} className="grid gap-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep("MOBILE")}
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                <FiArrowLeft /> Change number
              </button>
              <span className="text-xs text-slate-600">
                OTP sent to <b>{mobile}</b>
              </span>
            </div>

            <Input
              label="Enter OTP"
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
            />

            {/* Dev helper (since backend is mock OTP=123456) */}
            {devOtp && (
              <div className="rounded-xl bg-sky-50 border border-sky-100 px-3 py-2 text-xs text-slate-700">
                Dev OTP: <b>{devOtp}</b>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600">
                {typeof error === "string" ? error : error?.message || "Failed"}
              </p>
            )}

            <Button
              type="submit"
              disabled={!canVerify}
              loading={loading}
              className="mt-2 bg-orange-500 hover:bg-orange-600"
              withArrow
            >
              Verify & Login
            </Button>

            <button
              type="button"
              onClick={handleSendOtp}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              disabled={!canSendOtp || loading}
            >
              Resend OTP
            </button>
          </form>
        </div>
      </div>
    </Card>
  );
}
