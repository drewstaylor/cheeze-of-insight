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

module.exports = config;
