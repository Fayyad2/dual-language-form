import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const OPTIONS_KEY = "locationOptions";

export const OptionsTab = () => {
  const [options, setOptions] = useState<{ en: string; ar: string }[]>([]);
  const [newEn, setNewEn] = useState("");
  const [newAr, setNewAr] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(OPTIONS_KEY);
    if (saved) {
      setOptions(JSON.parse(saved));
    } else {
      setOptions([
        { en: "MAINTENANCE DEPARTMENT", ar: "قسم الصيانة" },
        { en: "PROJECTS DEPARTMENT", ar: "قسم المشاريع" },
        { en: "HR DEPARTMENT", ar: "قسم الموارد البشرية" },
        { en: "FINANCE DEPARTMENT", ar: "قسم المالية" },
        { en: "OTHER", ar: "قسم آخر" },
      ]);
    }
  }, []);

  const handleAdd = () => {
    if (newEn.trim() && newAr.trim()) {
      const updated = [...options, { en: newEn.trim(), ar: newAr.trim() }];
      setOptions(updated);
      localStorage.setItem(OPTIONS_KEY, JSON.stringify(updated));
      setNewEn("");
      setNewAr("");
    }
  };

  const handleDelete = (idx: number) => {
    const updated = options.filter((_, i) => i !== idx);
    setOptions(updated);
    localStorage.setItem(OPTIONS_KEY, JSON.stringify(updated));
  };

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
      <div className="flex gap-2">
        <input
          type="text"
          className="border rounded px-2 py-1 w-1/2"
          placeholder="Location (English)"
          value={newEn}
          onChange={e => setNewEn(e.target.value)}
        />
        <input
          type="text"
          className="border rounded px-2 py-1 w-1/2"
          placeholder="الموقع (بالعربية)"
          value={newAr}
          onChange={e => setNewAr(e.target.value)}
        />
        <Button onClick={handleAdd}>Add</Button>
      </div>
      <ul className="space-y-2">
        {options.map((opt, idx) => (
          <li key={idx} className="flex items-center justify-between border rounded px-2 py-1">
            <span>{opt.en} / <span dir="rtl">{opt.ar}</span></span>
            <Button variant="destructive" size="sm" onClick={() => handleDelete(idx)}>Delete</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
