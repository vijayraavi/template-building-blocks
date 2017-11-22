exports.getBuildingBlocks = ({application, baseUri}) => {
    let _ = application.require('lodash');
    let role = require('./omsSettings')(application);
    return [
        {
            type: 'OMS',
            process: role.process,
            preProcess: role.preProcess,
            defaultsFilename: 'omsSettings.json',
            template: _.join([baseUri, 'extensions/oms/workspaces.json'], '/'),
            deploymentName: 'oms'
        }
    ];
};
