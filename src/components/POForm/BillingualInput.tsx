import { useState, useEffect } from "react";
import { TranslatorService } from "@/utils/translator";
import { Textarea } from "@/components/ui/textarea";

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

  const handleEnglishChange = async (value: string) => {
    onEnglishChange(value);
    if (value.trim() && value !== arabicValue) {
      setIsTranslating(true);
      try {
        const translated = await TranslatorService.translateText(value, 'ar');
        if (translated !== value) {
          onArabicChange(translated);
        }
      } catch (error) {
        console.error('Translation error:', error);
      } finally {
        setIsTranslating(false);
      }
    } else if (!value.trim()) {
      onArabicChange('');
    }
  };

  const handleArabicChange = async (value: string) => {
    onArabicChange(value);
    if (value.trim() && value !== englishValue) {
      setIsTranslating(true);
      try {
        const translated = await TranslatorService.translateText(value, 'en');
        if (translated !== value) {
          onEnglishChange(translated);
        }
      } catch (error) {
        console.error('Translation error:', error);
      } finally {
        setIsTranslating(false);
      }
    } else if (!value.trim()) {
      onEnglishChange('');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-corporate-gray">{label}</h3>
      
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
          {isTranslating && (
            <div className="text-xs text-muted-foreground mt-1">
              Translating...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};