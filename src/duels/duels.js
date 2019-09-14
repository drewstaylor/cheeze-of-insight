'use strict';

// Config 
const config = require('../config');
const firebaseConfig = config.firebaseConfig;

/**
 * This information can be used to  manually set sessionData via console for testing Duels 
 * without requiring multiple Twitter accounts or multiple Web3 wallets (each having wizards)
 * 
 * Console commands:
 * 
 * let duelConfig = '{"action":"challenge","name":"Challenge to a duel simulation","isValidPartner":true,"wizardChallenged":{"id":"1353","owner":"0x88b49cA334521BadA40Faa71EF3B416Fb1B161ec","affinity":3,"initialPower":"78071441448856","power":"78071441448856","eliminatedBlockNumber":null,"createdBlockNumber":7780436,"image":"https://storage.googleapis.com/cheeze-wizards-production/0xec2203e38116f09e21bc27443e063b623b01345a/1353.svg","specialPower":"Wind","vulnerability":"Fire","optimalOpponent":"Water"},"wizardChallenging":{"id":"1614","owner":"0x33Ec2fEd3E429a515ccDf361554f102eA36e0CEB","affinity":2,"initialPower":"100973404296275","power":"100973404296275","eliminatedBlockNumber":null,"createdBlockNumber":7780479,"image":"https://storage.googleapis.com/cheeze-wizards-production/0xec2203e38116f09e21bc27443e063b623b01345a/1614.svg","specialPower":"Fire","vulnerability":"Water","optimalOpponent":"Wind"},"roomId":"-Lo1qhvCJxBy1TS3nCnw"}';
 * sessionStorage.setItem('duel', duelConfig);
 */

// Create application
if (location.href.indexOf('duels') !== -1) {
    let duelsVm = new Vue({
        el: '#duels',
        data: () => ({
            // Dependencies
            Provider: require('../providers'),
            api: require('../api'),
            duelUtils: require('../duels'),
            wizardUtils: require('../wizards'),
            DuelSim: require('./DuelLib.js'),
            // Web3
            web3Providers: {
                rinkeby: null,
                mainnet: null
            },
            isWeb3Enabled: null,
            wallets: {
                rinkeby: null,
                mainnet: null
            },
            contracts: {
                rinkeby: {},
                mainnet: {}
            },
            tokens: {
                rinkeby: {
                    wizards: []
                },
                mainnet: {
                    wizards: []
                }
            },
            // Duel
            duel: null
        }),
        mounted: async function () {
            // Web3 Instances
            this.web3Providers.mainnet = await this.Provider.getWssWeb3Mainnet();
            this.web3Providers.rinkeby = await this.Provider.getWssWeb3Rinkeby();

            // Wallet Instance
            let accounts;
            if (window.hasOwnProperty('ethereum')) {
                this.isWeb3Enabled = true;
                accounts = await window.ethereum.enable();
                if (accounts[0]) {
                    // Wallets
                    this.wallets.rinkeby = false;
                    this.wallets.mainnet = accounts[0];
                    console.log('Accounts =>', this.wallets);
                    
                    // ERC721 Instances
                    this.contracts.mainnet.wizards = await this.Provider.mainnetWizardsInstance();
                    console.log('ERC721 Contract', this.contracts.mainnet.wizards);
                }
            } else {
                this.isWeb3Enabled = false;
            }

            // Mount duel configuration
            let duelConfig = JSON.parse(sessionStorage.getItem('duel'));
            console.log('duelConfig', duelConfig);
            if (duelConfig) {
                //sessionStorage.removeItem('duel');
                this.duel = duelConfig;
            }
        },
        methods: {
            /**
             * @param {Object} moveArrayChallengingdWizard: An array of turn commitments (enums) for the challenging Wizard
             * @param {Object} moveArrayChallengedWizard: An array of turn commitments (enums) for the challenged Wizard
             * @return {Object} : An object containing the duel result. XXX TODO: Clarify how to interpret this result.
             * 
             * Example response:
             * 
             * $ node TestDuel.js
             * Resolved Duel => Result { '0': '2', '1': '100', __length__: 2 }
             */
            resolveDuelSimulation: async function(moveArrayChallengingWizard, moveArrayChallengedWizard) {
                // Only call, when valid args are present
                if (!moveArrayChallengingWizard
                    || !moveArrayChallengedWizard
                    || !this.duel) {
                        return;
                } else if (!this.duel.hasOwnProperty('wizardChallenging')) {
                    return;
                } else if (!this.duel.hasOwnProperty('wizardChallenged')) {
                    return;
                }

                // Instance of Providers
                let rinkeby = this.web3Providers.rinkeby;

                // Process Duel resolution
                let result = await this.DuelSim.SimulateDuel(
                    moveArrayChallengingWizard,             // Challenger player move set
                    moveArrayChallengedWizard,              // Challenged player move set 
                    this.duel.wizardChallenging.power,      // Challenger Wizard's power level
                    this.duel.wizardChallenged.power,       // Challenged Wizard's power level
                    this.duel.wizardChallenging.affinity,   // Challenger Wizard's affinity
                    this.duel.wizardChallenged.affinity,    // Challenged Wizard's affinity
                    rinkeby
                );

                // Debug
                console.log('Resolved Duel =>', result);

                // Return Duel result
                return result;
            }
        }
    });
}