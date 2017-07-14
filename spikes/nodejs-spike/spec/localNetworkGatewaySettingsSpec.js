describe('localNetworkGatewaySettings', () => {
    let localNetworkGatewaySettings = require('../core/localNetworkGatewaySettings.js');
    let _ = require('lodash');
    let validation = require('../core/validation.js');

    describe('merge', () => {
        let merge = localNetworkGatewaySettings.merge;
        
        let buildingBlockSettings = {
            subscriptionId: '00000000-0000-1000-8000-000000000000',
            resourceGroupName: 'test-vnet-rg',
            location: 'westus'
        };

        it('defaults merged', () => {
            let result = merge({
                settings: {},
                buildingBlockSettings: buildingBlockSettings
            });

            expect(result).toEqual(buildingBlockSettings);
        });

        it('setupResources', () => {
            let result = merge({
                settings: {},
                buildingBlockSettings: buildingBlockSettings
            });

            expect(result.subscriptionId).toEqual(buildingBlockSettings.subscriptionId);
            expect(result.resourceGroupName).toEqual(buildingBlockSettings.resourceGroupName);
            expect(result.location).toEqual(buildingBlockSettings.location);
        });
    });
    describe('userDefaults', () => {
        let merge = localNetworkGatewaySettings.merge;
        
        let buildingBlockSettings = {
            subscriptionId: '00000000-0000-1000-8000-000000000000',
            resourceGroupName: 'test-vnet-rg',
            location: 'westus'
        };

        it('user defaults merged', () => {
            let settings = {};

            let defaults = {};

            let result = merge({
                settings,
                buildingBlockSettings: buildingBlockSettings,
                defaultSettings: defaults
            });

            expect(result).toEqual(buildingBlockSettings);
        });

        it('setupResources with user defaults', () => {
            let settings = {};

            let defaults = {};

            let result = merge({
                settings,
                buildingBlockSettings: buildingBlockSettings,
                defaultSettings: defaults
            });

            expect(result.subscriptionId).toEqual(buildingBlockSettings.subscriptionId);
            expect(result.resourceGroupName).toEqual(buildingBlockSettings.resourceGroupName);
            expect(result.location).toEqual(buildingBlockSettings.location);
        });
    });
    describe('validations', () => {
        let lgwValidations = localNetworkGatewaySettings.validations;

        let localNetworkGateway = {
            name: 'my-lgw',
            ipAddress: '40.50.60.70',
            addressPrefixes: [
                '10.0.1.0/24'
            ]
        };

        it('name undefined', () => {
            let settings = _.cloneDeep(localNetworkGateway);
            delete settings.name;

            let errors = validation.validate({
                settings: settings,
                validations: lgwValidations
            });

            expect(errors.length).toEqual(1);
            expect(errors[0].name).toEqual('.name');
        });

        it('name null', () => {
            let settings = _.cloneDeep(localNetworkGateway);
            settings.name = null;

            let errors = validation.validate({
                settings: settings,
                validations: lgwValidations
            });

            expect(errors.length).toEqual(1);
            expect(errors[0].name).toEqual('.name');
        });

        it('name empty', () => {
            let settings = _.cloneDeep(localNetworkGateway);
            settings.name = '';

            let errors = validation.validate({
                settings: settings,
                validations: lgwValidations
            });

            expect(errors.length).toEqual(1);
            expect(errors[0].name).toEqual('.name');
        });

        it('ipAddress undefined', () => {
            let settings = _.cloneDeep(localNetworkGateway);
            delete settings.ipAddress;

            let errors = validation.validate({
                settings: settings,
                validations: lgwValidations
            });

            expect(errors.length).toEqual(1);
            expect(errors[0].name).toEqual('.ipAddress');
        });

        it('ipAddress null', () => {
            let settings = _.cloneDeep(localNetworkGateway);
            settings.ipAddress = null;

            let errors = validation.validate({
                settings: settings,
                validations: lgwValidations
            });

            expect(errors.length).toEqual(1);
            expect(errors[0].name).toEqual('.ipAddress');
        });

        it('addressPrefixes undefined', () => {
            let settings = _.cloneDeep(localNetworkGateway);
            delete settings.addressPrefixes;

            let errors = validation.validate({
                settings: settings,
                validations: lgwValidations
            });

            expect(errors.length).toEqual(1);
            expect(errors[0].name).toEqual('.addressPrefixes');
        });

        it('addressPrefixes null', () => {
            let settings = _.cloneDeep(localNetworkGateway);
            settings.addressPrefixes = null;

            let errors = validation.validate({
                settings: settings,
                validations: lgwValidations
            });

            expect(errors.length).toEqual(1);
            expect(errors[0].name).toEqual('.addressPrefixes');
        });

        it('addressPrefixes empty', () => {
            let settings = _.cloneDeep(localNetworkGateway);
            settings.addressPrefixes = [];

            let errors = validation.validate({
                settings: settings,
                validations: lgwValidations
            });

            expect(errors.length).toEqual(1);
            expect(errors[0].name).toEqual('.addressPrefixes');
        });

        it('addressPrefixes invalid', () => {
            let settings = _.cloneDeep(localNetworkGateway);
            settings.addressPrefixes = [
                'NOT_VALID'
            ];

            let errors = validation.validate({
                settings: settings,
                validations: lgwValidations
            });

            expect(errors.length).toEqual(1);
            expect(errors[0].name).toEqual('.addressPrefixes');
        });

        describe('bgpSettings', () => {
            let localNetworkGatewaySettingsWithBgp = _.cloneDeep(localNetworkGateway);
            localNetworkGatewaySettingsWithBgp.bgpSettings = {
                asn: 1,
                bgpPeeringAddress: 'bgp-peering-address',
                peerWeight: 10
            };

            it('asn undefined', () => {
                let settings = _.cloneDeep(localNetworkGatewaySettingsWithBgp);
                delete settings.bgpSettings.asn;
                let errors = validation.validate({
                    settings: settings,
                    validations: lgwValidations
                });

                expect(errors.length).toEqual(0);
            });

            it('asn null', () => {
                let settings = _.cloneDeep(localNetworkGatewaySettingsWithBgp);
                settings.bgpSettings.asn = null;
                let errors = validation.validate({
                    settings: settings,
                    validations: lgwValidations
                });

                expect(errors.length).toEqual(0);
            });

            it('asn invalid', () => {
                let settings = _.cloneDeep(localNetworkGatewaySettingsWithBgp);
                settings.bgpSettings.asn = 'NOT_VALID';
                let errors = validation.validate({
                    settings: settings,
                    validations: lgwValidations
                });

                expect(errors.length).toEqual(1);
                expect(errors[0].name).toEqual('.bgpSettings.asn');
            });

            it('bgpPeeringAddress undefined', () => {
                let settings = _.cloneDeep(localNetworkGatewaySettingsWithBgp);
                delete settings.bgpSettings.bgpPeeringAddress;
                let errors = validation.validate({
                    settings: settings,
                    validations: lgwValidations
                });

                expect(errors.length).toEqual(0);
            });

            it('bgpPeeringAddress null', () => {
                let settings = _.cloneDeep(localNetworkGatewaySettingsWithBgp);
                settings.bgpSettings.bgpPeeringAddress = null;
                let errors = validation.validate({
                    settings: settings,
                    validations: lgwValidations
                });

                expect(errors.length).toEqual(0);
            });

            it('bgpPeeringAddress empty', () => {
                let settings = _.cloneDeep(localNetworkGatewaySettingsWithBgp);
                settings.bgpSettings.bgpPeeringAddress = '';
                let errors = validation.validate({
                    settings: settings,
                    validations: lgwValidations
                });

                expect(errors.length).toEqual(1);
                expect(errors[0].name).toEqual('.bgpSettings.bgpPeeringAddress');
            });

            it('bgpPeeringAddress only whitespace', () => {
                let settings = _.cloneDeep(localNetworkGatewaySettingsWithBgp);
                settings.bgpSettings.bgpPeeringAddress = '   ';
                let errors = validation.validate({
                    settings: settings,
                    validations: lgwValidations
                });

                expect(errors.length).toEqual(1);
                expect(errors[0].name).toEqual('.bgpSettings.bgpPeeringAddress');
            });

            it('peerWeight undefined', () => {
                let settings = _.cloneDeep(localNetworkGatewaySettingsWithBgp);
                delete settings.bgpSettings.peerWeight;
                let errors = validation.validate({
                    settings: settings,
                    validations: lgwValidations
                });

                expect(errors.length).toEqual(0);
            });

            it('peerWeight null', () => {
                let settings = _.cloneDeep(localNetworkGatewaySettingsWithBgp);
                settings.bgpSettings.peerWeight = null;
                let errors = validation.validate({
                    settings: settings,
                    validations: lgwValidations
                });

                expect(errors.length).toEqual(0);
            });

            it('peerWeight invalid', () => {
                let settings = _.cloneDeep(localNetworkGatewaySettingsWithBgp);
                settings.bgpSettings.peerWeight = 'NOT_VALID';
                let errors = validation.validate({
                    settings: settings,
                    validations: lgwValidations
                });

                expect(errors.length).toEqual(1);
                expect(errors[0].name).toEqual('.bgpSettings.peerWeight');
            });
        });

        it('Valid', () => {
            let settings = _.cloneDeep(localNetworkGateway);

            let errors = validation.validate({
                settings: settings,
                validations: lgwValidations
            });

            expect(errors.length).toEqual(0);
        });
    });

    if (global.testConfiguration.runTransform) {
        describe('transform', () => {
            let localNetworkGateway = {
                name: 'my-lgw',
                ipAddress: '40.50.60.70',
                addressPrefixes: [
                    '10.0.1.0/24'
                ],
                bgpSettings: {
                    asn: 1,
                    bgpPeeringAddress: 'bgp-peering-address',
                    peerWeight: 10
                }
            };

            let buildingBlockSettings = {
                subscriptionId: '00000000-0000-1000-8000-000000000000',
                resourceGroupName: 'test-rg',
                location: 'westus2'
            };

            it('single localNetworkGateway without bgpSettings', () => {
                let settings = _.cloneDeep(localNetworkGateway);
                delete settings.bgpSettings;
                let merged = localNetworkGatewaySettings.merge({
                    settings: settings,
                    buildingBlockSettings: buildingBlockSettings
                });

                let result = localNetworkGatewaySettings.transform({
                    settings: merged
                });

                expect(result.name).toEqual(settings.name);
                expect(result.subscriptionId).toEqual(buildingBlockSettings.subscriptionId);
                expect(result.resourceGroupName).toEqual(buildingBlockSettings.resourceGroupName);
                expect(result.location).toEqual(buildingBlockSettings.location);

                expect(result.properties.ipAddress).toEqual(localNetworkGateway.gatewayIpAddress);
                expect(result.properties.localNetworkAddressSpace.addressPrefixes[0]).toEqual(localNetworkGateway.addressPrefixes[0]);
            });

            it('array localNetworkGateway', () => {
                let settings = _.cloneDeep(localNetworkGateway);
                expect(() => {
                    localNetworkGatewaySettings.transform({
                        settings: [settings],
                        buildingBlockSettings: buildingBlockSettings
                    });
                }).toThrow();
            });

            it('single localNetworkGateway with bgpSettings', () => {
                let settings = _.cloneDeep(localNetworkGateway);
                let merged = localNetworkGatewaySettings.merge({
                    settings: settings,
                    buildingBlockSettings: buildingBlockSettings
                });

                let result = localNetworkGatewaySettings.transform({
                    settings: merged
                });

                expect(result.name).toEqual(settings.name);
                expect(result.subscriptionId).toEqual(buildingBlockSettings.subscriptionId);
                expect(result.resourceGroupName).toEqual(buildingBlockSettings.resourceGroupName);
                expect(result.location).toEqual(buildingBlockSettings.location);

                expect(result.properties.ipAddress).toEqual(localNetworkGateway.gatewayIpAddress);
                expect(result.properties.localNetworkAddressSpace.addressPrefixes[0]).toBe(localNetworkGateway.addressPrefixes[0]);
                expect(result.properties.bgpSettings.asn).toEqual(localNetworkGateway.bgpSettings.asn);
                expect(result.properties.bgpSettings.bgpPeeringAddress).toEqual(localNetworkGateway.bgpSettings.bgpPeeringAddress);
                expect(result.properties.bgpSettings.peerWeight).toEqual(localNetworkGateway.bgpSettings.peerWeight);
            });

            it('single localNetworkGateway with bgpSettings without asn', () => {
                let settings = _.cloneDeep(localNetworkGateway);
                delete settings.bgpSettings.asn;
                let merged = localNetworkGatewaySettings.merge({
                    settings: settings,
                    buildingBlockSettings: buildingBlockSettings
                });

                let result = localNetworkGatewaySettings.transform({
                    settings: merged
                });

                expect(result.name).toEqual(settings.name);
                expect(result.subscriptionId).toEqual(buildingBlockSettings.subscriptionId);
                expect(result.resourceGroupName).toEqual(buildingBlockSettings.resourceGroupName);
                expect(result.location).toEqual(buildingBlockSettings.location);

                expect(result.properties.ipAddress).toEqual(localNetworkGateway.gatewayIpAddress);
                expect(result.properties.localNetworkAddressSpace.addressPrefixes[0]).toBe(localNetworkGateway.addressPrefixes[0]);
                expect(result.properties.bgpSettings.asn).toBeUndefined();
                expect(result.properties.bgpSettings.bgpPeeringAddress).toEqual(localNetworkGateway.bgpSettings.bgpPeeringAddress);
                expect(result.properties.bgpSettings.peerWeight).toEqual(localNetworkGateway.bgpSettings.peerWeight);
            });

            it('single localNetworkGateway with bgpSettings without bgpPeeringAddress', () => {
                let settings = _.cloneDeep(localNetworkGateway);
                delete settings.bgpSettings.bgpPeeringAddress;
                let merged = localNetworkGatewaySettings.merge({
                    settings: settings,
                    buildingBlockSettings: buildingBlockSettings
                });

                let result = localNetworkGatewaySettings.transform({
                    settings: merged
                });

                expect(result.name).toEqual(settings.name);
                expect(result.subscriptionId).toEqual(buildingBlockSettings.subscriptionId);
                expect(result.resourceGroupName).toEqual(buildingBlockSettings.resourceGroupName);
                expect(result.location).toEqual(buildingBlockSettings.location);

                expect(result.properties.ipAddress).toEqual(localNetworkGateway.gatewayIpAddress);
                expect(result.properties.localNetworkAddressSpace.addressPrefixes[0]).toBe(localNetworkGateway.addressPrefixes[0]);
                expect(result.properties.bgpSettings.asn).toEqual(localNetworkGateway.bgpSettings.asn);
                expect(result.properties.bgpSettings.bgpPeeringAddress).toBeUndefined();
                expect(result.properties.bgpSettings.peerWeight).toEqual(localNetworkGateway.bgpSettings.peerWeight);
            });

            it('single localNetworkGateway with bgpSettings without peerWeight', () => {
                let settings = _.cloneDeep(localNetworkGateway);
                delete settings.bgpSettings.peerWeight;
                let merged = localNetworkGatewaySettings.merge({
                    settings: settings,
                    buildingBlockSettings: buildingBlockSettings
                });

                let result = localNetworkGatewaySettings.transform({
                    settings: merged
                });

                expect(result.name).toEqual(settings.name);
                expect(result.subscriptionId).toEqual(buildingBlockSettings.subscriptionId);
                expect(result.resourceGroupName).toEqual(buildingBlockSettings.resourceGroupName);
                expect(result.location).toEqual(buildingBlockSettings.location);

                expect(result.properties.ipAddress).toEqual(localNetworkGateway.gatewayIpAddress);
                expect(result.properties.localNetworkAddressSpace.addressPrefixes[0]).toBe(localNetworkGateway.addressPrefixes[0]);
                expect(result.properties.bgpSettings.asn).toEqual(localNetworkGateway.bgpSettings.asn);
                expect(result.properties.bgpSettings.bgpPeeringAddress).toEqual(localNetworkGateway.bgpSettings.bgpPeeringAddress);
                expect(result.properties.bgpSettings.peerWeight).toBeUndefined();
            });
        });
    }
});