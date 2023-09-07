import schinese from "../assets/i18n/schinese.json"
import tchinese from "../assets/i18n/tchinese.json"
import english from "../assets/i18n/english.json"

export enum LanguageTypes {
    SChinese = 0,
    TChinese = 2,
    English = 1,
}

export function i18nText(id: string, langId: LanguageTypes) {
    switch (langId) {
        case LanguageTypes.SChinese: {
            return schinese[id as keyof typeof schinese] || id;
        }
        case LanguageTypes.TChinese: {
            return tchinese[id as keyof typeof tchinese] || id;
        }
        case LanguageTypes.English:
            return english[id as keyof typeof english] || id;
        default: {
            return id;
        }
    }
}
