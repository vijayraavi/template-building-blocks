describe('cosmosDbSettings', () => {
    let rewire = require('rewire');
    let cosmosDbSettings = rewire('../src/core/cosmosDbSettings.js');
    let _ = require('lodash');

    describe('isValidKind', () => {
        let isValidKind = cosmosDbSettings.__get__('isValidKind');

        it('undefined', () => {
            expect(isValidKind()).toEqual(false);
        });

        it('null', () => {
            expect(isValidKind(null)).toEqual(false);
        });

        it('empty', () => {
            expect(isValidKind('')).toEqual(false);
        });

        it('whitespace', () => {
            expect(isValidKind(' ')).toEqual(false);
        });

        it('invalid spacing', () => {
            expect(isValidKind(' DocumentDB ')).toEqual(false);
        });

        it('invalid casing', () => {
            expect(isValidKind('documentdb')).toEqual(false);
        });

        it('invalid value', () => {
            expect(isValidKind('NOT_VALID')).toEqual(false);
        });

        it('DocumentDB', () => {
            expect(isValidKind('DocumentDB')).toEqual(true);
        });

        it('Graph', () => {
            expect(isValidKind('Graph')).toEqual(true);
        });

        it('MongoDB', () => {
            expect(isValidKind('MongoDB')).toEqual(true);
        });

        it('Table', () => {
            expect(isValidKind('Table')).toEqual(true);
        });
    });

    describe('isValidDatabaseAccountOfferTypes', () => {
        let isValidDatabaseAccountOfferType = cosmosDbSettings.__get__('isValidDatabaseAccountOfferType');

        it('undefined', () => {
            expect(isValidDatabaseAccountOfferType()).toEqual(false);
        });

        it('null', () => {
            expect(isValidDatabaseAccountOfferType(null)).toEqual(false);
        });

        it('empty', () => {
            expect(isValidDatabaseAccountOfferType('')).toEqual(false);
        });

        it('whitespace', () => {
            expect(isValidDatabaseAccountOfferType(' ')).toEqual(false);
        });

        it('invalid spacing', () => {
            expect(isValidDatabaseAccountOfferType(' Standard ')).toEqual(false);
        });

        it('invalid casing', () => {
            expect(isValidDatabaseAccountOfferType('standard')).toEqual(false);
        });

        it('invalid value', () => {
            expect(isValidDatabaseAccountOfferType('NOT_VALID')).toEqual(false);
        });

        it('Standard', () => {
            expect(isValidDatabaseAccountOfferType('Standard')).toEqual(true);
        });
    });

    describe('isValidConsistencyLevel', () => {
        let isValidConsistencyLevel = cosmosDbSettings.__get__('isValidConsistencyLevel');

        it('undefined', () => {
            expect(isValidConsistencyLevel()).toEqual(false);
        });

        it('null', () => {
            expect(isValidConsistencyLevel(null)).toEqual(false);
        });

        it('empty', () => {
            expect(isValidConsistencyLevel('')).toEqual(false);
        });

        it('whitespace', () => {
            expect(isValidConsistencyLevel(' ')).toEqual(false);
        });

        it('invalid spacing', () => {
            expect(isValidConsistencyLevel(' BoundedStaleness ')).toEqual(false);
        });

        it('invalid casing', () => {
            expect(isValidConsistencyLevel('boundedstaleness')).toEqual(false);
        });

        it('invalid value', () => {
            expect(isValidConsistencyLevel('NOT_VALID')).toEqual(false);
        });

        it('BoundedStaleness', () => {
            expect(isValidConsistencyLevel('BoundedStaleness')).toEqual(true);
        });

        it('ConsistentPrefix', () => {
            expect(isValidConsistencyLevel('ConsistentPrefix')).toEqual(true);
        });

        it('Eventual', () => {
            expect(isValidConsistencyLevel('Eventual')).toEqual(true);
        });

        it('Session', () => {
            expect(isValidConsistencyLevel('Session')).toEqual(true);
        });

        it('Strong', () => {
            expect(isValidConsistencyLevel('Strong')).toEqual(true);
        });
    });

    describe('isValidDefaultTtl', () => {
        let isValidDefaultTtl = cosmosDbSettings.__get__('isValidDefaultTtl');

        it('undefined', () => {
            expect(isValidDefaultTtl()).toEqual(false);
        });

        it('null', () => {
            expect(isValidDefaultTtl(null)).toEqual(false);
        });

        it('empty', () => {
            expect(isValidDefaultTtl('')).toEqual(false);
        });

        it('whitespace', () => {
            expect(isValidDefaultTtl(' ')).toEqual(false);
        });

        it('invalid spacing', () => {
            expect(isValidDefaultTtl(' Standard ')).toEqual(false);
        });

        it('invalid casing', () => {
            expect(isValidDefaultTtl('standard')).toEqual(false);
        });

        it('invalid value', () => {
            expect(isValidDefaultTtl('NOT_VALID')).toEqual(false);
        });

        it('Default', () => {
            expect(isValidDefaultTtl('Default')).toEqual(true);
        });
    });

    describe('calculateThroughputDefault', () => {
        let calculateThroughputDefault = cosmosDbSettings.__get__('calculateThroughputDefault');

        it('undefined, undefined', () => {
            expect(calculateThroughputDefault()).toEqual(400);
        });

        it('null, null', () => {
            expect(calculateThroughputDefault(null, null)).toEqual(400);
        });

        it('100, undefined', () => {
            expect(calculateThroughputDefault(100)).toEqual(100);
        });

        it('undefined, true', () => {
            expect(calculateThroughputDefault(undefined, true)).toEqual(2500);
        });

        it('undefined, false', () => {
            expect(calculateThroughputDefault(undefined, false)).toEqual(400);
        });
    });

    describe('merge', () => {
        let merge = cosmosDbSettings.__get__('merge');

        let buildingBlockSettings = {
            subscriptionId: '00000000-0000-1000-8000-000000000000',
            resourceGroupName: 'test-vnet-rg',
            location: 'westus'
        };

        it('defaults', () => {
            let merged = merge({
                settings: [{
                    name: 'test-cosmos-db'
                }],
                buildingBlockSettings: buildingBlockSettings
            });

            expect(merged[0].kind).toEqual('DocumentDB');
            expect(merged[0].databaseAccountOfferType).toEqual('Standard');
            expect(merged[0].consistencyPolicy.defaultConsistencyLevel).toEqual('Session');
            expect(merged[0].consistencyPolicy.maxStalenessPrefix).toEqual(100);
            expect(merged[0].consistencyPolicy.maxIntervalInSeconds).toEqual(5);
            expect(merged[0].enableAutomaticFailover).toEqual(false);
            expect(merged[0].locations).toEqual([]);
            expect(merged[0].tags).toEqual({});
        });

        it('defaults with database and collections', () => {
            let settings = {
                name: 'test-cosmos-db',
                databases: [
                    {
                        name: 'test-database',
                        collections: [
                            {
                                name: 'collection1'
                            },
                            {
                                name: 'collection2',
                                partitionKeyPath: 'partition-key-path'
                            },
                            {
                                name: 'collection3',
                                throughput: 500
                            },
                            {
                                name: 'collection4',
                                throughput: 600,
                                defaultTtl: 'Default'
                            }
                        ]
                    }
                ]
            };

            let merged = merge({
                settings: [settings],
                buildingBlockSettings: buildingBlockSettings
            });

            expect(merged[0].databases[0].collections[0].throughput).toEqual(400);
            expect(merged[0].databases[0].collections[1].throughput).toEqual(2500);
            expect(merged[0].databases[0].collections[2].throughput).toEqual(settings.databases[0].collections[2].throughput);
            expect(merged[0].databases[0].collections[3].throughput).toEqual(settings.databases[0].collections[3].throughput);
            expect(merged[0].databases[0].collections[3].defaultTtl).toEqual(settings.databases[0].collections[3].defaultTtl);
        });

        it('defaults with BoundedStaleness consistency policy and a single location', () => {
            let settings = [{
                name: 'table-cosmos-db',
                consistencyPolicy: {
                    defaultConsistencyLevel: 'BoundedStaleness'
                },
                locations: [
                    'westus2'
                ]
            }];

            let merged = merge({
                settings: settings,
                buildingBlockSettings: buildingBlockSettings
            });

            expect(merged[0].consistencyPolicy.defaultConsistencyLevel).toEqual(settings[0].consistencyPolicy.defaultConsistencyLevel);
            expect(merged[0].consistencyPolicy.maxStalenessPrefix).toEqual(100);
            expect(merged[0].consistencyPolicy.maxIntervalInSeconds).toEqual(5);
        });

        it('defaults with BoundedStaleness consistency policy and multiple locations', () => {
            let settings = [{
                name: 'table-cosmos-db',
                consistencyPolicy: {
                    defaultConsistencyLevel: 'BoundedStaleness'
                },
                locations: [
                    'westus2',
                    'eastus'
                ]
            }];

            let merged = merge({
                settings: settings,
                buildingBlockSettings: buildingBlockSettings
            });

            expect(merged[0].consistencyPolicy.defaultConsistencyLevel).toEqual(settings[0].consistencyPolicy.defaultConsistencyLevel);
            expect(merged[0].consistencyPolicy.maxStalenessPrefix).toEqual(100000);
            expect(merged[0].consistencyPolicy.maxIntervalInSeconds).toEqual(300);
        });

        it('defaults with BoundedStaleness consistency policy, multiple locations, and user provided max staleness prefix and max interval in seconds', () => {
            let settings = [{
                name: 'table-cosmos-db',
                consistencyPolicy: {
                    defaultConsistencyLevel: 'BoundedStaleness',
                    maxStalenessPrefix: 200000,
                    maxIntervalInSeconds: 400
                },
                locations: [
                    'westus2',
                    'eastus'
                ]
            }];

            let merged = merge({
                settings: settings,
                buildingBlockSettings: buildingBlockSettings
            });

            expect(merged[0].consistencyPolicy.defaultConsistencyLevel).toEqual(settings[0].consistencyPolicy.defaultConsistencyLevel);
            expect(merged[0].consistencyPolicy.maxStalenessPrefix).toEqual(200000);
            expect(merged[0].consistencyPolicy.maxIntervalInSeconds).toEqual(400);
        });

        it('user defaults', () => {
            let merged = merge({
                settings: [{}],
                buildingBlockSettings: buildingBlockSettings,
                defaultSettings: {
                    kind: 'Graph',
                    consistencyPolicy: {
                        defaultConsistencyLevel: 'BoundedStaleness'
                    },
                    enableAutomaticFailover: true
                }
            });

            expect(merged[0].kind).toEqual('Graph');
            expect(merged[0].databaseAccountOfferType).toEqual('Standard');
            expect(merged[0].consistencyPolicy.defaultConsistencyLevel).toEqual('BoundedStaleness');
            expect(merged[0].consistencyPolicy.maxStalenessPrefix).toEqual(100);
            expect(merged[0].consistencyPolicy.maxIntervalInSeconds).toEqual(5);
            expect(merged[0].enableAutomaticFailover).toEqual(true);
            expect(merged[0].locations).toEqual([]);
            expect(merged[0].tags).toEqual({});
        });
    });

    describe('validate', () => {
        let validate = cosmosDbSettings.__get__('validate');

        let testSettings = {
            name: 'doc-cosmos-db',
            kind: 'DocumentDB',
            databaseAccountOfferType: 'Standard',
            consistencyPolicy: {
                defaultConsistencyLevel: 'Session',
                maxStalenessPrefix: 100,
                maxIntervalInSeconds: 5
            },
            enableAutomaticFailover: true,
            locations: [
                'westus2',
                'eastus'
            ],
            ipRangeFilters: [],
            databases: [
                {
                    name: 'test-database',
                    collections: [
                        {
                            name: 'collection1',
                            throughput: 400
                        }
                    ]
                }
            ],
            tags: {}
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

            it('valid', () => {
                let results = validate([settings]);
                expect(results.length).toEqual(0);
            });
        });

        describe('kind', () => {
            it('undefined', () => {
                delete settings.kind;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].kind');
            });

            it('null', () => {
                settings.kind = null;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].kind');
            });

            it('empty', () => {
                settings.kind = '';
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].kind');
            });

            it('whitespace', () => {
                settings.kind = '   ';
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].kind');
            });

            it('invalid', () => {
                settings.kind = 'NOT_VALID';
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].kind');
            });

            it('valid', () => {
                let results = validate([settings]);
                expect(results.length).toEqual(0);
            });
        });

        describe('databaseAccountOfferType', () => {
            it('undefined', () => {
                delete settings.databaseAccountOfferType;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].databaseAccountOfferType');
            });

            it('null', () => {
                settings.databaseAccountOfferType = null;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].databaseAccountOfferType');
            });

            it('empty', () => {
                settings.databaseAccountOfferType = '';
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].databaseAccountOfferType');
            });

            it('whitespace', () => {
                settings.databaseAccountOfferType = '   ';
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].databaseAccountOfferType');
            });

            it('invalid', () => {
                settings.databaseAccountOfferType = 'NOT_VALID';
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].databaseAccountOfferType');
            });

            it('valid', () => {
                let results = validate([settings]);
                expect(results.length).toEqual(0);
            });
        });

        describe('consistencyPolicy', () => {
            describe('defaultConsistencyLevel', () => {
                it('invalid', () => {
                    settings.consistencyPolicy = {
                        defaultConsistencyLevel: 'NOT_VALID'
                    };
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].consistencyPolicy.defaultConsistencyLevel');
                });
                describe('BoundedStaleness', () => {
                    it('maxStalenessPrefix undefined', () => {
                        settings.consistencyPolicy = {
                            defaultConsistencyLevel: 'BoundedStaleness',
                            maxIntervalInSeconds: settings.consistencyPolicy.maxIntervalInSeconds
                        };
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].consistencyPolicy.maxStalenessPrefix');
                    });

                    it('maxStalenessPrefix is less than 1', () => {
                        settings.consistencyPolicy = {
                            defaultConsistencyLevel: 'BoundedStaleness',
                            maxStalenessPrefix: 0,
                            maxIntervalInSeconds: settings.consistencyPolicy.maxIntervalInSeconds
                        };
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].consistencyPolicy.maxStalenessPrefix');
                    });

                    it('maxStalenessPrefix is greater than 2,147,483,647', () => {
                        settings.consistencyPolicy = {
                            defaultConsistencyLevel: 'BoundedStaleness',
                            maxStalenessPrefix: 2147483648,
                            maxIntervalInSeconds: settings.consistencyPolicy.maxIntervalInSeconds
                        };
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].consistencyPolicy.maxStalenessPrefix');
                    });

                    it('maxStalenessPrefix is valid', () => {
                        settings.consistencyPolicy = {
                            defaultConsistencyLevel: 'BoundedStaleness',
                            maxStalenessPrefix: 100,
                            maxIntervalInSeconds: settings.consistencyPolicy.maxIntervalInSeconds
                        };
                        let results = validate([settings]);
                        expect(results.length).toEqual(0);
                    });
                });
                describe('defaultConsistencyLevel != BoundedStaleness', () => {
                    let settings;
                    beforeEach(() => {
                        settings = _.cloneDeep(testSettings);
                    });

                    it('maxStalenessPrefix and maxIntervalInSeconds undefined', () => {
                        delete settings.consistencyPolicy.maxStalenessPrefix;
                        delete settings.consistencyPolicy.maxIntervalInSeconds;
                        let results = validate([settings]);
                        expect(results.length).toEqual(0);
                    });

                    it('maxStalenessPrefix and maxIntervalInSeconds ignored', () => {
                        let results = validate([settings]);
                        expect(results.length).toEqual(0);
                    });
                });
            });
        });

        describe('locations', () => {
            it('undefined', () => {
                delete settings.locations;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].locations');
            });

            it('null', () => {
                settings.locations = null;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].locations');
            });

            it('length === 0', () => {
                settings.locations = [];
                let results = validate([settings]);
                expect(results.length).toEqual(0);
            });

            it('undefined element', () => {
                settings.locations = [undefined];
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].locations[0]');
            });

            it('null element', () => {
                settings.locations = [null];
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].locations[0]');
            });

            it('empty element', () => {
                settings.locations = [''];
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].locations[0]');
            });

            it('whitespace element', () => {
                settings.locations = ['   '];
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].locations[0]');
            });

            it('valid', () => {
                let results = validate([settings]);
                expect(results.length).toEqual(0);
            });
        });

        describe('enableAutomaticFailover', () => {
            it('undefined', () => {
                delete settings.enableAutomaticFailover;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].enableAutomaticFailover');
            });

            it('null', () => {
                settings.enableAutomaticFailover = null;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].enableAutomaticFailover');
            });

            it('invalid', () => {
                settings.enableAutomaticFailover = 'NOT_VALID';
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].enableAutomaticFailover');
            });

            it('valid', () => {
                let results = validate([settings]);
                expect(results.length).toEqual(0);
            });
        });

        describe('ipRangeFilters', () => {
            it('undefined', () => {
                delete settings.ipRangeFilters;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].ipRangeFilters');
            });

            it('null', () => {
                settings.ipRangeFilters = null;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].ipRangeFilters');
            });

            it('invalid', () => {
                settings.ipRangeFilters = ['NOT_VALID'];
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].ipRangeFilters[0]');
            });

            it('valid', () => {
                settings.ipRangeFilters = [
                    '192.168.1.1',
                    '10.0.0.0/16'
                ];
                let results = validate([settings]);
                expect(results.length).toEqual(0);
            });
        });

        describe('databases', () => {
            it('undefined', () => {
                delete settings.databases;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].databases');
            });

            it('null', () => {
                settings.databases = null;
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].databases');
            });

            it('invalid', () => {
                settings.databases = '';
                let results = validate([settings]);
                expect(results.length).toEqual(1);
                expect(results[0].name).toEqual('[0].databases');
            });

            describe('name', () => {
                it('undefined', () => {
                    delete settings.databases[0].name;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].databases[0].name');
                });

                it('null', () => {
                    settings.databases[0].name = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].databases[0].name');
                });

                it('empty', () => {
                    settings.databases[0].name = '';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].databases[0].name');
                });

                it('whitespace', () => {
                    settings.databases[0].name = '   ';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].databases[0].name');
                });
            });

            describe('collections', () => {
                it('undefined', () => {
                    delete settings.databases[0].collections;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].databases[0].collections');
                });

                it('null', () => {
                    settings.databases[0].collections = null;
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].databases[0].collections');
                });

                it('invalid', () => {
                    settings.databases[0].collections = '';
                    let results = validate([settings]);
                    expect(results.length).toEqual(1);
                    expect(results[0].name).toEqual('[0].databases[0].collections');
                });

                describe('name', () => {
                    it('undefined', () => {
                        delete settings.databases[0].collections[0].name;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].databases[0].collections[0].name');
                    });

                    it('null', () => {
                        settings.databases[0].collections[0].name = null;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].databases[0].collections[0].name');
                    });

                    it('empty', () => {
                        settings.databases[0].collections[0].name = '';
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].databases[0].collections[0].name');
                    });

                    it('whitespace', () => {
                        settings.databases[0].collections[0].name = '   ';
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].databases[0].collections[0].name');
                    });
                });

                describe('defaultTtl', () => {
                    it('undefined', () => {
                        delete settings.databases[0].collections[0].defaultTtl;
                        let results = validate([settings]);
                        expect(results.length).toEqual(0);
                    });

                    it('null', () => {
                        settings.databases[0].collections[0].defaultTtl = null;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].databases[0].collections[0].defaultTtl');
                    });

                    it('empty', () => {
                        settings.databases[0].collections[0].defaultTtl = '';
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].databases[0].collections[0].defaultTtl');
                    });

                    it('whitespace', () => {
                        settings.databases[0].collections[0].defaultTtl = '   ';
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].databases[0].collections[0].defaultTtl');
                    });

                    it('invalid', () => {
                        settings.databases[0].collections[0].defaultTtl = 'NOT_VALID';
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].databases[0].collections[0].defaultTtl');
                    });

                    it('less than 1', () => {
                        settings.databases[0].collections[0].defaultTtl = 0;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].databases[0].collections[0].defaultTtl');
                    });
                });

                describe('partitionKeyPath', () => {
                    it('undefined', () => {
                        delete settings.databases[0].collections[0].partitionKeyPath;
                        let results = validate([settings]);
                        expect(results.length).toEqual(0);
                    });

                    it('null', () => {
                        settings.databases[0].collections[0].partitionKeyPath = null;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].databases[0].collections[0].partitionKeyPath');
                    });

                    it('empty', () => {
                        settings.databases[0].collections[0].partitionKeyPath = '';
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].databases[0].collections[0].partitionKeyPath');
                    });

                    it('whitespace', () => {
                        settings.databases[0].collections[0].partitionKeyPath = '   ';
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].databases[0].collections[0].partitionKeyPath');
                    });
                });

                describe('throughput', () => {
                    it('undefined', () => {
                        delete settings.databases[0].collections[0].throughput;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].databases[0].collections[0].throughput');
                    });

                    it('null', () => {
                        settings.databases[0].collections[0].throughput = null;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].databases[0].collections[0].throughput');
                    });

                    it('invalid', () => {
                        settings.databases[0].collections[0].throughput = '';
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].databases[0].collections[0].throughput');
                    });

                    it('not multiple of 100', () => {
                        settings.databases[0].collections[0].throughput = 101;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].databases[0].collections[0].throughput');
                    });

                    it('without partitionKeyPath and throughput less than 400', () => {
                        settings.databases[0].collections[0].throughput = 399;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].databases[0].collections[0].throughput');
                    });

                    it('without partitionKeyPath and throughput greater than 10000', () => {
                        settings.databases[0].collections[0].throughput = 10001;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].databases[0].collections[0].throughput');
                    });

                    it('with partitionKeyPath and throughput less than 2500', () => {
                        settings.databases[0].collections[0].partitionKeyPath = 'partition-key-path';
                        settings.databases[0].collections[0].throughput = 2499;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].databases[0].collections[0].throughput');
                    });

                    it('with partitionKeyPath and throughput greater than 100000', () => {
                        settings.databases[0].collections[0].partitionKeyPath = 'partition-key-path';
                        settings.databases[0].collections[0].throughput = 100001;
                        let results = validate([settings]);
                        expect(results.length).toEqual(1);
                        expect(results[0].name).toEqual('[0].databases[0].collections[0].throughput');
                    });

                    it('valid without partitionKeyPath and throughput === 400', () => {
                        settings.databases[0].collections[0].throughput = 400;
                        let results = validate([settings]);
                        expect(results.length).toEqual(0);
                    });

                    it('valid without partitionKeyPath and throughput === 10000', () => {
                        settings.databases[0].collections[0].throughput = 10000;
                        let results = validate([settings]);
                        expect(results.length).toEqual(0);
                    });

                    it('with partitionKeyPath and throughput === 2500', () => {
                        settings.databases[0].collections[0].partitionKeyPath = 'partition-key-path';
                        settings.databases[0].collections[0].throughput = 2500;
                        let results = validate([settings]);
                        expect(results.length).toEqual(0);
                    });

                    it('with partitionKeyPath and throughput === 100000', () => {
                        settings.databases[0].collections[0].partitionKeyPath = 'partition-key-path';
                        settings.databases[0].collections[0].throughput = 100000;
                        let results = validate([settings]);
                        expect(results.length).toEqual(0);
                    });
                });
            });
        });
    });

    describe('transform', () => {
        let transform = cosmosDbSettings.__get__('transform');

        let testSettings = {
            name: 'doc-cosmos-db',
            subscriptionId: '00000000-0000-1000-8000-000000000000',
            resourceGroupName: 'test-vnet-rg',
            location: 'westus',
            kind: 'DocumentDB',
            databaseAccountOfferType: 'Standard',
            consistencyPolicy: {
                defaultConsistencyLevel: 'Session'
            },
            enableAutomaticFailover: true,
            locations: [
                'westus2',
                'eastus'
            ],
            ipRangeFilters: [],
            databases: [
                {
                    name: 'test-database',
                    collections: [
                        {
                            name: 'collection1',
                            throughput: 400
                        }
                    ]
                }
            ],
            tags: {}
        };

        let settings;
        beforeEach(() => {
            settings = _.cloneDeep(testSettings);
        });

        it('DocumentDB', () => {
            settings.kind = 'DocumentDB';
            let results = transform(settings);
            expect(results.kind).toEqual('GlobalDocumentDB');
            expect(results.tags.defaultExperience).toEqual('DocumentDB');
        });

        it('Graph', () => {
            settings.kind = 'Graph';
            let results = transform(settings);
            expect(results.kind).toEqual('GlobalDocumentDB');
            expect(results.tags.defaultExperience).toEqual('Graph');
        });

        it('Table', () => {
            settings.kind = 'Table';
            let results = transform(settings);
            expect(results.kind).toEqual('GlobalDocumentDB');
            expect(results.tags.defaultExperience).toEqual('Table');
        });

        it('MongoDB', () => {
            settings.kind = 'MongoDB';
            let results = transform(settings);
            expect(results.kind).toEqual('MongoDB');
            expect(results.tags.defaultExperience).toBeUndefined();
        });

        describe('defaultConsistencyLevel', () => {
            it('BoundedStaleness', () => {
                settings.consistencyPolicy = {
                    defaultConsistencyLevel: 'BoundedStaleness',
                    maxStalenessPrefix: 100,
                    maxIntervalInSeconds: 5
                };

                let results = transform(settings);
                expect(results.properties.consistencyPolicy.defaultConsistencyLevel).toEqual(settings.consistencyPolicy.defaultConsistencyLevel);
                expect(results.properties.consistencyPolicy.maxStalenessPrefix).toEqual(settings.consistencyPolicy.maxStalenessPrefix);
                expect(results.properties.consistencyPolicy.maxIntervalInSeconds).toEqual(settings.consistencyPolicy.maxIntervalInSeconds);
            });

            it('BoundedStaleness', () => {
                settings.consistencyPolicy = {
                    defaultConsistencyLevel: 'Session',
                    maxStalenessPrefix: 100,
                    maxIntervalInSeconds: 5
                };

                let results = transform(settings);
                expect(results.properties.consistencyPolicy.defaultConsistencyLevel).toEqual(settings.consistencyPolicy.defaultConsistencyLevel);
                expect(results.properties.consistencyPolicy.maxStalenessPrefix).toBeUndefined();
                expect(results.properties.consistencyPolicy.maxIntervalInSeconds).toBeUndefined();
            });
        });

        it('ipRangeFilters', () => {
            settings.ipRangeFilters = [
                '192.168.1.1',
                '10.0.0.0/16'
            ];
            let results = transform(settings);
            expect(results.properties.ipRangeFilter).toEqual('192.168.1.1,10.0.0.0/16');
        });

        it('locations', () => {
            settings.locations = ['westus2', 'eastus'];
            let results = transform(settings);
            expect(results.properties.locations[0].locationName).toEqual(settings.locations[0]);
            expect(results.properties.locations[0].failoverPriority).toEqual(0);
            expect(results.properties.locations[1].locationName).toEqual(settings.locations[1]);
            expect(results.properties.locations[1].failoverPriority).toEqual(1);
        });

        it('without locations', () => {
            settings.locations = [];
            let results = transform(settings);
            expect(results.properties.locations).toBeUndefined();
        });

        it('enableAutomaticFailover === true', () => {
            settings.enableAutomaticFailover = true;
            let results = transform(settings);
            expect(results.properties.enableAutomaticFailover).toEqual(true);
        });

        it('enableAutomaticFailover === false', () => {
            settings.enableAutomaticFailover = false;
            let results = transform(settings);
            expect(results.properties.enableAutomaticFailover).toBeUndefined();
        });
    });

    describe('process', () => {
        let testBuildingBlockSettings = {
            subscriptionId: '00000000-0000-1000-8000-000000000000',
            resourceGroupName: 'test-vnet-rg',
            location: 'westus'
        };

        let testSettings = {
            name: 'doc-cosmos-db',
            kind: 'DocumentDB',
            databaseAccountOfferType: 'Standard',
            consistencyPolicy: {
                defaultConsistencyLevel: 'Session'
            },
            enableAutomaticFailover: true,
            locations: [
                'westus2',
                'eastus'
            ],
            ipRangeFilters: [],
            databases: [
                {
                    name: 'test-database',
                    collections: [
                        {
                            name: 'collection1',
                            throughput: 400
                        }
                    ]
                }
            ],
            tags: {}
        };

        let settings;
        let buildingBlockSettings;
        beforeEach(() => {
            settings = _.cloneDeep(testSettings);
            buildingBlockSettings = _.cloneDeep(testBuildingBlockSettings);
        });

        it('Building block errors', () => {
            delete buildingBlockSettings.subscriptionId;
            expect(() => cosmosDbSettings.process({
                settings: settings,
                buildingBlockSettings: buildingBlockSettings
            })).toThrowError(Error);
        });

        it('Validation failure', () => {
            delete settings.name;
            expect(() => cosmosDbSettings.process({
                settings: settings,
                buildingBlockSettings: buildingBlockSettings
            })).toThrowError(Error);
        });

        it('Valid', () => {
            let results = cosmosDbSettings.process({
                settings: settings,
                buildingBlockSettings: buildingBlockSettings
            });

            expect(results.resourceGroups.length).toEqual(1);
            expect(results.parameters.cosmosDbs.length).toEqual(1);
            expect(results.preDeploymentParameter.cosmosDbNames.length).toEqual(1);
            expect(results.preDeploymentParameter.cosmosDbNames[0]).toEqual(settings.name);
            expect(results.postDeploymentParameter.cosmosDbs.length).toEqual(1);
            expect(results.postDeploymentParameter.cosmosDbs[0].name).toEqual(settings.name);
            expect(results.postDeploymentParameter.cosmosDbs[0].subscriptionId).toEqual(buildingBlockSettings.subscriptionId);
            expect(results.postDeploymentParameter.cosmosDbs[0].resourceGroupName).toEqual(buildingBlockSettings.resourceGroupName);
            expect(results.postDeploymentParameter.cosmosDbs[0].databases.length).toEqual(1);
            expect(results.postDeploymentParameter.cosmosDbs[0].databases[0].name).toEqual(settings.databases[0].name);
        });
    });

    describe('preDeployment', () => {
        let testBuildingBlockSettings = {
            subscriptionId: '00000000-0000-1000-8000-000000000000',
            resourceGroupName: 'test-vnet-rg',
            location: 'westus'
        };

        let testSettings = {
            name: 'doc-cosmos-db',
            kind: 'DocumentDB',
            databaseAccountOfferType: 'Standard',
            consistencyPolicy: {
                defaultConsistencyLevel: 'Session'
            },
            enableAutomaticFailover: true,
            locations: [
                'westus2',
                'eastus'
            ],
            ipRangeFilters: [],
            databases: [
                {
                    name: 'test-database',
                    collections: [
                        {
                            name: 'collection1',
                            throughput: 400
                        }
                    ]
                }
            ],
            tags: {}
        };

        let revertAz;
        let settings;

        beforeEach(() => {
            settings = _.cloneDeep(testSettings);
        });

        it('no existing CosmosDbs', () => {
            revertAz = cosmosDbSettings.__set__('az', {
                spawnAz: ({args, spawnOptions, azOptions}) => {
                    return {
                        stdout: 'false\n'
                    };
                }
            });
            let results = cosmosDbSettings.process({
                settings: settings,
                buildingBlockSettings: testBuildingBlockSettings
            });
            try {
                expect(results.preDeployment(results.preDeploymentParameter)).toBeUndefined();
            } finally {
                revertAz();
            }
        });

        it('existing CosmosDbs', () => {
            revertAz = cosmosDbSettings.__set__('az', {
                spawnAz: ({args, spawnOptions, azOptions}) => {
                    return {
                        stdout: 'true\n'
                    };
                }
            });
            let results = cosmosDbSettings.process({
                settings: settings,
                buildingBlockSettings: testBuildingBlockSettings
            });
            try {
                expect(() => { results.preDeployment(results.preDeploymentParameter); }).toThrow();
            } finally {
                revertAz();
            }
        });
    });

    describe('postDeployment', () => {
        let testBuildingBlockSettings = {
            subscriptionId: '00000000-0000-1000-8000-000000000000',
            resourceGroupName: 'test-vnet-rg',
            location: 'westus'
        };

        let testSettings = {
            name: 'doc-cosmos-db',
            kind: 'DocumentDB',
            databaseAccountOfferType: 'Standard',
            consistencyPolicy: {
                defaultConsistencyLevel: 'Session'
            },
            enableAutomaticFailover: true,
            locations: [
                'westus2',
                'eastus'
            ],
            ipRangeFilters: [],
            databases: [
                {
                    name: 'test-database',
                    collections: [
                        {
                            name: 'collection1',
                            throughput: 400
                        }
                    ]
                }
            ],
            tags: {}
        };

        let revertAz;
        let azArguments = [];
        beforeAll(() => {
            revertAz = cosmosDbSettings.__set__('az', {
                spawnAz: ({args, spawnOptions, azOptions}) => {
                    azArguments.push(args);
                },
                setSubscription: ({subscriptionId}) => {
                }
            });
        });

        let settings;
        beforeEach(() => {
            settings = _.cloneDeep(testSettings);
            azArguments = [];
        });

        it('with optional fields and defaultTtl === Default', () => {
            settings.databases[0].collections[0].partitionKeyPath = 'partition-key-path';
            settings.databases[0].collections[0].defaultTtl = 'Default';
            settings.databases[0].collections[0].throughput = 2500;
            let results = cosmosDbSettings.process({
                settings: settings,
                buildingBlockSettings: testBuildingBlockSettings
            });

            let azValues = [
                [
                    'cosmosdb',
                    'database',
                    'create',
                    '--name',
                    'doc-cosmos-db',
                    '--resource-group',
                    'test-vnet-rg',
                    '--db-name',
                    'test-database'
                ],
                [
                    'cosmosdb',
                    'collection',
                    'create',
                    '--name',
                    'doc-cosmos-db',
                    '--resource-group',
                    'test-vnet-rg',
                    '--db-name',
                    'test-database',
                    '--collection-name',
                    'collection1',
                    '--throughput',
                    '2500',
                    '--partition-key-path',
                    'partition-key-path',
                    '--default-ttl',
                    '-1'
                ]
            ];

            results.postDeployment(results.postDeploymentParameter);
            expect(_.isEqual(azArguments[0], azValues[0])).toEqual(true);
            expect(_.isEqual(azArguments[1], azValues[1])).toEqual(true);
        });

        it('with optional fields and defaultTtl === Default', () => {
            settings.databases[0].collections[0].partitionKeyPath = 'partition-key-path';
            settings.databases[0].collections[0].defaultTtl = 30;
            settings.databases[0].collections[0].throughput = 2500;
            let results = cosmosDbSettings.process({
                settings: settings,
                buildingBlockSettings: testBuildingBlockSettings
            });

            let azValues = [
                [
                    'cosmosdb',
                    'database',
                    'create',
                    '--name',
                    'doc-cosmos-db',
                    '--resource-group',
                    'test-vnet-rg',
                    '--db-name',
                    'test-database'
                ],
                [
                    'cosmosdb',
                    'collection',
                    'create',
                    '--name',
                    'doc-cosmos-db',
                    '--resource-group',
                    'test-vnet-rg',
                    '--db-name',
                    'test-database',
                    '--collection-name',
                    'collection1',
                    '--throughput',
                    '2500',
                    '--partition-key-path',
                    'partition-key-path',
                    '--default-ttl',
                    '30'
                ]
            ];

            results.postDeployment(results.postDeploymentParameter);
            expect(_.isEqual(azArguments[0], azValues[0])).toEqual(true);
            expect(_.isEqual(azArguments[1], azValues[1])).toEqual(true);
        });

        it('without optional fields', () => {
            let results = cosmosDbSettings.process({
                settings: settings,
                buildingBlockSettings: testBuildingBlockSettings
            });

            let azValues = [
                [
                    'cosmosdb',
                    'database',
                    'create',
                    '--name',
                    'doc-cosmos-db',
                    '--resource-group',
                    'test-vnet-rg',
                    '--db-name',
                    'test-database'
                ],
                [
                    'cosmosdb',
                    'collection',
                    'create',
                    '--name',
                    'doc-cosmos-db',
                    '--resource-group',
                    'test-vnet-rg',
                    '--db-name',
                    'test-database',
                    '--collection-name',
                    'collection1',
                    '--throughput',
                    '400'
                ]
            ];

            results.postDeployment(results.postDeploymentParameter);
            expect(_.isEqual(azArguments[0], azValues[0])).toEqual(true);
            expect(_.isEqual(azArguments[1], azValues[1])).toEqual(true);
        });

        afterAll(() => {
            revertAz();
        });
    });
});