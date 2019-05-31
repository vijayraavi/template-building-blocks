'use strict';
const childProcess = require('child_process');
const os = require('os');
const v = require('./core/validation');
const _ = require('lodash');

let spawnAz = ({args, spawnOptions, azOptions}) => {
    if (!_.isArray(args) || args.length === 0) {
        throw new Error('args must be an array with a length greater than 0');
    }

    spawnOptions = spawnOptions || {
        stdio: 'pipe',
        shell: true
    };

    azOptions = azOptions || {
        debug: false
    };

    if (azOptions.debug) {
        args.push('--debug');
    }
    let child = childProcess.spawnSync('az', args, spawnOptions);
    if (child.status !== 0) {
        let error = `error executing az${os.EOL}`;
        // If our stdio is 'pipe', we should pull the error message out and show it.
        if (spawnOptions.stdio === 'pipe') {
            error += `  message: ${child.stderr.toString().trim()}${os.EOL}`;
        }

        error += `  status: ${child.status}${os.EOL}  arguments: ${args.join(' ')}`;
        throw new Error(error);
    }

    if ((azOptions.debug) && (spawnOptions.stdio === 'pipe')) {
        // The spawn was successful, but we are debugging, so we need to write the stderr, but only if stdio === 'pipe'
        console.error(child.stderr.toString().trim());
    }

    return child;
};

let setSubscription = ({subscriptionId, azOptions}) => {
    if (v.utilities.isNullOrWhitespace(subscriptionId)) {
        throw new Error('subscriptionId cannot be undefined, null, empty, or only whitespace');
    }

    let child = spawnAz({
        args: ['account', 'set', '--subscription', subscriptionId],
        spawnOptions: {
            stdio: 'inherit',
            shell: true
        },
        azOptions: azOptions
    });

    return child;
};

let setCloud = ({name, azOptions}) => {
    if (v.utilities.isNullOrWhitespace(name)) {
        throw new Error('name cannot be undefined, null, empty, or only whitespace');
    }

    let child = spawnAz({
        args: ['cloud', 'set', '--name', name],
        spawnOptions: {
            stdio: 'inherit',
            shell: true
        },
        azOptions: azOptions
    });

    return child;
};

let createResourceGroupIfNotExists = ({resourceGroupName, location, azOptions}) => {

    if (v.utilities.isNullOrWhitespace(resourceGroupName)) {
        throw new Error('resourceGroupName cannot be undefined, null, empty, or only whitespace');
    }

    if (v.utilities.isNullOrWhitespace(location)) {
        throw new Error('location cannot be undefined, null, empty, or only whitespace');
    }

     // See if the resource group exists, and if not create it.
    let child = spawnAz({
        args: ['group', 'exists', '--name', resourceGroupName],
        spawnOptions: {
            stdio: 'pipe',
            shell: true
        }
    });

    // The result has to be trimmed because it has a newline at the end
    if (child.stdout.toString().trim() === 'false') {
        // Create the resource group
        child = spawnAz({
            args: ['group', 'create', '--location', location, '--name', resourceGroupName],
            spawnOptions: {
                stdio: 'inherit',
                shell: true
            },
            azOptions: azOptions
        });
    }

    return child;
};

let deployTemplate = ({deploymentName, resourceGroupName, templateUri, parameterFile, azOptions}) => {
    let args = ['group', 'deployment', 'create', '--name', deploymentName,
        '--resource-group', resourceGroupName,
        '--template-uri', templateUri.replace(/&/g, (os.platform() === 'win32' ? '^^^&' : '\\&')),
        '--parameters', `@${parameterFile}`];

    let child = spawnAz({
        args: args,
        spawnOptions: {
            stdio: 'inherit',
            shell: true
        },
        azOptions: azOptions
    });

    return child;
};

let getRegisteredClouds = ({azOptions} = {}) => {
    let child = spawnAz({
        args: ['cloud', 'list', '--output', 'json'],
        azOptions: azOptions
    });

    try {
        return JSON.parse(child.stdout.toString());
    } catch (e) {
        throw new Error(`error retrieving cloud list${os.EOL}message: ${e.message}`);
    }
};

// I don't like having to do this, but there is no good way to validate zones.
// We could use a JMESPath query on the command line to filter this, but it pulls it all down anyway
// and filters on the client. We will make sure to cache for the lifetime of azbb, but if this
// becomes a performance issue, we may have to cache on the filesystem. :(
let virtualMachineSkus = undefined;

let getVirtualMachineSkus = (azOptions) => {
    if (!virtualMachineSkus) {
        let child = spawnAz({
            args: ['vm', 'list-skus', '--zone'],
            azOptions: azOptions
        });

        try {
            virtualMachineSkus = JSON.parse(child.stdout.toString());
        } catch (e) {
            throw new Error(`error retrieving virtual machine sku list${os.EOL}message: ${e.message}`);
        }

        virtualMachineSkus = _.transform(
            _.groupBy(virtualMachineSkus, sku => sku.name),
            (result, value, key) => {
                result[key] = value.reduce((prev, curr) => prev.concat(curr.locationInfo), []);
            }, {}
        );
    }

    //let transformed = _.groupBy(virtualMachineSkus, sku => sku.name);
    // let s = transformed['Standard_A1_v2'].map(sku => _.sortBy(sku.capabilities, c => c.name));
    // let t = {};
    
    //transformed['Standard_A1_v2'].reduce((prev, curr) => prev.concat(curr.locationInfo), [])
    return virtualMachineSkus;
};

let getVMSkuInfo = (vmSize, location, azOptions = {}) => {
    let sku = getVMSku(vmSize, location, azOptions);
    if (sku) {
        return sku.find((locInfo) => locInfo.location === location);
    }
};

let getVMSku = (vmSize, azOptions = {}) => {
    let skus = getVirtualMachineSkus(azOptions);
    let sku = skus[vmSize];
    // //if (!sku || sku.length === 0) {
    // if (sku && sku.length > 0) {
    //     // throw new Error(`Invalid virtual machine sku '${vmSize}'`);
    //     return sku;
    // }
    return sku;
}

// let getVMSkuZones = (vmSize, location, azOptions = {}) => {
//     // let skus = getVirtualMachineSkus(azOptions);
//     // let sku = skus[vmSize];
//     // if (!sku || sku.length === 0) {
//     //     throw new Error(`Invalid virtual machine sku '${vmSize}'`);
//     // }
//     let sku = getVMSku(vmSzie, location, azOptions);
//     let locationInfo = sku.find((locInfo) => locInfo.location === location);
//     if (!locationInfo) {
//         throw new Error(`Invalid virtual machine sku location '${location}'`);
//     }
//     return locationInfo.zones;
// };

exports.createResourceGroupIfNotExists = createResourceGroupIfNotExists;
exports.deployTemplate = deployTemplate;
exports.getRegisteredClouds = getRegisteredClouds;
exports.setSubscription = setSubscription;
exports.setCloud = setCloud;
exports.spawnAz = spawnAz;
exports.getVMSku = getVMSku;
exports.getVMSkuInfo = getVMSkuInfo;