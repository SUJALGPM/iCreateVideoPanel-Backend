const sharp = require('sharp');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs').promises;

const imageController = async (req, res) => {
    try {
        const { title } = req.body;
        const imageBuffer = req.file.buffer;  // Access the binary data directly from req.file

        // Display for console..
        console.log(title);

        // Specify the correct path to ffmpeg executable (update with your actual path)
        const ffmpegPath = "S:\\COMPILER\\FFmpeg\\ffmpeg-master-latest-win64-gpl\\bin\\ffmpeg";

        const outputDirectory = path.join(__dirname, 'data');

        // Ensure the output directory exists
        await fs.mkdir(outputDirectory, { recursive: true });

        // Convert the binary data to a JPEG image using sharp
        const convertedImageBuffer = await sharp(imageBuffer).jpeg().toBuffer();

        // Write the converted image buffer to a file
        const convertedImagePath = path.join(outputDirectory, 'convertedImage.jpg');
        const result = await sharp(convertedImageBuffer).toFile(convertedImagePath);
        console.log(result);

        const imageOverlayPath = result;
        const inputVideoPath = './data/tamp.mp4';
        const outputVideoPath = './data/outputVideo5.mp4';


        // Additional code for video editing can be added here...
        const ffmpegCommand = `"${ffmpegPath}" -i "${inputVideoPath}" -i "${convertedImagePath}" -filter_complex "[0:v][1:v]overlay=10:10[output];[output]drawtext=text='%{w}x%{h}':fontcolor=white:box=1:boxcolor=black@0.5:boxborderw=5:x=30:y=30" "${outputVideoPath}"`;

        exec(ffmpegCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return res.status(500).json({ success: false, error: 'Error processing image' });
            }
            console.log('Video successfully created with overlay:', outputVideoPath);
            return res.status(200).json({ success: true, message: 'Image processed successfully' });
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
};

module.exports = {
    imageController
};