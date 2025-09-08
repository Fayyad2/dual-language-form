import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";

interface OTPModalProps {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
  accountType: string | null;
  phoneNumber?: string;
}

const OTPModal: React.FC<OTPModalProps> = ({ open, onClose, onVerified, accountType, phoneNumber }) => {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState(phoneNumber || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Autofill phone when modal opens or phoneNumber prop changes
  React.useEffect(() => {
    if (open && phoneNumber) setPhone(phoneNumber);
  }, [open, phoneNumber]);

  const handleSendOTP = async () => {
    setLoading(true);
    setError("");
    try {
      // TODO: Replace with your backend endpoint for sending OTP
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, accountType }),
      });
      if (!res.ok) throw new Error("Failed to send OTP");
      setStep("otp");
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
      // TODO: Replace with your backend endpoint for verifying OTP
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, accountType }),
      });
      if (!res.ok) throw new Error("Invalid OTP");
      onVerified();
      onClose();
    } catch (e: any) {
      setError(e.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-full">
        <DialogHeader>
          <DialogTitle>
            {step === "phone" ? "Enter WhatsApp Number" : "Enter OTP"}
          </DialogTitle>
        </DialogHeader>
        {step === "phone" ? (
          <div className="flex flex-col gap-4 mt-2">
            <input
              type="tel"
              className="input w-full bg-gray-100 cursor-not-allowed"
              value={phone}
              readOnly
              disabled
            />
            <div className="text-xs text-muted-foreground">This number is linked to your account and cannot be changed.</div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <DialogFooter>
              <Button onClick={handleSendOTP} disabled={loading || !phone}>
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mt-2">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              disabled={loading}
              render={({ slots }) => (
                <InputOTPGroup>
                  {slots.map((_, idx) => (
                    <InputOTPSlot key={idx} index={idx} />
                  ))}
                </InputOTPGroup>
              )}
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <DialogFooter>
              <Button onClick={handleVerifyOTP} disabled={loading || otp.length !== 6}>
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OTPModal;
