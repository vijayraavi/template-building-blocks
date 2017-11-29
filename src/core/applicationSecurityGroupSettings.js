'use strict';

let _ = require('lodash');
let v = require('./validation');
let r = require('./resources');
let validationMessages = require('./validationMessages');

const APPLICATIONSECURITYGROUP_SETTINGS_DEFAULTS = {
    tags: {}
};

let applicationSecurityGroupsSettingsValidations = {
    name: v.validationUtilities.isNotNullOrWhitespace,
    tags: v.tagsValidations
};

let validate = ({settings}) => {
    let errors = v.validate({
        settings: settings,
        validations: applicationSecurityGroupsSettingsValidations
    });

    return errors;
};

let merge = ({ settings, buildingBlockSettings, defaultSettings }) => {
    let defaults = (defaultSettings) ? [APPLICATIONSECURITYGROUP_SETTINGS_DEFAULTS, defaultSettings] : APPLICATIONSECURITYGROUP_SETTINGS_DEFAULTS;

    let merged = r.setupResources(settings, buildingBlockSettings, (parentKey) => {
        return (parentKey === null);
    });

    merged = v.merge(merged, defaults);
    return merged;
};

function transform(settings) {
    let result = {
        name: settings.name,
        tags: settings.tags,
        resourceGroupName: settings.resourceGroupName,
        subscriptionId: settings.subscriptionId,
        location: settings.location,
        properties: { }
    };

    return result;
}

function process({ settings, buildingBlockSettings, defaultSettings }) {
    settings = _.castArray(settings);

    let buildingBlockErrors = v.validate({
        settings: buildingBlockSettings,
        validations: {
            subscriptionId: v.validationUtilities.isGuid,
            resourceGroupName: v.validationUtilities.isNotNullOrWhitespace,
        }
    });

    if (buildingBlockErrors.length > 0) {
        throw new Error(JSON.stringify(buildingBlockErrors));
    }

    let results = merge({
        settings: settings,
        buildingBlockSettings: buildingBlockSettings,
        defaultSettings: defaultSettings
    });

    let errors = validate({settings: results});

    if (errors.length > 0) {
        throw new Error(JSON.stringify(errors));
    }

    results = _.transform(results, (result, setting) => {
        result.applicationSecurityGroups.push(transform(setting));
    }, {
        applicationSecurityGroups: []
    });

    // Get needed resource groups information.
    let resourceGroups = r.extractResourceGroups(results.applicationSecurityGroups);
    return {
        resourceGroups: resourceGroups,
        parameters: results
    };
}

exports.process = process;
