'use strict';

const FIREBASE = require('../firebase');
let duelsRef = FIREBASE.firebaseDb.ref('duel-simulations');

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
 *
 * also, set current wizard id:
 * sessionStorage.setItem('ourWizardId', '1353');
 */

const randomTurn = () => { return Math.floor(Math.random() * 3) + 2; };
const randomTurns = () => {
    return [
        randomTurn(),
        randomTurn(),
        randomTurn(),
        randomTurn(),
        randomTurn(),
    ];
}

Vue.component('round-picker', {
    props: ['label'],
    data: () => ({
        value: 0,
    }),
    template: '#round-picker-template',
});

Vue.component('duel-status', {
    props: ['outcome', 'power', 'score'],
    template: '#duel-status-template',
});

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
            firebase: FIREBASE,
            // Duel
            duel: null,
            ourWizardId: null,
            duelResults: null,
            turns: randomTurns(),
            firebaseDuels: [],
        }),
        firebase: {
            // TODO: subscribe to "duel-simulations/"+ duelId
            firebaseDuels: duelsRef,
        },
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

            const ourWizardId = sessionStorage.getItem('ourWizardId');
            console.log('ourWizardId', ourWizardId);
            if (ourWizardId) {
                //sessionStorage.removeItem('duel');
                this.ourWizardId = ourWizardId;
            }

            // Mount duel configuration
            let duelConfig = JSON.parse(sessionStorage.getItem('duel'));
            console.log('duelConfig', duelConfig);
            if (duelConfig) {
                //sessionStorage.removeItem('duel');
                this.duel = duelConfig;

                // determine opposing wizard's id
                if (this.duel.wizardChallenged.id === this.ourWizardId) {
                    console.log("We're the challenged wizard");
                    this.opposingWizard = this.duel.wizardChallenging;
                    this.opposingWizardId = this.duel.wizardChallenging.id;

                    this.ourWizard = this.duel.wizardChallenged;
                    // this.ourWizardId = this.duel.wizardChallenged.id;
                } else {
                    console.log("We're the challenging wizard");
                    this.opposingWizard = this.duel.wizardChallenged;
                    this.opposingWizardId = this.duel.wizardChallenged.id;

                    this.ourWizard = this.duel.wizardChallenging;
                    // this.ourWizardId = this.duel.wizardChallenging.id;
                }
            }
        },
        watch: {
            firebaseDuels: {
                immediate: true,
                handler: function(firebaseDuels) {
                    // TODO: update our state
                },
            },
        },
        methods: {
            /**
             * @param {Object} ourMoves: An array of turn commitments (enums) for our wizard
             * @param {Object} opponentMoves: An array of turn commitments (enums) from our opponent
             * @return {Object} : object[0] = power transfer, object[1] = sum of move scores
             * 
             * Example response:
             * 
             * $ node TestDuel.js
             * Resolved Duel => Result { '0': '2', '1': '100', __length__: 2 }
             */
            resolveDuelSimulation: async function(ourMoves, opponentMoves) {
                // Only call, when valid args are present
                if (!ourMoves || !opponentMoves || !this.duel) {
                    return;
                }

                // Instance of Providers
                let rinkeby = this.web3Providers.rinkeby;

                // Process Duel resolution
                let result = await this.DuelSim.SimulateDuel(
                    ourMoves,
                    opponentMoves,
                    this.ourWizard.power,
                    this.opposingWizard.power,
                    this.ourWizard.affinity,
                    this.opposingWizard.affinity,
                    rinkeby
                );

                // Debug
                console.log('Resolved Duel =>', result);

                // Return Duel result
                return result;
            },

            /**
             * Submit turn
             */
            async submitTurn() {

                if (!(this.turns[0] && this.turns[1] && this.turns[2] && this.turns[3] && this.turns[4])) {
                    console.log("Error: not all turns are set");
                    return;
                }

                /* uncomment to push an empty object to 'duel-simulations', e.g. to clean up
                await duelsRef
                        .child(this.duel.roomId)
                        .set({});
                */

                // post duel config
                // TODO: don't want both parties posting this
                //       also, probably not the ideal time to post it
                await duelsRef
                        .child(this.duel.roomId)
                        .child("duelConfig")
                        .set(this.duel);

                // post moves object
                await duelsRef
                        .child(this.duel.roomId)
                        .child("moves")
                        .child(this.ourWizardId)
                        .set(this.turns);


                // submit fake turns for opponent
                // TODO: should actually wait for firebase update that includes opponent's submission
                // post moves object
                await duelsRef
                        .child(this.duel.roomId)
                        .child("moves")
                        .child(this.opposingWizardId)
                        .set(randomTurns());

                const contractResults = await this.resolveDuelSimulation(randomTurns(), randomTurns());
                const power = Math.floor(parseInt(contractResults[0]) / 1000000000000);
                const score = parseInt(contractResults[1]);
                const outcome = (power > 0 ? "WIN" : (power == 0 ? "TIE" : "LOSS"));

                this.duelResults = {
                    power: power,
                    score: score,
                    outcome: outcome,
                };

                console.log("Compiled duel results:", this.duelResults);

            },
        }
    });
}
