const _path = require('path');
const _fs = require('fs');
const { APS_CLIENT_ID, APS_WEBHOOK_URL,APS_AUTOMATION_NICKNAME, APS_AUTOMATION_ALIAS, APS_AUTOMATION_ACTIVITY_NAME, APS_AUTOMATION_CLIENT_SETTINGS } = require('../../config');
const dav3 = require('autodesk.forge.designautomation');


class Utils {
	static get LocalBundlesFolder() {
		return (_path.resolve(_path.join(__dirname, '../..', 'wwwroot/bundles')));
	}

	static get NickName() {
		return APS_AUTOMATION_NICKNAME? APS_AUTOMATION_NICKNAME : APS_CLIENT_ID;
	}

	static get Alias() {
		return APS_AUTOMATION_ALIAS? APS_AUTOMATION_ALIAS : 'dev';
	}

	static get CallBackUrl() {
		return APS_WEBHOOK_URL;
	}

	static get ActivityName() {
		return APS_AUTOMATION_ACTIVITY_NAME? APS_AUTOMATION_ACTIVITY_NAME : 'RCWMigratorAppActivity';
	}

	static async findFiles(dir, filter) {
		return (new Promise((fulfill, reject) => {
			_fs.readdir(dir, (err, files) => {
				if (err)
					return (reject(err));
				if (filter !== undefined && typeof filter === 'string')
					files = files.filter((file) => {
						return (_path.extname(file) === filter);
					});
				else if (filter !== undefined && typeof filter === 'object')
					files = files.filter((file) => {
						return (filter.test(file));
					});
				fulfill(files);
			});
		}));
	}

	static dav3API(oauth2) {
		let apiClient = new dav3.AutodeskForgeDesignAutomationClient( APS_AUTOMATION_CLIENT_SETTINGS);
		apiClient.authManager.authentications['2-legged'].accessToken = oauth2.access_token;
		return (new dav3.AutodeskForgeDesignAutomationApi(apiClient));
	}


    static async uploadAppBundleAsync(field, data) {
        const form = new FormData();
        for (const [key, value] of Object.entries(field.formData)) {
            form.append(key, value);
        }
        form.append('file', new Blob([data]));

        const response = await fetch(field.endpointURL, {
            method: 'POST',
            body: form
        });

        const bodyText = await response.text();
        let resp;
        try {
            resp = JSON.parse(bodyText);
        } catch (e) {
            resp = bodyText;
        }

        if (!response.ok) {
            console.log('error code: ' + response.status + ' response message: ' + response.statusText);
            throw { statusCode: response.status, statusMessage: response.statusText };
        }

        return { statusCode: response.status, headers: response.headers, body: resp };
    }
}


module.exports = 
{ 
    Utils
};
    