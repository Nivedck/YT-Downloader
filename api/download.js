const ytdl = require("ytdl-core");

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Only POST requests allowed" });
    }

    const { url } = req.body;

    if (!ytdl.validateURL(url)) {
        return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    try {
        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { quality: "highest", filter: "audioandvideo" });

        if (!format || !format.url) {
            return res.status(500).json({ error: "Unable to fetch video URL" });
        }

        res.json({ directUrl: format.url });
    } catch (error) {
        res.status(500).json({ error: "Error fetching video", details: error.message });
    }
}
