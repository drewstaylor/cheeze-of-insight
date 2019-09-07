const config = require('./config');
const IPGeolocationAPI = require('ip-geolocation-api-javascript-sdk');

// Api Instance
let ipgeolocationApi = new IPGeolocationAPI(config.geoLocation.apiKey, false);

const isUserWhiteListed = async function () {
    // Create location object 
    ipgeolocationApi.getGeolocation((locationData) => {
        console.log(locationData);
    });

    // XXX TODO: Create exhaustive list of allowed countries / states :x
};

//isUserWhiteListed();

module.exports = {
    isUserWhiteListed: isUserWhiteListed
};



