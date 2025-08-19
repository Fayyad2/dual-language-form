import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function FinanceApprovalBar({ status, onApprove, onDecline, onReview, disabled }: {
  status: string;
  onApprove: (transactionNumber: string) => void;
  onDecline: () => void;
  onReview: () => void;
  disabled?: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transactionNumber, setTransactionNumber] = useState("");
  const [error, setError] = useState("");
  const handleApprove = () => {
    if (!transactionNumber.trim()) {
      setError("يرجى إدخال رقم المعاملة");
      return;
    }
    setError("");
    setDialogOpen(false);
    onApprove(transactionNumber);
    setTransactionNumber("");
  };
  return (
    <div className="flex flex-col gap-2 mt-4">
      <div className="flex gap-2 items-center">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              disabled={disabled || status === 'approved'}
              variant="default"
              onClick={() => setDialogOpen(true)}
            >
              Approve
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter Transaction Number (رقم المعاملة)</DialogTitle>
            </DialogHeader>
            <input
              type="text"
              placeholder="رقم المعاملة"
              value={transactionNumber}
              onChange={e => setTransactionNumber(e.target.value)}
              className="border rounded px-2 py-1 text-sm w-full"
              autoFocus
            />
            {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
            <DialogFooter>
              <Button onClick={handleApprove} variant="default">Confirm</Button>
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button
          onClick={onDecline}
          disabled={disabled || status === 'declined'}
          variant="destructive"
        >
          Decline
        </Button>
        <Button
          onClick={onReview}
          disabled={disabled || status === 'review'}
          style={{ background: '#FFD600', color: '#222' }}
        >
          Send for Review
        </Button>
      </div>
    </div>
  );
}
