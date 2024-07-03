const path = require('path');
const express = require('express');
const cron = require('node-cron');
const downloadThunderstormForecast = require('./downloadThunderstormForecast');
const downloadRegionalAlerts = require('./downloadRegionalAlerts');
const downloadNHCImages = require('./downloadNHCImages');
const downloadHurricaneConeImage = require('./downloadHurricaneConeImage');
const { downloadThunderstormOutlook, downloadDay1Outlook } = require('./downloadSPCImages');

const app = express();
const PORT = 3000; // Adjust the port as needed

app.get('/hurricane-cone-image', ( req, res ) => {
    res.sendFile(path.join(__dirname, 'hurricane_cone_image.png'));
});

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

app.get('/spc-thunderstorm-outlook', ( req, res ) => {
    res.sendFile(path.join(__dirname, 'thunderstorm_outlook.gif'));
});

app.get('/spc-day1-outlook', ( req, res ) => {
    res.sendFile(path.join(__dirname, 'day1_outlook.gif'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${ PORT }`);
});

// Schedule tasks
cron.schedule('*/15 * * * *', async() => {
    await downloadThunderstormForecast();
    console.log('Download Thunderstorm Forecast task ran every 15 minutes');
    await downloadRegionalAlerts();
    console.log('Download Regional Alerts Runs every 15 minutes');
    await downloadNHCImages();
    console.log('NHC image download task ran');
    await downloadHurricaneConeImage();
    console.log('Hurricane cone image download task ran');
    await downloadThunderstormOutlook();
    console.log('SPC Thunderstorm Outlook image download task ran');
    await downloadDay1Outlook();
    console.log('SPC Day 1 Outlook image download task ran');
});

// Run the initial download
(async() => {
    //  await downloadThunderstormForecast();
    // await downloadRegionalAlerts();
    // await downloadNHCImages();
    // await downloadHurricaneConeImage();
    await downloadThunderstormOutlook();
    await downloadDay1Outlook();
})();