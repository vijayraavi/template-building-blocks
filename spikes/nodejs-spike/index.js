#!/usr/bin/env node
'use strict';

let commander = require('commander');
let fs = require('fs');
let path = require('path');
let _ = require('lodash');
let v = require('./core/validation');
const os = require('os');
const az = require('./azCLI');

let padInteger = (number, mask) => {
    if ((!_.isSafeInteger(number)) || (number < 0)) {
        throw new Error('number be a positive integer');
    }

    if (!_.isString(mask)) {
        throw new Error('mask must be a string');
    }
    let numberString = number.toString();
    return (mask.concat(numberString)).slice(-Math.max(mask.length, numberString.length));
};

let parseParameterFile = ({parameterFile}) => {
    // Resolve the path to be cross-platform safe
    parameterFile = path.resolve(parameterFile);
    let exists = fs.existsSync(parameterFile);
    if (!exists) {
        throw new Error(`parameters file '${commander.parametersFile}' does not exist`);
    }

    let content = fs.readFileSync(parameterFile, 'UTF-8');

    try {
        let json = JSON.parse(content.replace(/^\uFEFF/, ''));
        let parameters = json.parameters.buildingBlocks.value;
        return parameters;
    } catch (e) {
        throw new Error(`parameter file '${commander.parametersFile}' is not well-formed: ${e.message}`);
    }
};

let processParameters = ({buildingBlock, parameters, buildingBlockSettings, defaultsDirectory}) => {
    let processor = buildingBlock;

    let defaults;
    if (defaultsDirectory) {
        // Grab defaults, if they exist
        let defaultsFile = path.join(defaultsDirectory, `${processor.defaultsFilename}`);
        if (fs.existsSync(defaultsFile)) {
            try {
                let content = fs.readFileSync(defaultsFile, 'UTF-8');
                defaults = JSON.parse(content.replace(/^\uFEFF/, ''));
            } catch (e) {
                throw new Error(`error parsing '${defaultsFile}': ${e.message}`);
            }
        }
    }

    let results = processor.process({
        //settings: parameter,
        settings: parameters,
        buildingBlockSettings: buildingBlockSettings,
        defaultSettings: defaults
    });

    // Verify that any one resource group does not have multiple locations.
    // If this is the case, we can't know which one to use to create the resource group.
    // There is also a check for more than one subscription id (i.e. not the one in the building block settings).
    // If cross subscription deployments are ever implemented, remove this check.
    let groupedResourceGroups = _.map(_.uniqWith(_.map(results.resourceGroups, (value) => {
        return {
            subscriptionId: value.subscriptionId,
            resourceGroupName: value.resourceGroupName
        };
    }), _.isEqual), (value) => {
        value.locations = _.map(_.filter(results.resourceGroups, (rg) => {
            return ((rg.subscriptionId === value.subscriptionId) && (rg.resourceGroupName === value.resourceGroupName));
        }), (value) => {
            return value.location;
        });

        return value;
    });

    let invalidResourceGroups = _.filter(groupedResourceGroups, (value) => {
        return value.locations.length > 1;
    });

    if (invalidResourceGroups.length > 0) {
        let message = 'Resource groups for created resources can only be in one location';
        _.forEach(invalidResourceGroups, (value) => {
            message = message.concat(
                `${os.EOL}    subscriptionId: '${value.subscriptionId}' resourceGroup: '${value.resourceGroupName}' locations: '${value.locations.join(',')}'`);
        });
        throw new Error(message);
    }

    let invalidSubscriptions = _.filter(_.uniq(_.map(groupedResourceGroups, (value) => {
        return value.subscriptionId;
    })), (value) => {
        return value !== buildingBlockSettings.subscriptionId;
    });

    if (invalidSubscriptions.length > 0) {
        let message = 'Resource groups for created resources can only be in the deployment subscription';
        _.forEach(invalidSubscriptions, (value) => {
            message = message.concat(
                `${os.EOL}    invalid subscriptionId: '${value}'`);
        });
        throw new Error(message);
    }

    return results;
};

let getBuildingBlocks = ({baseUri}) => {
    if (_.isNil(baseUri)) {
        baseUri = 'https://raw.githubusercontent.com/mspnp/template-building-blocks/roshar/spikes/spikes/nodejs-spike/templates/';
    }

    // Clean the baseUri just in case it ends with /
    baseUri = _.trimEnd(baseUri, '/');

    return [
        {
            type: 'VirtualMachine',
            process: require('./core/virtualMachineSettings').process,
            defaultsFilename: 'virtualMachineSettings.json',
            template: _.join([baseUri, 'buildingBlocks/virtualMachines/virtualMachines.json'], '/')
        },
        {
            type: 'NetworkSecurityGroup',
            process: require('./core/networkSecurityGroupSettings').process,
            defaultsFilename: 'networkSecurityGroupSettings.json',
            template: _.join([baseUri, 'buildingBlocks/networkSecurityGroups/networkSecurityGroups.json'], '/')
        },
        {
            type: 'RouteTable',
            process: require('./core/routeTableSettings').process,
            defaultsFilename: 'routeTableSettings.json',
            template: _.join([baseUri, 'buildingBlocks/routeTables/routeTables.json'], '/')
        },
        {
            type: 'VirtualMachineExtension',
            process: ({settings, buildingBlockSettings}) => {
                let process = require('./core/virtualMachineExtensionsSettings').process;
                return process(settings, buildingBlockSettings);
            },
            defaultsFilename: 'virtualMachinesExtensionSettings.json',
            template: _.join([baseUri, 'buildingBlocks/virtualMachineExtensions/virtualMachineExtensions.json'], '/')
        },
        {
            type: 'VirtualNetwork',
            process: require('./core/virtualNetworkSettings').process,
            defaultsFilename: 'virtualNetworkSettings.json',
            template: _.join([baseUri, 'buildingBlocks/virtualNetworks/virtualNetworks.json'], '/')
        },
        {
            type: 'VirtualNetworkGateway',
            process: require('./core/virtualNetworkGatewaySettings').process,
            defaultsFilename: 'virtualNetworkGatewaySettings.json',
            template: _.join([baseUri, 'buildingBlocks/virtualNetworkGateways/virtualNetworkGateways.json'], '/')
        },
        {
            type: 'Connection',
            process: require('./core/connectionSettings').process,
            defaultsFilename: 'connectionSettings.json',
            template: _.join([baseUri, 'buildingBlocks/connections/connections.json'], '/')
        }
    ];
};

let createTemplateParameters = ({parameters}) => {
    let templateParameters = {
        $schema: 'http://schema.management.azure.com/schemas/2015-01-01/deploymentParameters.json#',
        contentVersion: '1.0.0.0',
        parameters: _.transform(parameters, (result, value, key) => {
            // All KeyVault parameters are named secret.  We need to see if it's a value, or if it is a KeyVault reference.
            if (key === 'secret') {
                if (_.isUndefined(value.reference)) {
                    result[key] = {
                        value: value
                    };
                } else {
                    result[key] = value;
                }
            } else {
                result[key] = {
                    value: value
                };
            }

            return result;
        }, {})
    };

    return templateParameters;
};

let validateSubscriptionId = (value) => {
    if (!v.utilities.isGuid(value)) {
        throw new Error(`invalid subscription-id '${value}'`);
    }

    return value;
};

let createResourceGroups = ({resourceGroups}) => {
    // We need to group them in an efficient way for the CLI
    resourceGroups = _.groupBy(resourceGroups, (value) => {
        return value.subscriptionId;
    });

    _.forOwn(resourceGroups, (value, key) => {
        // Set the subscription for the tooling so we can create the resource groups in the right subscription
        az.setSubscription({
            subscriptionId: key
        });
        _.forEach(value, (value) => {
            az.createResourceGroupIfNotExists({
                resourceGroupName: value.resourceGroupName,
                location: value.location
            });
        });
    });
};

let deployTemplate = ({parameterFile, buildingBlockSettings, buildingBlock}) => {
    // Get the current date in UTC and remove the separators.  We can use this as our deployment name.
    let deploymentName = `${_.camelCase(buildingBlock.type)}-${new Date().toISOString().replace(/[T\:\.\Z-]/g, '')}`;

    az.setSubscription({
        subscriptionId: buildingBlockSettings.subscriptionId
    });

    az.createResourceGroupIfNotExists({
        location: buildingBlockSettings.location,
        resourceGroupName: buildingBlockSettings.resourceGroupName,
    });

    // In case we have a SAS token, we need to append it to the template uri.  It will be passed into the building block in
    // the buildingBlockSettings objects as well.
    let templateUri = buildingBlock.template.concat(buildingBlockSettings.sasToken);
    az.deployTemplate({
        deploymentName: deploymentName,
        resourceGroupName: buildingBlockSettings.resourceGroupName,
        templateUri: templateUri,
        parameterFile: parameterFile
    });
};

let cloudName = 'AzureCloud';

try {
    commander
        .version('0.0.1')
        .option('-g, --resource-group <resource-group>', 'the name of the resource group')
        .option('-p, --parameters-file <parameters-file>', 'the path to a parameters file')
        .option('-o, --output-file <output-file>', 'the output file name')
        .option('-s, --subscription-id <subscription-id>', 'the subscription identifier', validateSubscriptionId)
        .option('-l, --location <location>', 'location in which to create the resource group, if it does not exist')
        .option('-d, --defaults-directory <defaults-directory>', 'directory containing customized building block default values')
        .option('--json', 'output JSON to console')
        .option('--deploy', 'deploy building block using az')
        .option('-t, --template-base-uri <template-base-uri>', 'base uri of building block templates')
        .option('-k, --sas-token <sas-token>', 'sas token to pass to the template-base-uri')
        .option('-c, --cloud, <cloud>', 'registered az cloud to use')
        .parse(process.argv);

    if (_.isUndefined(commander.parametersFile)) {
        throw new Error('no parameters file specified');
    }

    if ((commander.deploy === true) && (commander.json === true)) {
        throw new Error('--deploy cannot be used with --json');
    }

    commander.parametersFile = path.resolve(commander.parametersFile);
    // To make the interface easier, let's default a few things rather than making them explicit.
    // 1.  If neither json or outputFile is specified, assume output file is the intent, and default
    //     the outputFilename to be based on the parameter filename
    // 2.  If json is specified, no output filename is required. (We will still calculate a default, but we won't use it)
    // 3.  If outputFile is specified, we use that filename as the basis for our output filename
    // 4.  If both are specified, we'll just throw
    if ((!_.isUndefined(commander.outputFile)) && (!_.isUndefined(commander.json))) {
        throw new Error('--json cannot be used with --output-file');
    }
    
    if (!_.isUndefined(commander.outputFile)) {
        commander.outputFile = path.resolve(commander.outputFile);
    }

    if (!_.isUndefined(commander.defaultsDirectory)) {
        commander.defaultsDirectory = path.resolve(commander.defaultsDirectory);
        if (!fs.existsSync(commander.defaultsDirectory)) {
            throw new Error(`defaults path '${commander.defaultsDirectory}' was not found`);
        }
    }

    if (!_.isUndefined(commander.cloud)) {
        cloudName = commander.cloud;
    }

    let outputFile = _.isUndefined(commander.outputFile) ? commander.parametersFile : commander.outputFile;
    let outputBaseFilename = `${path.basename(outputFile, path.extname(outputFile))}-output`;
    let outputDirectory = _.isUndefined(commander.outputFile) ? process.cwd() : path.dirname(outputFile);

    let registeredClouds = az.getRegisteredClouds();
    let buildingBlocks = getBuildingBlocks({
        baseUri: commander.templateBaseUri
    });

    let cloud = _.find(registeredClouds, (value) => {
        return value.name === cloudName;
    });

    if (_.isUndefined(cloud)) {
        throw new Error(`cloud '${cloudName}' not found`);
    }

    let parameters = parseParameterFile({
        parameterFile: commander.parametersFile
    });

    parameters = _.castArray(parameters);

    let results = _.map(parameters, (value, index) => {
        // We need to validate that the subscriptionId, resourceGroupName, and location are not set on the parameter if they have
        // already been specified.
        if (((_.isUndefined(commander.subscriptionId)) && (_.isUndefined(value.subscriptionId))) ||
            ((!_.isUndefined(commander.subscriptionId)) && (!_.isUndefined(value.subscriptionId)))) {
            throw new Error(`parameters[${index}]:  subscriptionId was must be specified on the command line or must be a property of the parameter, but not both`);
        }

        if (((_.isUndefined(commander.resourceGroup)) && (_.isUndefined(value.resourceGroupName))) ||
            ((!_.isUndefined(commander.resourceGroup)) && (!_.isUndefined(value.resourceGroupName)))) {
            throw new Error(`parameters[${index}]:  resourceGroupName was must be specified on the command line or must be a property of the parameter, but not both`);
        }

        if (((_.isUndefined(commander.location)) && (_.isUndefined(value.location))) ||
            ((!_.isUndefined(commander.location)) && (!_.isUndefined(value.location)))) {
            throw new Error(`parameters[${index}]:  location was must be specified on the command line or must be a property of the parameter, but not both`);
        }

        let buildingBlockSettings = {
            subscriptionId: commander.subscriptionId ? commander.subscriptionId : value.subscriptionId,
            resourceGroupName: commander.resourceGroup ? commander.resourceGroup : value.resourceGroupName,
            location: commander.location ? commander.location : value.location,
            cloud: cloud,
            sasToken: (commander.sasToken ? '?'.concat(commander.sasToken) : '')
        };

        let buildingBlockType = value.type;
        let buildingBlock = _.find(buildingBlocks, (value) => {
            return value.type === buildingBlockType;
        });
    
        if (!buildingBlock) {
            throw new Error(`building block for parameter '${buildingBlockType}' was not found.`);
        }

        let result = processParameters({
            buildingBlock: buildingBlock,
            parameters: value.settings,
            buildingBlockSettings: buildingBlockSettings,
            defaultsDirectory: commander.defaultsDirectory
        });

        // We need to add the deploymentContext to the template parameter files.
        result.parameters.deploymentContext = {
            parentTemplateUniqueString: _.camelCase(buildingBlock.type),
            sasToken: buildingBlockSettings.sasToken
        };

        let templateParameters = createTemplateParameters({
            parameters: result.parameters
        });

        // Attach everything to our result so we can access it later as a unit.
        result.templateParameters = templateParameters;
        result.buildingBlock = buildingBlock;
        result.buildingBlockSettings = buildingBlockSettings;

        // Add the output filename
        result.outputFilename = path.format({
            dir: outputDirectory,
            name: `${outputBaseFilename}-${padInteger(index + 1, '00')}`,
            ext: '.json'
        });
        return result;
    });

    // Add the output filenames even if they aren't needed.
    if (results.length === 1) {
        results[0].outputFilename = path.format({
            dir: outputDirectory,
            name: outputBaseFilename,
            ext: '.json'
        });
    }
    
    // Output the parameters based on flags
    if (commander.json === true) {
        let templateParameters = _.map(results, (value) => {
            return value.templateParameters;
        });

        let output = JSON.stringify((templateParameters.length === 1) ? templateParameters[0] : templateParameters, null, 2);
        console.log(output);
    } else {
        _.forEach(results, (value) => {
            let output = JSON.stringify(value.templateParameters, null, 2);
            fs.writeFileSync(value.outputFilename, output);
            console.log();
            console.log(`  parameters written to ${value.outputFilename}`);
            console.log();
        });
    }

    if (commander.deploy === true) {
        _.forEach(results, (value) => {
            // Get the resources groups to create if they don't exist.  Each block is responsible for specifying these.
            createResourceGroups({
                resourceGroups: value.resourceGroups
            });
            deployTemplate({
                parameterFile: value.outputFilename,
                buildingBlockSettings: value.buildingBlockSettings,
                buildingBlock: value.buildingBlock
            });
        });
    }
} catch (e) {
    console.error();
    console.error(`  error: ${e.message}`);
    console.error();
    process.exit(1);
}
