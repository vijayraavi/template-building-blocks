'use strict';

var _ = require('lodash');
var storageSettings = require('./storageSettings.js');
var nicSettings = require('./networkInterfaceSettings.js');
var avSetSettings = require('./availabilitySetSettings.js');
var lbSettings = require('./loadBalancerSettings.js');
var resources = require('./resources.js');
let v = require('./validation.js');
let defaultSettings = require('./virtualMachineSettingsDefaults.js');
const os = require('os');

function merge({ settings, buildingBlockSettings, userDefaults }) {
    if (!settings.osDisk) {
        throw new Error(JSON.stringify({
            name: '.osDisk',
            message: `Invalid value: ${settings.osDisk}`
        }));
    } else if (!isValidOSType(settings.osDisk.osType)) {
        throw new Error(JSON.stringify({
            name: '.osDisk.osType',
            message: `Invalid value: ${settings.osDisk.osType}. Valid values for 'osType' are: ${validOSTypes.join(', ')}`
        }));
    }
    let defaults = ((settings.osDisk.osType === 'windows') ? defaultSettings.defaultWindowsSettings : defaultSettings.defaultLinuxSettings);
    defaults = (userDefaults) ? [defaults, userDefaults] : defaults;

    // loadBalancerSettings property needs to be specified, if load balancer is required for this deployment
    // If parameters doesnt have a loadBalancerSettings property, then remove it from defaults as well
    if (_.isNil(settings.loadBalancerSettings)) {
        delete defaults.loadBalancerSettings;
    }

    let mergedDefaults = v.merge(settings, defaults, defaultsCustomizer);

    return resources.setupResources(mergedDefaults, buildingBlockSettings, (parentKey) => {
        return ((parentKey === null) || (parentKey === 'virtualNetwork') || (parentKey === 'availabilitySet') ||
            (parentKey === 'nics') || (parentKey === 'diagnosticStorageAccounts') || (parentKey === 'storageAccounts') || (parentKey === 'encryptionSettings') || (parentKey === 'loadBalancerSettings'));
    });
}

function defaultsCustomizer(objValue, srcValue, key) {
    if (key === 'storageAccounts' || key === 'diagnosticStorageAccounts') {
        let mergedDefaults = storageSettings.merge(objValue, key);
        return v.merge(srcValue, mergedDefaults);
    }
    if (key === 'availabilitySet') {
        return avSetSettings.mergeWithDefaults(srcValue, objValue);
    }
    if (key === 'nics') {
        let mergedDefaults = ((objValue.length === 0) ? nicSettings.mergeWithDefaults({}) : nicSettings.mergeWithDefaults(objValue[0]));

        // If source has more than 1 nic specified than set the 'isPrimary' property in defaults to false
        if (srcValue.length > 1) {
            mergedDefaults.isPrimary = false;
        }
        return v.merge(srcValue, [mergedDefaults]);
    }
    if (key === 'loadBalancerSettings') {
        return lbSettings.merge(srcValue, objValue);
    }
}

let validOSAuthenticationTypes = ['ssh', 'password'];
let validOSTypes = ['linux', 'windows'];
let validCachingType = ['None', 'ReadOnly', 'ReadWrite'];
let validCreateOptions = ['fromImage', 'empty', 'attach'];

let isValidOSAuthenticationType = (osAuthenticationType) => {
    return v.utilities.isStringInArray(osAuthenticationType, validOSAuthenticationTypes);
};

let isValidOSType = (osType) => {
    return v.utilities.isStringInArray(osType, validOSTypes);
};

let isValidCachingType = (caching) => {
    return v.utilities.isStringInArray(caching, validCachingType);
};

let isValidCreateOptions = (option) => {
    return v.utilities.isStringInArray(option, validCreateOptions);
};

function validate(settings) {
    return v.validate({
        settings: settings,
        validations: virtualMachineValidations
    });
}

let encryptionSettingsValidations = {
    enabled: _.isBoolean,
    diskEncryptionKey: {
        secretUrl: v.validationUtilities.isNotNullOrWhitespace,
        sourceVaultName: v.validationUtilities.isNotNullOrWhitespace
    },
    keyEncryptionKey: {
        keyUrl: v.validationUtilities.isNotNullOrWhitespace,
        sourceVaultName: v.validationUtilities.isNotNullOrWhitespace
    }
};

let virtualMachineValidations = {
    virtualNetwork: () => {
        let virtualNetworkValidations = {
            name: v.validationUtilities.isNotNullOrWhitespace
        };

        return {
            validations: virtualNetworkValidations
        };
    },
    vmCount: (value) => {
        return {
            result: _.isFinite(value) && (value > 0),
            message: 'Value must be greater than 0'
        };
    },
    namePrefix: v.validationUtilities.isNotNullOrWhitespace,
    computerNamePrefix: (value) => {
        return {
            result: (!v.utilities.isNullOrWhitespace(value)) && (value.length < 7),
            message: 'Value cannot be longer than 6 characters'
        };
    },
    size: v.validationUtilities.isNotNullOrWhitespace,
    osDisk: (value, parent) => {
        // We will need this, so we'll capture here.
        let isManagedStorageAccounts = parent.storageAccounts.managed;
        let osDiskValidations = {
            caching: (value) => {
                return {
                    result: isValidCachingType(value),
                    message: `Valid values are ${validCachingType.join(', ')}`
                };
            },
            createOption: (value) => {
                if (!isValidCreateOptions(value)) {
                    return {
                        result: false,
                        message: `Valid values are ${validCreateOptions.join(', ')}`
                    };
                }

                if (isManagedStorageAccounts && value === 'attach') {
                    return {
                        result: false,
                        message: 'Value cannot be attach with managed disks'
                    };
                }
                return { result: true };
            },
            image: (value, parent) => {
                if (parent.createOption === 'attach' && v.utilities.isNullOrWhitespace(value)) {
                    return {
                        result: false,
                        message: 'Value of image cannot be null or empty, if value of .osDisk.createOption is attach'
                    };
                }

                return { result: true };
            },
            osType: (value) => {
                return {
                    result: isValidOSType(value),
                    message: `Valid values are ${validOSTypes.join(', ')}`
                };
            },
            diskSizeGB: (value) => {
                return _.isNil(value) ? {
                    result: true
                } : {
                        result: ((_.isFinite(value)) && value > 0),
                        message: 'Value must be greater than 0'
                    };
            },
            encryptionSettings: (value) => {
                return _.isNil(value) ? {
                    result: true
                } : {
                        validations: encryptionSettingsValidations
                    };
            }
        };

        return {
            validations: osDiskValidations
        };
    },
    dataDisks: (value, parent) => {
        // We will need this, so we'll capture here.
        let isManagedStorageAccounts = parent.storageAccounts.managed;
        let dataDiskValidations = {
            properties: {
                caching: (value) => {
                    return {
                        result: isValidCachingType(value),
                        message: `Valid values are ${validCachingType.join(', ')}`
                    };
                },
                createOption: (value) => {
                    if (!isValidCreateOptions(value)) {
                        return {
                            result: false,
                            message: `Valid values are ${validCreateOptions.join(', ')}`
                        };
                    }

                    if (isManagedStorageAccounts && value === 'attach') {
                        return {
                            result: false,
                            message: 'Value cannot be attach with managed disks'
                        };
                    }
                    return { result: true };
                },
                image: (value, parent) => {
                    if (parent.createOption === 'attach' && v.utilities.isNullOrWhitespace(value)) {
                        return {
                            result: false,
                            message: 'Value of image cannot be null or empty, if value of .dataDisks.createOption is attach'
                        };
                    }

                    return { result: true };
                },
                diskSizeGB: (value) => {
                    return {
                        result: ((_.isFinite(value)) && value > 0),
                        message: 'Value must be greater than 0'
                    };
                }
            },
            count: (value) => {
                return {
                    result: ((_.isFinite(value))),
                    message: 'Invalid value for count'
                };
            }
        };

        return {
            validations: dataDiskValidations
        };
    },
    existingWindowsServerlicense: (value, parent) => {
        if (_.isNil(value)) {
            return { result: true };
        }
        if (!_.isBoolean(value)) {
            return {
                result: false,
                message: 'Value must be Boolean'
            };
        }

        if (parent.osDisk.osType !== 'windows' && value) {
            return {
                result: false,
                message: 'Value cannot be true, if the osType is windows'
            };
        }
        return { result: true };
    },
    adminUsername: v.validationUtilities.isNotNullOrWhitespace,
    osAuthenticationType: (value, parent) => {
        let result = {
            result: true
        };

        if (!isValidOSAuthenticationType(value)) {
            result = {
                result: false,
                message: `Valid values for 'osAuthenticationType' are:  ${validOSAuthenticationTypes.join(',')}`
            };
        }
        if (value === 'ssh' && parent.osDisk.osType === 'windows') {
            result = {
                result: false,
                message: 'Valid value for osAuthenticationType for windows is: password'
            };
        }
        return result;
    },
    adminPassword: (value, parent) => {
        let result = {
            result: true
        };
        if ((parent.osAuthenticationType === 'password') && (v.utilities.isNullOrWhitespace(value))) {
            result = {
                result: false,
                message: 'adminPassword cannot be null, empty, or only whitespace if osAuthenticationType is password'
            };
        }
        return result;
    },
    sshPublicKey: (value, parent) => {
        let result = {
            result: true
        };

        if (parent.osAuthenticationType === 'ssh' && (v.utilities.isNullOrWhitespace(value))) {
            result = {
                result: false,
                message: 'sshPublicKey cannot be null, empty, or only whitespace if osAuthenticationType is ssh'
            };
        }
        return result;
    },
    storageAccounts: storageSettings.storageValidations,
    diagnosticStorageAccounts: storageSettings.diagnosticValidations,
    nics: (value, parent) => {
        let result = {
            validations: nicSettings.validations
        };

        if ((!_.isNil(value)) && (value.length > 0)) {
            if ((_.filter(value, (o) => { return o.isPrimary; })).length !== 1) {
                return {
                    result: false,
                    message: 'Virtual machine must have only 1 primary NetworkInterface.'
                };
            } else if (!_.isNil(parent.loadBalancerSettings)) {
                let errorMsg = '';
                value.forEach((nic, index) => {
                    nic.backendPoolsNames.forEach((bep) => {
                        if (!(_.map(parent.loadBalancerSettings.backendPools, (o) => { return o.name; })).includes(bep)) {
                            errorMsg += `BackendPool ${bep} specified in nic[${index}] is not valid.${os.EOL}`;
                        }
                    });
                    nic.inboundNatRulesNames.forEach((nat) => {
                        if (!(_.map(parent.loadBalancerSettings.inboundNatRules, (o) => { return o.name; })).includes(nat)) {
                            errorMsg += `InboundNatRule ${nat} specified in nic[${index}] is not valid.${os.EOL}`;
                        }
                    });
                });
                if (!v.utilities.isNullOrWhitespace(errorMsg)) {
                    return {
                        result: false,
                        message: errorMsg
                    };
                }

            }
        }
        return result;
    },
    availabilitySet: avSetSettings.validations,
    tags: v.tagsValidations,
    loadBalancerSettings: lbSettings.validations
};

let processorProperties = {
    existingWindowsServerlicense: (value, key, index, parent) => {
        if (parent.osDisk.osType === 'windows' && value) {
            return {
                licenseType: 'Windows_Server'
            };
        } else {
            return;
        }
    },
    availabilitySet: (value, key, index, parent) => {
        if (!value.useExistingAvailabilitySet && parent.vmCount < 2) {
            return {
                availabilitySet: null
            };
        }

        return {
            availabilitySet: {
                id: resources.resourceId(value.subscriptionId, value.resourceGroupName, 'Microsoft.Network/availabilitySets', value.name)
            }
        };
    },
    size: (value) => {
        return {
            hardwareProfile: {
                vmSize: value
            }
        };
    },
    imageReference: (value) => {
        return {
            storageProfile: {
                imageReference: value
            }
        };
    },
    osDisk: (value, key, index, parent, parentAccumulator, buildingBlockSettings) => {
        let instance = {
            name: parent.name.concat('-os.vhd'),
            createOption: value.createOption,
            caching: value.caching,
            osType: value.osType
        };

        if (value.hasOwnProperty('diskSizeGB')) {
            instance.diskSizeGB = value.diskSizeGB;
        }

        if (value.encryptionSettings) {
            instance.encryptionSettings = {
                diskEncryptionKey: {
                    secretUrl: value.encryptionSettings.diskEncryptionKey.secretUrl,
                    sourceVault: {
                        id: resources.resourceId(value.encryptionSettings.subscriptionId, value.encryptionSettings.resourceGroupName, 'Microsoft.KeyVault/vaults', value.encryptionSettings.diskEncryptionKey.sourceVaultName)
                    }
                },
                keyEncryptionKey: {
                    keyUrl: value.encryptionSettings.keyEncryptionKey.keyUrl,
                    sourceVault: {
                        id: resources.resourceId(value.encryptionSettings.subscriptionId, value.encryptionSettings.resourceGroupName, 'Microsoft.KeyVault/vaults', value.encryptionSettings.keyEncryptionKey.sourceVaultName)
                    }
                },
                enabled: true
            };
        }

        if (value.createOption === 'attach') {
            instance.image = {
                uri: value.image
            };
        } else if (parent.storageAccounts.managed) {
            instance.managedDisk = {
                storageAccountType: parent.storageAccounts.skuType
            };
        } else {
            let storageAccounts = _.cloneDeep(parent.storageAccounts.accounts);
            parentAccumulator.storageAccounts.forEach((account) => {
                storageAccounts.push(account.name);
            });
            let storageAccountToUse = index % storageAccounts.length;
            instance.vhd = {
                uri: `http://${storageAccounts[storageAccountToUse]}.blob.${buildingBlockSettings.cloud.suffixes.storageEndpoint}/vhds/${parent.name}-os.vhd`
            };
        }

        return {
            storageProfile: {
                osDisk: instance
            }
        };
    },
    dataDisks: (value, key, index, parent, parentAccumulator, buildingBlockSettings) => {
        let disks = [];
        for (let i = 0; i < value.count; i++) {
            let instance = {
                name: 'dataDisk'.concat(i + 1),
                diskSizeGB: value.properties.diskSizeGB,
                lun: i,
                caching: value.properties.caching,
                createOption: value.properties.createOption
            };
            if (value.properties.createOption === 'attach') {
                instance.image = {
                    uri: value.properties.image
                };
            } else if (parent.storageAccounts.managed) {
                instance.managedDisk = {
                    storageAccountType: parent.storageAccounts.skuType
                };
            } else {
                let storageAccounts = _.cloneDeep(parent.storageAccounts.accounts);
                parentAccumulator.storageAccounts.forEach((account) => {
                    storageAccounts.push(account.name);
                });
                let storageAccountToUse = index % storageAccounts.length;
                instance.vhd = {
                    uri: `http://${storageAccounts[storageAccountToUse]}.blob.${buildingBlockSettings.cloud.suffixes.storageEndpoint}/vhds/${parent.name}-dataDisk${i + 1}.vhd`
                };
            }

            disks.push(instance);
        }
        return {
            storageProfile: {
                dataDisks: disks
            }
        };
    },
    nics: (value, key, index, parent, parentAccumulator) => {
        let ntwkInterfaces = _.transform(parentAccumulator.nics, (result, n) => {
            if (_.includes(n.name, parent.name)) {
                let nicRef = {
                    id: resources.resourceId(parent.subscriptionId, parent.resourceGroupName, 'Microsoft.Network/networkInterfaces', n.name),
                    properties: {
                        primary: n.primary
                    }
                };
                result.push(nicRef);
            }
            return result;
        }, []);
        return {
            networkProfile: {
                networkInterfaces: ntwkInterfaces
            }
        };
    },
    diagnosticStorageAccounts: (value, key, index, parent, parentAccumulator, buildingBlockSettings) => {
        // get the diagonstic account name for the VM
        let diagnosticAccounts = _.cloneDeep(parent.diagnosticStorageAccounts.accounts);
        parentAccumulator.diagnosticStorageAccounts.forEach((account) => {
            diagnosticAccounts.push(account.name);
        });
        let diagnosticAccountToUse = index % diagnosticAccounts.length;
        let diagnosticAccountName = diagnosticAccounts[diagnosticAccountToUse];

        return {
            diagnosticsProfile: {
                bootDiagnostics: {
                    enabled: true,
                    storageUri: `http://${diagnosticAccountName}.blob.${buildingBlockSettings.cloud.suffixes.storageEndpoint}`
                }
            }
        };
    },
    computerNamePrefix: (value, key, index) => {
        return {
            osProfile: {
                computerName: value.concat('-vm', index + 1)
            }
        };
    },
    adminPassword: (value, key, index, parent) => {
        if (_.toLower(parent.osAuthenticationType) === 'password') {
            if (parent.osDisk.osType === 'windows') {
                return {
                    osProfile: {
                        adminPassword: '$SECRET$',
                        windowsConfiguration: {
                            provisionVmAgent: true
                        }
                    }
                };
            } else {
                return {
                    osProfile: {
                        adminPassword: '$SECRET$',
                        linuxConfiguration: null
                    }
                };
            }
        }
    },
    sshPublicKey: (value, key, index, parent) => {
        if (_.toLower(parent.osAuthenticationType) === 'ssh') {
            return {
                osProfile: {
                    adminPassword: null,
                    linuxConfiguration: {
                        disablePasswordAuthentication: true,
                        ssh: {
                            publicKeys: [
                                {
                                    path: `/home/${parent.adminUsername}/.ssh/authorized_keys`,
                                    keyData: '$SECRET$'
                                }
                            ]
                        }
                    }
                }
            };
        }
    },
    adminUsername: (value) => {
        return {
            osProfile: {
                adminUsername: value
            }
        };
    }
};

let processChildResources = {
    storageAccounts: (value, key, index, parent, accumulator) => {
        if (!accumulator.hasOwnProperty('storageAccounts')) {
            let mergedCol = (accumulator['storageAccounts'] || (accumulator['storageAccounts'] = [])).concat(storageSettings.transform(value, parent));
            accumulator.storageAccounts = mergedCol;
        }
    },
    diagnosticStorageAccounts: (value, key, index, parent, accumulator) => {
        if (!accumulator.hasOwnProperty('diagnosticStorageAccounts')) {
            let mergedCol = (accumulator['diagnosticStorageAccounts'] || (accumulator['diagnosticStorageAccounts'] = [])).concat(storageSettings.transform(value, parent));
            accumulator.diagnosticStorageAccounts = mergedCol;
        }
    },
    nics: (value, key, index, parent, accumulator) => {
        let col = nicSettings.processNetworkInterfaceSettings(value, parent, index);

        let mergedCol = (accumulator['nics'] || (accumulator['nics'] = [])).concat(col.nics);
        accumulator['nics'] = mergedCol;
        mergedCol = (accumulator['pips'] || (accumulator['pips'] = [])).concat(col.pips);
        accumulator['pips'] = mergedCol;
    },
    availabilitySet: (value, key, index, parent, accumulator) => {
        if (value.useExistingAvailabilitySet || parent.vmCount < 2) {
            accumulator['availabilitySet'] = [];
        } else if (!accumulator.hasOwnProperty('availabilitySet')) {
            accumulator['availabilitySet'] = avSetSettings.processAvSetSettings(value, parent);
        }
    },
    osDisk: (value, key, index, parent, accumulator) => {
        if (value.osType === 'linux' && _.toLower(parent.osAuthenticationType) === 'ssh') {
            accumulator['secret'] = parent.sshPublicKey;
        } else {
            accumulator['secret'] = parent.adminPassword;
        }
    },
};

function processVMStamps(param) {
    // resource template do not use the vmCount property. Remove from the template
    let vmCount = param.vmCount;
    // deep clone settings for the number of VMs required (vmCount)  
    return _.transform(_.castArray(param), (result, n) => {
        for (let i = 0; i < vmCount; i++) {
            let stamp = _.cloneDeep(n);
            stamp.name = n.namePrefix.concat('-vm', i + 1);

            // delete namePrefix property since we wont need it anymore
            delete stamp.namePrefix;
            result.push(stamp);
        }
        return result;
    }, []);
}

function process(param, buildingBlockSettings) {
    let processedParams = _.transform(processVMStamps(param, buildingBlockSettings), (result, n, index) => {
        for (let prop in n) {
            if (typeof processChildResources[prop] === 'function') {
                processChildResources[prop](n[prop], prop, index, n, result);
            }
        }
        result.virtualMachines.push(_.transform(n, (inner, value, key, obj) => {
            if (typeof processorProperties[key] === 'function') {
                _.merge(inner.properties, processorProperties[key](value, key, index, obj, _.cloneDeep(result), buildingBlockSettings));
            } else if (key === 'name') {
                inner[key] = value;
            } else if (key === 'tags') {
                inner[key] = value;
            }
            //_.merge(inner, (typeof processorProperties[key] === 'function') ? processorProperties[key](value, key, index, obj, _.cloneDeep(result)) : `{${key}: ${value}}`);
            return inner;
        }, { properties: {} }));
        return result;
    }, { virtualMachines: [] });

    return processedParams;
}

function transform(settings, buildingBlockSettings, userDefaults) {
    // Merge
    let mergedSettings = merge({ settings, buildingBlockSettings, userDefaults });

    // Validate
    let errors = validate(mergedSettings);

    if (errors.length > 0) {
        throw new Error(JSON.stringify(errors));
    }

    return process(mergedSettings, buildingBlockSettings);
}

exports.process = transform;

