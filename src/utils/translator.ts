export class TranslatorService {
  // MyMemory API - completely free, no API key required
  private static readonly API_URL = 'https://api.mymemory.translated.net/get';

  // Main translation function using MyMemory API (free, no API key needed)
  static async translateText(text: string, targetLang: 'ar' | 'en'): Promise<string> {
    if (!text.trim()) return text;

    try {
      const sourceLang = targetLang === 'ar' ? 'en' : 'ar';
      
      // Build the URL with parameters
      const url = new URL(this.API_URL);
      url.searchParams.append('q', text);
      url.searchParams.append('langpair', `${sourceLang}|${targetLang}`);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        return data.responseData.translatedText;
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