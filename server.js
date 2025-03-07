const express = require("express");
const cors = require("cors");
const path = require("path");
const { exec } = require("child_process");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ✅ Route to fetch available formats
app.post("/formats", (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "No URL provided" });
    }

    // Fetch available formats using yt-dlp
    exec(`yt-dlp -F ${url}`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: "Error fetching formats", details: stderr });
        }

        // Extract format list from stdout
        const formats = stdout.split("\n").filter(line => line.match(/^\d+/)).map(line => {
            const parts = line.trim().split(/\s+/);
            return {
                format_id: parts[0],
                extension: parts[1],
                resolution: parts.slice(2).join(" ")
            };
        });

        res.json({ formats });
    });
});

// ✅ Route to download selected format
app.post("/download", (req, res) => {
    const { url, format } = req.body;

    if (!url || !format) {
        return res.status(400).json({ error: "URL or format missing" });
    }

    // Set output filename
    const outputFilePath = path.join(__dirname, "public", `downloaded_video.${format}`);

    // Execute yt-dlp to download the selected format
    exec(`yt-dlp -f ${format} -o "${outputFilePath}" ${url}`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: "Error downloading video", details: stderr });
        }
        res.json({ title: "Download Ready", downloadUrl: `/downloaded_video.${format}` });
    });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
