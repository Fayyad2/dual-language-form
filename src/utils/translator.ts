// Enhanced translation service with better coverage
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
    'riyal': 'ريال',
    'riyals': 'ريال',
    'thousand': 'ألف',
    'will be': 'سيتم',
    'from': 'من',
    'his': 'له',
    'her': 'لها',
    'name': 'اسم',
    'method': 'طريقة',
    'type': 'نوع',
    'time': 'وقت',
    'deliver': 'تسليم',
    'days': 'أيام',
    'beneficiary': 'المستفيد',
    
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
    'مرفقات مرفقة': 'files attached',
    'ريال': 'riyal',
    'ألف': 'thousand',
    'سيتم': 'will be',
    'من': 'from',
    'له': 'his',
    'لها': 'her',
    'اسم': 'name',
    'طريقة': 'method',
    'نوع': 'type',
    'وقت': 'time',
    'تسليم': 'deliver',
    'أيام': 'days',
    'المستفيد': 'beneficiary'
  };

  static async translateText(text: string, targetLang: 'ar' | 'en'): Promise<string> {
    if (!text.trim()) return '';
    
    const originalText = text.trim();
    const lowerText = originalText.toLowerCase();
    
    // Check for exact matches first (case insensitive for source)
    const exactMatch = Object.entries(this.translations).find(([source, target]) => 
      source.toLowerCase() === lowerText
    );
    if (exactMatch) {
      return exactMatch[1];
    }
    
    // Check for partial matches and replace
    let result = originalText;
    const sortedTranslations = Object.entries(this.translations)
      .sort(([a], [b]) => b.length - a.length); // Longer phrases first
    
    sortedTranslations.forEach(([source, target]) => {
      if (targetLang === 'ar' && this.isEnglish(source)) {
        const regex = new RegExp(`\\b${source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        result = result.replace(regex, target);
      } else if (targetLang === 'en' && this.isArabic(source)) {
        result = result.replace(new RegExp(source, 'g'), target);
      }
    });
    
    return result === originalText ? this.generateSimpleTranslation(originalText, targetLang) : result;
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