const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { exec } = require("child_process");
const axios = require("axios");

const app = express();
const upload = multer({ dest: "uploads/" });

const botToken = "7810176235:AAGsVRjcENBqSAyeL5nLghvJvBNnitVLBDM"; // Ganti dengan token bot Anda
const chatId = "7961625661"; // Ganti dengan Chat ID Anda

app.post("/upload", upload.single("video"), async (req, res) => {
    const inputPath = req.file.path;
    const outputPath = `uploads/${Date.now()}.mp4`;

    // Konversi WEBM ke MP4 dengan FFmpeg
    exec(`ffmpeg -i ${inputPath} -c:v libx264 -preset ultrafast ${outputPath}`, async (error) => {
        if (error) {
            console.error("Konversi gagal:", error);
            return res.status(500).send("Konversi gagal");
        }

        // Kirim video MP4 ke Telegram
        const formData = new FormData();
        formData.append("chat_id", chatId);
        formData.append("video", fs.createReadStream(outputPath));

        try {
            await axios.post(`https://api.telegram.org/bot${botToken}/sendVideo`, formData, {
                headers: formData.getHeaders(),
            });

            console.log("Video MP4 terkirim ke Telegram");
            res.send("Video terkirim");
        } catch (error) {
            console.error("Gagal mengirim video ke Telegram:", error);
            res.status(500).send("Gagal mengirim video");
        }

        // Hapus file setelah dikirim
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
    });
});

app.listen(3000, () => console.log("Server berjalan di port 3000"));
