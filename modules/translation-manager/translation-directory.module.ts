import { NgModule } from '@angular/core';
import { FormsModule as NgFormModule } from '@angular/forms';
import {
  CoreModule,
  DynamicFormsModule,
  gettext,
  HelpModule,
  HOOK_NAVIGATOR_NODES,
  HOOK_ROUTE,
} from '@c8y/ngx-components';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { ManageTranslationCellRendererComponent } from './manage-translation-cell-renderer/manage-translation-cell-renderer.component';
import { ManageTranslationModalComponent } from './manage-translation-modal/manage-translation-modal.component';
import { TranslationDeactivateGuard } from './translation-deactivate.guard';
import { TranslationDirectoryComponent } from './translation-directory.component';
import { HttpClientModule } from '@angular/common/http';
import { TranslationDirectoryNavigationFactory } from './translation-directory.factory';
import { ImportTranslationModalComponent } from './import-translation/import-translation-modal.component';

@NgModule({
  imports: [
    PopoverModule.forRoot(),
    CoreModule,
    NgFormModule,
    DynamicFormsModule,
    HelpModule,
    HttpClientModule,
  ],
  exports: [
    TranslationDirectoryComponent,
    ManageTranslationModalComponent,
    ManageTranslationCellRendererComponent,
  ],
  declarations: [
    TranslationDirectoryComponent,
    ManageTranslationModalComponent,
    ManageTranslationCellRendererComponent,
    ImportTranslationModalComponent,
  ],
  entryComponents: [ManageTranslationCellRendererComponent],
  providers: [
    {
      provide: HOOK_NAVIGATOR_NODES,
      useClass: TranslationDirectoryNavigationFactory,
      multi: true,
    },
    {
      provide: HOOK_ROUTE,
      useValue: {
        path: 'translation-directory',
        component: TranslationDirectoryComponent,
        canDeactivate: [TranslationDeactivateGuard],
      },
      multi: true,
    },
    TranslationDeactivateGuard,
  ],
})
export class TranslationDirectoryModule {}
