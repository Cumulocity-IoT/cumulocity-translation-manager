import { Injectable } from '@angular/core';
import { NavigatorNode, NavigatorNodeFactory, gettext } from '@c8y/ngx-components';

@Injectable()
export class TranslationDirectoryNavigationFactory implements NavigatorNodeFactory {
  private readonly TRANSLATION_DIRECTORY_NAVIGATOR_NODE = new NavigatorNode({
    parent: gettext('Configuration'),
    label: gettext('Localization'),
    path: '/translation-directory',
    icon: 'language1',
    priority: 5,
  });

  get() {
    return this.TRANSLATION_DIRECTORY_NAVIGATOR_NODE;
  }
}
