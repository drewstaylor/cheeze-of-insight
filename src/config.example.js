'use strict';

const config = {};

config.apiToken = '';
config.apiUser = '';
config.apiMainnetBaseUrl = '';
config.apiRinkebyBaseUrl = '';
config.mainnetTournamentContract = '';
config.mainnetWizardsContract = '';
config.imageStorageUrl = '' + config.mainnetTournamentContract + '/';
config.proxyImageStorageUrl = '';
config.openSeaTraits = '';

// Your web app's Firebase configuration
// XXX TODO: Remove this security vulnerability from repo
const firebaseConfig = {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
};

config.firebaseConfig = firebaseConfig;

module.exports = config;
