import { Component, EventEmitter, HostListener, OnInit } from '@angular/core';
import {
  ActionControl,
  AlertService,
  AppStateService,
  BuiltInActionType,
  Column,
  gettext,
  GridConfig,
  ModalService as C8yModalService,
  OptionsService,
  Pagination,
  Status,
} from '@c8y/ngx-components';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep, isEqual, assign } from 'lodash';
import { PublicOptionsAppService } from '../../services/public-options-app.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { first, take } from 'rxjs/operators';
import { ManageTranslationCellRendererComponent } from './manage-translation-cell-renderer/manage-translation-cell-renderer.component';
import { ManageTranslationModalComponent } from './manage-translation-modal/manage-translation-modal.component';
import { TranslationEntry } from './translation-directory.model';
import { TranslationDirectoryService } from './translation-directory.service';
import { ImportTranslationModalComponent } from './import-translation/import-translation-modal.component';
import { isEmpty } from 'lodash';

@Component({
  selector: 'dtm-translation-directory',
  templateUrl: 'translation-directory.component.html',
})
export class TranslationDirectoryComponent implements OnInit {
  columns: Column[];

  loadingItemsLabel = gettext('Loading translations...') as string;

  actionControls: ActionControl[] = [
    {
      type: BuiltInActionType.Edit,
      callback: (selectedItem: TranslationEntry) => {
        void this.openTranslationModal(selectedItem);
      },
    },
    {
      type: BuiltInActionType.Delete,
      callback: (selectedItem: TranslationEntry) => {
        void this.onItemDelete(selectedItem);
      },
      showIf: (item: TranslationEntry) => item.isDeleteActionEnabled,
    },
  ];

  pagination: Pagination;

  translationsData: TranslationEntry[] = [];

  translationsDataCopy: TranslationEntry[] = []; // to compare for changes

  refresh = new EventEmitter();

  disabled = true;

  isTranslationsDataChanged = false;

  isTranslationsDataFetched = false;
  langCodes: string[];

  constructor(
    private appStateService: AppStateService,
    private directoryService: TranslationDirectoryService,
    private options: OptionsService,
    private modalService: BsModalService,
    private c8yModalService: C8yModalService,
    private publicOptionsAppService: PublicOptionsAppService,
    protected translateService: TranslateService,
    protected alertService: AlertService
  ) {}

  @HostListener('window:beforeunload', ['$event'])
  onbeforeunload(event) {
    if (this.isChanged()) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      event.returnValue = false;
    }
  }

  async ngOnInit() {
    this.isTranslationsDataFetched = false;

    const isPublicOptionsAppAvailable = await this.initPublicOptionsApp();

    this.disabled = !isPublicOptionsAppAvailable;

    if (this.disabled) {
      return;
    }

    this.langCodes = this.appStateService.getLangs() as string[];

    this.initColumnConfiguration(this.langCodes);
    await this.initTranslationData(this.langCodes);
    this.initListenersTranslationItemActions();

    this.isTranslationsDataFetched = true;
  }

  async onImportClick(): Promise<void> {
    const modalRef = this.modalService.show(ImportTranslationModalComponent);
    modalRef.content.languageCodes = [...this.langCodes];
    const entries = await modalRef.content.closeSubject.pipe(take(1)).toPromise();
    if (!isEmpty(entries)) {
      for (const entry of entries) {
        const merged = this.mergeIfNeeded(entry);
        this.directoryService.saveTranslationLocally(merged);
      }
      this.refresh.emit();
      this.isTranslationsDataChanged = true;
    }

    modalRef.hide();
  }

  private mergeIfNeeded(entry: TranslationEntry): TranslationEntry {
    const match = this.translationsData.find((t) => t.translationKey === entry.translationKey);
    if (match) {
      return Object.assign(match, entry);
    } else {
      this.translationsData.push(entry);
    }
    return entry;
  }

  async reload() {
    try {
      if (this.isChanged()) {
        await this.c8yModalService.confirm(
          gettext('Reload') as string,
          gettext('Reloading will remove your current changes. Do you want to continue?') as string,
          Status.WARNING
        );
      }
      this.disabled = true;
      await this.ngOnInit();
    } catch (ex) {
      // intended empty
    }
  }

  openTranslationModal(selectedItem?: TranslationEntry) {
    const initialState: { initialState: Partial<ManageTranslationModalComponent> } = {
      initialState: {
        translationEntry: selectedItem,
        langCodes: this.langCodes,
        translationsData: this.translationsData,
        langsDetail: this.options.languages,
      },
    };
    const modalRef: BsModalRef<ManageTranslationModalComponent> = this.modalService.show(
      ManageTranslationModalComponent,
      initialState
    );
    modalRef.content.onSave
      .pipe(
        first() // this is to not run into memory issues
      )
      .subscribe(() => {
        this.onTranslationModalSave(modalRef, selectedItem);
      });
  }

  onConfigChange(
    config: GridConfig,
    key: string = this.directoryService.TRANSLATION_GRID_CONFIG_DEFAULT_STORAGE_KEY
  ): void {
    if (this.columns) {
      this.directoryService.saveConfig$(config, key);
    }
  }

  saveApplicationOptions() {
    this.isTranslationsDataChanged = false;
    this.directoryService.saveOptionsJson();
    this.alertService.success(gettext('Translation configuration saved.') as string);
    this.translationsDataCopy = cloneDeep(this.translationsData);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.options.langsDetails = {
      ...this.options.langsDetails,
      ...this.directoryService.applicationOptions.i18nExtra,
    };
    this.translateService.reloadLang(this.translateService.currentLang).subscribe((data) => {
      this.translateService.setTranslation(this.translateService.currentLang, data as object);
      this.translateService.use(this.translateService.currentLang);
    });
  }

  async canDeactivate(): Promise<boolean> {
    if (this.isChanged()) {
      try {
        await this.c8yModalService.confirm(
          gettext('Unsaved changes') as string,
          gettext(
            "There are unapplied changes which will be lost if you don't apply them. Do you still want to leave this page?"
          ) as string,
          Status.DANGER,
          { ok: gettext('Leave page') as string }
        );
        return true;
      } catch (ex) {
        return false;
      }
    }
    return true;
  }

  private isChanged() {
    return !isEqual(this.translationsDataCopy, this.translationsData);
  }

  private getColumns(langCodes: string[]): Column[] {
    const keyColumn = {
      name: 'translationKey',
      header: 'Key',
      path: 'translationKey',
      filterable: true,
      positionFixed: true,
    };

    return [
      keyColumn,
      ...langCodes.map((langCode, index: number) => this.addColumnsIntoDataGrid(langCode, index)),
    ];
  }

  private onTranslationModalSave(
    modalRef: BsModalRef<ManageTranslationModalComponent>,
    selectedItem: TranslationEntry
  ) {
    this.directoryService.saveTranslationLocally(modalRef.content.languageFormModel);
    if (selectedItem) {
      this.update(selectedItem, modalRef.content.languageFormModel);
    } else {
      this.add(modalRef.content.languageFormModel);
    }
    this.refresh.emit();
    modalRef.hide();
    this.isTranslationsDataChanged = true;
  }

  private update(selectedItem: TranslationEntry, entry: TranslationEntry) {
    const index = this.translationsData.indexOf(selectedItem);
    this.translationsData[index] = entry;
  }

  private add(selectedItemInput: TranslationEntry) {
    const selectedItem = assign(selectedItemInput, { isDeleteActionEnabled: true });
    this.translationsData.push(selectedItem);
  }

  private remove(selectedItem: TranslationEntry) {
    const index = this.translationsData.indexOf(selectedItem);
    if (index > -1) {
      this.translationsData.splice(index, 1);
    }
  }

  private addColumnsIntoDataGrid(langCode: string, index: number): Column {
    const column = {
      name: langCode,
      header: this.getLangFromLangCode(langCode),
      path: langCode,
      filterable: true,
      cellRendererComponent: ManageTranslationCellRendererComponent,
      visible: true,
    };
    if (index >= 3) {
      column.visible = false;
    }
    return column;
  }

  async onItemDelete(selectedItem: TranslationEntry) {
    try {
      await this.c8yModalService.confirm(
        gettext('Delete translation item') as string,
        gettext('Are you sure you want to delete the item?') as string,
        Status.DANGER
      );
      this.directoryService.saveTranslationLocally(selectedItem, true);
      this.remove(selectedItem);
      this.isTranslationsDataChanged = true;
    } catch (ex) {
      // inteded empty
    }
    this.refresh.emit();
  }

  private getLangFromLangCode(langCode: string): string {
    if (this.options.languages[langCode]) {
      return this.options.languages[langCode].nativeName;
    }
  }

  private async initPublicOptionsApp(): Promise<boolean> {
    const isPublicOptionsAppAvailable =
      await this.publicOptionsAppService.isPublicOptionsAppAvailable();

    if (isPublicOptionsAppAvailable) {
      return true;
    }

    return await this.publicOptionsAppService.createPublicOptionsApp();
  }

  private initColumnConfiguration(langCodes: string[]): void {
    this.directoryService
      .getConfig$(this.directoryService.TRANSLATION_GRID_CONFIG_DEFAULT_STORAGE_KEY)
      .subscribe((data) => {
        this.columns = this.directoryService.applyConfigToColumns(data, this.getColumns(langCodes));
        this.pagination = data.pagination ? data.pagination : { pageSize: 20, currentPage: 1 };
      });
  }

  private async initTranslationData(langCodes: string[]): Promise<void> {
    this.translationsData = await this.initTranslationItems(langCodes);
    this.translationsDataCopy = cloneDeep(this.translationsData);
  }

  private async initTranslationItems(langCodes: string[]): Promise<TranslationEntry[]> {
    return await this.directoryService.getI18nExtra(langCodes);
  }

  private initListenersTranslationItemActions(): void {
    this.initListenerForSingleTranslationItemSaved();
    this.initListenerForSingleTranslationItemDeleted();
  }

  private initListenerForSingleTranslationItemDeleted(): void {
    this.directoryService.deleteTranslationItem.subscribe((entry: TranslationEntry) => {
      this.isTranslationsDataChanged = true;
      this.directoryService.saveTranslationLocally(entry, true);
      this.remove(entry);
      this.refresh.emit();
    });
  }

  private initListenerForSingleTranslationItemSaved(): void {
    this.directoryService.saveTranslationItem.subscribe(() => {
      this.isTranslationsDataChanged = true;
    });
  }
}
