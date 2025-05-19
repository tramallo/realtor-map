export type AppTranslation = {
    components: {
        layouts: { 
            userMenu: { title: string, logoutButton: string },
        }
        appSettingsPane: { languageSelector: { label: string } }
    }
}

export const supportedLanguages = ["en", "es"] as const;
type SupportedLanguage = typeof supportedLanguages[number];

type TranslationNamespace = {
    // default namespace
    translation: AppTranslation
}

export const translations: Record<SupportedLanguage, TranslationNamespace> = {
    "en": { 
        translation: { 
            components: { 
                layouts: { userMenu: { title: "User menu", logoutButton: "Logout" }},
                appSettingsPane: { languageSelector: { label: "Language" } }
            }
        }
    },
    "es": {
        translation: {
            components: { 
                layouts: { userMenu: { title: "Menu de usuario", logoutButton: "Cerrar sesion" }},
                appSettingsPane: { languageSelector: { label: "Idioma" } }
            }
        }
    }
} satisfies Record<SupportedLanguage, TranslationNamespace>
