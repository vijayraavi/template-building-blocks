'use strict';

const fs = require('fs');

// We need to export a different way since we have to get the require() stuff to play nice
module.exports = (application) => {
    let _ = application.require('lodash');
    let v = application.require('./core/validation');
    let r = application.require('./core/resources');
    let az = application.require('./azCLI');

    const OMS_SETTINGS_DEFAULTS = {
        sku: 'Free',
        retention: 7,
        dataSources: [],
        savedSearches: [],
        solutions: [],
        storageAccounts: [],
        resources: []
    };

    let omsValidations = {
        name: v.validationUtilities.isNotNullOrWhitespace,
        retention: (value, parent) => {
            let lowerRange = parent.sku === 'Unlimited' ? -1 : 0;
            return _.inRange(value, lowerRange, 731);
        },
        sku: (value) => {
            return {
                result: isValidSku(value),
                message: `Value must be one of the following values: ${validSkus.join(',')}`
            };
        },
        dataSources: (value) => {
            if (_.isNil(value)) {
                return {
                    result: false,
                    message: 'Value cannot be null or undefined'
                };
            }

            if (!_.isArray) {
                return {
                    result: false,
                    message: 'Value must be an array'
                };
            }

            return {
                validations: {
                    name: v.validationUtilities.isNotNullOrWhitespace,
                    kind: (value) => {
                        return {
                            result: isValidDataSourceKind(value),
                            message: `Value must be one of the following values: ${validDataSourceKinds.join(',')}`
                        };
                    },
                    properties: (value) => {
                        // We can't really validate this yet.
                        return {
                            result: !_.isNil(value),
                            message: 'Value cannot be null or undefined'
                        };
                    }
                }
            };
        },
        savedSearches: (value) => {
            if (_.isNil(value)) {
                return {
                    result: false,
                    message: 'Value cannot be null or undefined'
                };
            }

            if (!_.isArray) {
                return {
                    result: false,
                    message: 'Value must be an array'
                };
            }

            return {
                validations: {
                    name: v.validationUtilities.isNotNullOrWhitespace,
                    category: v.validationUtilities.isNotNullOrWhitespace,
                    displayName: v.validationUtilities.isNotNullOrWhitespace,
                    query: v.validationUtilities.isNotNullOrWhitespace
                }
            };
        },
        solutions: (value) => {
            if (_.isNil(value)) {
                return {
                    result: false,
                    message: 'Value cannot be null or undefined'
                };
            }

            if (!_.isArray) {
                return {
                    result: false,
                    message: 'Value must be an array'
                };
            }

            return {
                validations: v.validationUtilities.isNotNullOrWhitespace
            };
        },
        storageAccounts: (value) => {
            if (_.isNil(value)) {
                return {
                    result: false,
                    message: 'Value cannot be null or undefined'
                };
            }

            if (!_.isArray) {
                return {
                    result: false,
                    message: 'Value must be an array'
                };
            }

            return {
                validations: {
                    name: v.validationUtilities.isNotNullOrWhitespace,
                    containers: (value) => {
                        if (_.isNil(value)) {
                            return {
                                result: false,
                                message: 'Value cannot be null or undefined'
                            };
                        }

                        if (!_.isArray) {
                            return {
                                result: false,
                                message: 'Value must be an array'
                            };
                        }

                        return {
                            validations: v.validationUtilities.isNotNullOrWhitespace
                        };
                    },
                    tables: (value) => {
                        if (_.isNil(value)) {
                            return {
                                result: false,
                                message: 'Value cannot be null or undefined'
                            };
                        }

                        if (!_.isArray) {
                            return {
                                result: false,
                                message: 'Value must be an array'
                            };
                        }

                        return {
                            validations: v.validationUtilities.isNotNullOrWhitespace
                        };
                    }
                }
            };
        },
        resources: (value) => {
            if (_.isNil(value)) {
                return {
                    result: false,
                    message: 'Value cannot be null or undefined'
                };
            }

            if (!_.isArray) {
                return {
                    result: false,
                    message: 'Value must be an array'
                };
            }

            return {
                validations: v.validationUtilities.isNotNullOrWhitespace
            };
        }
    };

    let validSkus = ['Free', 'PerNode', 'Premium', 'Standalone', 'Standard', 'Unlimited'];
    let validDataSourceKinds = [
        'AzureActivityLog',
        'ChangeTrackingCustomRegistry',
        'ChangeTrackingDefaultPath',
        'ChangeTrackingDefaultRegistry',
        'ChangeTrackingPath',
        'CustomLog',
        'CustomLogCollection',
        'GenericDataSource',
        'IISLogs',
        'LinuxPerformanceCollection',
        'LinuxPerformanceObject',
        'LinuxSyslog',
        'LinuxSyslogCollection',
        'WindowsEvent',
        'WindowsPerformanceCounter',
        'ImportComputerGroup',
        'WindowsTelemetry',
        // Are these extras?
        // Deprecated....use AzureActivityLog
        //'AzureAuditLog',
        'ChangeTrackingCustomPath',
        'ChangeTrackingRegistry',
        'ChangeTrackingLinuxPath',
        'LinuxChangeTrackingPath',
        'ChangeTrackingContentLocation',
        'SecurityWindowsBaselineConfiguration',
        'SecurityEventCollectionConfiguration',
        'AADIdentityProtection',
        'NetworkMonitoring'
    ];

    let isValidSku = (sku) => {
        return v.utilities.isStringInArray(sku, validSkus);
    };

    let isValidDataSourceKind = (dataSourceKind) => {
        return v.utilities.isStringInArray(dataSourceKind, validDataSourceKinds);
    };

    let validate = (settings) => {
        let errors = v.validate({
            settings: settings,
            validations: omsValidations
        });

        return errors;
    };

    let merge = ({ settings, buildingBlockSettings, defaultSettings }) => {
        let defaults = (defaultSettings) ? [OMS_SETTINGS_DEFAULTS, defaultSettings] : OMS_SETTINGS_DEFAULTS;

        let merged = r.setupResources(settings, buildingBlockSettings, (parentKey) => {
            return (parentKey === null) ||
                (parentKey === 'dataSources') ||
                (parentKey === 'savedSearches') ||
                (parentKey === 'solutions') ||
                (parentKey === 'storageAccounts');
        });

        return v.merge(merged, defaults);
    };

    function transform(settings) {
        let workspaceResourceId = r.resourceId(
            settings.subscriptionId,
            settings.resourceGroupName,
            'Microsoft.OperationalInsights/workspaces',
            settings.name);
        let result = {
            resourceGroupName: settings.resourceGroupName,
            subscriptionId: settings.subscriptionId,
            location: settings.location,
            name: settings.name,
            id: workspaceResourceId,
            properties: {
                sku: {
                    name: settings.sku
                },
                retention: settings.retention
            },
            dataSources: _.map(settings.dataSources, (value) => {
                return {
                    resourceGroupName: value.resourceGroupName,
                    subscriptionId: value.subscriptionId,
                    location: value.location,
                    name: value.name,
                    id: r.resourceId(
                        value.subscriptionId,
                        value.resourceGroupName,
                        'Microsoft.OperationalInsights/workspaces/dataSources',
                        settings.name,
                        value.name),
                    kind: value.kind,
                    properties: value.properties
                };
            }),
            savedSearches: _.map(settings.savedSearches, (value) => {
                return {
                    resourceGroupName: value.resourceGroupName,
                    subscriptionId: value.subscriptionId,
                    location: value.location,
                    name: value.name,
                    id: r.resourceId(
                        value.subscriptionId,
                        value.resourceGroupName,
                        'Microsoft.OperationalInsights/workspaces/savedSearches',
                        settings.name,
                        value.name),
                    properties: {
                        category: value.category,
                        displayName: value.displayName,
                        query: value.query,
                        version: 1
                    }
                };
            }),
            solutions: _.map(settings.solutions, (value) => {
                let solutionName = `${value}(${settings.name})`;
                let galleryName = `OMSGallery/${value}`;
                return {
                    resourceGroupName: value.resourceGroupName,
                    subscriptionId: value.subscriptionId,
                    location: value.location,
                    name: solutionName,
                    id: r.resourceId(settings.subscriptionId, settings.resourceGroupName, 'Microsoft.OperationsManagement/solutions', solutionName),
                    properties: {
                        workspaceResourceId: workspaceResourceId
                    },
                    plan: {
                        name: solutionName,
                        product: galleryName,
                        promotionCode: '',
                        publisher: 'Microsoft'
                    }
                };
            }),
            storageAccounts: _.map(settings.storageAccounts, (value) => {
                let resourceName = `${value.name}(${settings.name})`;
                return {
                    resourceGroupName: settings.resourceGroupName,
                    subscriptionId: settings.subscriptionId,
                    location: value.location,
                    name: resourceName,
                    id: r.resourceId(
                        settings.subscriptionId,
                        settings.resourceGroupName,
                        'Microsoft.OperationalInsights/workspaces/storageInsightConfigs',
                        settings.name,
                        resourceName),
                    properties: {
                        containers: value.containers,
                        tables: value.tables,
                        storageAccount: {
                            id: r.resourceId(value.subscriptionId, value.resourceGroupName, 'Microsoft.Storage/storageAccounts', value.name)
                        }
                    }
                };
            }),
            resources: _.transform(settings.resources, (result, value) => {
                let parts = value.split('/');
                let name = parts[8];
                let type = _.toLower(`${parts[6]}/${parts[7]}`);
                let diagnosticSettings = {
                    // Workaround for portal workspace view
                    // name: `${name}/Microsoft.Insights/${name}(${settings.name})`,
                    name: `${name}/Microsoft.Insights/service`,
                    subscriptionId: parts[2],
                    resourceGroupName: parts[4],
                    properties: {
                        workspaceId: workspaceResourceId,
                        logs: [],
                        metrics: []
                    }
                };
                switch (type) {
                case 'microsoft.network/applicationgateways':
                    diagnosticSettings.properties.logs.push({
                        category: 'ApplicationGatewayAccessLog',
                        enabled: true,
                        retentionPolicy: {
                            days: 0,
                            enabled: false
                        }
                    });
                    diagnosticSettings.properties.logs.push({
                        category: 'ApplicationGatewayPerformanceLog',
                        enabled: true,
                        retentionPolicy: {
                            days: 0,
                            enabled: false
                        }
                    });
                    diagnosticSettings.properties.logs.push({
                        category: 'ApplicationGatewayFirewallLog',
                        enabled: true,
                        retentionPolicy: {
                            days: 0,
                            enabled: false
                        }
                    });
                    diagnosticSettings.properties.metrics.push({
                        category: 'AllMetrics',
                        enabled: true,
                        retentionPolicy: {
                            days: 0,
                            enabled: false
                        }
                    });

                    result.applicationGateways.push(diagnosticSettings);
                    break;
                case 'microsoft.network/loadbalancers':
                    diagnosticSettings.properties.logs.push({
                        category: 'LoadBalancerAlertEvent',
                        enabled: true,
                        retentionPolicy: {
                            days: 0,
                            enabled: false
                        }
                    });
                    diagnosticSettings.properties.logs.push({
                        category: 'LoadBalancerProbeHealthStatus',
                        enabled: true,
                        retentionPolicy: {
                            days: 0,
                            enabled: false
                        }
                    });
                    diagnosticSettings.properties.metrics.push({
                        category: 'AllMetrics',
                        enabled: true,
                        retentionPolicy: {
                            days: 0,
                            enabled: false
                        }
                    });

                    result.loadBalancers.push(diagnosticSettings);
                    break;
                case 'microsoft.network/networksecuritygroups':
                    diagnosticSettings.properties.logs.push({
                        category: 'NetworkSecurityGroupEvent',
                        enabled: true,
                        retentionPolicy: {
                            days: 0,
                            enabled: false
                        }
                    });
                    diagnosticSettings.properties.logs.push({
                        category: 'NetworkSecurityGroupRuleCounter',
                        enabled: true,
                        retentionPolicy: {
                            days: 0,
                            enabled: false
                        }
                    });

                    result.networkSecurityGroups.push(diagnosticSettings);
                    break;
                }
            }, {
                loadBalancers: [],
                networkSecurityGroups: [],
                applicationGateways: []
            })
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

        let errors = validate(results);

        if (errors.length > 0) {
            throw new Error(JSON.stringify(errors));
        }

        results = _.transform(results, (result, setting) => {
            result.workspaces.push(transform(setting));
        }, {
            workspaces: []
        });

        let preDeploymentParameter = results;
        // Get needed resource groups information.
        let resourceGroups = r.extractResourceGroups(results.workspaces);
        return {
            resourceGroups: resourceGroups,
            parameters: results,
            preDeploymentParameter: preDeploymentParameter,
            preDeployment: ({workspaces}) => {
                workspaces.forEach((workspace) => {
                    let child = az.spawnAz({
                        args: ['resource', 'show', '--ids', workspace.id],
                        spawnOptions: {
                            stdio: 'pipe',
                            shell: true
                        }
                    });

                    let resource = child.stdout.toString().trim();
                    workspace.exists = resource.length === 0;
                });
            }
        };
    }

    return {
        process: process
    };
};