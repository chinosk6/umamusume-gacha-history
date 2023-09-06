import schinese from "../assets/i18n/schinese.json"
import english from "../assets/i18n/english.json"

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
            return english[id as keyof typeof schinese] || id;
        default: {
            return id;
        }
    }
}
