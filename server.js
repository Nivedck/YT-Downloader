const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");


const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/formats", (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "No URL provided" });
    }

    exec(`yt-dlp -F ${url}`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: "Error fetching formats", details: stderr });
        }

        const formats = stdout.split("\n")
            .filter(line => line.match(/^\d+/))
            .map(line => {
                const parts = line.trim().split(/\s+/);
                return {
                    format_id: parts[0],
                    extension: parts[1],
                    resolution: parts.slice(2).join(" ")
                };
            });

        // ✅ Add "Best Video + Audio" option
        formats.unshift({
            format_id: "best",
            extension: "mp4",
            resolution: "Best Video + Audio"
        });

        // ✅ Add "Audio-Only MP3" option
        formats.unshift({
            format_id: "mp3",
            extension: "mp3",
            resolution: "Audio Only (MP3)"
        });

        res.json({ formats });
    });
});

app.post("/download", (req, res) => {
    const { url, format } = req.body;

    if (!url || !format) {
        return res.status(400).json({ error: "URL or format missing" });
    }

    let command;

    if (format === "mp3") {
        command = `yt-dlp -x --audio-format mp3 -g ${url}`;
    } else if (format === "best") {
        command = `yt-dlp -f "bv*+ba/b" -g ${url}`;
    } else {
        command = `yt-dlp -f ${format} -g ${url}`;
    }

    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: "Error getting download link", details: stderr });
        }

        const directLinks = stdout.trim().split("\n"); // Handles multiple URLs (e.g., video and audio)
        
        if (directLinks.length === 1) {
            res.json({ title: "Download Ready", downloadUrl: directLinks[0] });
        } else {
            res.json({ 
                title: "Download Ready",
                videoUrl: directLinks[0], 
                audioUrl: directLinks[1] // Separate audio file if required
            });
        }
    });
});

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
