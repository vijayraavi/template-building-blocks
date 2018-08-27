describe('storageSettings:', () => {
    let rewire = require('rewire');
    let storageSettings = rewire('../src/core/storageSettings.js');
    let _ = require('lodash');
    let v = require('../src/core/validation.js');

    let storageParams = [
        {
            name: 'testStorage',
            kind: 'Storage',
            sku: 'Premium_LRS',
            supportsHttpsTrafficOnly: true,
            encryptBlobStorage: true,
            encryptFileStorage: true,
            encryptQueueStorage: true,
            encryptTableStorage: true,
            keyVaultProperties: {
                keyName: 'testkeyname1',
                keyVersion: 'testkeyversion1',
                keyVaultUri: 'testkeyvaulturi1'
            },
            tables: ['testTable'],
            queues: [{ name: 'testQueue', metadata: { key1: 'value1', key2: 'value2' } }],
            containers: [{ name: 'testContainer', publicAccess: 'Container' }],
            shares: [{ name: 'testShare', quota: 25 }],
            subscriptionId: '3b518fac-e5c8-4f59-8ed5-d70b626f8e10',
            resourceGroupName: 'rs-test6-rg'
        },
        {
            name: 'testDiagStorage',
            kind: 'BlobStorage',
            accessTier: 'Cool',
            sku: 'Standard_LRS',
            supportsHttpsTrafficOnly: true,
            encryptBlobStorage: true,
            encryptFileStorage: true,
            encryptQueueStorage: true,
            encryptTableStorage: true,
            keyVaultProperties: {
                keyName: 'testkeyname2',
                keyVersion: 'testkeyversion2',
                keyVaultUri: 'testkeyvaulturi2'
            },
            subscriptionId: '3b518fac-e5c8-4f59-8ed5-d70b626f8e10',
            resourceGroupName: 'rs-test6-rg'
        }
    ];

    describe('merge:', () => {
        let storageMerge = storageSettings.__get__('merge');
        it('validates valid defaults are applied for storage accounts.', () => {
            let settings = {name: 'testStorage'};

            let mergedValue = storageMerge({ settings });
            expect(mergedValue.kind).toEqual('Storage');
            expect(mergedValue.sku).toEqual('Premium_LRS');
            expect(mergedValue.supportsHttpsTrafficOnly).toEqual(true);
            expect(mergedValue.encryptBlobStorage).toEqual(false);
            expect(mergedValue.encryptFileStorage).toEqual(false);
            expect(mergedValue.encryptQueueStorage).toEqual(false);
            expect(mergedValue.encryptTableStorage).toEqual(false);
            expect(Object.keys(mergedValue.keyVaultProperties).length).toEqual(0);
            expect(mergedValue.tables.length).toEqual(0);
            expect(mergedValue.queues.length).toEqual(0);
            expect(mergedValue.containers.length).toEqual(0);
            expect(mergedValue.shares.length).toEqual(0);
        });
        it('validates defaults do not override settings.', () => {
            let settings = _.cloneDeep(storageParams);

            let mergedValue = storageMerge({ settings });
            expect(mergedValue.length).toEqual(2);
            expect(mergedValue[0].name).toEqual('testStorage');
            expect(mergedValue[0].sku).toEqual('Premium_LRS');
            expect(mergedValue[0].supportsHttpsTrafficOnly).toEqual(true);
            expect(mergedValue[0].encryptBlobStorage).toEqual(true);
            expect(mergedValue[0].encryptFileStorage).toEqual(true);
            expect(mergedValue[0].encryptQueueStorage).toEqual(true);
            expect(mergedValue[0].encryptTableStorage).toEqual(true);
            expect(Object.keys(mergedValue[0].keyVaultProperties).length).toEqual(3);
            expect(mergedValue[0].keyVaultProperties.keyName).toEqual('testkeyname1');
            expect(mergedValue[0].keyVaultProperties.keyVersion).toEqual('testkeyversion1');
            expect(mergedValue[0].keyVaultProperties.keyVaultUri).toEqual('testkeyvaulturi1');
            expect(mergedValue[0].tables[0]).toEqual('testTable');
            expect(mergedValue[0].queues[0].name).toEqual('testQueue');
            expect(mergedValue[0].queues[0].metadata['key1']).toEqual('value1');
            expect(mergedValue[0].queues[0].metadata['key2']).toEqual('value2');
            expect(mergedValue[0].containers[0].name).toEqual('testContainer');
            expect(mergedValue[0].containers[0].publicAccess).toEqual('Container');
            expect(mergedValue[0].shares[0].name).toEqual('testShare');
            expect(mergedValue[0].shares[0].quota).toEqual(25);

            expect(mergedValue[1].name).toEqual('testDiagStorage');
            expect(mergedValue[1].sku).toEqual('Standard_LRS');
            expect(mergedValue[1].kind).toEqual('BlobStorage');
            expect(mergedValue[1].accessTier).toEqual('Cool');
            expect(mergedValue[1].supportsHttpsTrafficOnly).toEqual(true);
            expect(mergedValue[1].encryptBlobStorage).toEqual(true);
            expect(mergedValue[1].encryptFileStorage).toEqual(true);
            expect(mergedValue[1].encryptQueueStorage).toEqual(true);
            expect(mergedValue[1].encryptTableStorage).toEqual(true);
            expect(Object.keys(mergedValue[1].keyVaultProperties).length).toEqual(3);
            expect(mergedValue[1].keyVaultProperties.keyName).toEqual('testkeyname2');
            expect(mergedValue[1].keyVaultProperties.keyVersion).toEqual('testkeyversion2');
            expect(mergedValue[1].keyVaultProperties.keyVaultUri).toEqual('testkeyvaulturi2');
            expect(mergedValue[1].tables.length).toEqual(0);
            expect(mergedValue[1].queues.length).toEqual(0);
            expect(mergedValue[1].containers.length).toEqual(0);
            expect(mergedValue[1].shares.length).toEqual(0);
        });
        it('validates additional properties in settings are not removed.', () => {
            let settings = {
                name1: 'test'
            };

            let mergedValue = storageMerge({ settings });
            expect(mergedValue.hasOwnProperty('name1')).toEqual(true);
            expect(mergedValue.name1).toEqual('test');
        });
    });
    describe('userDefaults:', () => {
        let storageMerge = storageSettings.__get__('merge');
        it('validates valid user defaults are applied for storage accounts.', () => {
            let settings = [{}];

            let defaults = {
                name: 'DST'
            };

            let mergedValue = storageMerge({
                settings,
                defaultSettings: defaults
            });

            expect(mergedValue.length).toEqual(1);
            expect(mergedValue[0].name).toEqual('DST');
            expect(mergedValue[0].sku).toEqual('Premium_LRS');
            expect(mergedValue[0].kind).toEqual('Storage');
            expect(mergedValue[0].supportsHttpsTrafficOnly).toEqual(true);
            expect(mergedValue[0].encryptBlobStorage).toEqual(false);
            expect(mergedValue[0].encryptFileStorage).toEqual(false);
            expect(mergedValue[0].encryptQueueStorage).toEqual(false);
            expect(mergedValue[0].encryptTableStorage).toEqual(false);
            expect(Object.keys(mergedValue[0].keyVaultProperties).length).toEqual(0);
            expect(mergedValue[0].tables.length).toEqual(0);
            expect(mergedValue[0].queues.length).toEqual(0);
            expect(mergedValue[0].containers.length).toEqual(0);
            expect(mergedValue[0].shares.length).toEqual(0);
        });
        it('validates user defaults do not override settings.', () => {
            let settings = _.cloneDeep(storageParams);

            let defaults = {
                name: 'DST'
            };

            let mergedValue = storageMerge({
                settings,
                defaultSettings: defaults
            });

            expect(mergedValue.length).toEqual(2);
            expect(mergedValue[0].name).toEqual('testStorage');
            expect(mergedValue[0].sku).toEqual('Premium_LRS');
            expect(mergedValue[0].supportsHttpsTrafficOnly).toEqual(true);

            expect(mergedValue[1].name).toEqual('testDiagStorage');
            expect(mergedValue[1].sku).toEqual('Standard_LRS');
            expect(mergedValue[1].kind).toEqual('BlobStorage');
            expect(mergedValue[1].accessTier).toEqual('Cool');
            expect(mergedValue[1].supportsHttpsTrafficOnly).toEqual(true);
        });
        it('validates additional properties in default settings are not removed.', () => {
            let settings = [{}];

            let defaults = {
                name1: 'include'
            };

            let mergedValue = storageMerge({
                settings,
                defaultSettings: defaults
            });

            expect(mergedValue[0].hasOwnProperty('name1')).toEqual(true);
            expect(mergedValue[0].name1).toEqual('include');
        });
        it('validates additional properties in settings are neither removed nor overriden by default settings.', () => {
            let settings = [{
                name1: 'test'
            }];

            let defaults = {
                name1: 'do-not-override'
            };

            let mergedValue = storageSettings.storageMerge({
                settings,
                defaultSettings: defaults
            });

            expect(mergedValue.hasOwnProperty('name1')).toEqual(true);
            expect(mergedValue.name1).toEqual('test');
        });
        it('validates missing properties in settings are picked up from user defaults.', () => {
            let settings = {
                skuType: 'Standard_LRS',
                managed: false,
                supportsHttpsTrafficOnly: true
            };

            let defaults = {
                count: 10
            };

            let mergedValue = storageSettings.storageMerge({
                settings,
                defaultSettings: defaults
            });

            expect(mergedValue.hasOwnProperty('count')).toEqual(true);
            expect(mergedValue.count).toEqual(10);
            expect(mergedValue.nameSuffix).toEqual('st');
            expect(mergedValue.encryptBlobStorage).toEqual(false);
            expect(mergedValue.encryptFileStorage).toEqual(false);
            expect(Object.keys(mergedValue.keyVaultProperties).length).toEqual(0);
        });
    });
    describe('validations:', () => {
        describe('storage validations:', () => {
            let settings;
            beforeEach(() => {
                settings = _.cloneDeep(storageParams);
            });

            describe('nameSuffix:', () => {
                it('validates nameSuffix canot be an empty string.', () => {
                    settings.nameSuffix = '';
                    let result = v.validate({
                        settings: settings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.nameSuffix');

                    settings.nameSuffix = null;
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.nameSuffix');

                    settings.nameSuffix = 'test';
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(0);
                });
            });
            describe('managed:', () => {
                it('validates valid value for managed property is boolean.', () => {
                    settings.managed = 'yes';
                    let result = v.validate({
                        settings: settings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.managed');

                    settings.managed = 'true';
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.managed');

                    settings.managed = true;
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(0);
                });
            });
            describe('skuType:', () => {
                it('validates skuType canot be null or empty string, if managed is false.', () => {
                    settings.skuType = '';
                    let result = v.validate({
                        settings: settings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.skuType');

                    settings.skuType = null;
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.skuType');

                    settings.skuType = 'test';
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(0);
                });
                it('validates skuType is ignored if managed is true.', () => {
                    settings.managed = true;

                    settings.skuType = '';
                    let result = v.validate({
                        settings: settings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(0);

                    settings.skuType = null;
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(0);
                });
            });
            describe('count:', () => {
                it('validates count is greater than 0, if managed is false.', () => {
                    settings.managed = false;

                    settings.count = 0;
                    let result = v.validate({
                        settings: settings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.count');

                    settings.count = '5';
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.count');

                    settings.count = null;
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.count');

                    settings.count = 5;
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(0);
                });
                it('validates count is ignored if managed is true.', () => {
                    settings.managed = true;

                    settings.count = 0;
                    let result = v.validate({
                        settings: settings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(0);
                });
            });
            describe('supportsHttpsTrafficOnly:', () => {
                it('validates valid value for supportsHttpsTrafficOnly property is boolean.', () => {
                    settings.supportsHttpsTrafficOnly = 'yes';
                    let result = v.validate({
                        settings: settings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.supportsHttpsTrafficOnly');

                    settings.supportsHttpsTrafficOnly = 'true';
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.supportsHttpsTrafficOnly');

                    settings.supportsHttpsTrafficOnly = true;
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(0);
                });
            });
            describe('encryptBlobStorage:', () => {
                it('validates valid value for encryptBlobStorage property is boolean.', () => {
                    settings.encryptBlobStorage = 'yes';
                    let result = v.validate({
                        settings: settings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.encryptBlobStorage');

                    settings.encryptBlobStorage = 'true';
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.encryptBlobStorage');

                    settings.encryptBlobStorage = true;
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(0);
                });
            });
            describe('encryptFileStorage:', () => {
                it('validates valid value for encryptFileStorage property is boolean.', () => {
                    settings.encryptFileStorage = 'yes';
                    let result = v.validate({
                        settings: settings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.encryptFileStorage');

                    settings.encryptFileStorage = 'true';
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.encryptFileStorage');

                    settings.encryptFileStorage = true;
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(0);
                });
            });
            describe('keyvaultproperties:', () => {
                it('validates no error is thrown if keyvaultproperties is not provided or empty object.', () => {
                    settings.keyVaultProperties = null;
                    let result = v.validate({
                        settings: settings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(0);

                    settings.keyVaultProperties = {};
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(0);
                });
                it('validates that if keyvaultproperties is not empty than required properties are provided', () => {
                    settings.keyVaultProperties = { test: 'test' };
                    let result = v.validate({
                        settings: settings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(3);
                    expect(result[0].name).toEqual('.keyVaultProperties.keyName');
                    expect(result[1].name).toEqual('.keyVaultProperties.keyVersion');
                    expect(result[2].name).toEqual('.keyVaultProperties.keyVaultUri');

                    settings.keyVaultProperties = {
                        keyName: 'testkeyname',
                        keyVersion: 'testkeyversion',
                        keyVaultUri: 'testkeyvaulturi'
                    };
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(0);
                });
            });
        });
        describe('diagnostic storage validations:', () => {
            let settings;
            beforeEach(() => {
                settings = _.cloneDeep(diagStorageParams);
            });

            describe('nameSuffix:', () => {
                it('validates nameSuffix canot be an empty string.', () => {
                    settings.nameSuffix = '';
                    let result = v.validate({
                        settings: settings,
                        validations: storageSettings.diagnosticValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.nameSuffix');

                    settings.nameSuffix = null;
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.diagnosticValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.nameSuffix');

                    settings.nameSuffix = 'test';
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.diagnosticValidations
                    });
                    expect(result.length).toEqual(0);
                });
            });
            describe('managed:', () => {
                it('validates managed property for diagnostic storage cannot be true.', () => {
                    settings.managed = true;
                    let result = v.validate({
                        settings: settings,
                        validations: storageSettings.diagnosticValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.managed');

                    settings.managed = false;
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.diagnosticValidations
                    });
                    expect(result.length).toEqual(0);
                });
            });
            describe('skuType:', () => {
                it('validates skuType canot be null or empty string or premium storage', () => {
                    settings.skuType = '';
                    let result = v.validate({
                        settings: settings,
                        validations: storageSettings.diagnosticValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.skuType');

                    settings.skuType = null;
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.diagnosticValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.skuType');

                    settings.skuType = 'Premium_LRS';
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.diagnosticValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.skuType');

                    settings.skuType = 'Standard_LRS';
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.diagnosticValidations
                    });
                    expect(result.length).toEqual(0);
                });
            });
            describe('count:', () => {
                it('validates count is greater than 0', () => {
                    settings.count = 0;
                    let result = v.validate({
                        settings: settings,
                        validations: storageSettings.diagnosticValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.count');

                    settings.count = '5';
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.diagnosticValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.count');

                    settings.count = null;
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.diagnosticValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.count');

                    settings.count = 5;
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.diagnosticValidations
                    });
                    expect(result.length).toEqual(0);
                });
            });
            describe('supportsHttpsTrafficOnly:', () => {
                it('validates valid value for supportsHttpsTrafficOnly property is boolean.', () => {
                    settings.supportsHttpsTrafficOnly = 'yes';
                    let result = v.validate({
                        settings: settings,
                        validations: storageSettings.diagnosticValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.supportsHttpsTrafficOnly');

                    settings.supportsHttpsTrafficOnly = 'true';
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.diagnosticValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.supportsHttpsTrafficOnly');

                    settings.supportsHttpsTrafficOnly = true;
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.diagnosticValidations
                    });
                    expect(result.length).toEqual(0);
                });
            });
            describe('encryptBlobStorage:', () => {
                it('validates valid value for encryptBlobStorage property is boolean.', () => {
                    settings.encryptBlobStorage = 'yes';
                    let result = v.validate({
                        settings: settings,
                        validations: storageSettings.diagnosticValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.encryptBlobStorage');

                    settings.encryptBlobStorage = 'true';
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.diagnosticValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.encryptBlobStorage');

                    settings.encryptBlobStorage = true;
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.diagnosticValidations
                    });
                    expect(result.length).toEqual(0);
                });
            });
            describe('encryptFileStorage:', () => {
                it('validates valid value for encryptFileStorage property is boolean.', () => {
                    settings.encryptFileStorage = 'yes';
                    let result = v.validate({
                        settings: settings,
                        validations: storageSettings.diagnosticValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.encryptFileStorage');

                    settings.encryptFileStorage = 'true';
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.diagnosticValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.encryptFileStorage');

                    settings.encryptFileStorage = true;
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.diagnosticValidations
                    });
                    expect(result.length).toEqual(0);
                });
            });
            describe('keyvaultproperties:', () => {
                it('validates no error is thrown if keyvaultproperties is not provided or empty object.', () => {
                    settings.keyVaultProperties = null;
                    let result = v.validate({
                        settings: settings,
                        validations: storageSettings.diagnosticValidations
                    });
                    expect(result.length).toEqual(0);

                    settings.keyVaultProperties = {};
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.diagnosticValidations
                    });
                    expect(result.length).toEqual(0);
                });
                it('validates that if keyvaultproperties is not empty than required properties are provided', () => {
                    settings.keyVaultProperties = { test: 'test' };
                    let result = v.validate({
                        settings: settings,
                        validations: storageSettings.diagnosticValidations
                    });
                    expect(result.length).toEqual(3);
                    expect(result[0].name).toEqual('.keyVaultProperties.keyName');
                    expect(result[1].name).toEqual('.keyVaultProperties.keyVersion');
                    expect(result[2].name).toEqual('.keyVaultProperties.keyVaultUri');

                    settings.keyVaultProperties = {
                        keyName: 'testkeyname',
                        keyVersion: 'testkeyversion',
                        keyVaultUri: 'testkeyvaulturi'
                    };
                    result = v.validate({
                        settings: settings,
                        validations: storageSettings.diagnosticValidations
                    });
                    expect(result.length).toEqual(0);
                });
            });
        });
    });

    if (jasmine.testConfiguration.runTransform) {
        describe('storage accounts transform:', () => {
            let settings = {
                storageAccounts: {
                    nameSuffix: 'st',
                    count: 2,
                    skuType: 'Premium_LRS',
                    managed: false,
                    accounts: [
                        'vm7tt2e6prktm3lst1',
                        'vm7tt2e6prktm3lst2'
                    ],
                    supportsHttpsTrafficOnly: true,
                    encryptBlobStorage: true,
                    encryptFileStorage: true,
                    keyVaultProperties: {
                        keyName: 'testkeyname',
                        keyVersion: 'testkeyversion',
                        keyVaultUri: 'testkeyvaulturi'
                    },
                    subscriptionId: '3b518fac-e5c8-4f59-8ed5-d70b626f8e10',
                    resourceGroupName: 'rs-test6-rg'
                }
            };
            it('returns empty array if count of existing storage accounts is equal to count property:', () => {
                let result = storageSettings.transform(settings.storageAccounts, settings);
                expect(result.accounts.length).toEqual(0);
            });
            describe('', () => {
                let param;
                beforeEach(() => {
                    param = _.cloneDeep(settings);
                });

                it('returns empty array if count of existing storage accounts is greater than count property:', () => {
                    param.storageAccounts.accounts = ['A', 'B', 'C'];

                    let result = storageSettings.transform(param.storageAccounts, param);
                    expect(result.accounts.length).toEqual(0);
                });
                it('returns array with storage account to create. length of array is count - no. of existing accounts provided:', () => {
                    param.storageAccounts.accounts = ['A'];

                    let result = storageSettings.transform(param.storageAccounts, param);
                    expect(result.accounts.length).toEqual(1);
                });
                it('converts settings to RP shape', () => {
                    param.storageAccounts.accounts = [];

                    let result = storageSettings.transform(param.storageAccounts, param);
                    expect(_.endsWith(result.accounts[0].name, `${param.storageAccounts.nameSuffix}1`)).toEqual(true);
                    expect(result.accounts[0].kind).toEqual('Storage');
                    expect(result.accounts[0].sku.name).toEqual('Premium_LRS');
                    expect(result.accounts[0].properties.encryption.services.blob.enabled).toEqual(true);
                    expect(result.accounts[0].properties.encryption.services.file.enabled).toEqual(true);
                    expect(result.accounts[0].properties.encryption.keySource).toEqual('Microsoft.Keyvault');
                    expect(result.accounts[0].properties.encryption.keyvaultproperties.keyname).toEqual('testkeyname');
                    expect(result.accounts[0].properties.encryption.keyvaultproperties.keyversion).toEqual('testkeyversion');
                    expect(result.accounts[0].properties.encryption.keyvaultproperties.keyvaulturi).toEqual('testkeyvaulturi');
                    expect(result.accounts[0].properties.supportsHttpsTrafficOnly).toEqual(true);
                    expect(_.endsWith(result.accounts[1].name, `${param.storageAccounts.nameSuffix}2`)).toEqual(true);
                    expect(result.accounts[1].kind).toEqual('Storage');
                    expect(result.accounts[1].sku.name).toEqual('Premium_LRS');
                    expect(result.accounts[1].properties.encryption.services.blob.enabled).toEqual(true);
                    expect(result.accounts[1].properties.encryption.services.file.enabled).toEqual(true);
                    expect(result.accounts[1].properties.encryption.keySource).toEqual('Microsoft.Keyvault');
                    expect(result.accounts[1].properties.encryption.keyvaultproperties.keyname).toEqual('testkeyname');
                    expect(result.accounts[1].properties.encryption.keyvaultproperties.keyversion).toEqual('testkeyversion');
                    expect(result.accounts[1].properties.encryption.keyvaultproperties.keyvaulturi).toEqual('testkeyvaulturi');
                    expect(result.accounts[1].properties.supportsHttpsTrafficOnly).toEqual(true);
                });
                it('if supportsHttpsTrafficOnly is false, RP shape doesnt include it', () => {
                    param.storageAccounts.count = 1;
                    param.storageAccounts.supportsHttpsTrafficOnly = false;
                    param.storageAccounts.accounts = [];

                    let result = storageSettings.transform(param.storageAccounts, param);
                    expect(_.endsWith(result.accounts[0].name, `${param.storageAccounts.nameSuffix}1`)).toEqual(true);
                    expect(result.accounts[0].kind).toEqual('Storage');
                    expect(result.accounts[0].sku.name).toEqual('Premium_LRS');
                    expect(result.accounts[0].properties.encryption.services.blob.enabled).toEqual(true);
                    expect(result.accounts[0].properties.encryption.services.file.enabled).toEqual(true);
                    expect(result.accounts[0].properties.encryption.keySource).toEqual('Microsoft.Keyvault');
                    expect(result.accounts[0].properties.encryption.keyvaultproperties.keyname).toEqual('testkeyname');
                    expect(result.accounts[0].properties.encryption.keyvaultproperties.keyversion).toEqual('testkeyversion');
                    expect(result.accounts[0].properties.encryption.keyvaultproperties.keyvaulturi).toEqual('testkeyvaulturi');
                    expect(result.accounts[0].properties.hasOwnProperty('supportsHttpsTrafficOnly')).toEqual(false);
                });
                it('if encrypt options are false, RP shape doesnt include it', () => {
                    param.storageAccounts.count = 1;
                    param.storageAccounts.supportsHttpsTrafficOnly = true;
                    param.storageAccounts.encryptBlobStorage = false;
                    param.storageAccounts.encryptFileStorage = false;
                    param.storageAccounts.accounts = [];

                    let result = storageSettings.transform(param.storageAccounts, param);
                    expect(_.endsWith(result.accounts[0].name, `${param.storageAccounts.nameSuffix}1`)).toEqual(true);
                    expect(result.accounts[0].kind).toEqual('Storage');
                    expect(result.accounts[0].sku.name).toEqual('Premium_LRS');
                    expect(result.accounts[0].properties.hasOwnProperty('encryption')).toEqual(false);
                    expect(result.accounts[0].properties.supportsHttpsTrafficOnly).toEqual(true);
                });
                it('if supportsHttpsTrafficOnly & ecrypt options are false, properties property is empty object', () => {
                    param.storageAccounts.count = 1;
                    param.storageAccounts.supportsHttpsTrafficOnly = false;
                    param.storageAccounts.encryptBlobStorage = false;
                    param.storageAccounts.encryptFileStorage = false;
                    param.storageAccounts.accounts = [];

                    let result = storageSettings.transform(param.storageAccounts, param);
                    expect(_.endsWith(result.accounts[0].name, `${param.storageAccounts.nameSuffix}1`)).toEqual(true);
                    expect(result.accounts[0].kind).toEqual('Storage');
                    expect(result.accounts[0].sku.name).toEqual('Premium_LRS');
                    expect(result.accounts[0].hasOwnProperty('properties')).toEqual(true);
                    expect(Object.keys(result.accounts[0].properties).length).toEqual(0);
                });
                it('if keyVaultProperties are provided, RP shape include keySource and keyvault properties', () => {
                    param.storageAccounts.count = 1;
                    param.storageAccounts.supportsHttpsTrafficOnly = false;
                    param.storageAccounts.accounts = [];

                    let result = storageSettings.transform(param.storageAccounts, param);
                    expect(_.endsWith(result.accounts[0].name, `${param.storageAccounts.nameSuffix}1`)).toEqual(true);
                    expect(result.accounts[0].kind).toEqual('Storage');
                    expect(result.accounts[0].sku.name).toEqual('Premium_LRS');
                    expect(result.accounts[0].properties.encryption.services.blob.enabled).toEqual(true);
                    expect(result.accounts[0].properties.encryption.services.file.enabled).toEqual(true);
                    expect(result.accounts[0].properties.encryption.keySource).toEqual('Microsoft.Keyvault');
                    expect(result.accounts[0].properties.encryption.keyvaultproperties.keyname).toEqual('testkeyname');
                    expect(result.accounts[0].properties.encryption.keyvaultproperties.keyversion).toEqual('testkeyversion');
                    expect(result.accounts[0].properties.encryption.keyvaultproperties.keyvaulturi).toEqual('testkeyvaulturi');
                    expect(result.accounts[0].properties.hasOwnProperty('supportsHttpsTrafficOnly')).toEqual(false);
                });
                it('if keyVaultProperties are not provided, RP shape include keySource as storage', () => {
                    param.storageAccounts.count = 1;
                    param.storageAccounts.supportsHttpsTrafficOnly = false;
                    param.storageAccounts.keyVaultProperties = {};
                    param.storageAccounts.accounts = [];

                    let result = storageSettings.transform(param.storageAccounts, param);
                    expect(_.endsWith(result.accounts[0].name, `${param.storageAccounts.nameSuffix}1`)).toEqual(true);
                    expect(result.accounts[0].kind).toEqual('Storage');
                    expect(result.accounts[0].sku.name).toEqual('Premium_LRS');
                    expect(result.accounts[0].properties.encryption.services.blob.enabled).toEqual(true);
                    expect(result.accounts[0].properties.encryption.services.file.enabled).toEqual(true);
                    expect(result.accounts[0].properties.encryption.keySource).toEqual('Microsoft.Storage');
                    expect(result.accounts[0].properties.encryption.hasOwnProperty('keyvaultproperties')).toEqual(false);
                    expect(result.accounts[0].properties.hasOwnProperty('supportsHttpsTrafficOnly')).toEqual(false);
                });
            });
        });
    }

    describe('getUniqueString:', () => {
        it('validates that unique string functions is idempotent', () => {
            let getUniqueString = storageSettings.__get__('getUniqueString');

            let result = getUniqueString('test input');
            expect(result).toEqual(getUniqueString('test input'));
        });
        it('validates that unique string functions returns different result for different inputs', () => {
            let getUniqueString = storageSettings.__get__('getUniqueString');

            let result = getUniqueString('test input');
            expect(result).not.toEqual(getUniqueString('test input1'));
        });
        it('validates that unique string return is 13 char long', () => {
            let getUniqueString = storageSettings.__get__('getUniqueString');

            let result = getUniqueString('test input');
            expect(result.length).toEqual(13);
        });
    });
});