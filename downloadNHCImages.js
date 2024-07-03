const path = require('path');
const { downloadImageFromNHC } = require('./downloadImagesFromNHC');

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

module.exports = downloadNHCImages;