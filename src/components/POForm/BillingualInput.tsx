import { useState, useEffect } from "react";
import { TranslatorService } from "@/utils/translator";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

interface BilingualInputProps {
  englishValue: string;
  arabicValue: string;
  onEnglishChange: (value: string) => void;
  onArabicChange: (value: string) => void;
  label: string;
  placeholder?: string;
}

export const BilingualInput = ({
  englishValue,
  arabicValue,
  onEnglishChange,
  onArabicChange,
  label,
  placeholder = ""
}: BilingualInputProps) => {
  const [isTranslating, setIsTranslating] = useState(false);

  const handleEnglishChange = (value: string) => {
    onEnglishChange(value);
  };

  const handleArabicChange = (value: string) => {
    onArabicChange(value);
  };

  const handleTranslate = async () => {
    if (englishValue.trim() && !arabicValue.trim()) {
      setIsTranslating(true);
      try {
        const translated = await TranslatorService.translateText(englishValue, 'ar');
        onArabicChange(translated);
      } catch (error) {
        console.error('Translation error:', error);
      } finally {
        setIsTranslating(false);
      }
    } else if (arabicValue.trim() && !englishValue.trim()) {
      setIsTranslating(true);
      try {
        const translated = await TranslatorService.translateText(arabicValue, 'en');
        onEnglishChange(translated);
      } catch (error) {
        console.error('Translation error:', error);
      } finally {
        setIsTranslating(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-corporate-gray">{label}</h3>
        <Button
          onClick={handleTranslate}
          variant="outline"
          size="sm"
          className="print:hidden flex items-center gap-2"
          disabled={isTranslating || (!englishValue.trim() && !arabicValue.trim())}
        >
          <Languages className="h-4 w-4" />
          {isTranslating ? "Translating..." : "Translate"}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* English Input */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">
            English
          </label>
          <Textarea
            value={englishValue}
            onChange={(e) => handleEnglishChange(e.target.value)}
            placeholder={`${placeholder} (English)`}
            className="min-h-[100px] text-left"
            dir="ltr"
          />
        </div>

        {/* Arabic Input */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">
            العربية
          </label>
          <Textarea
            value={arabicValue}
            onChange={(e) => handleArabicChange(e.target.value)}
            placeholder={`${placeholder} (Arabic)`}
            className="min-h-[100px] text-right"
            dir="rtl"
          />
        </div>
      </div>
    </div>
  );
};