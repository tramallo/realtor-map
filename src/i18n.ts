import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { AppTranslation, supportedLanguages, translations } from "./translations";

declare module 'i18next' {
    interface CustomTypeOptions {
      resources: {
        translation: AppTranslation;
      };
    }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init<AppTranslation>({
    resources: translations,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    supportedLngs: supportedLanguages,
    nonExplicitSupportedLngs: true,
  });

export default i18n;