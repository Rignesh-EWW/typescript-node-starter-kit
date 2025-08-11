import i18next from "i18next";
import en from "@/locales/en.json";
import ar from "@/locales/ar.json";

export async function loadLocales(lang = "en") {
  if (!i18next.isInitialized) {
    await i18next.init({
      lng: lang, // dynamic language
      fallbackLng: "en",
      resources: {
        en: { translation: en },
        ar: { translation: ar },
      },
    });
  } else {
    await i18next.changeLanguage(lang);
  }
  return i18next;
}
