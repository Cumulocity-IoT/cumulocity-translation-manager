import { Injectable } from '@angular/core';
import {
  ApplicationAvailability,
  ApplicationService,
  ApplicationType,
  FetchClient,
  IApplication,
} from '@c8y/client';
import { AlertService, ApplicationOptions, gettext } from '@c8y/ngx-components';
import * as JSZip from 'jszip';

@Injectable({ providedIn: 'root' })
export class PublicOptionsAppService {
  private readonly APP_NAME = 'public-options';

  private application: IApplication;

  constructor(
    private fetchClient: FetchClient,
    private applicationService: ApplicationService,
    private alertService: AlertService
  ) {}

  /**
   * Stores the current applicationOptions object as options.json in public-options.
   * @returns The result of the API call.
   */
  async saveOptionsJson(applicationOptions: ApplicationOptions) {
    console.log('application: ', this.application);

    if (!this.application) {
      throw new Error('Public Options applications has not been initialized');
    }

    return this.applicationService
      .binary(this.application)
      .updateFiles([{ path: 'options.json', contents: JSON.stringify(applicationOptions) as any }]);
  }

  /**
   * Returns the current application options.
   * @returns
   */
  async getApplicationOptions(): Promise<ApplicationOptions> {
    const OPTIONS_JSON = `/apps/public-options/options.json?nocache=${String(
      Math.random()
    ).substring(2)}`;
    const result = await this.fetchClient.fetch(OPTIONS_JSON);
    if (result.status >= 400) {
      this.alertService.danger(gettext('No Cumulocity manifest found.'));
    }
    return result.json();
  }

  /**
   * Check if public options app exists.
   * TODO: The side-effect of storing the this.app here isn't nice. Maybe we can improve this.
   * @returns True if public options app exists.
   */
  async isPublicOptionsAppAvailable(): Promise<boolean> {
    try {
      const { data } = await this.applicationService.listByName(this.APP_NAME);

      if (!data || data.length === 0) {
        return false;
      }

      this.application = data[0];

      console.log('application: ', this.application);

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Creates the public options application in the tenant. In addition, the options.json file
   * with no content will be created and added to the public options application.
   */
  async createPublicOptionsApp(): Promise<boolean> {
    try {
      this.application = (
        await this.applicationService.create(this.getPublicOptionsAppDescription())
      ).data;

      const fileCreated = (
        await this.applicationService
          .binary(this.application.id)
          .upload(await this.getPublicOptionsFilesArchive())
      ).data;

      await this.applicationService.update({
        id: this.application.id,
        activeVersionId: fileCreated.id as string,
      });

      return true;
    } catch (error) {
      this.alertService.danger(
        gettext('Failed to create public-options application. Check permissions.'),
        error
      );
    }

    return false;
  }

  /**
   * Creates a zip archive consisting of the files 'cumulocity.json' and 'options.json'. The 'options.json'
   * file only contains an empty object
   * @returns File: zip archive named 'public-options.zip'
   */
  private async getPublicOptionsFilesArchive(): Promise<File> {
    const zip = new JSZip();

    zip.file('cumulocity.json', JSON.stringify(this.getPublicOptionsAppDescription()));
    zip.file('options.json', JSON.stringify({}));

    const file = new File([await zip.generateAsync({ type: 'blob' })], 'public-options.zip');

    return file;
  }

  private getPublicOptionsAppDescription(): IApplication {
    return {
      name: this.APP_NAME,
      contextPath: this.APP_NAME,
      description: gettext('Application containing public options used by tenant.'),
      key: `${this.APP_NAME}-key`,
      availability: ApplicationAvailability.MARKET,
      type: ApplicationType.HOSTED,
      resourcesUrl: '/',
      manifest: {
        noAppSwitcher: true,
      },
    };
  }
}
