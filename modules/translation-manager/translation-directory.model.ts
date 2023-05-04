import { Row } from '@c8y/ngx-components';

export interface TranslationEntry extends Row {
  [translationKey: string]: string;
}

export interface I18nExtra {
  [code: string]: { [key: string]: [value: string] };
}
