const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const request = require("request");
const path = require("path");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// ✅ Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/download", (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "URL is required" });
    }

    exec(`yt-dlp -f best --get-url ${url}`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: "Error fetching video", details: stderr });
        }

        const directVideoUrl = stdout.trim();

        res.json({ 
            title: "Download Ready",
            downloadUrl: `http://localhost:${PORT}/fetch-video?url=${encodeURIComponent(directVideoUrl)}`
        });
    });
});

app.get("/fetch-video", (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).send("Missing video URL");
    }

    res.setHeader("Content-Disposition", 'attachment; filename="video.mp4"');
    res.setHeader("Content-Type", "video/mp4");

    request(videoUrl).pipe(res);
});

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
