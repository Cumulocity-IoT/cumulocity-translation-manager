export interface TranslationEntry {
  [translationKey: string]: string;
}

export interface I18nExtra {
  [code:string]:{ [key:string]:[value:string] }
}