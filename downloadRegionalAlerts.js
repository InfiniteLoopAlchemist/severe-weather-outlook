const puppeteer = require('puppeteer');
const path = require('path');
const { delay, downloadImageWithRetry } = require('./downloadImages');

/**
 * Downloads regional alerts from the weather.com website.
 *
 * @async
 * @function downloadRegionalAlerts
 * @returns {Promise<void>} Promise that resolves when the download is complete.
 * @throws {Error} If there is an error during the download process.
 */
const downloadRegionalAlerts = async() => {
    const browser = await puppeteer.launch({
        headless: true,
        args: [ '--no-sandbox', '--disable-setuid-sandbox' ]
    });
    const page = await browser.newPage();
    
    try {
        const navigationOptions = { waitUntil: 'networkidle2', timeout: 60000 }; // Increased timeout to 60 seconds
        
        await page.goto('https://weather.com/maps/severe/regional-alerts', navigationOptions);
        
        // Select "East Central"
        await page.waitForSelector('select[class^="PrimaryWeatherMap--selectMap"]');
        await page.select('select[class^="PrimaryWeatherMap--selectMap"]', '1');
        await delay(10000); // Increase the delay to 10 seconds to ensure the image loads
        await downloadImageWithRetry(
            page,
            () => {
                const img = document.querySelector('img[src*="severe_ec"]');
                return img ? img.src : null;
            },
            path.join(__dirname, 'severe_ec_800x450.jpg')
        );
        
        // Select "Southeast"
        await page.select('select[class^="PrimaryWeatherMap--selectMap"]', '2');
        await delay(10000); // Increase the delay to 10 seconds to ensure the image loads
        await downloadImageWithRetry(
            page,
            () => {
                const img = document.querySelector('img[src*="severe_se"]');
                return img ? img.src : null;
            },
            path.join(__dirname, 'severe_se_800x450.jpg')
        );
    } catch ( error ) {
        console.error('Error downloading regional alerts:', error);
    } finally {
        await browser.close();
    }
};

module.exports = downloadRegionalAlerts;