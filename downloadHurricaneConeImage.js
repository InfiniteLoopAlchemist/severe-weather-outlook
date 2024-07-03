const path = require('path');
const { downloadImageFromNHC } = require('./downloadImagesFromNHC');

/**
 * Downloads the latest full-sized hurricane cone image from the NHC website.
 *
 * @async
 * @function downloadHurricaneConeImage
 * @returns {Promise<void>} A promise that resolves once the image is downloaded.
 */
const downloadHurricaneConeImage = async() => {
    const url = 'https://www.nhc.noaa.gov/refresh/graphics_at2+shtml/173539.shtml?cone#contents';
    const selector = 'img#coneimage';
    const filePath = path.join(__dirname, 'hurricane_cone_image.png');
    
    await downloadImageFromNHC(url, selector, filePath);
};

module.exports = downloadHurricaneConeImage;