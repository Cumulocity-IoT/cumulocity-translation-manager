import { NgModule } from '@angular/core';
import { FormsModule as NgFormModule } from '@angular/forms';
import {
  CoreModule,
  DynamicFormsModule,
  gettext,
  HelpModule,
  HOOK_NAVIGATOR_NODES,
  HOOK_ROUTE,
  hookNavigator,
  hookRoute,
} from '@c8y/ngx-components';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { ManageTranslationCellRendererComponent } from './manage-translation-cell-renderer/manage-translation-cell-renderer.component';
import { ManageTranslationModalComponent } from './manage-translation-modal/manage-translation-modal.component';
import { TranslationDeactivateGuard } from './translation-deactivate.guard';
import { TranslationDirectoryComponent } from './translation-directory.component';
import { HttpClientModule } from '@angular/common/http';

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
  ],
  entryComponents: [ManageTranslationCellRendererComponent],
  providers: [
    hookNavigator({
      parent: 'Settings',
      label: gettext('Localization'),
      path: '/translation-directory',
      icon: 'language1',
      priority: 5,
      preventDuplicates: true,
    }),
    hookRoute({
      path: 'translation-directory',
      component: TranslationDirectoryComponent,
      canDeactivate: [TranslationDeactivateGuard],
    }),
    TranslationDeactivateGuard,
  ],
})
export class TranslationDirectoryModule {}
