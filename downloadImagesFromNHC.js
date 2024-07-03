const puppeteer = require('puppeteer');
const { delay, downloadImage } = require('./downloadImages');
/**
 * Downloads an image from the National Hurricane Center website.
 *
 * @param {string} url - The URL of the webpage containing the image.
 * @param {string} selector - The CSS selector to locate the image element.
 * @param {string} filePath - The local file path to save the downloaded image.
 * @param {number} [retries=5] - The number of times to retry downloading the image.
 * @returns {Promise<void>} - A promise that resolves when the image has been downloaded successfully or rejects on error.
 */
const downloadImageFromNHC = async( url, selector, filePath, retries = 5 ) => {
    const browser = await puppeteer.launch({
        headless: true,
        args: [ '--no-sandbox', '--disable-setuid-sandbox' ]
    });
    const page = await browser.newPage();
    
    try {
        const navigationOptions = { waitUntil: 'networkidle2', timeout: 60000 }; // Increased timeout to 60 seconds
        
        for ( let i = 0; i < retries; i++ ) {
            await page.goto(url, navigationOptions);
            await page.waitForSelector(selector);
            
            const imageUrl = await page.evaluate(( selector ) => {
                const img = document.querySelector(selector);
                return img ? new URL(img.src, 'https://www.nhc.noaa.gov').href : null;
            }, selector);
            
            if ( imageUrl ) {
                await downloadImage(imageUrl, filePath);
                return;
            }
            
            console.error(`Failed to find image for ${ filePath }. Retry ${ i + 1 }/${ retries }`);
            await delay(20000); // Wait before retrying
        }
        
        console.error(`Failed to download image for ${ filePath } after ${ retries } retries.`);
    } catch ( error ) {
        console.error(`Error downloading image from ${ url }:`, error);
    } finally {
        await browser.close();
    }
};
module.exports = { downloadImageFromNHC };