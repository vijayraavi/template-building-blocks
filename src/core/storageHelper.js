'use strict';

let _ = require('lodash');
let v = require('./validation');
let murmurHash = require('murmurhash3js').x64;

let storageValidations = {
    count: (value, parent) => {
        return {
            result: (parent.managed) || ((_.isFinite(value)) && value > 0),
            message: 'Value must be greater than 0'
        };
    },
    managed: v.validationUtilities.isBoolean,
    nameSuffix: v.validationUtilities.isNotNullOrWhitespace,
    skuType: (value, parent) => {
        return {
            result: (parent.managed) || !v.utilities.isNullOrWhitespace(value),
            message: 'Value cannot be null or empty string if managed is set to false'
        };
    },
    accounts: (value) => {
        return {
            result: _.isArray(value),
            message: 'Value cannot be null'
        };
    }
};

let diagnosticValidations = {
    managed: (value) => {
        if (!_.isBoolean(value)) {
            return {
                result: false,
                message: 'Value must be Boolean'
            };
        }
        return {
            result: !value,
            message: 'Diagnostic storage cannot be managed.'
        };
    },
    skuType: (value) => {
        return {
            result: (!v.utilities.isNullOrWhitespace(value)) && !_.includes(_.toLower(value), 'premium'),
            message: 'Diagnostic storage cannot use premium storage.'
        };
    },
    count: (value) => {
        return {
            result: ((_.isFinite(value)) && value > 0),
            message: 'Value must be greater than 0'
        };
    },
    nameSuffix: v.validationUtilities.isNotNullOrWhitespace,
    accounts: (value) => {
        return {
            result: _.isArray(value),
            message: 'Value cannot be null'
        };
    }
};

function transform(settings, parent) {
    if (settings.managed) {
        return { accounts: [] };
    }
    let accounts = _.transform(createStamps(settings, parent), (result, n, index) => {
        let instance = {
            resourceGroupName: n.resourceGroupName,
            subscriptionId: n.subscriptionId,
            location: n.location,
            name: `vm${getUniqueString(parent)}${n.nameSuffix}${index + 1}`,
            kind: 'Storage',
            sku: n.skuType
        };
        if (!_.isNil(n.supportsHttpsTrafficOnly)) {
            instance.supportsHttpsTrafficOnly = n.supportsHttpsTrafficOnly;
        }
        if (!_.isNil(n.encryptBlobStorage)) {
            instance.encryptBlobStorage = n.encryptBlobStorage;
        }
        if (!_.isNil(n.encryptFileStorage)) {
            instance.encryptFileStorage = n.encryptFileStorage;
        }
        if (!_.isNil(n.encryptQueueStorage)) {
            instance.encryptQueueStorage = n.encryptQueueStorage;
        }
        if (!_.isNil(n.encryptTableStorage)) {
            instance.encryptTableStorage = n.encryptTableStorage;
        }
        if (!_.isNil(n.keyVaultProperties)) {
            instance.keyVaultProperties = n.keyVaultProperties;
        }

        result.push(instance);
        return result;
    }, []);

    return {
        accounts: accounts
    };
}

function convertToBase32(carryOverValue, carryOverBits, buffer) {
    if (buffer.length === 0) return '';
    if (carryOverBits === 0 && buffer.length > 1) {
        return convertToBase32(parseInt(buffer[0], 16), 4, buffer.slice(1));
    }

    let charSet = 'abcdefghijklmnopqrstuvwxyz234567';
    let base32String = '';
    let valueToProcess = carryOverValue * 16 + parseInt(buffer[0], 16);
    let bitsCount = carryOverBits + 4;

    do {
        let value = valueToProcess;
        if (bitsCount >= 5) {
            bitsCount -= 5;
            value = valueToProcess >> bitsCount;
        }
        base32String += charSet[value];
        value <<= bitsCount;
        valueToProcess -= value;
    } while (valueToProcess > 32 || (buffer.length === 1 && valueToProcess > 0));

    base32String += convertToBase32(valueToProcess, bitsCount, buffer.slice(1));
    return base32String;
}

function getUniqueString(input) {
    let buffer = murmurHash.hash128(JSON.stringify(input));

    let base32 = _.truncate(convertToBase32(0, 0, buffer), {length: 13, omission:''});
    return base32;
}

function createStamps(settings) {
    // deep clone settings for the number of VMs required (vmCount)
    return _.transform(_.castArray(settings), (result, n) => {
        for (let i = 0; i < settings.count - settings.accounts.length; i++) {
            result.push(_.cloneDeep(n));
        }
        return result;
    }, []);
}

exports.transform = transform;
exports.storageValidations = storageValidations;
exports.diagnosticValidations = diagnosticValidations;