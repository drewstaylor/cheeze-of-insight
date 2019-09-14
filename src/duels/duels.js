/**
 * `duels.js` contains functionality to display and interact with a duel simulation. The simulation
 * can be carried out in different ways depending on how it is "invoked," as described below.
 *
 * Modes - there are currently two modes of operation. One is a `challenge` duel where two live
 * participants duel each other. `firebase` is used as a means of communicating wizard `forecasts`.
 * In this mode, each player submits their `forecast` and then waits for their opponent's `forecast`
 * from `firebase`, at which point the duel results are displayed.
 *
 * The other mode is an `offline` duel where a single user has selected two arbitrary wizards and
 * picks one or both of their moves. This allows the user to simulate different outcomes and learn
 * about both the dueling process and the different outcomes of the match.
 *
 * These modes are invoked by passing certain data to `duels.js` by means of `sessionStorage`. This
 * includes:
 *
 * @param {string} mode should be either "challenge" or "offline"
 * @param {string} ourWizardId should be the wizard ID of the wizard associated with the user
 * @param {string} opposingWizardId should be the wizard ID of the wizard to duel against
 * @param {object} duel is a config object that contains info about both wizards and the
 *                 duel setup.
 */

'use strict';

// TODO: clean up / consolidate with similar logic below
//const duelConfig = JSON.parse(sessionStorage.getItem('duel'));

const FIREBASE = require('../firebase');
const path = 'duel-simulations';
const duelsRef = FIREBASE.firebaseDb.ref(path);

// Config 
const config = require('../config');
const firebaseConfig = config.firebaseConfig;

/**
 * This information can be used to  manually set sessionStorage via console for testing Duels 
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

/**
 * Reads in variables from sessionStorage, optionally deleting them.
 *
 * See the documentation at the top of this file (duels.js) for more info on
 * what data is stored in sessionStorage.
 *
 * This also validates the input from sessionStorage, throwing an instance of
 * Error on invalid input.
 *
 * @return {object} an object with the sessionStorage variables filled out
 */
const readSessionStorage = function() {

    const mode = sessionStorage.getItem("mode");
    const ourWizardId = sessionStorage.getItem("ourWizardId");
    const opposingWizardId = sessionStorage.getItem("opposingWizardId");
    const duel = JSON.parse(sessionStorage.getItem('duel'));

    if (! mode) throw new Error("duels.js requires 'mode' in sessionStorage");
    if (! ourWizardId || ourWizardId === "undefined") throw new Error("duels.js requires 'ourWizardId' in sessionStorage");
    if (! opposingWizardId || opposingWizardId === "undefined") throw new Error("duels.js requires 'opposingWizardId' in sessionStorage");
    if (! duel) throw new Error("duels.js requires 'duel' in sessionStorage");

    return {
        mode,
        ourWizardId,
        opposingWizardId,
        duel,
    };
};


/**
 * Clears sessionStorage
 */
const clearSessionStorage = function() {
    sessionStorage.removeItem("mode");
    sessionStorage.removeItem("ourWizardId");
    sessionStorage.removeItem("opposingWizardId");
    sessionStorage.removeItem("duel");
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

Vue.component('wizard-card', {
    props: ['wizard', 'api'],
    template: "#wizard-card-template",
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
            mode: null,
            duel: null,
            ourWizard: null,
            ourWizardId: null,
            opposingWizard: null,
            opposingWizardId: null,
            duelResults: null,
            ourMoves: [],
            opponentMoves: [],
            opponentMovesReceived: false,
            firebaseDuels: [],
        }),
        firebase: {
            // TODO: subscribe to "duel-simulations/"+ duelId
            firebaseDuels: duelsRef,
        },
        mounted: async function () {

            const duelParams = readSessionStorage();
            console.log("duelParams => ", duelParams);

            this.mode = duelParams.mode;
            this.ourWizardId = duelParams.ourWizardId;
            this.opposingWizardId = duelParams.opposingWizardId;
            this.duel = duelParams.duel;

            // determine which wizard is which
            if (this.duel.wizardChallenged.id === this.ourWizardId) {
                console.log("We're the challenged wizard");
                this.opposingWizard = this.duel.wizardChallenging;
                this.ourWizard = this.duel.wizardChallenged;
            } else {
                console.log("We're the challenging wizard");
                this.opposingWizard = this.duel.wizardChallenged;
                this.ourWizard = this.duel.wizardChallenging;
            }

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
        },
        watch: {
            async firebaseDuels(value) {

                // TODO: we should not even connec to firebase in (mode == "offline")
                if (this.mode === "offline") {
                    console.log("Ignoring firebaseDuels update");
                    return;
                }

                console.log("firebaseDuels change => ", value);

                // 'duel-simulations' is an array of all active duels; we need to loop through each to find ours
                let thisDuel = null;
                for (const duel of value) {
                    if (duel && duel['.key'] && duel['.key'] === this.duel.roomId) {
                        console.log("Found our duel => ", duel);
                        thisDuel = duel;
                        break;
                    }
                }

                if (! thisDuel) {
                    console.log("Did not find our duel");
                    return;
                }

                if (! thisDuel.moves) {
                    console.log("No moves yet");
                    return;
                }

                const ourMoves = thisDuel.moves[this.ourWizardId];
                const opponentMoves = thisDuel.moves[this.opposingWizardId];

                if (opponentMoves) {
                    console.log("Setting opponentMoves", opponentMoves);
                    this.opponentMoves = opponentMoves;
                    this.opponentMovesReceived = true;
                }

                if (! this.duelResults && this.opponentMovesReceived && this.ourMoves) {
                    await this.processDuelSimulation(this.ourMoves, this.opponentMoves);
                }
            },
            ourMoves(value) {
                console.log("our moves updated => ", value);
                this.processOfflineSimulation(this.ourMoves, this.opponentMoves);
            },
            opponentMoves(value) {
                console.log("opponent moves updated => ", value);
                this.processOfflineSimulation(this.ourMoves, this.opponentMoves);
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
            processDuelSimulation: async function(ourMoves, opponentMoves) {
                // Only call, when valid args are present
                if (!ourMoves || !opponentMoves || !this.duel || !this.opponentMovesReceived) {
                    console.log("processDuelSimulation(): preconditions not met => ",
                        {
                            ourMoves,
                            opponentMoves,
                            duel: this.duel,
                            opponentMovesReceived: this.opponentMovesReceived
                        });
                    throw new Error("processDuelSimulation(): preconditions not met (see console)");
                }

                // even more pedantic... 
                if (! this.ourWizardId || ! this.ourWizard || ! this.opposingWizardId || ! this.opposingWizard) {
                    console.log("processDuelSimulation(): don't have correct wizard ids, how did we even get here? => ",
                        {
                            ourWizardId: this.ourWizardId,
                            ourWizard: this.ourWizard,
                            opposingWizardId: this.opposingWizardId,
                            opposingWizard: this.opposingWizard,
                        });
                    throw new Error("processDuelSimulation(): incorrect wizard(s) in duel config");
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

                const power = Math.floor(parseInt(result[0]) / 1000000000000);
                const score = parseInt(result[1]);
                const outcome = (power > 0 ? "WIN" : (power == 0 ? "TIE" : "LOSS"));

                this.duelResults = {
                    power: power,
                    score: score,
                    outcome: outcome,
                };

                console.log("Compiled duel results:", this.duelResults);
                clearSessionStorage();
            },

            /**
             * calls processDuelSimulation() if all moves (ours and opponent's) are
             * selected. Only works in (mode == 'offline').
             */
            processOfflineSimulation: async function(ourMoves, opponentMoves) {
                if (this.mode !== 'offline') {
                    return;
                }

                const isValid = (move) => {
                    return (move > 1 && move < 5);
                };
                if (isValid(ourMoves[0])
                    && isValid(ourMoves[1])
                    && isValid(ourMoves[2])
                    && isValid(ourMoves[3])
                    && isValid(ourMoves[4])

                    && isValid(opponentMoves[0])
                    && isValid(opponentMoves[1])
                    && isValid(opponentMoves[2])
                    && isValid(opponentMoves[3])
                    && isValid(opponentMoves[4])) {

                    await this.processDuelSimulation(ourMoves, opponentMoves);
                }
            },

            /**
             * Submit random moves for opponent
             */
            async submitRandomOpponentForecast() {

                // submit fake turns for opponent
                await duelsRef
                        .child(this.duel.roomId)
                        .child("moves")
                        .child(this.opposingWizardId)
                        .set(randomTurns());
            },

            /**
             * Clear opponent's forecast
             */
            async clearOpponentMoves() {

                await duelsRef
                        .child(this.duel.roomId)
                        .child("moves")
                        .child(this.opposingWizardId)
                        .remove();
            },

            /**
             * Submit turn
             */
            async submitTurn() {

                if (!(this.ourMoves[0] && this.ourMoves[1] && this.ourMoves[2] && this.ourMoves[3] && this.ourMoves[4])) {
                    console.log("Error: not all turns are set");
                    return;
                }

                /* uncomment to push an empty object to 'duel-simulations', e.g. to clean up
                await duelsRef
                        .child(this.duel.roomId)
                        .set({});
                */

                const moves = {};
                moves[this.ourWizardId] = this.ourMoves;

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
                        .update(moves);
            },
        }
    });
}
