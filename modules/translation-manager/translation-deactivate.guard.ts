import { CanDeactivate } from '@angular/router';
import { TranslationDirectoryComponent } from './translation-directory.component';

export class TranslationDeactivateGuard implements CanDeactivate<TranslationDirectoryComponent> {
  canDeactivate(component: TranslationDirectoryComponent): Promise<boolean> {
    return component.canDeactivate();
  }
}
