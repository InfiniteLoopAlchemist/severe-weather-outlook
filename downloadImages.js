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
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
    console.log('Downloaded', filePath);
};

/**
 * Checks if the file at the given file path is a valid image.
 *
 * @async
 * @function isValidImage
 * @param {string} filePath - The file path of the image to check.
 * @returns {Promise<boolean>} - A Promise that resolves to a boolean indicating if the file is a valid image.
 */
const isValidImage = async( filePath ) => {
    const fileTypeFromBuffer = (await import('file-type')).fileTypeFromBuffer;
    const buffer = fs.readFileSync(filePath);
    const fileType = await fileTypeFromBuffer(buffer);
    return fileType && fileType.mime.startsWith('image/');
};

/**
 * Creates a delay for the specified amount of time.
 *
 * @function delay
 * @param {number} time - The amount of time to delay in milliseconds.
 * @returns {Promise<void>} - A Promise that resolves after the specified delay.
 */
const delay = ( time ) => new Promise(( resolve ) => setTimeout(resolve, time));

const downloadImageWithRetry = async( page, evaluateFn, filePath, selector, retries = 20 ) => {
    for ( let i = 0; i < retries; i++ ) {
        const imageUrl = await page.evaluate(evaluateFn, selector);
        if ( imageUrl ) {
            await downloadImage(imageUrl, filePath);
            if ( await isValidImage(filePath) ) {
                return;
            } else {
                console.error(`Invalid image format. Retry ${ i + 1 }/${ retries }`);
            }
        } else {
            console.error(`Failed to find image. Retry ${ i + 1 }/${ retries }`);
        }
        await delay(5000); // Wait before retrying
    }
    console.error(`Failed to download valid image after ${ retries } retries.`);
};

module.exports = { downloadImage, delay, downloadImageWithRetry, isValidImage };