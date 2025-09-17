import React, { useState } from "react";
// ...removed custom OTP input...
import { Button } from "@/components/ui/button";

interface OTPVerificationPageProps {
  userName: string;
  phoneNumber: string;
  onVerified: () => void;
  onCancel: () => void;
}

const OTPVerificationPage: React.FC<OTPVerificationPageProps> = ({ userName, phoneNumber, onVerified, onCancel }) => {
  const [otp, setOtp] = useState(""); // Start with empty string for OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleSendOTP = async () => {
    if (!phoneNumber) {
      setError("No phone number available for this account. Please contact admin.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient: phoneNumber, channel: "sms" }),
      });
      if (!res.ok) throw new Error("Failed to send OTP");
      const data = await res.json();
      setSessionId(data.session_id || data.sessionId || null);
      setSent(true);
    } catch (e: any) {
      setError(e.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient: phoneNumber, otp: otp.trim() }), // Remove session_id, match backend
      });
      const data = await res.json();
      if (!res.ok || data.status === false || data.success === false || data.verified === false) {
        throw new Error(data.error?.message || data.error || "Invalid OTP");
      }
      onVerified();
    } catch (e: any) {
      setError(e.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    handleSendOTP();
    // eslint-disable-next-line
  }, [phoneNumber]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-2">OTP Verification</h2>
        <div className="mb-4 text-center">
          <div className="text-lg font-semibold">{userName}</div>
          <div className="text-gray-500">{phoneNumber}</div>
        </div>
        <div className="w-full flex flex-col items-center mb-4">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            className="border border-gray-300 rounded px-3 py-2 text-lg w-full text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            disabled={loading}
            autoFocus
          />
        </div>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <Button className="w-full mb-2" onClick={handleVerifyOTP} disabled={loading || otp.length !== 6}>
          {loading ? "Verifying..." : "Verify OTP"}
        </Button>
        <Button className="w-full" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <div className="mt-4 text-xs text-gray-500">
          Didn't receive the code?{' '}
          <button className="underline text-blue-600" onClick={handleSendOTP} disabled={loading}>
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;