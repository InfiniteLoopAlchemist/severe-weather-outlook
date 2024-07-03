const fs = require('fs');
/**
 * Downloads an image from a given URL and saves it to the specified file path.
 *
 * @async
 * @function downloadImage
 * @param {string} url - The URL of the image to download.
 * @param {string} filePath - The file path where the downloaded image will be saved.
 * @returns {Promise<void>} - A Promise.
 */
const downloadImage = async( url, filePath ) => {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    fs.writeFile(filePath, Buffer.from(arrayBuffer), () => console.log('Downloaded', filePath));
};

const delay = ( time ) => new Promise(( resolve ) => setTimeout(resolve, time));

const downloadImageWithRetry = async( page, evaluateFn, filePath, selector, retries = 5 ) => {
    for ( let i = 0; i < retries; i++ ) {
        const imageUrl = await page.evaluate(evaluateFn, selector);
        if ( imageUrl ) {
            await downloadImage(imageUrl, filePath);
            return;
        }
        console.error(`Failed to find image. Retry ${ i + 1 }/${ retries }`);
        await delay(20000); // Wait before retrying
    }
    console.error(`Failed to download image after ${ retries } retries.`);
};

module.exports = { downloadImage, delay, downloadImageWithRetry };