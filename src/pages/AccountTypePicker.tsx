import React from "react";
import { Button } from "@/components/ui/button";

export type AccountType = "hr" | "finance";

export default function AccountTypePicker({ onPick }: { onPick: (type: AccountType) => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="bg-white p-8 rounded shadow-md w-80 flex flex-col gap-6">
        <h2 className="text-xl font-bold text-center">Choose your account type</h2>
        <Button onClick={() => onPick("hr")}>HR (Create & Manage POs)</Button>
        <Button onClick={() => onPick("finance")}>Finance (View & Approve/Decline POs)</Button>
      </div>
    </div>
  );
}
