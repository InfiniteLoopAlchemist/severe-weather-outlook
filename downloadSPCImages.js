const puppeteer = require('puppeteer');
const path = require('path');
const { delay, downloadImageWithRetry } = require('./downloadImages');

/**
 * Downloads the thunderstorm outlook image from SPC website.
 *
 * @async
 * @function downloadThunderstormOutlook
 * @returns {Promise<void>} A promise that resolves once the image is downloaded.
 */
const downloadThunderstormOutlook = async() => {
    const url = 'https://www.spc.noaa.gov/products/exper/enhtstm/';
    const filePath = path.join(__dirname, 'thunderstorm_outlook.gif');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: [ '--no-sandbox', '--disable-setuid-sandbox' ]
    });
    const page = await browser.newPage();
    
    try {
        const navigationOptions = { waitUntil: 'networkidle2', timeout: 60000 }; // Increased timeout to 60 seconds
        await page.goto(url, navigationOptions);
        
        await downloadImageWithRetry(
            page,
            () => {
                const img = Array.from(document.querySelectorAll('img'))
                    .find(img => img.src.includes('enh_') && img.src.includes('2000'));
                return img ? img.src : null;
            },
            filePath
        );
    } catch ( error ) {
        console.error(`Error downloading image from ${ url }:`, error);
    } finally {
        await browser.close();
    }
};

/**
 * Downloads the day 1 outlook image from SPC website.
 *
 * @async
 * @function downloadDay1Outlook
 * @returns {Promise<void>} A promise that resolves once the image is downloaded.
 */
const downloadDay1Outlook = async() => {
    const url = 'https://www.spc.noaa.gov/products/outlook/day1otlk.html';
    const selector = 'img#main';
    const filePath = path.join(__dirname, 'day1_outlook.gif');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: [ '--no-sandbox', '--disable-setuid-sandbox' ]
    });
    const page = await browser.newPage();
    
    try {
        const navigationOptions = { waitUntil: 'networkidle2', timeout: 60000 }; // Increased timeout to 60 seconds
        await page.goto(url, navigationOptions);
        await page.waitForSelector(selector);
        
        await downloadImageWithRetry(
            page,
            ( selector ) => {
                const img = document.querySelector(selector);
                return img ? img.src : null;
            },
            filePath,
            selector
        );
    } catch ( error ) {
        console.error(`Error downloading image from ${ url }:`, error);
    } finally {
        await browser.close();
    }
};

module.exports = { downloadThunderstormOutlook, downloadDay1Outlook };