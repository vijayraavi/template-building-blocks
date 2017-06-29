describe('storageSettings:', () => {
    let rewire = require('rewire');
    let storageSettings = rewire('../core/storageSettings.js');
    let _ = require('lodash');
    let v = require('../core/validation.js');

    describe('storage accounts merge:', () => {
        it('validates valid defaults are applied for storage accounts.', () => {
            let settings = {};

            let mergedValue = storageSettings.merge(settings, 'storageAccounts');
            expect(mergedValue.count).toEqual(1);
            expect(mergedValue.nameSuffix).toEqual('st');
            expect(mergedValue.skuType).toEqual('Premium_LRS');
            expect(mergedValue.managed).toEqual(true);
            expect(mergedValue.supportsHttpsTrafficOnly).toEqual(false);
            expect(mergedValue.encryptBlobStorage).toEqual(false);
            expect(mergedValue.encryptFileStorage).toEqual(false);
            expect(Object.keys(mergedValue.keyVaultProperties).length).toEqual(0);
        });
        it('validates defaults do not override settings.', () => {
            let settings = {
                'nameSuffix': 'test',
                'count': 2,
                'skuType': 'Standard_LRS',
                'managed': false,
                'supportsHttpsTrafficOnly': true,
                'encryptBlobStorage': true,
                'encryptFileStorage': true,
                'keyVaultProperties': {
                    'keyName': 'testkeyname',
                    'keyVersion': 'testkeyversion',
                    'keyVaultUri': 'testkeyvaulturi'
                }
            };

            let mergedValue = storageSettings.merge(settings, 'storageAccounts');
            expect(mergedValue.count).toEqual(2);
            expect(mergedValue.nameSuffix).toEqual('test');
            expect(mergedValue.skuType).toEqual('Standard_LRS');
            expect(mergedValue.managed).toEqual(false);
            expect(mergedValue.supportsHttpsTrafficOnly).toEqual(true);
            expect(mergedValue.encryptBlobStorage).toEqual(true);
            expect(mergedValue.encryptFileStorage).toEqual(true);
            expect(Object.keys(mergedValue.keyVaultProperties).length).toEqual(3);
            expect(mergedValue.keyVaultProperties.keyName).toEqual('testkeyname');
            expect(mergedValue.keyVaultProperties.keyVersion).toEqual('testkeyversion');
            expect(mergedValue.keyVaultProperties.keyVaultUri).toEqual('testkeyvaulturi');
        });
        it('validates additional properties in settings are not removed.', () => {
            let settings = {
                'name1': 'test'
            };

            let mergedValue = storageSettings.merge(settings, 'storageAccounts');
            expect(mergedValue.hasOwnProperty('name1')).toEqual(true);
            expect(mergedValue.name1).toEqual('test');
        });
        it('validates missing properties in settings are picked up from defaults.', () => {
            let settings = {
                'nameSuffix': 'test',
                'skuType': 'Standard_LRS',
                'managed': false,
                'supportsHttpsTrafficOnly': true
            };

            let mergedValue = storageSettings.merge(settings, 'storageAccounts');
            expect(mergedValue.hasOwnProperty('count')).toEqual(true);
            expect(mergedValue.count).toEqual(1);
            expect(mergedValue.supportsHttpsTrafficOnly).toEqual(true);
            expect(mergedValue.encryptBlobStorage).toEqual(false);
            expect(mergedValue.encryptFileStorage).toEqual(false);
            expect(Object.keys(mergedValue.keyVaultProperties).length).toEqual(0);
        });
    });
    describe('diagnostic storage accounts merge:', () => {
        it('validates valid defaults are applied for storage accounts.', () => {
            let settings = {};

            let mergedValue = storageSettings.merge(settings);
            expect(mergedValue.count).toEqual(1);
            expect(mergedValue.nameSuffix).toEqual('diag');
            expect(mergedValue.skuType).toEqual('Standard_LRS');
            expect(mergedValue.managed).toEqual(false);
            expect(mergedValue.supportsHttpsTrafficOnly).toEqual(false);
            expect(mergedValue.encryptBlobStorage).toEqual(false);
            expect(mergedValue.encryptFileStorage).toEqual(false);
            expect(Object.keys(mergedValue.keyVaultProperties).length).toEqual(0);
        });
        it('validates defaults do not override settings.', () => {
            let settings = {
                'nameSuffix': 'test',
                'count': 2,
                'skuType': 'LRS',
                'managed': true,
                'supportsHttpsTrafficOnly': true,
                'encryptBlobStorage': true,
                'encryptFileStorage': true,
                'keyVaultProperties': {
                    'keyName': 'testkeyname',
                    'keyVersion': 'testkeyversion',
                    'keyVaultUri': 'testkeyvaulturi'
                }
            };

            let mergedValue = storageSettings.merge(settings);
            expect(mergedValue.count).toEqual(2);
            expect(mergedValue.nameSuffix).toEqual('test');
            expect(mergedValue.skuType).toEqual('LRS');
            expect(mergedValue.managed).toEqual(true);
            expect(mergedValue.supportsHttpsTrafficOnly).toEqual(true);
            expect(mergedValue.encryptBlobStorage).toEqual(true);
            expect(mergedValue.encryptFileStorage).toEqual(true);
            expect(Object.keys(mergedValue.keyVaultProperties).length).toEqual(3);
            expect(mergedValue.keyVaultProperties.keyName).toEqual('testkeyname');
            expect(mergedValue.keyVaultProperties.keyVersion).toEqual('testkeyversion');
            expect(mergedValue.keyVaultProperties.keyVaultUri).toEqual('testkeyvaulturi');
        });
        it('validates additional properties in settings are not removed.', () => {
            let settings = {
                'name1': 'test'
            };

            let mergedValue = storageSettings.merge(settings);
            expect(mergedValue.hasOwnProperty('name1')).toEqual(true);
            expect(mergedValue.name1).toEqual('test');
        });
        it('validates missing properties in settings are picked up from defaults.', () => {
            let settings = {
                'skuType': 'Standard_LRS',
                'managed': false,
                'supportsHttpsTrafficOnly': true
            };

            let mergedValue = storageSettings.merge(settings);
            expect(mergedValue.hasOwnProperty('nameSuffix')).toEqual(true);
            expect(mergedValue.nameSuffix).toEqual('diag');
            expect(mergedValue.supportsHttpsTrafficOnly).toEqual(true);
            expect(mergedValue.encryptBlobStorage).toEqual(false);
            expect(mergedValue.encryptFileStorage).toEqual(false);
            expect(Object.keys(mergedValue.keyVaultProperties).length).toEqual(0);
        });
    });
    describe('validations:', () => {
        describe('storage validations:', () => {
            let settings = {
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
            };
            describe('nameSuffix:', () => {
                let validation = storageSettings.__get__('storageValidations').nameSuffix;
                it('validates nameSuffix canot be an empty string.', () => {
                    let result = validation('');
                    expect(result.result).toEqual(false);

                    result = validation('test');
                    expect(result.result).toEqual(true);

                    result = validation(null);
                    expect(result.result).toEqual(false);
                });
            });
            describe('managed:', () => {
                let validation = storageSettings.__get__('storageValidations').managed;
                it('validates valid value for managed property is boolean.', () => {
                    let result = validation('yes', settings);
                    expect(result.result).toEqual(false);

                    result = validation('true', settings);
                    expect(result.result).toEqual(false);

                    result = validation(true, settings);
                    expect(result.result).toEqual(true);
                });
            });
            describe('skuType:', () => {
                let validation = storageSettings.__get__('storageValidations').skuType;
                it('validates skuType canot be null or empty string, if managed is false.', () => {
                    let result = validation('', settings);
                    expect(result.result).toEqual(false);

                    result = validation('test', settings);
                    expect(result.result).toEqual(true);

                    result = validation(null, settings);
                    expect(result.result).toEqual(false);
                });
                it('validates skuType is ignored if managed is true.', () => {
                    let param = _.cloneDeep(settings);
                    param.managed = true;

                    let result = validation('', param);
                    expect(result.result).toEqual(true);

                    result = validation(null, param);
                    expect(result.result).toEqual(true);
                });
            });
            describe('count:', () => {
                let validation = storageSettings.__get__('storageValidations').count;
                it('validates count is greater than 0, if managed is false.', () => {
                    let param = _.cloneDeep(settings);
                    param.count = 0;

                    let result = validation(0, param);
                    expect(result.result).toEqual(false);

                    result = validation('5', param);
                    expect(result.result).toEqual(false);

                    result = validation(null, param);
                    expect(result.result).toEqual(false);

                    result = validation(5, param);
                    expect(result.result).toEqual(true);
                });
                it('validates count is ignored if managed is true.', () => {
                    let param = _.cloneDeep(settings);
                    param.managed = true;

                    let result = validation(0, param);
                    expect(result.result).toEqual(true);

                    result = validation(null, param);
                    expect(result.result).toEqual(true);
                });
            });
            describe('supportsHttpsTrafficOnly:', () => {
                let validation = storageSettings.__get__('storageValidations').supportsHttpsTrafficOnly;
                it('validates valid value for supportsHttpsTrafficOnly property is boolean.', () => {
                    let result = validation('yes', settings);
                    expect(result.result).toEqual(false);

                    result = validation('true', settings);
                    expect(result.result).toEqual(false);

                    result = validation(true, settings);
                    expect(result.result).toEqual(true);
                });
            });
            describe('encryptBlobStorage:', () => {
                let validation = storageSettings.__get__('storageValidations').encryptBlobStorage;
                it('validates valid value for encryptBlobStorage property is boolean.', () => {
                    let result = validation('yes', settings);
                    expect(result.result).toEqual(false);

                    result = validation('true', settings);
                    expect(result.result).toEqual(false);

                    result = validation(true, settings);
                    expect(result.result).toEqual(true);
                });
            });
            describe('encryptFileStorage:', () => {
                let validation = storageSettings.__get__('storageValidations').encryptFileStorage;
                it('validates valid value for encryptFileStorage property is boolean.', () => {
                    let result = validation('yes', settings);
                    expect(result.result).toEqual(false);

                    result = validation('true', settings);
                    expect(result.result).toEqual(false);

                    result = validation(true, settings);
                    expect(result.result).toEqual(true);
                });
            });
            describe('keyvaultproperties:', () => {
                it('validates no error is thrown if keyvaultproperties is not provided or empty object.', () => {
                    let testSettings = _.cloneDeep(settings);
                    testSettings.keyVaultProperties = null;
                    let result = v.validate({
                        settings: testSettings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(0);

                    testSettings.keyVaultProperties = {};
                    result = v.validate({
                        settings: testSettings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(0);
                });
                it('validates that if keyvaultproperties is not empty than required properties are provided', () => {
                    let testSettings = _.cloneDeep(settings);
                    testSettings.keyVaultProperties = { test: 'test' };
                    let result = v.validate({
                        settings: testSettings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(3);
                    expect(result[0].name).toEqual('.keyVaultProperties.keyName');
                    expect(result[1].name).toEqual('.keyVaultProperties.keyVersion');
                    expect(result[2].name).toEqual('.keyVaultProperties.keyVaultUri');

                    testSettings.keyVaultProperties = {
                        keyName: 'testkeyname',
                        keyVersion: 'testkeyversion',
                        keyVaultUri: 'testkeyvaulturi'
                    };
                    result = v.validate({
                        settings: testSettings,
                        validations: storageSettings.storageValidations
                    });
                    expect(result.length).toEqual(0);
                });
            });
        });
        describe('diagnostic storage validations:', () => {
            let settings = {
                nameSuffix: 'diag',
                count: 2,
                skuType: 'Standard_LRS',
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
            };
            describe('nameSuffix:', () => {
                let validation = storageSettings.__get__('diagnosticValidations').nameSuffix;
                it('validates nameSuffix canot be an empty string.', () => {
                    let result = validation('');
                    expect(result.result).toEqual(false);

                    result = validation('test');
                    expect(result.result).toEqual(true);

                    result = validation(null);
                    expect(result.result).toEqual(false);
                });
            });
            describe('managed:', () => {
                let validation = storageSettings.__get__('diagnosticValidations').managed;
                it('validates managed property for diagnostic storage cannot be true.', () => {
                    let result = validation('true', settings);
                    expect(result.result).toEqual(false);

                    result = validation(true, settings);
                    expect(result.result).toEqual(false);

                    result = validation(false, settings);
                    expect(result.result).toEqual(true);
                });
            });
            describe('skuType:', () => {
                let validation = storageSettings.__get__('diagnosticValidations').skuType;
                it('validates skuType canot be null or empty string or premium storage', () => {
                    let result = validation('', settings);
                    expect(result.result).toEqual(false);

                    result = validation(null, settings);
                    expect(result.result).toEqual(false);

                    result = validation('Standard_LRS', settings);
                    expect(result.result).toEqual(true);

                    let param = _.cloneDeep(settings);
                    param.skuType = 'Premium_LRS';

                    result = validation('Premium_LRS', param);
                    expect(result.result).toEqual(false);
                });
            });
            describe('count:', () => {
                let validation = storageSettings.__get__('diagnosticValidations').count;
                it('validates count is greater than 0', () => {
                    let param = _.cloneDeep(settings);
                    param.count = 0;

                    let result = validation(0, param);
                    expect(result.result).toEqual(false);

                    result = validation('5', param);
                    expect(result.result).toEqual(false);

                    result = validation(null, param);
                    expect(result.result).toEqual(false);

                    result = validation(5, param);
                    expect(result.result).toEqual(true);
                });
            });
            describe('supportsHttpsTrafficOnly:', () => {
                let validation = storageSettings.__get__('diagnosticValidations').supportsHttpsTrafficOnly;
                it('validates valid value for supportsHttpsTrafficOnly property is boolean.', () => {
                    let result = validation('yes', settings);
                    expect(result.result).toEqual(false);

                    result = validation('true', settings);
                    expect(result.result).toEqual(false);

                    result = validation(true, settings);
                    expect(result.result).toEqual(true);
                });
            });
            describe('encryptBlobStorage:', () => {
                let validation = storageSettings.__get__('diagnosticValidations').encryptBlobStorage;
                it('validates valid value for encryptBlobStorage property is boolean.', () => {
                    let result = validation('yes', settings);
                    expect(result.result).toEqual(false);

                    result = validation('true', settings);
                    expect(result.result).toEqual(false);

                    result = validation(true, settings);
                    expect(result.result).toEqual(true);
                });
            });
            describe('encryptFileStorage:', () => {
                let validation = storageSettings.__get__('diagnosticValidations').encryptFileStorage;
                it('validates valid value for encryptFileStorage property is boolean.', () => {
                    let result = validation('yes', settings);
                    expect(result.result).toEqual(false);

                    result = validation('true', settings);
                    expect(result.result).toEqual(false);

                    result = validation(true, settings);
                    expect(result.result).toEqual(true);
                });
            });
            describe('keyvaultproperties:', () => {
                it('validates no error is thrown if keyvaultproperties is not provided or empty object.', () => {
                    let testSettings = _.cloneDeep(settings);
                    testSettings.keyVaultProperties = null;
                    let result = v.validate({
                        settings: testSettings,
                        validations: storageSettings.diagnosticValidations
                    });
                    expect(result.length).toEqual(0);

                    testSettings.keyVaultProperties = {};
                    result = v.validate({
                        settings: testSettings,
                        validations: storageSettings.diagnosticValidations
                    });
                    expect(result.length).toEqual(0);
                });
                it('validates that if keyvaultproperties is not empty than required properties are provided', () => {
                    let testSettings = _.cloneDeep(settings);
                    testSettings.keyVaultProperties = { test: 'test' };
                    let result = v.validate({
                        settings: testSettings,
                        validations: storageSettings.diagnosticValidations
                    });
                    expect(result.length).toEqual(3);
                    expect(result[0].name).toEqual('.keyVaultProperties.keyName');
                    expect(result[1].name).toEqual('.keyVaultProperties.keyVersion');
                    expect(result[2].name).toEqual('.keyVaultProperties.keyVaultUri');

                    testSettings.keyVaultProperties = {
                        keyName: 'testkeyname',
                        keyVersion: 'testkeyversion',
                        keyVaultUri: 'testkeyvaulturi'
                    };
                    result = v.validate({
                        settings: testSettings,
                        validations: storageSettings.diagnosticValidations
                    });
                    expect(result.length).toEqual(0);
                });
            });
        });
    });

    if (global.testConfiguration.runTransform) {
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
            it('returns empty array if count of existing storage accounts is greater than count property:', () => {
                let param = _.cloneDeep(settings);
                param.storageAccounts.accounts = ['A', 'B', 'C'];

                let result = storageSettings.transform(param.storageAccounts, param);
                expect(result.accounts.length).toEqual(0);
            });
            it('returns array with storage account to create. length of array is count - no. of existing accounts provided:', () => {
                let param = _.cloneDeep(settings);
                param.storageAccounts.accounts = ['A'];

                let result = storageSettings.transform(param.storageAccounts, param);
                expect(result.accounts.length).toEqual(1);
            });
            it('converts settings to RP shape', () => {
                let param = _.cloneDeep(settings);
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
                let param = _.cloneDeep(settings);
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
                let param = _.cloneDeep(settings);
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
            it('if supportsHttpsTrafficOnly & ecrypt options are false, RP shape doesnt include properties property', () => {
                let param = _.cloneDeep(settings);
                param.storageAccounts.count = 1;
                param.storageAccounts.supportsHttpsTrafficOnly = false;
                param.storageAccounts.encryptBlobStorage = false;
                param.storageAccounts.encryptFileStorage = false;
                param.storageAccounts.accounts = [];

                let result = storageSettings.transform(param.storageAccounts, param);
                expect(_.endsWith(result.accounts[0].name, `${param.storageAccounts.nameSuffix}1`)).toEqual(true);
                expect(result.accounts[0].kind).toEqual('Storage');
                expect(result.accounts[0].sku.name).toEqual('Premium_LRS');
                expect(result.accounts[0].hasOwnProperty('properties')).toEqual(false);
            });
            it('if keyVaultProperties are provided, RP shape include keySource and keyvault properties', () => {
                let param = _.cloneDeep(settings);
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
                let param = _.cloneDeep(settings);
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