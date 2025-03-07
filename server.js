const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// ✅ Serve static files correctly
app.use("/public", express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/download", (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "URL is required" });
    }

    let outputFile = "downloaded_video.mp4"; // Final output file

    // ✅ Automatically download the best video + audio
    let command = `yt-dlp -f best -o "public/${outputFile}" ${url}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: "Error downloading video", details: stderr });
        }

        res.json({ 
            title: "Download Ready",
            downloadUrl: `/public/${outputFile}` // ✅ Direct download link
        });
    });
});

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
