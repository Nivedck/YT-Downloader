const express = require("express");
const cors = require("cors");
const path = require("path");
const { exec } = require("child_process");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/download", (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "No URL provided" });
    }

    // Set output filename
    const outputFilePath = path.join(__dirname, "public", "video.mp4");

    // Execute yt-dlp to download the video
    exec(`yt-dlp -f best -o "${outputFilePath}" ${url}`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: "Error downloading video", details: stderr });
        }
        res.json({ title: "Download Ready", downloadUrl: "/video.mp4" });
    });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
