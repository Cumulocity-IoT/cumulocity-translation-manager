# Translation UI Plugin

## General

Manage your translations in Cumulocity IoT for all supported languages easily using the Translation UI Plugin. Translations can be added and updated using the Translation table. Translations are globally available in all Cumulocity applications running on the same Cumulocity tenant via the `public-options` application and its `options.json` file. 

The Translation UI Plugin automatically register a new navigation entry in the left side navigation menu. The Translation Plugin can be accessed by navigating to `Configuration` -> `Localization`. 

> **Important:** If the Plugin is used in an application it needs to check if the `public-options` application exists. The `public-options` application is used to store and share translations to the different applications. In case the application doesn't exist, it will automatically be created in the Cumulocity tenant via the Translation UI Plugin. Creating this application requires `Admin` permission on `Application management`. Therefore, make sure the plugin is initally called with a user having the necessary permission, otherwise an error will be thrown.

## Add new term with translations

To add a new term and corresponding translations follow these steps:

1. Click on the button `Add term` at the top-right in the action bar.

2. In the upcoming modal dialog provide the term (key), which should be translated, and the related translations.

3. Click on `Save` to store the changes locally.

4. In order for the translations to be applied to Cumulocity and its application, click on the `Apply` button in the action bar. 

5. A success notification appears if the changes could be applied successfully

6. The translations are directly applied to your application.

![alt translation plugin demo](/assets/translation_plugin.gif)

## Update existing translations

Translations can be updated directly in the table or via the modal dialog.

**Table**

1. Hover over the cell in the table for the translation, which you want to update.

2. Click on the `Pencil` icon to edit the translation

3. Update the translation and click on the `Checkmark` icon to save the translation locally

4. Click on `Apply` in the action bar to apply the update to Cumulocity and its applications.

![alt translation plugin update translation directly in table](/assets/translation-update-table_plugin.gif)

**Modal dialog**

1. For the term you want to update the translations for, click on the `Edit` button at the right of the corresponding row.

2. Update the translations for the relevant languages

3. Click on `Save` to store the changes locally.

4. In order for the translations to be applied to Cumulocity and its application, click on the `Apply` button in the action bar. 

5. A success notification appears if the changes could be applied successfully

![alt translation plugin update translation via modal dialog](/assets/translation-update-modal_plugin.gif)

## Delete a term

1. Hover over the row of the term you want to delete.

2. Click on the `Delete` button, which is displayed on hovering over the row.

3. In the upcoming confirmation dialog click on the `Confirm` button.

4. In order for the changes to take affect click on the `Apply` button in the action bar.

5. A success notification appears if the changes could be applied successfully.

![alt translation plugin delete a translation](/assets/translation-delete_plugin.gif)

## Local development

### Recommended version

* node v 14.x
* npm v 6.x

### Plugin versions

* Angular v 14.x
* WebSDK v 1017.0.x

**How to start**
Change the target tenant and application you want to run this plugin on in the `package.json`.

```
c8ycli server -u https://{{your-tenant}}.cumulocity.com/ --shell {{cockpit}}
```
Keep in mind that this plugin needs to have an app (e.g. cockpit) running with at least the same version as this plugin. if your tenant contains an older version, use the c8ycli to create a cockpit clone running with at least v 1017.0.x! Upload this clone to the target tenant (e.g. cockpit-1017) and reference this name in the --shell command.

The widget plugin can be locally tested via the start script:

```
npm start
```

In the Module Federation terminology, `widget` plugin is called `remote` and the `cokpit` is called `shell`. Modules provided by this `widget` will be loaded by the `cockpit` application at the runtime. This plugin provides a basic custom widget that can be accessed through the `Add widget` menu.

> Note that the `--shell` flag creates a proxy to the cockpit application and provides` AdvancedMapWidgetModule` as an `remote` via URL options.

Also deploying needs no special handling and can be simply done via `npm run deploy`. As soon as the application has exports it will be uploaded as a plugin.

## Useful links 

📘 Explore the Knowledge Base   
Dive into a wealth of Cumulocity IoT tutorials and articles in our [Tech Community Knowledge Base](https://tech.forums.softwareag.com/tags/c/knowledge-base/6/cumulocity-iot).  

💡 Get Expert Answers    
Stuck or just curious? Ask the Cumulocity IoT experts directly on our [Forum](https://tech.forums.softwareag.com/tags/c/forum/1/Cumulocity-IoT).    

🚀 Try Cumulocity IoT    
See Cumulocity IoT in action with a [Free Trial](https://techcommunity.softwareag.com/en_en/downloads.html).   

✍️ Share Your Feedback    
Your input drives our innovation. If you find a bug, please create an issue in the repository. If you’d like to share your ideas or feedback, please post them [here](https://tech.forums.softwareag.com/c/feedback/2). 

More to discover
* [How to install a Microfrontend Plugin on a tenant and use it in an app?](https://tech.forums.softwareag.com/t/how-to-install-a-microfrontend-plugin-on-a-tenant-and-use-it-in-an-app/268981)  
* [Cumulocity IoT Web Development Tutorial - Part 1: Start your journey](https://tech.forums.softwareag.com/t/cumulocity-iot-web-development-tutorial-part-1-start-your-journey/259613) 
* [The power of micro frontends – How to dynamically extend Cumulocity IoT Frontends](https://tech.forums.softwareag.com/t/the-power-of-micro-frontends-how-to-dynamically-extend-cumulocity-iot-frontends/266665)  

------------------------------
These tools are provided as-is and without warranty or support. They do not constitute part of the Software AG product suite. Users are free to use, fork and modify them, subject to the license agreement. While Software AG welcomes contributions, we cannot guarantee to include every contribution in the master project.
