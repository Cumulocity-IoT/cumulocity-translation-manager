import { Component } from "@angular/core";
import { Subject } from "rxjs";
import { TranslationJSON } from "./translation-json.model";
import { AlertService, DroppedFile, ModalLabels } from "@c8y/ngx-components";
import { isEmpty } from "lodash";

@Component({
    templateUrl:'./import-translation-modal.component.html'
})
export class ImportTranslationModalComponent {
    closeSubject: Subject<TranslationJSON> = new Subject();
    labels: ModalLabels = { ok: "Import", cancel: "Cancel" };
    isLoading = false;
    files: FileList;
    json: TranslationJSON;

  constructor(
    private alert: AlertService,
  ) {}

  // called if cancel is pressed
  onDismiss(): void {
    this.closeSubject.next(null);
  }

  // called if save is pressed
  onClose(): void {
    this.closeSubject.next(this.json);
  }

  async uploadFile(droppedFiles: DroppedFile[]): Promise<void> {
    this.isLoading = true;
    if (droppedFiles.length > 1) {
      this.alert.danger("Only single file import is allowed.");
      return;
    }
    const [file] = droppedFiles;
    this.parseFile(file)
      .then((json) => this.json = json)
      .catch((error) => this.alert.danger(error))
      .finally(() => (this.isLoading = false));
  }

  private async parseFile(file: DroppedFile) {
    let translationJSON: TranslationJSON = null;

    translationJSON = await file.readAsJson();

    if (!translationJSON) {
      throw new Error("Could not read file");
    }
    if (isEmpty(translationJSON)) {
      throw new Error("Expected name property in json");
    }
    
    return translationJSON;
  }

}