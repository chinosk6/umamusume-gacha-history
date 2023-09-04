import schinese from "../assets/i18n/schinese.json"

export enum LanguageTypes {
    SChinese,
    English
}

export function i18nText(id: string, langId: LanguageTypes) {
    switch (langId) {
        case LanguageTypes.SChinese: {
            return schinese[id as keyof typeof schinese] || id;
        }
        case LanguageTypes.English:
        default: {
            return id;
        }
    }
}
