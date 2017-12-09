'use strict';

let _ = require('lodash');
let v = require('./validation');
let r = require('./resources');
let az = require('../azCLI');

const KEYVAULT_SETTINGS_DEFAULTS = {
    sku: {
        family: 'A',
        name: 'Standard'
    },
    accessPolicies: [
        {
            permissions: {
                keys: [],
                secrets: [],
                certificates: []
            }
        }
    ],
    enabledForDeployment: false,
    enabledForDiskEncryption: false,
    enabledForTemplateDeployment: false,
    createMode: 'Default',
    keys: [
        {
            enabled: true,
            operations: [],
            tags: {}
        }
    ],
    secrets: [
        {
            enabled: true,
            tags: {}
        }
    ],
    certificates: [
        {
            enabled: true,
            enhancedKeyUsages: [],
            keyUsages: [],
            subjectAlternativeNames: {
                dnsNames: [],
                emails: [],
                upns: []
            },
            monthOfValidity: 12,
            issuer: {
                name: 'Self'
            },
            key: {
                exportable: false,
                size: 2048
            },
            lifetimeActions: [],
            tags: {}
        }
    ],
    tags: {}
};

let validSkuFamilies = ['A'];
let validSkuNames = ['Premium', 'Standard'];
let validCreateModes = ['Default', 'Recover'];
let validKeyPermissions = [
    'encrypt', 'decrypt', 'wrapKey', 'unwrapKey', 'sign', 'verify', 'get', 'list', 'create',
    'update', 'import', 'delete', 'backup', 'restore', 'recover', 'purge'
];
let validSecretPermissions = ['get', 'list', 'set', 'delete', 'backup', 'restore', 'recover', 'purge'];
let validCertificatePermissions = [
    'get', 'list', 'delete', 'create', 'import', 'update', 'managecontacts',
    'getissuers', 'listissuers', 'setissuers', 'deleteissuers', 'manageissuers', 'recover', 'purge'];

let validKeyProtections = ['hsm', 'software'];
let validJsonWebKeyOperations = ['decrypt', 'encrypt', 'sign', 'unwrapKey', 'verify', 'wrapKey'];

let validActionTypes = ['AutoRenew', 'EmailContacts'];
let validKeyUsages = ['digitalSignature', 'nonRepudiation', 'keyEncipherment', 'dataEncipherment', 'keyAgreement', 'keyCertSign',
    'cRLSign', 'encipherOnly', 'decipherOnly'];

let isValidSkuFamily = (skuFamily) => {
    return v.utilities.isStringInArray(skuFamily, validSkuFamilies);
};

let isValidSkuName = (skuName) => {
    return v.utilities.isStringInArray(skuName, validSkuNames);
};

let isValidCreateMode = (createMode) => {
    return v.utilities.isStringInArray(createMode, validCreateModes);
};

let isValidKeyPermission = (keyPermission) => {
    return v.utilities.isStringInArray(keyPermission, validKeyPermissions);
};

let isValidSecretPermission = (secretPermission) => {
    return v.utilities.isStringInArray(secretPermission, validSecretPermissions);
};

let isValidCertificatePermission = (certificatePermission) => {
    return v.utilities.isStringInArray(certificatePermission, validCertificatePermissions);
};

let isValidKeyProtection = (keyProtection) => {
    return v.utilities.isStringInArray(keyProtection, validKeyProtections);
};

let isValidJsonWebKeyOperation = (jsonWebKeyOperation) => {
    return v.utilities.isStringInArray(jsonWebKeyOperation, validJsonWebKeyOperations);
};

let isValidActionType = (actionType) => {
    return v.utilities.isStringInArray(actionType, validActionTypes);
};

let isValidKeyUsage = (keyUsage) => {
    return v.utilities.isStringInArray(keyUsage, validKeyUsages);
};

let isValidDate = (value) => {
    // null is "valid", but gives use a Date with a valueOf() === 0, so handle this case.
    let date = new Date(value);
    return {
        result: !Number.isNaN(date.valueOf()) && (value !== null),
        message: 'Value must be a valid ISO-8601 date format (Y-m-d\'T\'H:M:S\'Z\')'
    };
};

let transformTagsToKeyValuePairs = (tags) => {
    let pairs = _.transform(tags, (result, value, key) => {
        result.push(`"${key}=${value}"`);
    }, []);
    return _.join(pairs, ' ');
};

let keyVaultValidations = {
    name: v.validationUtilities.isNotNullOrWhitespace,
    tenantId: v.validationUtilities.isGuid,
    sku: (value) => {
        if (_.isNil(value)) {
            return {
                result: false,
                message: 'Value cannot be null or undefined'
            };
        }

        return {
            validations: {
                family: (value) => {
                    return {
                        result: isValidSkuFamily(value),
                        message: `Value must be one of the following values: ${validSkuFamilies.join(',')}`
                    };
                },
                name: (value) => {
                    return {
                        result: isValidSkuName(value),
                        message: `Value must be one of the following values: ${validSkuNames.join(',')}`
                    };
                }
            }
        };
    },
    accessPolicies: (value, parent) => {
        if ((_.isNil(value) || !_.isArray(value) || value.length === 0)) {
            return {
                result: false,
                message: 'Value must be at least a one-element array'
            };
        }

        let tenantId = parent.tenantId;
        return {
            validations: {
                tenantId: (value) => {
                    return {
                        result: tenantId === value,
                        message: 'Value must match KeyVault tenantId'
                    };
                },
                objectId: v.validationUtilities.isGuid,
                applicationId: (value) => {
                    if (_.isNil(value)) {
                        return {
                            result: true
                        };
                    }

                    return {
                        result: v.utilities.isGuid(value),
                        message: 'Value must be a valid guid'
                    };
                },
                permissions: {
                    keys: (value) => {
                        if (!_.isArray(value)) {
                            return {
                                result: false,
                                message: 'Value must be an array'
                            };
                        }

                        return {
                            validations: (value) => {
                                return {
                                    result: isValidKeyPermission(value),
                                    message: `Value must be one of the following values: ${validKeyPermissions.join(',')}`
                                };
                            }
                        };
                    },
                    secrets: (value) => {
                        if (!_.isArray(value)) {
                            return {
                                result: false,
                                message: 'Value must be an array'
                            };
                        }

                        return {
                            validations: (value) => {
                                return {
                                    result: isValidSecretPermission(value),
                                    message: `Value must be one of the following values: ${validSecretPermissions.join(',')}`
                                };
                            }
                        };
                    },
                    certificates: (value) => {
                        if (!_.isArray(value)) {
                            return {
                                result: false,
                                message: 'Value must be an array'
                            };
                        }

                        return {
                            validations: (value) => {
                                return {
                                    result: isValidCertificatePermission(value),
                                    message: `Value must be one of the following values: ${validCertificatePermissions.join(',')}`
                                };
                            }
                        };
                    }
                }
            }
        };
    },
    enabledForDeployment: v.validationUtilities.isBoolean,
    enabledForDiskEncryption: v.validationUtilities.isBoolean,
    enabledForTemplateDeployment: v.validationUtilities.isBoolean,
    enableSoftDelete: (value) => {
        if (_.isNil(value)) {
            return {
                result: true
            };
        }

        if (!_.isBoolean(value)) {
            return {
                result: false,
                message: 'Value must be a boolean value'
            };
        }

        if (!value) {
            return {
                result: false,
                message: 'Value cannot be false'
            };
        }

        return {
            result: true
        };
    },
    createMode: (value) => {
        return {
            result: isValidCreateMode(value),
            message: `Value must be one of the following values: ${validCreateModes.join(',')}`
        };
    },
    keys: (value) => {
        if (!_.isArray(value)) {
            return {
                result: false,
                message: 'Value cannot be null or undefined, and must be an array'
            };
        }

        if (value.length === 0) {
            return { result: true };
        }

        let validations = {
            name: v.validationUtilities.isNotNullOrWhitespace,
            protection: (value) => {
                return {
                    result: isValidKeyProtection(value),
                    message: `Value must be one of the following values: ${validKeyProtections.join(',')}`
                };
            },
            enabled: v.validationUtilities.isBoolean,
            expires: (value) => {
                if (_.isUndefined(value)) {
                    return {
                        result: true
                    };
                }

                return {
                    validations: isValidDate
                };
            },
            notBefore: (value) => {
                if (_.isUndefined(value)) {
                    return {
                        result: true
                    };
                }

                return {
                    validations: isValidDate
                };
            },
            operations: (value) => {
                if ((_.isUndefined(value)) || ((_.isArray(value)) && (value.length === 0))) {
                    return { result: true };
                }

                if (_.isNil(value)) {
                    return {
                        result: false,
                        message: 'Value cannot be null'
                    };
                }

                return {
                    validations: (value) => {
                        return {
                            result: isValidJsonWebKeyOperation(value),
                            message: `Value must be one of the following values: ${validJsonWebKeyOperations.join(',')}`
                        };
                    }
                };
            },
            size: (value) => {
                if (_.isUndefined(value)) {
                    return {
                        result: true
                    };
                } else {
                    return {
                        result: (_.isSafeInteger(value) && ((value === 2048) || (value === 3072) || (value === 4096))),
                        message: 'Value must be a positive integer'
                    };
                }
            },
            tags: v.tagsValidations
        };

        return {
            validations: validations
        };
    },
    secrets: (value) => {
        if (!_.isArray(value)) {
            return {
                result: false,
                message: 'Value cannot be null or undefined, and must be an array'
            };
        }

        if (value.length === 0) {
            return { result: true };
        }

        let validations = {
            name: v.validationUtilities.isNotNullOrWhitespace,
            contentType: (value) => {
                if (_.isUndefined(value)) {
                    return { result: true };
                } else {
                    return v.validationUtilities.isNotNullOrWhitespace(value);
                }
            },
            value: v.validationUtilities.isNotNullOrWhitespace,
            enabled: v.validationUtilities.isBoolean,
            expires: (value) => {
                if (_.isUndefined(value)) {
                    return {
                        result: true
                    };
                }

                return {
                    validations: isValidDate
                };
            },
            notBefore: (value) => {
                if (_.isUndefined(value)) {
                    return {
                        result: true
                    };
                }

                return {
                    validations: isValidDate
                };
            },
            tags: v.tagsValidations
        };

        return {
            validations: validations
        };
    },
    certificates: (value) => {
        if (!_.isArray(value)) {
            return {
                result: false,
                message: 'Value cannot be null or undefined, and must be an array'
            };
        }

        if (value.length === 0) {
            return { result: true };
        }

        let validations = {
            name: v.validationUtilities.isNotNullOrWhitespace,
            contentType: (value) => {
                if (_.isUndefined(value)) {
                    return { result: true };
                } else {
                    return v.validationUtilities.isNotNullOrWhitespace(value);
                }
            },
            enhancedKeyUsages: (value) => {
                if (!_.isArray(value)) {
                    return {
                        result: false,
                        message: 'Value cannot be null or undefined, and must be an array'
                    };
                }

                if (value.length === 0) {
                    return {
                        result: true
                    };
                }

                return {
                    validations: v.validationUtilities.isNotNullOrWhitespace
                };
            },
            keyUsages: (value) => {
                if (!_.isArray(value)) {
                    return {
                        result: false,
                        message: 'Value cannot be null or undefined, and must be an array'
                    };
                }

                if (value.length === 0) {
                    return {
                        result: true
                    };
                }

                return {
                    validations: (value) => {
                        return {
                            result: isValidKeyUsage(value),
                            message: `Value must be one of the following values: ${validKeyUsages.join(',')}`
                        };
                    }
                };
            },
            subjectAlternativeNames: (value) => {
                if (_.isNil(value)) {
                    return {
                        result: false,
                        message: 'Value cannot be null or undefined'
                    };
                }

                if (!_.isObject(value)) {
                    return {
                        result: false,
                        message: 'Value must be an object'
                    };
                }

                return {
                    validations: {
                        dnsNames: (value) => {
                            if (!_.isArray(value)) {
                                return {
                                    result: false,
                                    message: 'Value cannot be null or undefined, and must be an array'
                                };
                            }

                            if (value.length === 0) {
                                return {
                                    result: true
                                };
                            }

                            return {
                                validations: v.validationUtilities.isNotNullOrWhitespace
                            };
                        },
                        emails: (value) => {
                            if (!_.isArray(value)) {
                                return {
                                    result: false,
                                    message: 'Value cannot be null or undefined, and must be an array'
                                };
                            }

                            if (value.length === 0) {
                                return {
                                    result: true
                                };
                            }

                            return {
                                validations: v.validationUtilities.isNotNullOrWhitespace
                            };
                        },
                        upns: (value) => {
                            if (!_.isArray(value)) {
                                return {
                                    result: false,
                                    message: 'Value cannot be null or undefined, and must be an array'
                                };
                            }

                            if (value.length === 0) {
                                return {
                                    result: true
                                };
                            }

                            return {
                                validations: v.validationUtilities.isNotNullOrWhitespace
                            };
                        }
                    }
                };
            },
            subject: v.validationUtilities.isNotNullOrWhitespace,
            enabled: v.validationUtilities.isBoolean,
            monthsOfValidity: (value) => {
                return {
                    result: _.isSafeInteger(value) && value > 0,
                    message: 'Value must be a positive integer'
                };
            },
            issuer: (value) => {
                if (_.isNil(value)) {
                    return {
                        result: false,
                        message: 'Value cannot be null or undefined'
                    };
                }

                if (!_.isObject(value)) {
                    return {
                        result: false,
                        message: 'Value must be an object'
                    };
                }

                return {
                    validations: {
                        certificateType: (value) => {
                            if (_.isUndefined(value)) {
                                return {
                                    result: true
                                };
                            }

                            return {
                                validations: (value) => {
                                    return {
                                        result: !v.utilities.isNullOrWhitespace(value),
                                        message: 'Value cannot be null, empty, or only whitespace'
                                    };
                                }
                            };
                        },
                        name: v.validationUtilities.isNotNullOrWhitespace
                    }
                };
            },
            key: (value) => {
                if (_.isNil(value)) {
                    return {
                        result: false,
                        message: 'Value cannot be null or undefined'
                    };
                }

                if (!_.isObject(value)) {
                    return {
                        result: false,
                        message: 'Value must be an object'
                    };
                }

                return {
                    validations: {
                        exportable: v.validationUtilities.isBoolean,
                        size: (value) => {
                            return {
                                result: (value === 2048) || (value === 3072) || (value === 4096),
                                message: 'Value must be 2048, 3072, or 4096'
                            };
                        },
                        type: (value) => {
                            if (_.isUndefined(value)) {
                                return {
                                    result: true
                                };
                            }

                            return {
                                validations: v.validationUtilities.isNotNullOrWhitespace
                            };
                        },
                        reuseKeyOnRenewal: (value) => {
                            if (_.isUndefined(value)) {
                                return {
                                    result: true
                                };
                            }

                            return {
                                validations: v.validationUtilities.isBoolean
                            };
                        }
                    }
                };
            },
            lifetimeActions: (value, parent) => {
                if (!_.isArray(value)) {
                    return {
                        result: false,
                        message: 'Value cannot be null or undefined, and must be an array'
                    };
                }

                if (value.length === 0) {
                    return {
                        result: true
                    };
                }

                // The KeyVault RP actually only allows 1 lifetimeAction, but it is actually an array.  We will just limit it to 1, for now.
                if (value.length > 1) {
                    return {
                        result: false,
                        message: 'Only one lifetime action can be specified'
                    };
                }

                let monthsOfValidity = parent.monthsOfValidity;
                return {
                    validations: {
                        action: (value) => {
                            return {
                                result: isValidActionType(value),
                                message: `Value must be one of the following values: ${validActionTypes.join(',')}`
                            };
                        },
                        daysBeforeExpiration: (value, parent) => {
                            if ((!_.isUndefined(value) && !_.isUndefined(parent.lifetimePercentage)) ||
                            (_.isUndefined(value) && _.isUndefined(parent.lifetimePercentage))) {
                                return {
                                    result: false,
                                    message: 'Either daysBeforeExpiration or lifetimePercentage must be specified, but not both'
                                };
                            }

                            return {
                                result: _.isUndefined(value) || _.inRange(value, 1, (monthsOfValidity * 27) + 1),
                                message: 'Value must be between 1 and (monthsOfValidity * 27)'
                            };
                        },
                        lifetimePercentage: (value, parent) => {
                            if ((!_.isUndefined(value) && !_.isUndefined(parent.daysBeforeExpiration)) ||
                            (_.isUndefined(value) && _.isUndefined(parent.daysBeforeExpiration))) {
                                return {
                                    result: false,
                                    message: 'Either daysBeforeExpiration or lifetimePercentage must be specified, but not both'
                                };
                            }

                            return {
                                result: _.isUndefined(value) || _.inRange(value, 1, 100),
                                message: 'Value must be between 1 and 99'
                            };
                        }
                    }
                };
            },
            tags: v.tagsValidations
        };

        return {
            validations: validations
        };
    }
};

let validate = (settings) => {
    let errors = v.validate({
        settings: settings,
        validations: keyVaultValidations
    });

    return errors;
};

let merge = ({ settings, buildingBlockSettings, defaultSettings }) => {
    let defaults = (defaultSettings) ? [KEYVAULT_SETTINGS_DEFAULTS, defaultSettings] : KEYVAULT_SETTINGS_DEFAULTS;

    let merged = r.setupResources(settings, buildingBlockSettings, (parentKey) => {
        return (parentKey === null);
    });

    return v.merge(merged, defaults);
};

function transform(settings) {
    let result = {
        name: settings.name,
        tags: settings.tags,
        id: r.resourceId(settings.subscriptionId, settings.resourceGroupName, 'Microsoft.KeyVault/vaults', settings.name),
        resourceGroupName: settings.resourceGroupName,
        subscriptionId: settings.subscriptionId,
        location: settings.location,
        properties: {
            sku: settings.sku,
            tenantId: settings.tenantId,
            enabledForDeployment: settings.enabledForDeployment,
            enabledForDiskEncryption: settings.enabledForDiskEncryption,
            enabledForTemplateDeployment: settings.enabledForTemplateDeployment,
            createMode: settings.createMode,
            accessPolicies: settings.accessPolicies
        }
    };

    if (settings.enableSoftDelete) {
        result.properties.enableSoftDelete = settings.enableSoftDelete;
    }

    return result;
}

function process ({ settings, buildingBlockSettings, defaultSettings }) {
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

    let errors = validate(results);

    if (errors.length > 0) {
        throw new Error(JSON.stringify(errors));
    }

    let postDeploymentParameter = {
        keyVaults: []
    };

    results = _.transform(results, (result, setting) => {
        result.keyVaults.push(transform(setting));
        // Extract the secrets
        postDeploymentParameter.keyVaults.push({
            name: setting.name,
            keys: setting.keys,
            secrets: setting.secrets,
            certificates: _.map(setting.certificates, (certificate) => {
                // This shape is the Python SDKs shape, NOT the REST API shape!
                let policy = {
                    attributes: {
                        enabled: certificate.enabled
                    },
                    issuer_parameters: {
                        name: certificate.issuer.name
                    },
                    key_properties: {
                        exportable: certificate.key.exportable,
                        key_size: certificate.key.size
                    },
                    lifetime_actions: _.map(certificate.lifetimeActions, (lifetimeAction) => {
                        return {
                            action: {
                                action_type: lifetimeAction.action
                            },
                            trigger: _.isUndefined(lifetimeAction.lifetimePercentage) ? {
                                days_before_expiry: lifetimeAction.daysBeforeExpiration
                            } : {
                                lifetime_percentage: lifetimeAction.lifetimePercentage
                            }
                        };
                    }),
                    x509_certificate_properties: {
                        ekus: certificate.enhancedKeyUsages,
                        key_usage: certificate.keyUsages,
                        subject_alternative_names: {
                            dns_names: certificate.subjectAlternativeNames.dnsNames,
                            emails: certificate.subjectAlternativeNames.emails,
                            upns: certificate.subjectAlternativeNames.upns
                        },
                        subject: certificate.subject,
                        validity_in_months: certificate.monthsOfValidity
                    }
                };

                if (certificate.issuer.certificateType) {
                    policy.issuer_parameters.certificate_type = certificate.issuer.certificateType;
                }

                if (certificate.key.type) {
                    policy.key_properties.key_type = certificate.key.type;
                }

                if (!_.isUndefined(certificate.key.reuseKeyOnRenewal)) {
                    policy.key_properties.reuse_key = certificate.key.reuseKeyOnRenewal;
                }

                if (certificate.contentType) {
                    policy.secret_properties = {
                        content_type: certificate.contentType
                    };
                }

                return {
                    name: certificate.name,
                    policy: policy,
                    tags: certificate.tags
                };
            })
        });
    }, {
        keyVaults: []
    });

    // Get needed resource groups information.
    let resourceGroups = r.extractResourceGroups(results.keyVaults);
    return {
        resourceGroups: resourceGroups,
        parameters: results,
        postDeploymentParameter: postDeploymentParameter,
        postDeployment: ({keyVaults}) => {
            _.forEach(keyVaults, (keyVault) => {
                _.forEach(keyVault.keys, (key) => {
                    let args = ['keyvault', 'key', 'create', '--vault-name', keyVault.name,
                        '--name', key.name,
                        '--protection', key.protection];
                    if (key.enabled === false) {
                        args = args.concat(['--disabled']);
                    }
                    if (key.expires) {
                        let expires = new Date(key.expires).toISOString();
                        // We need this in the format az CLI will accept
                        expires = expires.substr(0, expires.indexOf('.')) + 'Z';
                        args = args.concat(['--expires', `${expires}`]);
                    }

                    if (key.notBefore) {
                        let notBefore = new Date(key.notBefore).toISOString();
                        notBefore = notBefore.substr(0, notBefore.indexOf('.')) + 'Z';
                        args = args.concat(['--not-before', `${notBefore}`]);
                    }

                    if (key.operations.length > 0) {
                        args = args.concat(['--ops', `${_.join(key.operations, ' ')}`]);
                    }

                    if (key.size) {
                        args = args.concat(['--size', `${key.size}`]);
                    }

                    if (!_.isEmpty(key.tags)) {
                        args = args.concat(['--tags', `${transformTagsToKeyValuePairs(key.tags)}`]);
                    }

                    az.spawnAz({
                        args: args,
                        spawnOptions: {
                            stdio: 'inherit',
                            shell: true
                        }
                    });
                });

                _.forEach(keyVault.secrets, (secret) => {
                    let args = ['keyvault', 'secret', 'set', '--vault-name', keyVault.name,
                        '--name', secret.name,
                        '--value', `"${secret.value}"`];
                    if (secret.contentType) {
                        args = args.concat(['--description', `"${secret.contentType}"`]);
                    }

                    if (secret.enabled === false) {
                        args = args.concat(['--disabled']);
                    }

                    if (secret.expires) {
                        let expires = new Date(secret.expires).toISOString();
                        // We need this in the format az CLI will accept
                        expires = expires.substr(0, expires.indexOf('.')) + 'Z';
                        args = args.concat(['--expires', `${expires}`]);
                    }

                    if (secret.notBefore) {
                        let notBefore = new Date(secret.notBefore).toISOString();
                        notBefore = notBefore.substr(0, notBefore.indexOf('.')) + 'Z';
                        args = args.concat(['--not-before', `${notBefore}`]);
                    }

                    if (!_.isEmpty(secret.tags)) {
                        args = args.concat(['--tags', `${transformTagsToKeyValuePairs(secret.tags)}`]);
                    }

                    az.spawnAz({
                        args: args,
                        spawnOptions: {
                            stdio: 'inherit',
                            shell: true
                        }
                    });
                });

                _.forEach(keyVault.certificates, (certificate) => {
                    // We stringify twice so we get the quotes escaped for az CLI
                    let args = ['keyvault', 'certificate', 'create', '--vault-name', keyVault.name,
                        '--name', certificate.name,
                        '--policy', `${JSON.stringify(JSON.stringify(certificate.policy))}`];

                    if (!_.isEmpty(certificate.tags)) {
                        args = args.concat(['--tags', `${transformTagsToKeyValuePairs(certificate.tags)}`]);
                    }

                    az.spawnAz({
                        args: args,
                        spawnOptions: {
                            stdio: 'inherit',
                            shell: true
                        }
                    });
                });
            });
        }
    };
}

let preProcess = (settings, buildingBlockSettings) => {
    // We need to look up the objectIds for the access policies to make our lives easier.
    // Remember that settings is s COPY of the actual settings so any mutations will not
    // be reflected in the calling code.  We need to return our new settings.
    settings = _.map(settings, (setting) => {
        let accessPolicies = _.transform(setting.accessPolicies, (result, value) => {
            // Let's save the upns, delete the upns property, and use what is left as our stamp
            let upns = value.upns;
            if (!_.isArray(upns) || upns.length === 0) {
                throw new Error('At least one upn must be provided for KeyVault access policies');
            }

            let objectIds = _.map(upns, (upn) => {
                let child = az.spawnAz({
                    args: ['ad', 'user', 'show', '--query', 'objectId', '--upn-or-object-id', upn],
                    spawnOptions: {
                        stdio: 'pipe',
                        shell: true
                    }
                });

                return _.trim(child.stdout.toString().trim(), '"');
            });

            _.forEach(objectIds, (objectId) => {
                let accessPolicy = _.omit(value, 'upns');
                accessPolicy.objectId = objectId;
                result.push(accessPolicy);
            });
        }, []);

        setting.accessPolicies = accessPolicies;
        return setting;
    });
    return settings;
};

exports.process = process;
exports.preProcess = preProcess;
