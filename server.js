const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cron = require('node-cron');

const app = express();
const PORT = 3000; // Adjust the port as needed

/**
 * Downloads an image from a given URL and saves it to the specified file path.
 *
 * @async
 * @function downloadImage
 * @param {string} url - The URL of the image to download.
 * @param {string} filePath - The file path where the downloaded image will be saved.
 * @returns {Promise<void>} - A Promise resolving to undefined.
 */
const downloadImage = async( url, filePath ) => {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    fs.writeFile(filePath, Buffer.from(arrayBuffer), () => console.log('Downloaded', filePath));
};

const delay = ( time ) => new Promise(( resolve ) => setTimeout(resolve, time));

const downloadImageWithRetry = async( page, evaluateFn, filePath, retries = 15 ) => {
    for ( let i = 0; i < retries; i++ ) {
        const imageUrl = await page.evaluate(evaluateFn);
        if ( imageUrl ) {
            await downloadImage(imageUrl, filePath);
            return;
        }
        console.error(`Failed to find image. Retry ${ i + 1 }/${ retries }`);
        await delay(20000); // Wait before retrying
    }
    console.error(`Failed to download image after ${ retries } retries.`);
};

/**
 * Downloads an image from the National Hurricane Center website.
 *
 * @param {string} url - The URL of the webpage containing the image.
 * @param {string} selector - The CSS selector to locate the image element.
 * @param {string} filePath - The local file path to save the downloaded image.
 * @param {number} [retries=15] - The number of times to retry downloading the image.
 * @returns {Promise<void>} - A promise that resolves when the image has been downloaded successfully or rejects on error.
 */
const downloadImageFromNHC = async( url, selector, filePath, retries = 15 ) => {
    const browser = await puppeteer.launch({
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

/**
 * Downloads images from the National Hurricane Center (NHC) website.
 *
 * This function downloads images for the Atlantic and Pacific 2-day and 7-day outlooks
 * from the NHC website and saves them locally.
 *
 * @async
 * @function downloadNHCImages
 */
const downloadNHCImages = async() => {
    // Atlantic 2-Day Outlook
    await downloadImageFromNHC(
        'https://www.nhc.noaa.gov/gtwo.php?basin=atlc&fdays=2',
        'img[id="twofig2d"]',
        path.join(__dirname, 'two_atl_2d0.png')
    );
    
    // Atlantic 7-Day Outlook
    await downloadImageFromNHC(
        'https://www.nhc.noaa.gov/gtwo.php?basin=atlc&fdays=7',
        'img[id="twofig7d"]',
        path.join(__dirname, 'two_atl_7d0.png')
    );
    
    // Pacific 2-Day Outlook
    await downloadImageFromNHC(
        'https://www.nhc.noaa.gov/gtwo.php?basin=cpac&fdays=2',
        'img[id="twofig2d"]',
        path.join(__dirname, 'two_cpac_2d0.png')
    );
    
    // Pacific 7-Day Outlook
    await downloadImageFromNHC(
        'https://www.nhc.noaa.gov/gtwo.php?basin=cpac&fdays=7',
        'img[id="twofig7d"]',
        path.join(__dirname, 'two_cpac_7d0.png')
    );
};

app.get('/severe-storm-outlook', ( req, res ) => {
    res.sendFile(path.join(__dirname, 'thunderstorm_forecast.jpg'));
});

app.get('/severe-ec', ( req, res ) => {
    res.sendFile(path.join(__dirname, 'severe_ec_800x450.jpg'));
});

app.get('/severe-se', ( req, res ) => {
    res.sendFile(path.join(__dirname, 'severe_se_800x450.jpg'));
});

app.get('/atlantic-2d', ( req, res ) => {
    res.sendFile(path.join(__dirname, 'two_atl_2d0.png'));
});

app.get('/atlantic-7d', ( req, res ) => {
    res.sendFile(path.join(__dirname, 'two_atl_7d0.png'));
});

app.get('/pacific-2d', ( req, res ) => {
    res.sendFile(path.join(__dirname, 'two_cpac_2d0.png'));
});

app.get('/pacific-7d', ( req, res ) => {
    res.sendFile(path.join(__dirname, 'two_cpac_7d0.png'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${ PORT }`);
});

// Schedule tasks
cron.schedule('10 0,18 * * *', async() => {
    await downloadThunderstormForecast();
    console.log('Download Thunderstorm Forecast Task ran at 12 AM-6PM');
});

cron.schedule('*/15 * * * *', async() => {
    await downloadRegionalAlerts();
    console.log('Download Regional Alerts Runs every 30 minutes');
});

cron.schedule('10 2,8,14,20 * * *', async() => {
    await downloadNHCImages();
    console.log('NHC image download task ran');
});

// Run the initial download
(async() => {
    await downloadThunderstormForecast();
    await downloadRegionalAlerts();
    await downloadNHCImages();
})();
