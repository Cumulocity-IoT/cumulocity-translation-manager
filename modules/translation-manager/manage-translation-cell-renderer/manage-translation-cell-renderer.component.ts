import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  CellRendererContext,
  ModalService as C8yModalService,
  gettext,
  Status,
} from '@c8y/ngx-components';
import { TranslationDirectoryService } from '../translation-directory.service';
import { TranslateService } from '@ngx-translate/core';
import { TranslationEntry } from '../translation-directory.model';

@Component({
  selector: 'c8y-cell-renderer',
  templateUrl: 'manage-translation-cell-renderer.component.html',
})
export class ManageTranslationCellRendererComponent {
  private readonly FOCUS_RENDER_WAIT_TIME_IN_MS = 100;
  isCellEditable = false;
  cellValue = '';
  @ViewChild('cellInput') cellInput: ElementRef<HTMLInputElement>;

  constructor(
    public context: CellRendererContext,
    private directoryService: TranslationDirectoryService,
    private c8yModalService: C8yModalService,
    private translateService: TranslateService
  ) {}

  save(): Promise<void> {
    this.isCellEditable = false;
    const previousCellValue = this.context.value as string;
    const cellValueTrimed = this.cellValue.trim();
    this.context.value = cellValueTrimed;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    this.context.item[this.context.property.path] = cellValueTrimed;
    const normalizedEntry = this.directoryService.normalizeTranslationValues(this.getItem());
    const isTranslationProvided =
      this.directoryService.validateTranslationIsProvided(normalizedEntry);

    if (!isTranslationProvided) {
      void this.removeTranslationDialog(previousCellValue);
      return;
    }

    this.directoryService.saveTranslationLocally(normalizedEntry);
    this.directoryService.saveTranslationItem.emit();
  }

  getItem(): TranslationEntry {
    return this.context.item as TranslationEntry;
  }

  cancel(): void {
    this.isCellEditable = false;
  }

  editCell(): void {
    this.cellValue = this.context.value as string;
    this.isCellEditable = true;

    // Focuses the input box after the input text box is visible
    setTimeout(() => {
      this.cellInput.nativeElement.focus();
    }, this.FOCUS_RENDER_WAIT_TIME_IN_MS);
  }

  private async removeTranslationDialog(previousCellValue: string): Promise<void> {
    try {
      const title = gettext('Remove translation key?') as string;
      const body = this.translateService.instant(
        gettext(
          'You are going to remove the last translation for key "{{ key }}", so the key will be deleted. Do you want to proceed?'
        ) as string,
        { key: this.getItem().translationKey }
      ) as string;
      await this.c8yModalService.confirm(title, body, Status.WARNING);
      this.directoryService.deleteTranslationItem.emit(this.getItem());
    } catch (ex) {
      this.context.value = previousCellValue;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.context.item[this.context.property.path] = previousCellValue;
    }
  }
}
