'use strict';

const config = {};

// XXX TODO: Figure out a secure way to not share all of this :x
config.apiToken = 'PFJKqO5Hv9RJmrnoX_QMDRdUK1I7IwKwnewRDq58';
config.apiUser = 'drew@infiniteinternet.ca';
config.apiMainnetBaseUrl = 'cheezewizards-mainnet.alchemyapi.io';
config.apiRinkebyBaseUrl = 'cheezewizards-rinkeby.alchemyapi.io';
config.mainnetTournamentContract = '0xec2203e38116f09e21bc27443e063b623b01345a';
config.mainnetWizardsContract = '0x023C74B67dfCf4c20875A079e59873D8bBE42449';
config.imageStorageUrl = 'https://storage.googleapis.com/cheeze-wizards-production/' + config.mainnetTournamentContract + '/';
config.proxyImageStorageUrl = 'https://cheezeofinsight.infiniteinternet.ca/svg/';
config.openSeaTraits = 'api.opensea.io/collection/cheezewizard/';

// Your web app's Firebase configuration
// XXX TODO: Remove this security vulnerability from repo
const firebaseConfig = {
    apiKey: "AIzaSyBzUQmzf_kHpO_lU7FneB1xinVJifHfiUM",
    authDomain: "cheeze-of-insight.firebaseapp.com",
    databaseURL: "https://cheeze-of-insight.firebaseio.com",
    projectId: "cheeze-of-insight",
    storageBucket: "",
    messagingSenderId: "84005637289",
    appId: "1:84005637289:web:9252aa55eb5cf70b"
};

config.firebaseConfig = firebaseConfig;

module.exports = config;
