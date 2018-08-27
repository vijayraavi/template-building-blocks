describe('storageHelper:', () => {
    let rewire = require('rewire');
    let storageHelper = rewire('../src/core/storageHelper.js');
    let _ = require('lodash');
    let v = require('../src/core/validation.js');

    let storageParams = {
        nameSuffix: 'ST',
        count: 2,
        skuType: 'Premium_LRS',
        accounts: ['vm7tt2e6prktm3lst1', 'vm7tt2e6prktm3lst2'],
        managed: false,
        supportsHttpsTrafficOnly: true,
        encryptBlobStorage: true,
        encryptFileStorage: true,
        encryptQueueStorage: false,
        encryptTableStorage: true,
        keyVaultProperties: {
            keyName: 'testkeyname',
            keyVersion: 'testkeyversion',
            keyVaultUri: 'testkeyvaulturi'
        },
        subscriptionId: '3b518fac-e5c8-4f59-8ed5-d70b626f8e10',
        resourceGroupName: 'rs-test6-rg'
    };

    let diagStorageParams = {
        nameSuffix: 'DIAG',
        count: 2,
        skuType: 'Standard_LRS',
        accounts: ['vm7tt2e6prktm3lst1', 'vm7tt2e6prktm3lst2'],
        managed: false,
        supportsHttpsTrafficOnly: true,
        encryptBlobStorage: true,
        encryptFileStorage: true,
        encryptQueueStorage: false,
        encryptTableStorage: false,
        keyVaultProperties: {
            keyName: 'testkeyname',
            keyVersion: 'testkeyversion',
            keyVaultUri: 'testkeyvaulturi'
        },
        subscriptionId: '3b518fac-e5c8-4f59-8ed5-d70b626f8e10',
        resourceGroupName: 'rs-test6-rg'
    };
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
                        validations: storageHelper.storageValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.nameSuffix');

                    settings.nameSuffix = null;
                    result = v.validate({
                        settings: settings,
                        validations: storageHelper.storageValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.nameSuffix');

                    settings.nameSuffix = 'test';
                    result = v.validate({
                        settings: settings,
                        validations: storageHelper.storageValidations
                    });
                    expect(result.length).toEqual(0);
                });
            });
            describe('managed:', () => {
                it('validates valid value for managed property is boolean.', () => {
                    settings.managed = 'yes';
                    let result = v.validate({
                        settings: settings,
                        validations: storageHelper.storageValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.managed');

                    settings.managed = 'true';
                    result = v.validate({
                        settings: settings,
                        validations: storageHelper.storageValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.managed');

                    settings.managed = true;
                    result = v.validate({
                        settings: settings,
                        validations: storageHelper.storageValidations
                    });
                    expect(result.length).toEqual(0);
                });
            });
            describe('skuType:', () => {
                it('validates skuType canot be null or empty string, if managed is false.', () => {
                    settings.skuType = '';
                    let result = v.validate({
                        settings: settings,
                        validations: storageHelper.storageValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.skuType');

                    settings.skuType = null;
                    result = v.validate({
                        settings: settings,
                        validations: storageHelper.storageValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.skuType');

                    settings.skuType = 'test';
                    result = v.validate({
                        settings: settings,
                        validations: storageHelper.storageValidations
                    });
                    expect(result.length).toEqual(0);
                });
                it('validates skuType is ignored if managed is true.', () => {
                    settings.managed = true;

                    settings.skuType = '';
                    let result = v.validate({
                        settings: settings,
                        validations: storageHelper.storageValidations
                    });
                    expect(result.length).toEqual(0);

                    settings.skuType = null;
                    result = v.validate({
                        settings: settings,
                        validations: storageHelper.storageValidations
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
                        validations: storageHelper.storageValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.count');

                    settings.count = '5';
                    result = v.validate({
                        settings: settings,
                        validations: storageHelper.storageValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.count');

                    settings.count = null;
                    result = v.validate({
                        settings: settings,
                        validations: storageHelper.storageValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.count');

                    settings.count = 5;
                    result = v.validate({
                        settings: settings,
                        validations: storageHelper.storageValidations
                    });
                    expect(result.length).toEqual(0);
                });
                it('validates count is ignored if managed is true.', () => {
                    settings.managed = true;

                    settings.count = 0;
                    let result = v.validate({
                        settings: settings,
                        validations: storageHelper.storageValidations
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
                        validations: storageHelper.diagnosticValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.nameSuffix');

                    settings.nameSuffix = null;
                    result = v.validate({
                        settings: settings,
                        validations: storageHelper.diagnosticValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.nameSuffix');

                    settings.nameSuffix = 'test';
                    result = v.validate({
                        settings: settings,
                        validations: storageHelper.diagnosticValidations
                    });
                    expect(result.length).toEqual(0);
                });
            });
            describe('managed:', () => {
                it('validates managed property for diagnostic storage cannot be true.', () => {
                    settings.managed = true;
                    let result = v.validate({
                        settings: settings,
                        validations: storageHelper.diagnosticValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.managed');

                    settings.managed = false;
                    result = v.validate({
                        settings: settings,
                        validations: storageHelper.diagnosticValidations
                    });
                    expect(result.length).toEqual(0);
                });
            });
            describe('skuType:', () => {
                it('validates skuType canot be null or empty string or premium storage', () => {
                    settings.skuType = '';
                    let result = v.validate({
                        settings: settings,
                        validations: storageHelper.diagnosticValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.skuType');

                    settings.skuType = null;
                    result = v.validate({
                        settings: settings,
                        validations: storageHelper.diagnosticValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.skuType');

                    settings.skuType = 'Premium_LRS';
                    result = v.validate({
                        settings: settings,
                        validations: storageHelper.diagnosticValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.skuType');

                    settings.skuType = 'Standard_LRS';
                    result = v.validate({
                        settings: settings,
                        validations: storageHelper.diagnosticValidations
                    });
                    expect(result.length).toEqual(0);
                });
            });
            describe('count:', () => {
                it('validates count is greater than 0', () => {
                    settings.count = 0;
                    let result = v.validate({
                        settings: settings,
                        validations: storageHelper.diagnosticValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.count');

                    settings.count = '5';
                    result = v.validate({
                        settings: settings,
                        validations: storageHelper.diagnosticValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.count');

                    settings.count = null;
                    result = v.validate({
                        settings: settings,
                        validations: storageHelper.diagnosticValidations
                    });
                    expect(result.length).toEqual(1);
                    expect(result[0].name).toEqual('.count');

                    settings.count = 5;
                    result = v.validate({
                        settings: settings,
                        validations: storageHelper.diagnosticValidations
                    });
                    expect(result.length).toEqual(0);
                });
            });
        });
    });

    if (jasmine.testConfiguration.runTransform) {
        describe('storage accounts transform:', () => {
            let temp = { storageAccounts: storageParams};
            let settings;
            beforeEach(() => {
                settings = _.cloneDeep(temp);
            });

            it('returns empty array if count of existing storage accounts is equal to count property:', () => {
                let result = storageHelper.transform(settings.storageAccounts, settings);
                expect(result.accounts.length).toEqual(0);
            });

            it('returns empty array if count of existing storage accounts is greater than count property:', () => {
                settings.storageAccounts.accounts = ['A', 'B', 'C'];

                let result = storageHelper.transform(settings.storageAccounts, settings);
                expect(result.accounts.length).toEqual(0);
            });
            it('returns array with storage account to create. length of array is count - no. of existing accounts provided:', () => {
                settings.storageAccounts.accounts = ['A'];

                let result = storageHelper.transform(settings.storageAccounts, settings);
                expect(result.accounts.length).toEqual(1);
            });
            it('converts settings to shape required for invoking storageSettings block', () => {
                settings.storageAccounts.accounts = [];

                let result = storageHelper.transform(settings.storageAccounts, settings);
                expect(_.endsWith(result.accounts[0].name, `${settings.storageAccounts.nameSuffix}1`)).toEqual(true);
                expect(result.accounts[0].kind).toEqual('Storage');
                expect(result.accounts[0].sku).toEqual('Premium_LRS');
                expect(result.accounts[0].encryptBlobStorage).toEqual(true);
                expect(result.accounts[0].encryptFileStorage).toEqual(true);
                expect(result.accounts[0].encryptQueueStorage).toEqual(false);
                expect(result.accounts[0].encryptTableStorage).toEqual(true);
                expect(result.accounts[0].keyVaultProperties.keyName).toEqual('testkeyname');
                expect(result.accounts[0].keyVaultProperties.keyVersion).toEqual('testkeyversion');
                expect(result.accounts[0].keyVaultProperties.keyVaultUri).toEqual('testkeyvaulturi');
                expect(result.accounts[0].supportsHttpsTrafficOnly).toEqual(true);

                expect(_.endsWith(result.accounts[1].name, `${settings.storageAccounts.nameSuffix}2`)).toEqual(true);
                expect(result.accounts[1].kind).toEqual('Storage');
                expect(result.accounts[1].sku).toEqual('Premium_LRS');
                expect(result.accounts[1].encryptBlobStorage).toEqual(true);
                expect(result.accounts[1].encryptFileStorage).toEqual(true);
                expect(result.accounts[1].encryptQueueStorage).toEqual(false);
                expect(result.accounts[1].encryptTableStorage).toEqual(true);
                expect(result.accounts[1].keyVaultProperties.keyName).toEqual('testkeyname');
                expect(result.accounts[1].keyVaultProperties.keyVersion).toEqual('testkeyversion');
                expect(result.accounts[1].keyVaultProperties.keyVaultUri).toEqual('testkeyvaulturi');
                expect(result.accounts[1].supportsHttpsTrafficOnly).toEqual(true);
            });
        });
    }

    describe('getUniqueString:', () => {
        it('validates that unique string functions is idempotent', () => {
            let getUniqueString = storageHelper.__get__('getUniqueString');

            let result = getUniqueString('test input');
            expect(result).toEqual(getUniqueString('test input'));
        });
        it('validates that unique string functions returns different result for different inputs', () => {
            let getUniqueString = storageHelper.__get__('getUniqueString');

            let result = getUniqueString('test input');
            expect(result).not.toEqual(getUniqueString('test input1'));
        });
        it('validates that unique string return is 13 char long', () => {
            let getUniqueString = storageHelper.__get__('getUniqueString');

            let result = getUniqueString('test input');
            expect(result.length).toEqual(13);
        });
    });
});