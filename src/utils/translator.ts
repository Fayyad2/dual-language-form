export class TranslatorService {
  private static readonly API_KEY = 'XJKHEP4-4BQ4FDY-GP86B39-XXHH845';
  private static readonly API_URL = 'https://api.lecto.ai/v1/translate/text';

  // Main translation function using Lecto AI
  static async translateText(text: string, targetLang: 'ar' | 'en'): Promise<string> {
    if (!text.trim()) return text;

    try {
      const fromLang = targetLang === 'ar' ? 'en' : 'ar';
      const toLang = targetLang;

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'X-API-Key': this.API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          texts: [text],
          to: [toLang],
          from: fromLang
        })
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.translations && data.translations.length > 0) {
        return data.translations[0].text;
      }
      
      throw new Error('No translation returned');
    } catch (error) {
      console.error('Translation error:', error);
      return this.generateFallbackTranslation(text, targetLang);
    }
  }

  // Helper methods for language detection
  static isEnglish(text: string): boolean {
    return /^[a-zA-Z\s]*$/.test(text);
  }

  static isArabic(text: string): boolean {
    return /[\u0600-\u06FF]/.test(text);
  }

  // Fallback translation for when API fails
  static generateFallbackTranslation(text: string, targetLang: 'ar' | 'en'): string {
    if (targetLang === 'ar' && this.isEnglish(text)) {
      return `[AR] ${text}`;
    } else if (targetLang === 'en' && this.isArabic(text)) {
      return `[EN] ${text}`;
    }
    return text;
  }
}