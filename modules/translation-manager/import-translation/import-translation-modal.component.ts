import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { TranslationJSON } from './translation-json.model';
import { AlertService, DroppedFile, ModalLabels } from '@c8y/ngx-components';
import { isEmpty } from 'lodash';
import { JSONImportHelperService } from './json-import-helper.service';
import { TranslationEntry } from '../translation-directory.model';

@Component({
  templateUrl: './import-translation-modal.component.html',
  providers: [JSONImportHelperService],
})
export class ImportTranslationModalComponent {
  closeSubject: Subject<TranslationEntry[]> = new Subject();
  labels: ModalLabels = { ok: 'Import', cancel: 'Cancel' };
  languageCodes: string[];
  isLoading = false;
  files: FileList;
  json: { [key: string]: string };
  langCode: string;

  constructor(private alert: AlertService, private importHelper: JSONImportHelperService) {}

  // called if cancel is pressed
  onDismiss(): void {
    this.closeSubject.next(null);
  }

  // called if save is pressed
  onClose(): void {
    const entries = this.importHelper.toLangCodeFormat(this.json, this.langCode);
    this.closeSubject.next(entries);
  }

  uploadFile(droppedFiles: DroppedFile[]): Promise<void> {
    this.isLoading = true;
    if (droppedFiles.length > 1) {
      this.alert.danger('Only single file import is allowed.');
      return;
    }
    const [file] = droppedFiles;
    this.parseFile(file)
      .then((json) => (this.json = this.importHelper.flatten(json)))
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      .catch((error) => this.alert.danger(error))
      .finally(() => (this.isLoading = false));
  }

  private async parseFile(file: DroppedFile) {
    const translationJSON = (await file.readAsJson()) as TranslationJSON;

    if (!translationJSON) {
      throw new Error('Could not read file');
    }
    if (isEmpty(translationJSON)) {
      throw new Error('Expected name property in json');
    }

    const fileName = file.file.name;
    this.langCode = this.languageCodes.find((code) => fileName.includes(code));

    return translationJSON;
  }
}
