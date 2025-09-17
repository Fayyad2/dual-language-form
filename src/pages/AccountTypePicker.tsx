import React from "react";
import { Button } from "@/components/ui/button";

export type AccountType = "hr" | "finance" | "ceo" | "project_manager" | "engineers" | "project_management";

import { useState } from "react";

export default function AccountTypePicker({ onPick }: { onPick: (type: AccountType) => void }) {
  const [hrStep, setHrStep] = useState(false);

  // Save HR name to localStorage when picked
  const pickHR = (name: string) => {
    localStorage.setItem('hrName', name);
    onPick("hr");
  };

  // CEO selection
  const pickCEO = (name: string) => {
    localStorage.setItem('ceoName', name);
    onPick("ceo");
  };

  // Project Manager selection
  const pickProjectManager = (name: string) => {
    localStorage.setItem('projectManagerName', name);
    onPick("project_manager");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="bg-white p-8 rounded shadow-md w-80 flex flex-col gap-6">
        <h2 className="text-xl font-bold text-center">
          {hrStep ? "Choose your HR account" : "Choose your account type"}
        </h2>
        {!hrStep ? (
          <>
            <Button onClick={() => setHrStep(true)}>HR (Create & Manage POs)</Button>
            <Button onClick={() => onPick("finance")}>Finance (View & Approve/Decline POs)</Button>
            <Button onClick={() => pickCEO("E.khatib")}>CEO: E.khatib</Button>
            <Button onClick={() => pickProjectManager("Imad Abdel Halim")}>Project Manager: Imad Abdel Halim</Button>
          </>
        ) : (
          <>
            <Button onClick={() => pickHR("Fayad Adel")}>HR: Fayad Adel</Button>
            <Button onClick={() => pickHR("Mohammed Ayed")}>HR: Mohammed Ayed</Button>
            <Button onClick={() => pickHR("Sultan Ibrahim")}>HR Manager: Sultan Ibrahim</Button>
            <Button variant="ghost" onClick={() => setHrStep(false)}>Back</Button>
          </>
        )}
      </div>
    </div>
  );
}
