import { Injectable } from '@angular/core';
import { get, isEmpty, set } from 'lodash';
import { TranslationJSON } from './translation-json.model';
import { TranslationEntry } from '../translation-directory.model';

@Injectable()
export class JSONImportHelperService {
  flatten(json: TranslationJSON): { [key: string]: string } {
    const flattened: { [key: string]: string } = {};
    this.traverse(json, flattened);
    return flattened;
  }

  traverse(json: TranslationJSON, result: { [key: string]: string }, path?: string) {
    const keys = Object.keys(json);
    for (const key of keys) {
      if (isEmpty(key)) {
        continue;
      }
      const element = get(json, key);
      const p = path ? path + '.' + key : key;
      if (typeof element === 'string') {
        result[p] = element;
      } else if (typeof element === 'object') {
        this.traverse(element, result, p);
      }
    }
  }

  toLangCodeFormat(json: { [key: string]: string }, langCode: string): TranslationEntry[] {
    const keys = Object.keys(json);
    return keys.map((key) => {
      const mapping = { id: key, translationKey: key };
      set(mapping, langCode, get(json, key));
      return mapping;
    });
  }
}
