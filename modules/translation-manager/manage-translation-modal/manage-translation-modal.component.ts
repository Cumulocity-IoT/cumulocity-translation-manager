import { Component, EventEmitter, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';
import { Languages } from '@c8y/ngx-components';
import { find } from 'lodash-es';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { TranslationEntry } from '../translation-directory.model';
import { TranslationDirectoryService } from '../translation-directory.service';

@Component({
  selector: 'c8y-manage-translation-modal',
  templateUrl: './manage-translation-modal.component.html'
})
export class ManageTranslationModalComponent implements OnInit {
  translationEntry: TranslationEntry;
  langsDetail: Languages;
  translationsData: TranslationEntry[];
  langCodes: string[];
  isInputTextDisabled = true;
  formGroup: FormGroup;
  languageFormModel: TranslationEntry = {};
  isTranslationProvided = true;
  pendingStatus: boolean = false;

  onClose = new EventEmitter<void>();
  onSave = new EventEmitter<TranslationEntry>();

  constructor(
    private formBuilder: FormBuilder,
    private bsModelRef: BsModalRef,
    private directoryService: TranslationDirectoryService
  ) {}

  ngOnInit(): void {
    const formControls = this.buildForm(!this.translationEntry);
    this.formGroup = this.formBuilder.group(formControls);

    if (this.translationEntry) {
      this.formGroup.controls['translationKey'].disable();
      this.updateModel();
    } else {
      this.formGroup.controls['translationKey'].enable();
    }
  }

  async onSaveButtonClicked(): Promise<void> {
    this.pendingStatus = true;
    
    const normalizedEntry = this.directoryService.normalizeTranslationValues(
      this.languageFormModel
    );
    const isTranslationProvided = this.directoryService.validateTranslationIsProvided(
      normalizedEntry
    );

    if (!isTranslationProvided) {
      this.isTranslationProvided = false;
      this.pendingStatus = false;
      return;
    }
    
    this.onSave.emit(this.languageFormModel);
  }

  onCancel(): void {
    this.bsModelRef.hide();
    this.onClose.emit();
  }

  validateTranslationKey(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value && !control.value.trim()) {
        return { invalidName: true };
      }
      const isFound = find(this.translationsData, { translationKey: control.value });
      return isFound ? { nameTaken: true } : null;
    };
  }

  private buildForm(isNewKey: boolean): { translationKey: FormControl } {
    this.canChangeTranslationKey(isNewKey);
    const formControls = {
      translationKey: new FormControl(this.languageFormModel.translationKey, {
        validators: isNewKey ? [this.validateTranslationKey()] : [],
        updateOn: 'blur'
      })
    };

    this.langCodes.forEach(languageCode => {
      formControls[languageCode] = languageCode;
      this.languageFormModel[languageCode] = undefined;
    });

    return formControls;
  }

  private updateModel(): TranslationEntry {
    const formControls = this.translationEntry;
    this.languageFormModel = Object.assign({}, this.translationEntry);
    return formControls;
  }

  private canChangeTranslationKey(isNewKey: boolean): void {
    this.isInputTextDisabled = !isNewKey;
    if (isNewKey) {
      this.languageFormModel.translationKey = undefined;
    }
  }
}
