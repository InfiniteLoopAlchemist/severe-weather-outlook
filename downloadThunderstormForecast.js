const path = require('path');
const { downloadImageFromNHC } = require('./downloadImagesFromNHC');

/**
 * Downloads the thunderstorm forecast image from Weather.com website.
 *
 * @async
 * @function downloadThunderstormForecast
 * @returns {Promise<void>} A promise that resolves once the image is downloaded.
 */
const downloadThunderstormForecast = async() => {
    await downloadImageFromNHC(
        'https://weather.com/maps/severe/thunderstorm-forecast',
        'img[src*="trvlthun"]',
        path.join(__dirname, 'thunderstorm_forecast.jpg')
    );
};

module.exports = downloadThunderstormForecast;