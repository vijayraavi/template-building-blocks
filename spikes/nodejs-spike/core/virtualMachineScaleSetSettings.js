'use strict';

let _ = require('lodash');
let v = require('./validation');
let resources = require('./resources');

const SCALESET_SETTINGS_DEFAULTS = {
    upgradePolicy: 'Automatic',
    recoveryPolicy: 'OverProvision',
    overprovision: true,
    singlePlacementGroup: false,
    vhdContainers: []
};

function merge({ settings, buildingBlockSettings, defaultSettings }) {
    let defaults = (defaultSettings) ? [SCALESET_SETTINGS_DEFAULTS, defaultSettings] : SCALESET_SETTINGS_DEFAULTS;
    let mergedSettings = v.merge(settings, defaults);

    let updatedMergedSettings = resources.setupResources(mergedSettings, buildingBlockSettings, (parentKey) => {
        return ((parentKey === null) || (v.utilities.isStringInArray(parentKey)));
    });

    return updatedMergedSettings;
}

let upgradePolicies = ['Automatic', 'Manual'];
let recoveryPolicies = ['None', 'OverProvision', 'Reprovision'];

let isValidUpgradePolicy = (upgradePolicy) => {
    return v.utilities.isStringInArray(upgradePolicy, upgradePolicies);
};

let isValidRecoveryPolicy = (recoveryPolicy) => {
    return v.utilities.isStringInArray(recoveryPolicy, recoveryPolicies);
};

let scaleSetValidations = {
    name: v.validationUtilities.isNotNullOrWhitespace,
    upgradePolicy: (value) => {
        return {
            result: isValidUpgradePolicy(value),
            message: `Valid values are ${upgradePolicies.join(', ')}`
        };
    },
    recoveryPolicy: (value) => {
        return {
            result: isValidRecoveryPolicy(value),
            message: `Valid values are ${recoveryPolicies.join(', ')}`
        };
    },
    overprovision: v.validationUtilities.isBoolean,
    singlePlacementGroup: v.validationUtilities.isBoolean,
    vhdContainers: (value) => {
        let result = {
            result: true
        };

        if (!_.isNil(value) && value.length > 0) {
            result = {
                validations: v.validationUtilities.isNotNullOrWhitespace
            };
        }

        return result;
    }
};

function transform(param, resources) {
    // use the 1st virtual machine stamp for building virtualMachineProfile of scale set
    let vm = resources.virtualMachines[0];
    let sku = {
        name: vm.properties.hardwareProfile.vmSize,
        tier: _.split(vm.properties.hardwareProfile.vmSize, '_')[0],
        capacity: resources.virtualMachines.length
    };

    // use osProfile from VM to build osProfile for scale set virtualMachineProfile
    let osProfile = _.cloneDeep(vm.properties.osProfile);
    osProfile.computerNamePrefix = _.trimEnd(osProfile.computerName, '-vm1');
    delete osProfile.computerName;

    // use storageProfile from VM to build storageProfile for scale set virtualMachineProfile
    let storageProfile = _.cloneDeep(vm.properties.storageProfile);
    storageProfile.osDisk.vhdContainers = param.vhdContainers;

    // use extensions from VM to build extensionProfile for scale set virtualMachineProfile
    let extensions = _.map(vm.extensions, (ext) => {
        let transformed = {
            name: ext.name,
            properties: ext.extensionSettings
        };
        transformed.properties.protectedSettings = JSON.parse(ext.extensionProtectedSettings.value);
        return transformed;
    });

    // use networkProfile from VM to build networkProfile for scale set virtualMachineProfile
    let nics = _.map(vm.properties.networkProfile.networkInterfaces, (n) => {
        let nic = _.find(resources.networkInterfaces, (o) => {
            return (o.name === _.last(_.split(n.id, '/')));
        });

        let ipConifigs = _.map(nic.properties.ipConfigurations, (ipc) => {
            let config = {
                name: ipc.name,
                properties: {
                    subnet: ipc.properties.subnet,
                    privateIPAddressVersion: ipc.properties.privateIPAddressVersion,
                    loadBalancerBackendAddressPools: ipc.properties.loadBalancerBackendAddressPools,
                    loadBalancerInboundNatPools: ipc.properties.loadBalancerInboundNatRules
                }
            };

            if (!_.isNil(ipc.properties.publicIPAddress)) {
                let pip = _.find(resources.publicIpAddresses, (o) => {
                    return (o.name === _.last(_.split(ipc.properties.publicIPAddress.id, '/')));
                });

                config.properties.publicIPAddressConfiguration = { properties: {} };
                config.properties.publicIPAddressConfiguration.name = pip.name;
                if (!_.isNil(pip.properties.idleTimeoutInMinutes)) {
                    config.properties.publicIPAddressConfiguration.properties.idleTimeoutInMinutes = pip.properties.idleTimeoutInMinutes;
                }
                if (!_.isNil(pip.properties.dnsSettings)) {
                    config.properties.publicIPAddressConfiguration.properties.dnsSettings = pip.properties.dnsSettings;
                }
            }

            return config;
        });

        let transformed = {
            name: nic.name,
            properties: {
                primary: nic.properties.primary,
                dnsSettings: {
                    dnsServers: nic.properties.dnsSettings.dnsServers
                },
                ipConfigurations: ipConifigs
            }
        };

        return transformed;
    });

    let properties = {
        upgradePolicy: {
            mode: param.upgradePolicy
        },
        recoveryPolicy: {
            mode: param.recoveryPolicy
        },
        virtualMachineProfile: {
            osProfile: osProfile,
            storageProfile: storageProfile,
            networkProfile: {
                networkInterfaceConfigurations: nics
            },
            diagnosticsProfile: resources.virtualMachines[0].properties.diagnosticsProfile,
            extensionProfile: {
                extensions: extensions
            }
        },
        overprovision: param.overprovision,
        singlePlacementGroup: param.singlePlacementGroup
    };

    if (!_.isNil(vm.licenseType)) {
        properties.virtualMachineProfile.licenseType = vm.licenseType;
    }

    let accumulator = {};
    accumulator['scaleSet'] = [{
        name: param.name,
        sku: sku,
        properties: properties,
        resourceGroupName: param.resourceGroupName,
        subscriptionId: param.subscriptionId,
        location: param.location
    }];

    return accumulator;
}

exports.merge = merge;
exports.validations = scaleSetValidations;
exports.transform = transform;
