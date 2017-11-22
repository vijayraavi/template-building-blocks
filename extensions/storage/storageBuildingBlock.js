exports.getBuildingBlocks = ({application, baseUri}) => {
    let _ = application.require('lodash');
    let role = require('./storageSettings')(application);
    return [
        {
            type: 'Storage',
            process: role.process,
            //preProcess: role.preProcess,
            defaultsFilename: 'storageSettings.json',
            template: _.join([baseUri, 'resources/Microsoft.Storage/storageAccounts.json'], '/'),
            deploymentName: 'storage'
        }
    ];
};
