describe('keyVaultSettings', () => {
    let rewire = require('rewire');
    let keyVaultSettings = rewire('../src/core/keyVaultSettings.js');
    let _ = require('lodash');
    let validation = require('../src/core/validation.js');
    let resource = require('../src/core/resources.js');

    describe('isValidSkuFamily', () => {
        let isValidSkuFamily = keyVaultSettings.__get__('isValidSkuFamily');

        it('undefined', () => {
            expect(isValidSkuFamily()).toEqual(false);
        });

        it('null', () => {
            expect(isValidSkuFamily(null)).toEqual(false);
        });

        it('empty', () => {
            expect(isValidSkuFamily('')).toEqual(false);
        });

        it('whitespace', () => {
            expect(isValidSkuFamily(' ')).toEqual(false);
        });

        it('invalid spacing', () => {
            expect(isValidSkuFamily(' A ')).toEqual(false);
        });

        it('invalid casing', () => {
            expect(isValidSkuFamily('a')).toEqual(false);
        });

        it('invalid value', () => {
            expect(isValidSkuFamily('NOT_VALID')).toEqual(false);
        });

        it('A', () => {
            expect(isValidSkuFamily('A')).toEqual(true);
        });
    });

    describe('isValidSkuName', () => {
        let isValid = keyVaultSettings.__get__('isValidSkuName');
        let validValues = keyVaultSettings.__get__('validSkuNames');
        let testingValues = ['Premium', 'Standard'];
        let failureValues = {
            'undefined': undefined,
            'null': null,
            'empty': '',
            'whitespace': ' ',
            'invalid spacing': ` ${testingValues[0]} `,
            'invalid casing': testingValues[0].toUpperCase(),
            'invalid value': 'NOT_VALID'
        };

        for (let key in failureValues) {
            it(failureValues[key], () => {
                expect(isValid(failureValues[key])).toEqual(false);
            });
        }

        it('Missed values', () => {
            let diff = _.difference(validValues, testingValues);
            expect(diff.length).toBe(0, `Missed values: ${diff.join(', ')}`);
        });

        for (const testValue of testingValues) {
            it(testValue, () => {
                expect(isValid(testValue)).toEqual(true);
            });
        }
    });

    describe('isValidCreateMode', () => {
        let isValid = keyVaultSettings.__get__('isValidCreateMode');
        let validValues = keyVaultSettings.__get__('validCreateModes');
        let testingValues = ['Default', 'Recover'];
        let failureValues = {
            'undefined': undefined,
            'null': null,
            'empty': '',
            'whitespace': ' ',
            'invalid spacing': ` ${testingValues[0]} `,
            'invalid casing': testingValues[0].toUpperCase(),
            'invalid value': 'NOT_VALID'
        };

        for (let key in failureValues) {
            it(failureValues[key], () => {
                expect(isValid(failureValues[key])).toEqual(false);
            });
        }

        it('Missed values', () => {
            let diff = _.difference(validValues, testingValues);
            expect(diff.length).toBe(0, `Missed values: ${diff.join(', ')}`);
        });

        for (const testValue of testingValues) {
            it(testValue, () => {
                expect(isValid(testValue)).toEqual(true);
            });
        }
    });

    describe('isValidKeyPermission', () => {
        let isValid = keyVaultSettings.__get__('isValidKeyPermission');
        let validValues = keyVaultSettings.__get__('validKeyPermissions');
        let testingValues = ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey', 'sign', 'verify', 'get', 'list', 'create',
            'update', 'import', 'delete', 'backup', 'restore', 'recover', 'purge'];
        let failureValues = {
            'undefined': undefined,
            'null': null,
            'empty': '',
            'whitespace': ' ',
            'invalid spacing': ` ${testingValues[0]} `,
            'invalid casing': testingValues[0].toUpperCase(),
            'invalid value': 'NOT_VALID'
        };

        for (let key in failureValues) {
            it(failureValues[key], () => {
                expect(isValid(failureValues[key])).toEqual(false);
            });
        }

        it('Missed values', () => {
            let diff = _.difference(validValues, testingValues);
            expect(diff.length).toBe(0, `Missed values: ${diff.join(', ')}`);
        });

        for (const testValue of testingValues) {
            it(testValue, () => {
                expect(isValid(testValue)).toEqual(true);
            });
        }
    });

    describe('isValidSecretPermission', () => {
        let isValid = keyVaultSettings.__get__('isValidSecretPermission');
        let validValues = keyVaultSettings.__get__('validSecretPermissions');
        let testingValues = ['get', 'list', 'set', 'delete', 'backup', 'restore', 'recover', 'purge'];
        let failureValues = {
            'undefined': undefined,
            'null': null,
            'empty': '',
            'whitespace': ' ',
            'invalid spacing': ` ${testingValues[0]} `,
            'invalid casing': testingValues[0].toUpperCase(),
            'invalid value': 'NOT_VALID'
        };

        for (let key in failureValues) {
            it(failureValues[key], () => {
                expect(isValid(failureValues[key])).toEqual(false);
            });
        }

        it('Missed values', () => {
            let diff = _.difference(validValues, testingValues);
            expect(diff.length).toBe(0, `Missed values: ${diff.join(', ')}`);
        });

        for (const testValue of testingValues) {
            it(testValue, () => {
                expect(isValid(testValue)).toEqual(true);
            });
        }
    });

    describe('isValidCertificatePermission', () => {
        let isValid = keyVaultSettings.__get__('isValidCertificatePermission');
        let validValues = keyVaultSettings.__get__('validCertificatePermissions');
        let testingValues = [
            'get', 'list', 'delete', 'create', 'import', 'update', 'managecontacts',
            'getissuers', 'listissuers', 'setissuers', 'deleteissuers', 'manageissuers', 'recover', 'purge'];
        let failureValues = {
            'undefined': undefined,
            'null': null,
            'empty': '',
            'whitespace': ' ',
            'invalid spacing': ` ${testingValues[0]} `,
            'invalid casing': testingValues[0].toUpperCase(),
            'invalid value': 'NOT_VALID'
        };

        for (let key in failureValues) {
            it(failureValues[key], () => {
                expect(isValid(failureValues[key])).toEqual(false);
            });
        }

        it('Missed values', () => {
            let diff = _.difference(validValues, testingValues);
            expect(diff.length).toBe(0, `Missed values: ${diff.join(', ')}`);
        });

        for (const testValue of testingValues) {
            it(testValue, () => {
                expect(isValid(testValue)).toEqual(true);
            });
        }
    });

    describe('isValidKeyProtection', () => {
        let isValid = keyVaultSettings.__get__('isValidKeyProtection');
        let validValues = keyVaultSettings.__get__('validKeyProtections');
        let testingValues = ['hsm', 'software'];
        let failureValues = {
            'undefined': undefined,
            'null': null,
            'empty': '',
            'whitespace': ' ',
            'invalid spacing': ` ${testingValues[0]} `,
            'invalid casing': testingValues[0].toUpperCase(),
            'invalid value': 'NOT_VALID'
        };

        for (let key in failureValues) {
            it(failureValues[key], () => {
                expect(isValid(failureValues[key])).toEqual(false);
            });
        }

        it('Missed values', () => {
            let diff = _.difference(validValues, testingValues);
            expect(diff.length).toBe(0, `Missed values: ${diff.join(', ')}`);
        });

        for (const testValue of testingValues) {
            it(testValue, () => {
                expect(isValid(testValue)).toEqual(true);
            });
        }
    });

    describe('isValidJsonWebKeyOperation', () => {
        let isValid = keyVaultSettings.__get__('isValidJsonWebKeyOperation');
        let validValues = keyVaultSettings.__get__('validJsonWebKeyOperations');
        let testingValues = ['decrypt', 'encrypt', 'sign', 'unwrapKey', 'verify', 'wrapKey'];
        let failureValues = {
            'undefined': undefined,
            'null': null,
            'empty': '',
            'whitespace': ' ',
            'invalid spacing': ` ${testingValues[0]} `,
            'invalid casing': testingValues[0].toUpperCase(),
            'invalid value': 'NOT_VALID'
        };

        for (let key in failureValues) {
            it(failureValues[key], () => {
                expect(isValid(failureValues[key])).toEqual(false);
            });
        }

        it('Missed values', () => {
            let diff = _.difference(validValues, testingValues);
            expect(diff.length).toBe(0, `Missed values: ${diff.join(', ')}`);
        });

        for (const testValue of testingValues) {
            it(testValue, () => {
                expect(isValid(testValue)).toEqual(true);
            });
        }
    });

    describe('isValidActionType', () => {
        let isValid = keyVaultSettings.__get__('isValidActionType');
        let validValues = keyVaultSettings.__get__('validActionTypes');
        let testingValues = ['AutoRenew', 'EmailContacts'];
        let failureValues = {
            'undefined': undefined,
            'null': null,
            'empty': '',
            'whitespace': ' ',
            'invalid spacing': ` ${testingValues[0]} `,
            'invalid casing': testingValues[0].toUpperCase(),
            'invalid value': 'NOT_VALID'
        };

        for (let key in failureValues) {
            it(failureValues[key], () => {
                expect(isValid(failureValues[key])).toEqual(false);
            });
        }

        it('Missed values', () => {
            let diff = _.difference(validValues, testingValues);
            expect(diff.length).toBe(0, `Missed values: ${diff.join(', ')}`);
        });

        for (const testValue of testingValues) {
            it(testValue, () => {
                expect(isValid(testValue)).toEqual(true);
            });
        }
    });

    describe('isValidKeyUsage', () => {
        let isValid = keyVaultSettings.__get__('isValidKeyUsage');
        let validValues = keyVaultSettings.__get__('validKeyUsages');
        let testingValues = ['digitalSignature', 'nonRepudiation', 'keyEncipherment', 'dataEncipherment', 'keyAgreement', 'keyCertSign',
            'cRLSign', 'encipherOnly', 'decipherOnly'];
        let failureValues = {
            'undefined': undefined,
            'null': null,
            'empty': '',
            'whitespace': ' ',
            'invalid spacing': ` ${testingValues[0]} `,
            'invalid casing': testingValues[0].toUpperCase(),
            'invalid value': 'NOT_VALID'
        };

        for (let key in failureValues) {
            it(failureValues[key], () => {
                expect(isValid(failureValues[key])).toEqual(false);
            });
        }

        it('Missed values', () => {
            let diff = _.difference(validValues, testingValues);
            expect(diff.length).toBe(0, `Missed values: ${diff.join(', ')}`);
        });

        for (const testValue of testingValues) {
            it(testValue, () => {
                expect(isValid(testValue)).toEqual(true);
            });
        }
    });

    describe('isValidDate', () => {
        let isValid = keyVaultSettings.__get__('isValidDate');
        let validValues = keyVaultSettings.__get__('validKeyUsages');
        let failureValues = {
            'undefined': undefined,
            'null': null,
            'empty': '',
            'whitespace': ' ',
            'invalid value': 'NOT_VALID'
        };

        for (let key in failureValues) {
            it(failureValues[key], () => {
                expect(isValid(failureValues[key]).result).toEqual(false);
            });
        }
    });

    describe('transformTagsToKeyValuePairs', () => {
        it('empty', () => {
            let transformTagsToKeyValuePairs = keyVaultSettings.__get__('transformTagsToKeyValuePairs');
            let tags = {};
            expect(transformTagsToKeyValuePairs(tags)).toEqual('');
        });

        it('single tag', () => {
            let transformTagsToKeyValuePairs = keyVaultSettings.__get__('transformTagsToKeyValuePairs');
            let tags = {
                tag1: 'value1'
            };
            expect(transformTagsToKeyValuePairs(tags)).toEqual('"tag1=value1"');
        });

        it('multiple tags', () => {
            let transformTagsToKeyValuePairs = keyVaultSettings.__get__('transformTagsToKeyValuePairs');
            let tags = {
                tag1: 'value1',
                tag2: 'value2',
                tag3: 'value3'
            };
            expect(transformTagsToKeyValuePairs(tags)).toEqual('"tag1=value1" "tag2=value2" "tag3=value3"');
        });
    });

    describe('merge', () => {
        let merge = keyVaultSettings.__get__('merge');

        let routeTable = {
            name: 'my-route-table',
            virtualNetworks: [
                {
                    name: 'my-virtual-network',
                    subnets: [
                        'biz',
                        'web'
                    ]
                }
            ],
            routes: [
                {
                    name: 'route1',
                    addressPrefix: '10.0.1.0/24',
                    nextHopType: 'VnetLocal'
                },
                {
                    name: 'route2',
                    addressPrefix: '10.0.2.0/24',
                    nextHopType: 'VirtualAppliance',
                    nextHopIpAddress: '192.168.1.1'
                }
            ]
        };

        let buildingBlockSettings = {
            subscriptionId: '00000000-0000-1000-8000-000000000000',
            resourceGroupName: 'test-rg',
            location: 'westus2'
        };

        it('defaults', () => {
            let result = merge({
                settings: [{}],
                buildingBlockSettings: buildingBlockSettings
            });

            expect(result[0].sku.family).toEqual('A');
            expect(result[0].sku.name).toEqual('Standard');
            expect(result[0].accessPolicies.length).toEqual(0);
            expect(result[0].enabledForDeployment).toEqual(false);
            expect(result[0].enabledForDiskEncryption).toEqual(false);
            expect(result[0].enabledForTemplateDeployment).toEqual(false);
            expect(result[0].createMode).toEqual('Default');
            expect(result[0].keys.length).toEqual(0);
            expect(result[0].secrets.length).toEqual(0);
            expect(result[0].certificates.length).toEqual(0);
            expect(result[0].tags).toEqual({});
        });

        it('user defaults', () => {
            let result = merge({
                settings: [{}],
                buildingBlockSettings: buildingBlockSettings,
                defaultSettings: {
                    sku: {
                        name: 'Premium'
                    }
                }
            });

            expect(result[0].sku.family).toEqual('A');
            expect(result[0].sku.name).toEqual('Premium');
            expect(result[0].accessPolicies.length).toEqual(0);
            expect(result[0].enabledForDeployment).toEqual(false);
            expect(result[0].enabledForDiskEncryption).toEqual(false);
            expect(result[0].enabledForTemplateDeployment).toEqual(false);
            expect(result[0].createMode).toEqual('Default');
            expect(result[0].keys.length).toEqual(0);
            expect(result[0].secrets.length).toEqual(0);
            expect(result[0].certificates.length).toEqual(0);
            expect(result[0].tags).toEqual({});
        });
    });

    describe('validate', () => {
        let merge = keyVaultSettings.__get__('merge');
        let validate = keyVaultSettings.__get__('validate');
        let buildingBlockSettings = {
            subscriptionId: '00000000-0000-1000-8000-000000000000',
            resourceGroupName: 'test-vnet-rg',
            location: 'westus'
        };
        let testSettings = {
            name: 'key-vault-test',
            sku: {
                family: 'A',
                name: 'Standard'
            },
            tenantId: '00000000-0000-1000-8000-000000000000',
            enabledForDeployment: false,
            enabledForDiskEncryption: false,
            enabledForTemplateDeployment: false,
            createMode: 'Default',
            keys: [],
            secrets: [],
            certificates: [],
            accessPolicies: [
                {
                    permissions: {
                        keys: [
                            'encrypt',
                            'decrypt',
                            'wrapKey',
                            'unwrapKey',
                            'sign',
                            'verify',
                            'get',
                            'list',
                            'create',
                            'update',
                            'import',
                            'delete',
                            'backup',
                            'restore',
                            'recover',
                            'purge'
                        ],
                        secrets: [
                            'get',
                            'list',
                            'set',
                            'delete',
                            'backup',
                            'restore',
                            'recover',
                            'purge'
                        ],
                        certificates: [
                            'get',
                            'list',
                            'delete',
                            'create',
                            'import',
                            'update',
                            'managecontacts',
                            'getissuers',
                            'listissuers',
                            'setissuers',
                            'deleteissuers',
                            'manageissuers',
                            'recover',
                            'purge'
                        ]
                    },
                    tenantId: '00000000-0000-1000-8000-000000000000',
                    objectId: '00000000-0000-1000-8000-000000000000'
                }
            ]
        };

        let settings;
        beforeEach(() => {
            settings = _.cloneDeep(testSettings);
        });

        describe('name', () => {
            it('undefined', () => {
                delete settings.name;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].name');
            });

            it('null', () => {
                settings.name = null;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].name');
            });

            it('empty', () => {
                settings.name = '';
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].name');
            });

            it('whitespace', () => {
                settings.name = '   ';
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].name');
            });
        });

        describe('sku', () => {
            it('undefined', () => {
                delete settings.sku;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].sku');
            });

            it('null', () => {
                settings.sku = null;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].sku');
            });

            describe('name', () => {
                it('undefined', () => {
                    delete settings.sku.name;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].sku.name');
                });

                it('null', () => {
                    settings.sku.name = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].sku.name');
                });

                it('empty', () => {
                    settings.sku.name = '';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].sku.name');
                });

                it('whitespace', () => {
                    settings.sku.name = '   ';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].sku.name');
                });
            });

            describe('family', () => {
                it('undefined', () => {
                    delete settings.sku.family;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].sku.family');
                });

                it('null', () => {
                    settings.sku.family = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].sku.family');
                });

                it('empty', () => {
                    settings.sku.family = '';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].sku.family');
                });

                it('whitespace', () => {
                    settings.sku.family = '   ';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].sku.family');
                });
            });
        });

        describe('enabledForDeployment', () => {
            it('undefined', () => {
                delete settings.enabledForDeployment;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].enabledForDeployment');
            });

            it('null', () => {
                settings.enabledForDeployment = null;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].enabledForDeployment');
            });

            it('invalid', () => {
                settings.enabledForDeployment = '';
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].enabledForDeployment');
            });
        });

        describe('enabledForDiskEncryption', () => {
            it('undefined', () => {
                delete settings.enabledForDiskEncryption;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].enabledForDiskEncryption');
            });

            it('null', () => {
                settings.enabledForDiskEncryption = null;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].enabledForDiskEncryption');
            });

            it('invalid', () => {
                settings.enabledForDiskEncryption = '';
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].enabledForDiskEncryption');
            });
        });

        describe('enabledForTemplateDeployment', () => {
            it('undefined', () => {
                delete settings.enabledForTemplateDeployment;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].enabledForTemplateDeployment');
            });

            it('null', () => {
                settings.enabledForTemplateDeployment = null;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].enabledForTemplateDeployment');
            });

            it('invalid', () => {
                settings.enabledForTemplateDeployment = '';
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].enabledForTemplateDeployment');
            });
        });

        describe('enableSoftDelete', () => {
            it('undefined', () => {
                delete settings.enableSoftDelete;
                let results = validate([settings]);
                expect(results.length).toEqual(0);
            });

            it('null', () => {
                settings.enableSoftDelete = null;
                let results = validate([settings]);
                expect(results.length).toEqual(0);
            });

            it('invalid', () => {
                settings.enableSoftDelete = '';
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].enableSoftDelete');
            });

            it('false', () => {
                settings.enableSoftDelete = false;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].enableSoftDelete');
            });

            it('valid', () => {
                settings.enableSoftDelete = true;
                let results = validate([settings]);
                expect(results.length).toEqual(0);
            });
        });

        describe('createMode', () => {
            it('undefined', () => {
                delete settings.createMode;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].createMode');
            });

            it('null', () => {
                settings.createMode = null;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].createMode');
            });

            it('empty', () => {
                settings.createMode = '';
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].createMode');
            });

            it('whitespace', () => {
                settings.createMode = '   ';
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].createMode');
            });
        });

        describe('keys', () => {
            beforeEach(() => {
                settings.keys = [
                    {
                        name: 'test-key',
                        enabled: true,
                        protection: 'software',
                        notBefore: '2017-12-11',
                        expires: '2018-12-01',
                        operations: [
                            'sign',
                            'wrapKey'
                        ],
                        tags: {
                            hello: 'world',
                            world: 'earth',
                            guessWhat: 'I have spaces!'
                        }
                    }
                ];
            });

            it('undefined', () => {
                delete settings.keys;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].keys');
            });

            it('null', () => {
                settings.keys = null;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].keys');
            });

            it('invalid', () => {
                settings.keys = '';
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].keys');
            });

            describe('name', () => {
                it('undefined', () => {
                    delete settings.keys[0].name;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].keys[0].name');
                });

                it('null', () => {
                    settings.keys[0].name = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].keys[0].name');
                });

                it('empty', () => {
                    settings.keys[0].name = '';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].keys[0].name');
                });

                it('whitespace', () => {
                    settings.keys[0].name = '   ';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].keys[0].name');
                });
            });

            describe('protection', () => {
                it('undefined', () => {
                    delete settings.keys[0].protection;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].keys[0].protection');
                });

                it('null', () => {
                    settings.keys[0].protection = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].keys[0].protection');
                });

                it('empty', () => {
                    settings.keys[0].protection = '';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].keys[0].protection');
                });

                it('whitespace', () => {
                    settings.keys[0].protection = '   ';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].keys[0].protection');
                });

                it('invalid', () => {
                    settings.keys[0].protection = 'NOT_VALID';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].keys[0].protection');
                });
            });

            describe('enabled', () => {
                it('undefined', () => {
                    delete settings.keys[0].enabled;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].keys[0].enabled');
                });

                it('null', () => {
                    settings.keys[0].enabled = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].keys[0].enabled');
                });

                it('invalid', () => {
                    settings.keys[0].enabled = '';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].keys[0].enabled');
                });
            });

            describe('notBefore', () => {
                it('undefined', () => {
                    delete settings.keys[0].notBefore;
                    let results = validate([settings]);
                    expect(results.length).toEqual(0);
                });

                it('null', () => {
                    settings.keys[0].notBefore = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].keys[0].notBefore');
                });
            });

            describe('expires', () => {
                it('undefined', () => {
                    delete settings.keys[0].expires;
                    let results = validate([settings]);
                    expect(results.length).toEqual(0);
                });

                it('null', () => {
                    settings.keys[0].expires = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].keys[0].expires');
                });
            });

            describe('operations', () => {
                it('undefined', () => {
                    delete settings.keys[0].operations;
                    let results = validate([settings]);
                    expect(results.length).toEqual(0);
                });

                it('null', () => {
                    settings.keys[0].operations = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].keys[0].operations');
                });

                it('invalid', () => {
                    settings.keys[0].operations = '';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].keys[0].operations');
                });

                it('empty', () => {
                    settings.keys[0].operations = [];
                    let results = validate([settings]);
                    expect(results.length).toEqual(0);
                });
            });

            describe('size', () => {
                it('undefined', () => {
                    delete settings.keys[0].size;
                    let results = validate([settings]);
                    expect(results.length).toEqual(0);
                });

                it('null', () => {
                    settings.keys[0].size = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].keys[0].size');
                });

                it('invalid', () => {
                    settings.keys[0].size = '';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].keys[0].size');
                });

                it('1024', () => {
                    settings.keys[0].size = 1024;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].keys[0].size');
                });

                it('2048', () => {
                    settings.keys[0].size = 2048;
                    let results = validate([settings]);
                    expect(results.length).toEqual(0);
                });

                it('3072', () => {
                    settings.keys[0].size = 3072;
                    let results = validate([settings]);
                    expect(results.length).toEqual(0);
                });

                it('4096', () => {
                    settings.keys[0].size = 4096;
                    let results = validate([settings]);
                    expect(results.length).toEqual(0);
                });

                it('5120', () => {
                    settings.keys[0].size = 5120;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].keys[0].size');
                });
            });
        });

        describe('secrets', () => {
            beforeEach(() => {
                settings.secrets = [
                    {
                        name: 'test-secret',
                        notBefore: '2017-12-01',
                        expires: '2018-12-01',
                        contentType: 'text/plain',
                        enabled: false,
                        tags: {
                            securityLevel: 'Super Secret'
                        },
                        value: 'Actual secret value'
                    }
                ];
            });

            it('undefined', () => {
                delete settings.secrets;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].secrets');
            });

            it('null', () => {
                settings.secrets = null;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].secrets');
            });

            it('invalid', () => {
                settings.secrets = '';
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].secrets');
            });

            describe('name', () => {
                it('undefined', () => {
                    delete settings.secrets[0].name;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].secrets[0].name');
                });

                it('null', () => {
                    settings.secrets[0].name = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].secrets[0].name');
                });

                it('empty', () => {
                    settings.secrets[0].name = '';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].secrets[0].name');
                });

                it('whitespace', () => {
                    settings.secrets[0].name = '   ';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].secrets[0].name');
                });
            });

            describe('contentType', () => {
                it('undefined', () => {
                    delete settings.secrets[0].contentType;
                    let results = validate([settings]);
                    expect(results.length).toEqual(0);
                });

                it('null', () => {
                    settings.secrets[0].contentType = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].secrets[0].contentType');
                });

                it('invalid', () => {
                    settings.secrets[0].contentType = '';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].secrets[0].contentType');
                });

                it('empty', () => {
                    settings.secrets[0].contentType = [];
                    let results = validate([settings]);
                    expect(results.length).toEqual(0);
                });
            });

            describe('value', () => {
                it('undefined', () => {
                    delete settings.secrets[0].value;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].secrets[0].value');
                });

                it('null', () => {
                    settings.secrets[0].value = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].secrets[0].value');
                });

                it('empty', () => {
                    settings.secrets[0].value = '';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].secrets[0].value');
                });

                it('whitespace', () => {
                    settings.secrets[0].value = '   ';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].secrets[0].value');
                });
            });

            describe('enabled', () => {
                it('undefined', () => {
                    delete settings.secrets[0].enabled;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].secrets[0].enabled');
                });

                it('null', () => {
                    settings.secrets[0].enabled = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].secrets[0].enabled');
                });

                it('empty', () => {
                    settings.secrets[0].enabled = '';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].secrets[0].enabled');
                });

                it('whitespace', () => {
                    settings.secrets[0].enabled = '   ';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].secrets[0].enabled');
                });
            });

            describe('expires', () => {
                it('undefined', () => {
                    delete settings.secrets[0].expires;
                    let results = validate([settings]);
                    expect(results.length).toEqual(0);
                });

                it('null', () => {
                    settings.secrets[0].expires = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].secrets[0].expires');
                });

                it('empty', () => {
                    settings.secrets[0].expires = '';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].secrets[0].expires');
                });

                it('whitespace', () => {
                    settings.secrets[0].expires = '   ';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].secrets[0].expires');
                });
            });

            describe('notBefore', () => {
                it('undefined', () => {
                    delete settings.secrets[0].notBefore;
                    let results = validate([settings]);
                    expect(results.length).toEqual(0);
                });

                it('null', () => {
                    settings.secrets[0].notBefore = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].secrets[0].notBefore');
                });

                it('empty', () => {
                    settings.secrets[0].notBefore = '';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].secrets[0].notBefore');
                });

                it('whitespace', () => {
                    settings.secrets[0].notBefore = '   ';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].secrets[0].notBefore');
                });
            });

            describe('tags', () => {
                it('undefined', () => {
                    delete settings.secrets[0].tags;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].secrets[0].tags');
                });

                it('null', () => {
                    settings.secrets[0].tags = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].secrets[0].tags');
                });

                it('empty', () => {
                    settings.secrets[0].tags = '';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].secrets[0].tags');
                });
            });
        });

        describe('certificates', () => {
            beforeEach(() => {
                settings.certificates = [
                    {
                        name: 'test-certificate',
                        subject: 'CN=contoso.com',
                        enhancedKeyUsages: [
                            '1.3.6.1.5.5.7.3.1',
                            '1.3.6.1.5.5.7.3.2'
                        ],
                        keyUsages: [
                            'digitalSignature',
                            'nonRepudiation',
                            'keyEncipherment',
                            'dataEncipherment',
                            'keyAgreement',
                            'keyCertSign',
                            'cRLSign',
                            'encipherOnly',
                            'decipherOnly'
                        ],
                        subjectAlternativeNames: {
                            dnsNames: [
                                'www.contoso.com'
                            ],
                            emails: [
                                'admin@contoso.com'
                            ],
                            upns: [
                                'admin_upn@contoso.com'
                            ]
                        },
                        enabled: true,
                        monthsOfValidity: 12,
                        contentType: 'application/x-pkcs12',
                        issuer: {
                            name: 'Self',
                            certificateType: 'cert-type'
                        },
                        key: {
                            exportable: true,
                            size: 2048,
                            reuseKeyOnRenewal: false,
                            type: 'RSA'
                        },
                        lifetimeActions: [
                            {
                                action: 'AutoRenew',
                                daysBeforeExpiration: 30
                            }
                        ],
                        tags: {
                            'cert-tag': 'Hello, World!'
                        }
                    }
                ];
            });

            it('undefined', () => {
                delete settings.certificates;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].certificates');
            });

            it('null', () => {
                settings.certificates = null;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].certificates');
            });

            it('invalid', () => {
                settings.certificates = '';
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].certificates');
            });

            describe('name', () => {
                it('undefined', () => {
                    delete settings.certificates[0].name;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].name');
                });

                it('null', () => {
                    settings.certificates[0].name = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].name');
                });

                it('empty', () => {
                    settings.certificates[0].name = '';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].name');
                });

                it('whitespace', () => {
                    settings.certificates[0].name = '   ';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].name');
                });
            });

            describe('contentType', () => {
                it('undefined', () => {
                    delete settings.certificates[0].contentType;
                    let results = validate([settings]);
                    expect(results.length).toEqual(0);
                });

                it('null', () => {
                    settings.certificates[0].contentType = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].contentType');
                });

                it('invalid', () => {
                    settings.certificates[0].contentType = '';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].contentType');
                });

                it('empty', () => {
                    settings.certificates[0].contentType = [];
                    let results = validate([settings]);
                    expect(results.length).toEqual(0);
                });
            });

            describe('enhancedKeyUsages', () => {
                it('undefined', () => {
                    delete settings.certificates[0].enhancedKeyUsages;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].enhancedKeyUsages');
                });

                it('null', () => {
                    settings.certificates[0].enhancedKeyUsages = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].enhancedKeyUsages');
                });

                it('invalid', () => {
                    settings.certificates[0].enhancedKeyUsages = '';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].enhancedKeyUsages');
                });

                it('invalid entry', () => {
                    settings.certificates[0].enhancedKeyUsages = [''];
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].enhancedKeyUsages[0]');
                });

                it('empty', () => {
                    settings.certificates[0].enhancedKeyUsages = [];
                    let results = validate([settings]);
                    expect(results.length).toEqual(0);
                });
            });

            describe('keyUsages', () => {
                it('undefined', () => {
                    delete settings.certificates[0].keyUsages;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].keyUsages');
                });

                it('null', () => {
                    settings.certificates[0].keyUsages = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].keyUsages');
                });

                it('invalid', () => {
                    settings.certificates[0].keyUsages = '';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].keyUsages');
                });

                it('invalid entry', () => {
                    settings.certificates[0].keyUsages = [''];
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].keyUsages[0]');
                });

                it('empty', () => {
                    settings.certificates[0].keyUsages = [];
                    let results = validate([settings]);
                    expect(results.length).toEqual(0);
                });
            });

            describe('subjectAlternativeNames', () => {
                it('undefined', () => {
                    delete settings.certificates[0].subjectAlternativeNames;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].subjectAlternativeNames');
                });

                it('null', () => {
                    settings.certificates[0].subjectAlternativeNames = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].subjectAlternativeNames');
                });

                it('invalid', () => {
                    settings.certificates[0].subjectAlternativeNames = '';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].subjectAlternativeNames');
                });

                describe('dnsNames', () => {
                    it('undefined', () => {
                        delete settings.certificates[0].subjectAlternativeNames.dnsNames;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].subjectAlternativeNames.dnsNames');
                    });

                    it('null', () => {
                        settings.certificates[0].subjectAlternativeNames.dnsNames = null;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].subjectAlternativeNames.dnsNames');
                    });

                    it('invalid', () => {
                        settings.certificates[0].subjectAlternativeNames.dnsNames = '';
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].subjectAlternativeNames.dnsNames');
                    });

                    it('invalid entry', () => {
                        settings.certificates[0].subjectAlternativeNames.dnsNames = [''];
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].subjectAlternativeNames.dnsNames[0]');
                    });

                    it('empty', () => {
                        settings.certificates[0].subjectAlternativeNames.dnsNames = [];
                        let results = validate([settings]);
                        expect(results.length).toEqual(0);
                    });
                });

                describe('emails', () => {
                    it('undefined', () => {
                        delete settings.certificates[0].subjectAlternativeNames.emails;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].subjectAlternativeNames.emails');
                    });

                    it('null', () => {
                        settings.certificates[0].subjectAlternativeNames.emails = null;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].subjectAlternativeNames.emails');
                    });

                    it('invalid', () => {
                        settings.certificates[0].subjectAlternativeNames.emails = '';
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].subjectAlternativeNames.emails');
                    });

                    it('invalid entry', () => {
                        settings.certificates[0].subjectAlternativeNames.emails = [''];
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].subjectAlternativeNames.emails[0]');
                    });

                    it('empty', () => {
                        settings.certificates[0].subjectAlternativeNames.emails = [];
                        let results = validate([settings]);
                        expect(results.length).toEqual(0);
                    });
                });

                describe('upns', () => {
                    it('undefined', () => {
                        delete settings.certificates[0].subjectAlternativeNames.upns;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].subjectAlternativeNames.upns');
                    });

                    it('null', () => {
                        settings.certificates[0].subjectAlternativeNames.upns = null;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].subjectAlternativeNames.upns');
                    });

                    it('invalid', () => {
                        settings.certificates[0].subjectAlternativeNames.upns = '';
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].subjectAlternativeNames.upns');
                    });

                    it('invalid entry', () => {
                        settings.certificates[0].subjectAlternativeNames.upns = [''];
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].subjectAlternativeNames.upns[0]');
                    });

                    it('empty', () => {
                        settings.certificates[0].subjectAlternativeNames.upns = [];
                        let results = validate([settings]);
                        expect(results.length).toEqual(0);
                    });
                });
            });

            describe('subject', () => {
                it('undefined', () => {
                    delete settings.certificates[0].subject;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].subject');
                });

                it('null', () => {
                    settings.certificates[0].subject = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].subject');
                });

                it('invalid', () => {
                    settings.certificates[0].subject = '';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].subject');
                });
            });

            describe('enabled', () => {
                it('undefined', () => {
                    delete settings.certificates[0].enabled;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].enabled');
                });

                it('null', () => {
                    settings.certificates[0].enabled = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].enabled');
                });

                it('invalid', () => {
                    settings.certificates[0].enabled = '';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].enabled');
                });
            });

            describe('monthsOfValidity', () => {
                it('undefined', () => {
                    delete settings.certificates[0].monthsOfValidity;
                    let results = validate([settings]);
                    expect(results.length).toEqual(2);
                    expect(results[0].name).toEqual('[0].certificates[0].monthsOfValidity');
                    expect(results[1].name).toEqual('[0].certificates[0].lifetimeActions[0].daysBeforeExpiration');
                });

                it('null', () => {
                    settings.certificates[0].monthsOfValidity = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(2);
                    expect(results[0].name).toEqual('[0].certificates[0].monthsOfValidity');
                    expect(results[1].name).toEqual('[0].certificates[0].lifetimeActions[0].daysBeforeExpiration');
                });

                it('invalid', () => {
                    settings.certificates[0].monthsOfValidity = '';
                    let results = validate([settings]);
                    expect(results.length).toEqual(2);
                    expect(results[0].name).toEqual('[0].certificates[0].monthsOfValidity');
                    expect(results[1].name).toEqual('[0].certificates[0].lifetimeActions[0].daysBeforeExpiration');
                });

                it('zero', () => {
                    settings.certificates[0].monthsOfValidity = 0;
                    let results = validate([settings]);
                    expect(results.length).toEqual(2);
                    expect(results[0].name).toEqual('[0].certificates[0].monthsOfValidity');
                    expect(results[1].name).toEqual('[0].certificates[0].lifetimeActions[0].daysBeforeExpiration');
                });
            });

            describe('issuer', () => {
                it('undefined', () => {
                    delete settings.certificates[0].issuer;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].issuer');
                });

                it('null', () => {
                    settings.certificates[0].issuer = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].issuer');
                });

                it('invalid', () => {
                    settings.certificates[0].issuer = '';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].issuer');
                });

                describe('certificateType', () => {
                    it('undefined', () => {
                        delete settings.certificates[0].issuer.certificateType;
                        let results = validate([settings]);
                        expect(results.length).toEqual(0);
                    });

                    it('null', () => {
                        settings.certificates[0].issuer.certificateType = null;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].issuer.certificateType');
                    });

                    it('empty', () => {
                        settings.certificates[0].issuer.certificateType = '';
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].issuer.certificateType');
                    });

                    it('whitespace', () => {
                        settings.certificates[0].issuer.certificateType = ' ';
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].issuer.certificateType');
                    });
                });

                describe('name', () => {
                    it('undefined', () => {
                        delete settings.certificates[0].issuer.name;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].issuer.name');
                    });

                    it('null', () => {
                        settings.certificates[0].issuer.name = null;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].issuer.name');
                    });

                    it('empty', () => {
                        settings.certificates[0].issuer.name = '';
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].issuer.name');
                    });

                    it('whitespace', () => {
                        settings.certificates[0].issuer.name = ' ';
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].issuer.name');
                    });
                });
            });

            describe('key', () => {
                it('undefined', () => {
                    delete settings.certificates[0].key;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].key');
                });

                it('null', () => {
                    settings.certificates[0].key = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].key');
                });

                it('invalid', () => {
                    settings.certificates[0].key = '';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].key');
                });

                describe('exportable', () => {
                    it('undefined', () => {
                        delete settings.certificates[0].key.exportable;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].key.exportable');
                    });

                    it('null', () => {
                        settings.certificates[0].key.exportable = null;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].key.exportable');
                    });

                    it('invalid', () => {
                        settings.certificates[0].key.exportable = '';
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].key.exportable');
                    });
                });

                describe('size', () => {
                    it('undefined', () => {
                        delete settings.certificates[0].key.size;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].key.size');
                    });

                    it('null', () => {
                        settings.certificates[0].key.size = null;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].key.size');
                    });

                    it('invalid', () => {
                        settings.certificates[0].key.size = '';
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].key.size');
                    });

                    it('1024', () => {
                        settings.certificates[0].key.size = 1024;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].key.size');
                    });

                    it('2048', () => {
                        settings.certificates[0].key.size = 2048;
                        let results = validate([settings]);
                        expect(results.length).toEqual(0);
                    });

                    it('3072', () => {
                        settings.certificates[0].key.size = 3072;
                        let results = validate([settings]);
                        expect(results.length).toEqual(0);
                    });

                    it('4096', () => {
                        settings.certificates[0].key.size = 4096;
                        let results = validate([settings]);
                        expect(results.length).toEqual(0);
                    });
                });

                describe('type', () => {
                    it('undefined', () => {
                        delete settings.certificates[0].key.type;
                        let results = validate([settings]);
                        expect(results.length).toEqual(0);
                    });

                    it('null', () => {
                        settings.certificates[0].key.type = null;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].key.type');
                    });

                    it('empty', () => {
                        settings.certificates[0].key.type = '';
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].key.type');
                    });

                    it('whitespace', () => {
                        settings.certificates[0].key.type = ' ';
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].key.type');
                    });
                });

                describe('reuseKeyOnRenewal', () => {
                    it('undefined', () => {
                        delete settings.certificates[0].key.reuseKeyOnRenewal;
                        let results = validate([settings]);
                        expect(results.length).toEqual(0);
                    });

                    it('null', () => {
                        settings.certificates[0].key.reuseKeyOnRenewal = null;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].key.reuseKeyOnRenewal');
                    });

                    it('invalid', () => {
                        settings.certificates[0].key.reuseKeyOnRenewal = '';
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].key.reuseKeyOnRenewal');
                    });
                });
            });

            describe('lifetimeActions', () => {
                it('undefined', () => {
                    delete settings.certificates[0].lifetimeActions;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].lifetimeActions');
                });

                it('null', () => {
                    settings.certificates[0].lifetimeActions = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].lifetimeActions');
                });

                it('invalid', () => {
                    settings.certificates[0].lifetimeActions = '';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].lifetimeActions');
                });

                it('empty', () => {
                    settings.certificates[0].lifetimeActions = [];
                    let results = validate([settings]);
                    expect(results.length).toEqual(0);
                });

                it('more than one', () => {
                    settings.certificates[0].lifetimeActions = [
                        {
                            action: 'AutoRenew',
                            daysBeforeExpiration: 30
                        },
                        {
                            action: 'EmailContacts',
                            lifetimePercentage: 80
                        }
                    ];
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].lifetimeActions');
                });

                describe('action', () => {
                    it('undefined', () => {
                        delete settings.certificates[0].lifetimeActions[0].action;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].lifetimeActions[0].action');
                    });

                    it('null', () => {
                        settings.certificates[0].lifetimeActions[0].action = null;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].lifetimeActions[0].action');
                    });

                    it('empty', () => {
                        settings.certificates[0].lifetimeActions[0].action = '';
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].lifetimeActions[0].action');
                    });
                });

                describe('daysBeforeExpiration', () => {
                    beforeEach(() => {
                        settings.certificates[0].monthsOfValidity = 1;
                        settings.certificates[0].lifetimeActions = [
                            {
                                action: 'AutoRenew',
                                daysBeforeExpiration: 30,
                                lifetimePercentage: 80
                            }
                        ];
                    });

                    it('undefined', () => {
                        delete settings.certificates[0].lifetimeActions[0].daysBeforeExpiration;
                        delete settings.certificates[0].lifetimeActions[0].lifetimePercentage;
                        let results = validate([settings]);
                        expect(results.length).toEqual(2);
                        expect(results[0].name).toEqual('[0].certificates[0].lifetimeActions[0].daysBeforeExpiration');
                        expect(results[1].name).toEqual('[0].certificates[0].lifetimeActions[0].lifetimePercentage');
                    });

                    it('null', () => {
                        settings.certificates[0].lifetimeActions[0].daysBeforeExpiration = null;
                        settings.certificates[0].lifetimeActions[0].lifetimePercentage = null;
                        let results = validate([settings]);
                        expect(results.length).toEqual(2);
                        expect(results[0].name).toEqual('[0].certificates[0].lifetimeActions[0].daysBeforeExpiration');
                        expect(results[1].name).toEqual('[0].certificates[0].lifetimeActions[0].lifetimePercentage');
                    });

                    it('low', () => {
                        settings.certificates[0].lifetimeActions[0].daysBeforeExpiration = 0;
                        delete settings.certificates[0].lifetimeActions[0].lifetimePercentage;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].lifetimeActions[0].daysBeforeExpiration');
                    });

                    it('high', () => {
                        settings.certificates[0].lifetimeActions[0].daysBeforeExpiration = 28;
                        delete settings.certificates[0].lifetimeActions[0].lifetimePercentage;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].lifetimeActions[0].daysBeforeExpiration');
                    });
                });

                describe('lifetimePercentage', () => {
                    beforeEach(() => {
                        settings.certificates[0].monthsOfValidity = 1;
                        settings.certificates[0].lifetimeActions = [
                            {
                                action: 'AutoRenew',
                                daysBeforeExpiration: 30,
                                lifetimePercentage: 80
                            }
                        ];
                    });

                    it('undefined', () => {
                        delete settings.certificates[0].lifetimeActions[0].daysBeforeExpiration;
                        delete settings.certificates[0].lifetimeActions[0].lifetimePercentage;
                        let results = validate([settings]);
                        expect(results.length).toEqual(2);
                        expect(results[0].name).toEqual('[0].certificates[0].lifetimeActions[0].daysBeforeExpiration');
                        expect(results[1].name).toEqual('[0].certificates[0].lifetimeActions[0].lifetimePercentage');
                    });

                    it('null', () => {
                        settings.certificates[0].lifetimeActions[0].daysBeforeExpiration = null;
                        settings.certificates[0].lifetimeActions[0].lifetimePercentage = null;
                        let results = validate([settings]);
                        expect(results.length).toEqual(2);
                        expect(results[0].name).toEqual('[0].certificates[0].lifetimeActions[0].daysBeforeExpiration');
                        expect(results[1].name).toEqual('[0].certificates[0].lifetimeActions[0].lifetimePercentage');
                    });

                    it('low', () => {
                        settings.certificates[0].lifetimeActions[0].lifetimePercentage = 0;
                        delete settings.certificates[0].lifetimeActions[0].daysBeforeExpiration;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].lifetimeActions[0].lifetimePercentage');
                    });

                    it('high', () => {
                        settings.certificates[0].lifetimeActions[0].lifetimePercentage = 100;
                        delete settings.certificates[0].lifetimeActions[0].daysBeforeExpiration;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].certificates[0].lifetimeActions[0].lifetimePercentage');
                    });
                });
            });

            describe('tags', () => {
                it('undefined', () => {
                    delete settings.certificates[0].tags;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].tags');
                });

                it('null', () => {
                    settings.certificates[0].tags = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].tags');
                });

                it('empty', () => {
                    settings.certificates[0].tags = '';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].certificates[0].tags');
                });
            });
        });

        describe('accessPolicies', () => {
            it('undefined', () => {
                delete settings.accessPolicies;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].accessPolicies');
            });

            it('null', () => {
                settings.accessPolicies = null;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].accessPolicies');
            });

            it('invalid', () => {
                settings.accessPolicies = '';
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].accessPolicies');
            });

            it('length === 0', () => {
                settings.accessPolicies = [];
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].accessPolicies');
            });

            describe('tenantId', () => {
                it('different tenantId', () => {
                    settings.accessPolicies[0].tenantId = '00000000-0000-1000-8000-000000000001';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].accessPolicies[0].tenantId');
                });
            });

            describe('objectId', () => {
                it('undefined', () => {
                    delete settings.accessPolicies[0].objectId;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].accessPolicies[0].objectId');
                });

                it('null', () => {
                    settings.accessPolicies[0].objectId = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].accessPolicies[0].objectId');
                });

                it('empty', () => {
                    settings.accessPolicies[0].objectId = '';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].accessPolicies[0].objectId');
                });

                it('whitespace', () => {
                    settings.accessPolicies[0].objectId = ' ';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].accessPolicies[0].objectId');
                });

                it('invalid spacing', () => {
                    settings.accessPolicies[0].objectId = ' 00000000-0000-1000-8000-000000000000 ';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].accessPolicies[0].objectId');
                });

                it('invalid value', () => {
                    settings.accessPolicies[0].objectId = 'NOT_VALID';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].accessPolicies[0].objectId');
                });

                it('valid', () => {
                    settings.accessPolicies[0].objectId = '00000000-0000-1000-8000-000000000000';
                    let results = validate([settings]);
                    expect(results.length).toEqual(0);
                });
            });

            describe('applicationId', () => {
                it('undefined', () => {
                    delete settings.accessPolicies[0].applicationId;
                    let results = validate([settings]);
                    expect(results.length).toEqual(0);
                });

                it('null', () => {
                    settings.accessPolicies[0].applicationId = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(0);
                });

                it('empty', () => {
                    settings.accessPolicies[0].applicationId = '';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].accessPolicies[0].applicationId');
                });

                it('whitespace', () => {
                    settings.accessPolicies[0].applicationId = ' ';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].accessPolicies[0].applicationId');
                });

                it('invalid spacing', () => {
                    settings.accessPolicies[0].applicationId = ' 00000000-0000-1000-8000-000000000000 ';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].accessPolicies[0].applicationId');
                });

                it('invalid value', () => {
                    settings.accessPolicies[0].applicationId = 'NOT_VALID';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].accessPolicies[0].applicationId');
                });

                it('valid', () => {
                    settings.accessPolicies[0].applicationId = '00000000-0000-1000-8000-000000000000';
                    let results = validate([settings]);
                    expect(results.length).toEqual(0);
                });
            });

            describe('permissions', () => {
                describe('keys', () => {
                    it('undefined', () => {
                        delete settings.accessPolicies[0].permissions.keys;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].accessPolicies[0].permissions.keys');
                    });

                    it('null', () => {
                        settings.accessPolicies[0].permissions.keys = null;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].accessPolicies[0].permissions.keys');
                    });

                    it('invalid', () => {
                        settings.accessPolicies[0].permissions.keys = '';
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].accessPolicies[0].permissions.keys');
                    });

                    it('empty', () => {
                        settings.accessPolicies[0].permissions.keys = [];
                        let results = validate([settings]);
                        expect(results.length).toEqual(0);
                    });
                });

                describe('secrets', () => {
                    it('undefined', () => {
                        delete settings.accessPolicies[0].permissions.secrets;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].accessPolicies[0].permissions.secrets');
                    });

                    it('null', () => {
                        settings.accessPolicies[0].permissions.secrets = null;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].accessPolicies[0].permissions.secrets');
                    });

                    it('invalid', () => {
                        settings.accessPolicies[0].permissions.secrets = '';
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].accessPolicies[0].permissions.secrets');
                    });

                    it('empty', () => {
                        settings.accessPolicies[0].permissions.secrets = [];
                        let results = validate([settings]);
                        expect(results.length).toEqual(0);
                    });
                });

                describe('certificates', () => {
                    it('undefined', () => {
                        delete settings.accessPolicies[0].permissions.certificates;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].accessPolicies[0].permissions.certificates');
                    });

                    it('null', () => {
                        settings.accessPolicies[0].permissions.certificates = null;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].accessPolicies[0].permissions.certificates');
                    });

                    it('invalid', () => {
                        settings.accessPolicies[0].permissions.certificates = '';
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].accessPolicies[0].permissions.certificates');
                    });

                    it('empty', () => {
                        settings.accessPolicies[0].permissions.certificates = [];
                        let results = validate([settings]);
                        expect(results.length).toEqual(0);
                    });
                });
            });
        });
    });

    describe('preProcess', () => {
        let buildingBlockSettings = {
            subscriptionId: '00000000-0000-1000-8000-000000000000',
            resourceGroupName: 'test-vnet-rg',
            location: 'westus'
        };
        let testSettings = {
            name: 'key-vault-test',
            sku: {
                family: 'A',
                name: 'Standard'
            },
            tenantId: '00000000-0000-1000-8000-000000000000',
            enabledForDeployment: false,
            enabledForDiskEncryption: false,
            enabledForTemplateDeployment: false,
            createMode: 'Default',
            keys: [],
            secrets: [],
            certificates: [],
            accessPolicies: [
                {
                    permissions: {
                        keys: [
                            'encrypt',
                            'decrypt',
                            'wrapKey',
                            'unwrapKey',
                            'sign',
                            'verify',
                            'get',
                            'list',
                            'create',
                            'update',
                            'import',
                            'delete',
                            'backup',
                            'restore',
                            'recover',
                            'purge'
                        ],
                        secrets: [
                            'get',
                            'list',
                            'set',
                            'delete',
                            'backup',
                            'restore',
                            'recover',
                            'purge'
                        ],
                        certificates: [
                            'get',
                            'list',
                            'delete',
                            'create',
                            'import',
                            'update',
                            'managecontacts',
                            'getissuers',
                            'listissuers',
                            'setissuers',
                            'deleteissuers',
                            'manageissuers',
                            'recover',
                            'purge'
                        ]
                    },
                    tenantId: '00000000-0000-1000-8000-000000000000',
                    upns: [
                        'admin@contoso.com'
                    ]
                }
            ]
        };
        let preProcess;
        let revertAz;
        let counter = 0;
        beforeAll(() => {
            preProcess = keyVaultSettings.__get__('preProcess');
            revertAz = keyVaultSettings.__set__('az', {
                spawnAz: ({args, spawnOptions, azOptions}) => {
                    return {
                        stdout: `"00000000-0000-1000-8000-00000000000${counter++}"`
                    };
                }
            });
        });

        let settings;
        beforeEach(() => {
            settings = _.cloneDeep(testSettings);
            counter = 0;
        });

        it('upns undefined', () => {
            delete settings.accessPolicies[0].upns;
            expect(() => {
                preProcess([settings], buildingBlockSettings);
            }).toThrow();
        });

        it('upns length === 0', () => {
            settings.accessPolicies[0].upns = [];
            expect(() => {
                preProcess([settings], buildingBlockSettings);
            }).toThrow();
        });

        it('single upn', () => {
            let results = preProcess([settings], buildingBlockSettings);
            expect(results[0].accessPolicies.length).toEqual(1);
            expect(results[0].accessPolicies[0].objectId).toEqual('00000000-0000-1000-8000-000000000000');
        });

        it('multiple upns', () => {
            settings.accessPolicies[0].upns = [
                'admin@contoso.com',
                'user1@contoso.com',
                'user2@contoso.com'
            ];

            let results = preProcess([settings], buildingBlockSettings);
            expect(results[0].accessPolicies.length).toEqual(3);
            expect(results[0].accessPolicies[0].objectId).toEqual('00000000-0000-1000-8000-000000000000');
            expect(results[0].accessPolicies[1].objectId).toEqual('00000000-0000-1000-8000-000000000001');
            expect(results[0].accessPolicies[2].objectId).toEqual('00000000-0000-1000-8000-000000000002');
        });

        afterAll(() => {
            revertAz();
        });
    });

    describe('process', () => {
        let testBuildingBlockSettings = {
            subscriptionId: '00000000-0000-1000-8000-000000000000',
            resourceGroupName: 'test-vnet-rg',
            location: 'westus'
        };
        let testSettings = {
            name: 'key-vault-test',
            sku: {
                family: 'A',
                name: 'Standard'
            },
            tenantId: '00000000-0000-1000-8000-000000000000',
            enabledForDeployment: false,
            enabledForDiskEncryption: false,
            enabledForTemplateDeployment: false,
            enableSoftDelete: true,
            createMode: 'Default',
            tags: {
                department: 'Security'
            },
            keys: [
                {
                    name: 'test-key',
                    enabled: true,
                    protection: 'software',
                    notBefore: '2017-12-11',
                    expires: '2018-12-01',
                    operations: [
                        'sign',
                        'wrapKey'
                    ],
                    tags: {
                        hello: 'world',
                        world: 'earth',
                        guessWhat: 'I have spaces!'
                    }
                }
            ],
            secrets: [
                {
                    name: 'test-secret',
                    notBefore: '2017-12-01',
                    expires: '2018-12-01',
                    contentType: 'text/plain',
                    enabled: false,
                    tags: {
                        securityLevel: 'Super Secret'
                    },
                    value: 'Actual secret value'
                }
            ],
            certificates: [
                {
                    name: 'test-certificate',
                    subject: 'CN=contoso.com',
                    enhancedKeyUsages: [
                        '1.3.6.1.5.5.7.3.1',
                        '1.3.6.1.5.5.7.3.2'
                    ],
                    keyUsages: [
                        'digitalSignature',
                        'nonRepudiation',
                        'keyEncipherment',
                        'dataEncipherment',
                        'keyAgreement',
                        'keyCertSign',
                        'cRLSign',
                        'encipherOnly',
                        'decipherOnly'
                    ],
                    subjectAlternativeNames: {
                        dnsNames: [
                            'www.contoso.com'
                        ],
                        emails: [
                            'admin@contoso.com'
                        ],
                        upns: [
                            'admin_upn@contoso.com'
                        ]
                    },
                    enabled: true,
                    monthsOfValidity: 12,
                    contentType: 'application/x-pkcs12',
                    issuer: {
                        name: 'Self',
                        certificateType: 'cert-type'
                    },
                    key: {
                        exportable: true,
                        size: 2048,
                        reuseKeyOnRenewal: false,
                        type: 'RSA'
                    },
                    lifetimeActions: [
                        {
                            action: 'AutoRenew',
                            daysBeforeExpiration: 30
                        }
                    ],
                    tags: {
                        'cert-tag': 'Hello, World!'
                    }
                }
            ],
            accessPolicies: [
                {
                    permissions: {
                        keys: [
                            'encrypt',
                            'decrypt',
                            'wrapKey',
                            'unwrapKey',
                            'sign',
                            'verify',
                            'get',
                            'list',
                            'create',
                            'update',
                            'import',
                            'delete',
                            'backup',
                            'restore',
                            'recover',
                            'purge'
                        ],
                        secrets: [
                            'get',
                            'list',
                            'set',
                            'delete',
                            'backup',
                            'restore',
                            'recover',
                            'purge'
                        ],
                        certificates: [
                            'get',
                            'list',
                            'delete',
                            'create',
                            'import',
                            'update',
                            'managecontacts',
                            'getissuers',
                            'listissuers',
                            'setissuers',
                            'deleteissuers',
                            'manageissuers',
                            'recover',
                            'purge'
                        ]
                    },
                    tenantId: '00000000-0000-1000-8000-000000000000',
                    objectId: '00000000-0000-1000-8000-000000000000'
                }
            ]
        };

        let settings;
        let buildingBlockSettings;
        beforeEach(() => {
            settings = _.cloneDeep(testSettings);
            buildingBlockSettings = _.cloneDeep(testBuildingBlockSettings);
        });

        it('Building block errors', () => {
            delete buildingBlockSettings.subscriptionId;
            expect(() => keyVaultSettings.process({
                settings: settings,
                buildingBlockSettings: buildingBlockSettings
            })).toThrowError(Error);
        });

        it('Validation failure', () => {
            delete settings.name;
            expect(() => keyVaultSettings.process({
                settings: settings,
                buildingBlockSettings: buildingBlockSettings
            })).toThrowError(Error);
        });

        it('Valid with optional parameters', () => {
            let results = keyVaultSettings.process({
                settings: settings,
                buildingBlockSettings: buildingBlockSettings
            });

            expect(results.resourceGroups.length).toEqual(1);
            expect(results.parameters.keyVaults.length).toEqual(1);
            expect(results.parameters.keyVaults[0].name).toEqual(settings.name);
            expect(_.isEqual(results.parameters.keyVaults[0].tags, settings.tags)).toEqual(true);
            expect(results.parameters.keyVaults[0].id).toEqual(
                resource.resourceId(testBuildingBlockSettings.subscriptionId, testBuildingBlockSettings.resourceGroupName,
                'Microsoft.KeyVault/vaults', settings.name));
            expect(results.parameters.keyVaults[0].subscriptionId).toEqual(testBuildingBlockSettings.subscriptionId);
            expect(results.parameters.keyVaults[0].resourceGroupName).toEqual(testBuildingBlockSettings.resourceGroupName);
            expect(results.parameters.keyVaults[0].location).toEqual(testBuildingBlockSettings.location);
            expect(results.parameters.keyVaults[0].properties.sku).toEqual(settings.sku);
            expect(results.parameters.keyVaults[0].properties.tenantId).toEqual(settings.tenantId);
            expect(results.parameters.keyVaults[0].properties.enabledForDeployment).toEqual(settings.enabledForDeployment);
            expect(results.parameters.keyVaults[0].properties.enabledForDiskEncryption).toEqual(settings.enabledForDiskEncryption);
            expect(results.parameters.keyVaults[0].properties.enabledForTemplateDeployment).toEqual(settings.enabledForTemplateDeployment);
            expect(results.parameters.keyVaults[0].properties.createMode).toEqual(settings.createMode);
            expect(_.isEqual(results.parameters.keyVaults[0].properties.accessPolicies, settings.accessPolicies)).toEqual(true);

            expect(results.parameters.keyVaults[0].properties.enableSoftDelete).toEqual(settings.enableSoftDelete);
            // PostDeploymentParameter
            expect(results.postDeploymentParameter.keyVaults[0].name).toEqual(settings.name);
            expect(_.isEqual(results.postDeploymentParameter.keyVaults[0].keys[0], settings.keys[0])).toEqual(true);
            expect(_.isEqual(results.postDeploymentParameter.keyVaults[0].secrets[0], settings.secrets[0])).toEqual(true);

            // Certificates are different.  The policy shape that is used by the Azure CLI is actually the Python SDK's shape,
            // which is different from the REST API.  This is related to the AutoRest serialization.
            expect(results.postDeploymentParameter.keyVaults[0].certificates[0].name).toEqual(settings.certificates[0].name);
            expect(results.postDeploymentParameter.keyVaults[0].certificates[0].policy.attributes.enabled).toEqual(settings.certificates[0].enabled);
            expect(results.postDeploymentParameter.keyVaults[0].certificates[0].policy.issuer_parameters.name).toEqual(settings.certificates[0].issuer.name);
            expect(results.postDeploymentParameter.keyVaults[0].certificates[0].policy.key_properties.exportable).toEqual(settings.certificates[0].key.exportable);
            expect(results.postDeploymentParameter.keyVaults[0].certificates[0].policy.key_properties.key_size).toEqual(settings.certificates[0].key.size);
            expect(results.postDeploymentParameter.keyVaults[0].certificates[0].policy.lifetime_actions[0].action.action_type).toEqual(settings.certificates[0].lifetimeActions[0].action);
            expect(results.postDeploymentParameter.keyVaults[0].certificates[0].policy.lifetime_actions[0].trigger.days_before_expiry).toEqual(settings.certificates[0].lifetimeActions[0].daysBeforeExpiration);
            expect(results.postDeploymentParameter.keyVaults[0].certificates[0].policy.x509_certificate_properties.ekus).toEqual(settings.certificates[0].enhancedKeyUsages);
            expect(results.postDeploymentParameter.keyVaults[0].certificates[0].policy.x509_certificate_properties.key_usage).toEqual(settings.certificates[0].keyUsages);
            expect(_.isEqual(results.postDeploymentParameter.keyVaults[0].certificates[0].policy.x509_certificate_properties.subject_alternative_names.dns_names,
                settings.certificates[0].subjectAlternativeNames.dnsNames)).toEqual(true);
            expect(_.isEqual(results.postDeploymentParameter.keyVaults[0].certificates[0].policy.x509_certificate_properties.subject_alternative_names.emails,
                settings.certificates[0].subjectAlternativeNames.emails)).toEqual(true);
            expect(_.isEqual(results.postDeploymentParameter.keyVaults[0].certificates[0].policy.x509_certificate_properties.subject_alternative_names.upns,
                settings.certificates[0].subjectAlternativeNames.upns)).toEqual(true);
            expect(results.postDeploymentParameter.keyVaults[0].certificates[0].policy.x509_certificate_properties.subject).toEqual(settings.certificates[0].subject);
            expect(results.postDeploymentParameter.keyVaults[0].certificates[0].policy.x509_certificate_properties.validity_in_months).toEqual(settings.certificates[0].monthsOfValidity);
            expect(_.isEqual(results.postDeploymentParameter.keyVaults[0].certificates[0].tags, settings.certificates[0].tags)).toEqual(true);

            expect(results.postDeploymentParameter.keyVaults[0].certificates[0].policy.issuer_parameters.certificate_type).toEqual(settings.certificates[0].issuer.certificateType);
            expect(results.postDeploymentParameter.keyVaults[0].certificates[0].policy.key_properties.key_type).toEqual(settings.certificates[0].key.type);
            expect(results.postDeploymentParameter.keyVaults[0].certificates[0].policy.key_properties.reuse_key).toEqual(settings.certificates[0].key.reuseKeyOnRenewal);
            expect(results.postDeploymentParameter.keyVaults[0].certificates[0].policy.secret_properties.content_type).toEqual(settings.certificates[0].contentType);
        });

        it('Valid with lifetime percentage trigger', () => {
            delete settings.certificates[0].lifetimeActions[0].daysBeforeExpiration;
            settings.certificates[0].lifetimeActions[0].lifetimePercentage = 80;
            let results = keyVaultSettings.process({
                settings: settings,
                buildingBlockSettings: buildingBlockSettings
            });

            expect(results.resourceGroups.length).toEqual(1);
            expect(results.parameters.keyVaults.length).toEqual(1);
            expect(results.postDeploymentParameter.keyVaults[0].certificates[0].policy.lifetime_actions[0].trigger.days_before_expiry).toBeUndefined();
            expect(results.postDeploymentParameter.keyVaults[0].certificates[0].policy.lifetime_actions[0].trigger.lifetime_percentage).toEqual(settings.certificates[0].lifetimeActions[0].lifetimePercentage);
        });

        it('Valid without optional parameters', () => {
            delete settings.enableSoftDelete;
            delete settings.certificates[0].issuer.certificateType;
            delete settings.certificates[0].key.type;
            delete settings.certificates[0].key.reuseKeyOnRenewal;
            delete settings.certificates[0].contentType;

            let results = keyVaultSettings.process({
                settings: settings,
                buildingBlockSettings: buildingBlockSettings
            });

            expect(results.resourceGroups.length).toEqual(1);
            expect(results.parameters.keyVaults.length).toEqual(1);
            expect(results.parameters.keyVaults[0].properties.enableSoftDelete).toBeUndefined();
            expect(results.postDeploymentParameter.keyVaults[0].certificates[0].policy.issuer_parameters.certificate_type).toBeUndefined();
            expect(results.postDeploymentParameter.keyVaults[0].certificates[0].policy.key_properties.key_type).toBeUndefined();
            expect(results.postDeploymentParameter.keyVaults[0].certificates[0].policy.key_properties.reuse_key).toBeUndefined();
            expect(results.postDeploymentParameter.keyVaults[0].certificates[0].policy.secret_properties).toBeUndefined();
        });
    });

    describe('postDeployment', () => {
        let testBuildingBlockSettings = {
            subscriptionId: '00000000-0000-1000-8000-000000000000',
            resourceGroupName: 'test-vnet-rg',
            location: 'westus'
        };
        let testSettings = {
            name: 'key-vault-test',
            sku: {
                family: 'A',
                name: 'Standard'
            },
            tenantId: '00000000-0000-1000-8000-000000000000',
            enabledForDeployment: false,
            enabledForDiskEncryption: false,
            enabledForTemplateDeployment: false,
            enableSoftDelete: true,
            createMode: 'Default',
            tags: {
                department: 'Security'
            },
            keys: [
                {
                    name: 'test-key',
                    enabled: false,
                    protection: 'software',
                    notBefore: '2017-12-11',
                    expires: '2018-12-01',
                    operations: [
                        'sign',
                        'wrapKey'
                    ],
                    size: 2048,
                    tags: {
                        hello: 'world',
                        world: 'earth',
                        guessWhat: 'I have spaces!'
                    }
                }
            ],
            secrets: [
                {
                    name: 'test-secret',
                    notBefore: '2017-12-01',
                    expires: '2018-12-01',
                    contentType: 'text/plain',
                    enabled: false,
                    tags: {
                        securityLevel: 'Super Secret'
                    },
                    value: 'Actual secret value'
                }
            ],
            certificates: [
                {
                    name: 'test-certificate',
                    subject: 'CN=contoso.com',
                    enhancedKeyUsages: [
                        '1.3.6.1.5.5.7.3.1',
                        '1.3.6.1.5.5.7.3.2'
                    ],
                    keyUsages: [
                        'digitalSignature',
                        'nonRepudiation',
                        'keyEncipherment',
                        'dataEncipherment',
                        'keyAgreement',
                        'keyCertSign',
                        'cRLSign',
                        'encipherOnly',
                        'decipherOnly'
                    ],
                    subjectAlternativeNames: {
                        dnsNames: [
                            'www.contoso.com'
                        ],
                        emails: [
                            'admin@contoso.com'
                        ],
                        upns: [
                            'admin_upn@contoso.com'
                        ]
                    },
                    enabled: true,
                    monthsOfValidity: 12,
                    contentType: 'application/x-pkcs12',
                    issuer: {
                        name: 'Self',
                        certificateType: 'cert-type'
                    },
                    key: {
                        exportable: true,
                        size: 2048,
                        reuseKeyOnRenewal: false,
                        type: 'RSA'
                    },
                    lifetimeActions: [
                        {
                            action: 'AutoRenew',
                            daysBeforeExpiration: 30
                        }
                    ],
                    tags: {
                        'cert-tag': 'Hello, World!'
                    }
                }
            ],
            accessPolicies: [
                {
                    permissions: {
                        keys: [
                            'encrypt',
                            'decrypt',
                            'wrapKey',
                            'unwrapKey',
                            'sign',
                            'verify',
                            'get',
                            'list',
                            'create',
                            'update',
                            'import',
                            'delete',
                            'backup',
                            'restore',
                            'recover',
                            'purge'
                        ],
                        secrets: [
                            'get',
                            'list',
                            'set',
                            'delete',
                            'backup',
                            'restore',
                            'recover',
                            'purge'
                        ],
                        certificates: [
                            'get',
                            'list',
                            'delete',
                            'create',
                            'import',
                            'update',
                            'managecontacts',
                            'getissuers',
                            'listissuers',
                            'setissuers',
                            'deleteissuers',
                            'manageissuers',
                            'recover',
                            'purge'
                        ]
                    },
                    tenantId: '00000000-0000-1000-8000-000000000000',
                    objectId: '00000000-0000-1000-8000-000000000000'
                }
            ]
        };
        let revertAz;
        let azArguments = [];
        beforeAll(() => {
            revertAz = keyVaultSettings.__set__('az', {
                spawnAz: ({args, spawnOptions, azOptions}) => {
                    azArguments.push(args);
                }
            });
        });

        let settings;
        beforeEach(() => {
            settings = _.cloneDeep(testSettings);
            azArguments = [];
        });

        it('with optional fields', () => {
            let results = keyVaultSettings.process({
                settings: settings,
                buildingBlockSettings: testBuildingBlockSettings
            });

            let azValues = [
                [
                    'keyvault',
                    'key',
                    'create',
                    '--vault-name',
                    'key-vault-test',
                    '--name',
                    'test-key',
                    '--protection',
                    'software',
                    '--disabled',
                    '--expires',
                    '2018-12-01T00:00:00Z',
                    '--not-before',
                    '2017-12-11T00:00:00Z',
                    '--ops',
                    'sign wrapKey',
                    '--size',
                    '2048',
                    '--tags',
                    '"hello=world" "world=earth" "guessWhat=I have spaces!"'
                ],
                [
                    'keyvault',
                    'secret',
                    'set',
                    '--vault-name',
                    'key-vault-test',
                    '--name',
                    'test-secret',
                    '--value',
                    '"Actual secret value"',
                    '--description',
                    '"text/plain"',
                    '--disabled',
                    '--expires',
                    '2018-12-01T00:00:00Z',
                    '--not-before',
                    '2017-12-01T00:00:00Z',
                    '--tags',
                    '"securityLevel=Super Secret"'
                ],
                [
                    'keyvault',
                    'certificate',
                    'create',
                    '--vault-name',
                    'key-vault-test',
                    '--name',
                    'test-certificate',
                    '--policy',
                    '',
                    '--tags',
                    '"cert-tag=Hello, World!"'
                ]
            ];

            results.postDeployment(results.postDeploymentParameter);
            expect(_.isEqual(azArguments[0], azValues[0])).toEqual(true);
            expect(_.isEqual(azArguments[1], azValues[1])).toEqual(true);
            // We don't need to validate the policy part, so we'll just check the individual bits, skipping the policy
            for (let i = 0; i < azValues[2].length; i++) {
                if (i === 8) {
                    continue;
                }

                expect(azArguments[2][i]).toEqual(azValues[2][i]);
            }
        });

        it('without optional fields', () => {
            settings.keys[0].enabled = true;
            delete settings.keys[0].expires;
            delete settings.keys[0].notBefore;
            settings.keys[0].operations = [];
            delete settings.keys[0].size;
            settings.keys[0].tags = {};

            delete settings.secrets[0].contentType;
            settings.secrets[0].enabled = true;
            delete settings.secrets[0].expires;
            delete settings.secrets[0].notBefore;
            settings.secrets[0].tags = {};

            settings.certificates[0].tags = {};

            let results = keyVaultSettings.process({
                settings: settings,
                buildingBlockSettings: testBuildingBlockSettings
            });

            let azValues = [
                [
                    'keyvault',
                    'key',
                    'create',
                    '--vault-name',
                    'key-vault-test',
                    '--name',
                    'test-key',
                    '--protection',
                    'software'
                ],
                [
                    'keyvault',
                    'secret',
                    'set',
                    '--vault-name',
                    'key-vault-test',
                    '--name',
                    'test-secret',
                    '--value',
                    '"Actual secret value"'
                ],
                [
                    'keyvault',
                    'certificate',
                    'create',
                    '--vault-name',
                    'key-vault-test',
                    '--name',
                    'test-certificate',
                    '--policy',
                    ''
                ]
            ];

            results.postDeployment(results.postDeploymentParameter);
            expect(_.isEqual(azArguments[0], azValues[0])).toEqual(true);
            expect(_.isEqual(azArguments[1], azValues[1])).toEqual(true);
            // We don't need to validate the policy part, so we'll just check the individual bits, skipping the policy
            for (let i = 0; i < azValues[2].length; i++) {
                if (i === 8) {
                    continue;
                }

                expect(azArguments[2][i]).toEqual(azValues[2][i]);
            }
        });

        afterAll(() => {
            revertAz();
        });
    });
});