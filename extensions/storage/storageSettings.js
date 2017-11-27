'use strict';

const fs = require('fs');

// We need to export a different way since we have to get the require() stuff to play nice
module.exports = (application) => {
    let _ = application.require('lodash');
    let v = application.require('./core/validation');
    let r = application.require('./core/resources');
    let az = application.require('./azCLI');

    const STORAGE_SETTINGS_DEFAULTS = {
        kind: 'Storage',
        sku: 'Standard_LRS',
        supportsHttpsTrafficOnly: true,
        encryptBlobStorage: false,
        encryptFileStorage: false,
        encryptQueueStorage: false,
        encryptTableStorage: false,
        keyVaultProperties: {},
        tables: [],
        queues: [
            {
                metadata: {}
            }
        ],
        containers: [
            {
                publicAccess: 'Off',
                metadata: {}
            }
        ],
        shares: [
            {
                metadata: {}
            }
        ]
    };

    const nameRegex = /^[0-9a-z]{3,24}$/;
    const tableNameRegex = /^[a-z]{1}[0-9a-z]{2,62}$/i;
    const queueNameRegex = /^[a-z0-9](?!.*--)[0-9a-z-]{1,61}[a-z0-9]$/;
    const containerNameRegex = /^[a-z0-9](?!.*--)[0-9a-z-]{1,61}[a-z0-9]$/;
    const shareNameRegex = /^[^\\/[\]:|<>+=;,*?"\x00-\x1f]{1,80}$/i;
    // JavaScript's Unicode handling is not great, so for now, metadata names will be limited until we decide to pull in an npm package to make it better.
    const metadataNameRegex = /^[a-z0-9_][0-9a-z_-]*$/i;
    let validAccessTiers = ['Cool', 'Hot'];
    let validKinds = ['BlobStorage', 'Storage'];
    let validSkuNames = ['Premium_LRS', 'Standard_GRS', 'Standard_LRS', 'Standard_RAGRS', 'Standard_ZRS'];
    let validContainerPublicAccesses = ['Blob', 'Container', 'Off'];

    let isValidAccessTier = (accessTier) => {
        return v.utilities.isStringInArray(accessTier, validAccessTiers);
    };

    let isValidKind = (kind) => {
        return v.utilities.isStringInArray(kind, validKinds);
    };

    let isValidSkuName = (skuName) => {
        return v.utilities.isStringInArray(skuName, validSkuNames);
    };

    let isValidContainerPublicAccess = (containerPublicAccess) => {
        return v.utilities.isStringInArray(containerPublicAccess, validContainerPublicAccesses);
    };

    let findDuplicateNames = (value) => {
        let names = _.reduce(value, (accumulator, value) => {
            if (!v.utilities.isNullOrWhitespace(value.name)) {
                if (!accumulator[value.name]) {
                    accumulator[value.name] = 0;
                }
                accumulator[value.name] = accumulator[value.name] + 1;
            }

            return accumulator;
        }, {});

        let duplicates = _.reduce(names, (accumulator, value, key) => {
            if (value > 1) {
                accumulator.push(key);
            }

            return accumulator;
        }, []);

        return duplicates;
    };

    let metadataValidations = (value) => {
        let result = {
            result: true
        };
    
        // Tags are optional, but all defaults should have an empty object set
        if (_.isNil(value)) {
            result = {
                result: false,
                message: 'Value cannot be undefined or null'
            };
        } else if (!_.isPlainObject(value)) {
            // If this is not an object, the value is invalid
            result = {
                result: false,
                message: 'metadata must be a json object'
            };
        } else {
            let keys = Object.keys(value);
            // Validate the names
            let invalidNames = _.reduce(keys, (accumulator, value) => {
                if (!metadataNameRegex.test(value)) {
                    accumulator.push(value);
                }

                return accumulator;
            }, []);

            if (invalidNames.length > 0) {
                result = {
                    result: false,
                    message: `Invalid metadata name(s): ${invalidNames.join(',')}`
                };
            } else {
                let invalidValues = _.reduce(value, (accumulator, value, key) => {
                    if (_.isNil(value)) {
                        accumulator.push(key);
                    }

                    return accumulator;
                }, []);

                if (invalidValues.length > 0) {
                    result = {
                        result: false,
                        message: `Invalid metadata values for key(s): ${invalidValues.join(',')}`
                    };
                }
            }
        }
    
        return result;
    };

    let storageValidations = {
        name: (value) => {
            return {
                result: nameRegex.test(value),
                message: 'Storage account name must be between 3 and 24 characters and use numbers and lowercase letters only'
            };
        },
        kind: (value) => {
            return {
                result: isValidKind(value),
                message: `Value must be one of the following values: ${validKinds.join(',')}`
            };
        },
        sku: (value) => {
            return {
                result: isValidSkuName(value),
                message: `Value must be one of the following values: ${validSkuNames.join(',')}`
            };
        },
        accessTier: (value, parent) => {
            if (parent.kind === 'Storage') {
                return {
                    result: _.isUndefined(value),
                    message: 'Value cannot be specified when kind is "Storage"'
                };
            }

            if (parent.kind === 'BlobStorage') {
                return {
                    result: isValidAccessTier(value),
                    message: `Value must be one of the following values: ${validAccessTiers.join(',')}`
                };
            }
        },
        supportsHttpsTrafficOnly: v.validationUtilities.isBoolean,
        encryptBlobStorage: v.validationUtilities.isBoolean,
        encryptFileStorage: v.validationUtilities.isBoolean,
        encryptQueueStorage: v.validationUtilities.isBoolean,
        encryptTableStorage: v.validationUtilities.isBoolean,
        keyVaultProperties: (value) => {
            if (_.isNil(value) || Object.keys(value).length === 0) {
                return {
                    result: true
                };
            }
            let keyVaultValidations = {
                keyName: v.validationUtilities.isNotNullOrWhitespace,
                keyVersion: v.validationUtilities.isNotNullOrWhitespace,
                keyVaultUri: v.validationUtilities.isNotNullOrWhitespace
            };
    
            return {
                validations: keyVaultValidations
            };
        },
        tables: (value) => {
            if (_.isNil(value) || !_.isArray(value)) {
                return {
                    result: false,
                    message: 'Value must be an array'
                }
            }

            let duplicates = findDuplicateNames(value);

            if (duplicates.length > 0) {
                return {
                    result: false,
                    message: `Duplicate table names: ${duplicates.join(',')}`
                };
            }

            return {
                validations: {
                    name: (value) => {
                        return {
                            result: tableNameRegex.test(value),
                            message: 'The name may contain only alphanumeric characters and cannot begin with a numeric character. It is case-insensitive and must be from 3 to 63 characters long.'
                        };
                    }
                }
            }
        },
        queues: (value) => {
            if (_.isNil(value) || !_.isArray(value)) {
                return {
                    result: false,
                    message: 'Value must be an array'
                }
            }

            let duplicates = findDuplicateNames(value);
            
            if (duplicates.length > 0) {
                return {
                    result: false,
                    message: `Duplicate queue names: ${duplicates.join(',')}`
                };
            }

            return {
                validations: {
                    name: (value) => {
                        return {
                            result: queueNameRegex.test(value),
                            message: 'The name may contain only alphanumeric characters and the dash (-) character, the first and last characters must be alphanumeric, consecutive dash characters are not allowed, all letters must be lowercase, and the name must be from 3 to 63 characters long.'
                        };
                    },
                    metadata: metadataValidations
                }
            }
        },
        containers: (value) => {
            if (_.isNil(value) || !_.isArray(value)) {
                return {
                    result: false,
                    message: 'Value must be an array'
                }
            }

            let duplicates = findDuplicateNames(value);
            
            if (duplicates.length > 0) {
                return {
                    result: false,
                    message: `Duplicate container names: ${duplicates.join(',')}`
                };
            }

            return {
                validations: {
                    name: (value) => {
                        return {
                            result: tableNameRegex.test(value),
                            message: 'The name may contain only alphanumeric characters and the dash (-) character, the first and last characters must be alphanumeric, consecutive dash characters are not allowed, all letters must be lowercase, and the name must be from 3 to 63 characters long.'
                        };
                    },
                    publicAccess: (value) => {
                        return {
                            result: isValidContainerPublicAccess(value),
                            message: `Value must be one of the following values: ${validContainerPublicAccesses.join(',')}`
                        };
                    },
                    metadata: metadataValidations
                }
            }
        },
        shares: (value) => {
            if (_.isNil(value) || !_.isArray(value)) {
                return {
                    result: false,
                    message: 'Value must be an array'
                }
            }

            let duplicates = findDuplicateNames(value);
            
            if (duplicates.length > 0) {
                return {
                    result: false,
                    message: `Duplicate share names: ${duplicates.join(',')}`
                };
            }

            return {
                validations: {
                    name: (value) => {
                        return {
                            result: shareNameRegex.test(value),
                            message: 'The name must be between 1 and 80 characters in length cannot contain the following characters: \\ / [ ] : | < > + = ; , * ? "'
                        };
                    },
                    quota: (value) => {
                        if (!_.isUndefined(value)) {
                            return {
                                result: _.inRange(value, 1, 5121),
                                message: `Value must be greater than 0 and less than or equal to 5120'`
                            };
                        }

                        return {
                            result: true
                        };
                    },
                    metadata: metadataValidations
                }
            }
        }
    };

    let validate = (settings) => {
        let errors = v.validate({
            settings: settings,
            validations: storageValidations
        });

        return errors;
    };

    let merge = ({ settings, buildingBlockSettings, defaultSettings }) => {
        let defaults = (defaultSettings) ? [STORAGE_SETTINGS_DEFAULTS, defaultSettings] : STORAGE_SETTINGS_DEFAULTS;

        let merged = r.setupResources(settings, buildingBlockSettings, (parentKey) => {
            return (parentKey === null);
        });

        return v.merge(merged, defaults);
    };

    function transform(settings) {
        let instance = {
            resourceGroupName: settings.resourceGroupName,
            subscriptionId: settings.subscriptionId,
            location: settings.location,
            name: settings.name,
            kind: settings.kind,
            sku: {
                name: settings.sku
            },
            properties: {
                supportsHttpsTrafficOnly: settings.supportsHttpsTrafficOnly,
                encryption: {
                    services: {
                        blob: {
                            enabled: settings.encryptBlobStorage
                        },
                        file: {
                            enabled: settings.encryptFileStorage
                        },
                        queue: {
                            enabled: settings.encryptQueueStorage
                        },
                        table: {
                            enabled: settings.encryptTableStorage
                        }
                    }
                }
            }
        };

        if (settings.encryptBlobStorage === true || settings.encryptFileStorage === true ||
            settings.encryptQueueStorage === true || settings.encryptTableStorage === true) {
            if (Object.keys(settings.keyVaultProperties).length > 0) {
                instance.properties.encryption.keySource = 'Microsoft.Keyvault';
                instance.properties.encryption.keyvaultproperties = {
                    keyname: settings.keyVaultProperties.keyName,
                    keyversion: settings.keyVaultProperties.keyVersion,
                    keyvaulturi: settings.keyVaultProperties.keyVaultUri,
                };
            } else {
                instance.properties.encryption.keySource = 'Microsoft.Storage';
            }
        }

        return instance;
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

        let errors = validate(results);

        if (errors.length > 0) {
            throw new Error(JSON.stringify(errors));
        }

        let postDeploymentParameter = {
            storageAccounts: []
        };

        results = _.transform(results, (result, setting) => {
            result.storageAccounts.push(transform(setting));
            postDeploymentParameter.storageAccounts.push({
                name: setting.name,
                resourceGroupName: setting.resourceGroupName,
                subscriptionId: setting.subscriptionId,
                tables: setting.tables,
                queues: setting.queues,
                containers: setting.containers
            });
        }, {
            storageAccounts: []
        });

        let preDeploymentParameter = results;
        // Get needed resource groups information.
        let resourceGroups = r.extractResourceGroups(results.storageAccounts);
        return {
            resourceGroups: resourceGroups,
            parameters: results,
            preDeploymentParameter: preDeploymentParameter,
            preDeployment: ({storageAccounts}) => {
                // Subscription doesn't matter here so there is no need to set it.
                // We will check all names here and throw one exception that contains all of the invalid names.
                let existingStorageAccounts = _.filter(storageAccounts, (value) => {
                    let child = az.spawnAz({
                        args: [
                            'storage', 'account',
                            'check-name',
                            '--name', value.name,
                            '--output', 'json',
                            '--query', 'nameAvailable'
                        ],
                        spawnOptions: {
                            stdio: 'pipe',
                            shell: true
                        }
                    });

                    // The result has to be trimmed because it has a newline at the end and the logic is backwards
                    return (child.stdout.toString().trim() === 'false');
                });

                let storageAccountNames = _.map(existingStorageAccounts, (value) => {
                    return value.name;
                });

                if (storageAccountNames.length > 0) {
                    throw new Error(`One or more Storage account names already exist: ${storageAccountNames.join(',')}`);
                }
            },
            postDeploymentParameter: postDeploymentParameter,
            postDeployment: ({ storageAccounts }) => {
                _.forEach(storageAccounts, (storageAccount) => {
                    // Set the subscription since we don't know which subscription we may be in for this resource
                    az.setSubscription({
                        subscriptionId: storageAccount.subscriptionId
                    });

                    let storageAccountKey;
                    if ((storageAccount.tables.length > 0) || (storageAccount.queues.length > 0) ||
                    (storageAccount.containers.length > 0) || (storageAccount.shares.length > 0)) {
                        let child = az.spawnAz({
                            args: [
                                'storage', 'account', 'keys', 'list',
                                '--account-name', storageAccount.name,
                                '--resource-group', storageAccount.resourceGroupName,
                                '--output', 'json',
                                '--query', '[0].value'
                            ],
                            spawnOptions: {
                                stdio: 'pipe',
                                shell: true
                            }
                        });
    
                        storageAccountKey = _.trim(child.stdout.toString().trim(), '"');
                    }
                    _.forEach(storageAccount.tables, (table) => {
                        az.spawnAz({
                            args: [
                                'storage', 'table', 'create',
                                '--name', table.name,
                                '--account-name', storageAccount.name,
                                '--account-key', storageAccountKey
                            ],
                            spawnOptions: {
                                stdio: 'inherit',
                                shell: true
                            }
                        });
                    });

                    _.forEach(storageAccount.queues, (queue) => {
                        let args = [
                            'storage', 'queue', 'create',
                            '--name', queue.name,
                            '--account-name', storageAccount.name,
                            '--account-key', storageAccountKey
                        ];
                        if (!_.isEmpty(queue.metadata)) {
                            let pairs = _.transform(queue.metadata, (result, value, key) => {
                                result.push(`${key}=${value}`);
                            }, []);
                            args.push('--metadata', pairs.join(' '));
                        }
                        az.spawnAz({
                            args: args,
                            spawnOptions: {
                                stdio: 'inherit',
                                shell: true
                            }
                        });
                    });

                    _.forEach(storageAccount.containers, (container) => {
                        let args = [
                            'storage', 'container', 'create',
                            '--name', container.name,
                            '--public-access', container.publicAccess,
                            '--account-name', storageAccount.name,
                            '--account-key', storageAccountKey
                        ];

                        if (!_.isEmpty(container.metadata)) {
                            let pairs = _.transform(container.metadata, (result, value, key) => {
                                result.push(`${key}=${value}`);
                            }, []);
                            args.push('--metadata', pairs.join(' '));
                        }
                        az.spawnAz({
                            args: args,
                            spawnOptions: {
                                stdio: 'inherit',
                                shell: true
                            }
                        });
                    });

                    _.forEach(storageAccount.shares, (share) => {
                        let args = [
                            'storage', 'share', 'create',
                            '--name', share.name,
                            '--account-name', storageAccount.name,
                            '--account-key', storageAccountKey
                        ];

                        if (!_.isEmpty(share.metadata)) {
                            let pairs = _.transform(share.metadata, (result, value, key) => {
                                result.push(`${key}=${value}`);
                            }, []);
                            args.push('--metadata', pairs.join(' '));
                        }

                        if (!_.isUndefined(share.quota)) {
                            args.push('--quota', share.quota.toString());
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

    return {
        process: process
    };
};