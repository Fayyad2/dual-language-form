// Simple translation service - in production, use Google Translate API or similar
export class TranslatorService {
  private static translations: { [key: string]: string } = {
    // Common HR Payment Order translations
    'advance': 'سلفة',
    'salary': 'راتب',
    'employee': 'موظف',
    'deducted': 'خصم',
    'amount': 'مبلغ',
    'payment': 'دفع',
    'bank transfer': 'تحويل بنكي',
    'three days': 'ثلاثة أيام',
    'three thousand riyals': 'ثلاثة آلاف ريال',
    'will be deducted from his salary': 'سيتم خصمها من راتبه',
    'files attached': 'مرفقات مرفقة',
    
    // Reverse translations
    'سلفة': 'advance',
    'راتب': 'salary', 
    'موظف': 'employee',
    'خصم': 'deducted',
    'مبلغ': 'amount',
    'دفع': 'payment',
    'تحويل بنكي': 'bank transfer',
    'ثلاثة أيام': 'three days',
    'ثلاثة آلاف ريال': 'three thousand riyals',
    'سيتم خصمها من راتبه': 'will be deducted from his salary',
    'مرفقات مرفقة': 'files attached'
  };

  static async translateText(text: string, targetLang: 'ar' | 'en'): Promise<string> {
    if (!text.trim()) return '';
    
    const lowerText = text.toLowerCase().trim();
    
    // Check for exact matches first
    if (this.translations[lowerText]) {
      return this.translations[lowerText];
    }
    
    // Check for partial matches and replace
    let result = text;
    Object.entries(this.translations).forEach(([source, target]) => {
      if (targetLang === 'ar' && this.isEnglish(source)) {
        result = result.replace(new RegExp(source, 'gi'), target);
      } else if (targetLang === 'en' && this.isArabic(source)) {
        result = result.replace(new RegExp(source, 'g'), target);
      }
    });
    
    return result === text ? this.generateSimpleTranslation(text, targetLang) : result;
  }

  private static isEnglish(text: string): boolean {
    return /^[a-zA-Z\s]+$/.test(text);
  }

  private static isArabic(text: string): boolean {
    return /[\u0600-\u06FF]/.test(text);
  }

  private static generateSimpleTranslation(text: string, targetLang: 'ar' | 'en'): string {
    // Simple fallback - in production, use actual translation API
    if (targetLang === 'ar' && this.isEnglish(text)) {
      return `[AR] ${text}`;
    } else if (targetLang === 'en' && this.isArabic(text)) {
      return `[EN] ${text}`;
    }
    return text;
  }
}