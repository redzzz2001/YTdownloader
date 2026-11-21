import { Innertube } from 'youtubei.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido.' });
    }

    const { url, format } = req.body;
    const match = url?.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/);
    const videoId = match ? match[1] : null;

    if (!videoId) {
        return res.status(400).json({ error: 'URL do YouTube inválida.' });
    }

    try {
        const yt = await Innertube.create();
        // Emula o cliente iOS/Android para evitar bloqueios do cliente Web
        const info = await yt.getBasicInfo(videoId, 'IOS');

        let chosenFormat;
        if (format === 'mp3') {
            chosenFormat = info.chooseFormat({ type: 'audio', quality: 'best' });
        } else {
            chosenFormat = info.chooseFormat({ type: 'video+audio', quality: 'best' });
        }

        const downloadUrl = chosenFormat?.url || chosenFormat?.decipher(yt.session.player);

        if (!downloadUrl) {
            throw new Error('Link direto não encontrado para este vídeo.');
        }

        return res.status(200).json({
            downloadUrl,
            title: info.basic_info?.title || 'video'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: `Erro: ${error.message}`
        });
    }
}
