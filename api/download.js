import ytdl from '@distube/ytdl-core';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido.' });
    }

    const { url, format } = req.body;
    if (!url || !ytdl.validateURL(url)) {
        return res.status(400).json({ error: 'URL do YouTube inválida.' });
    }

    try {
        const info = await ytdl.getInfo(url);
        let chosenFormat;

        if (format === 'mp3') {
            chosenFormat = ytdl.chooseFormat(info.formats, {
                quality: 'highestaudio',
                filter: 'audioonly'
            });
        } else {
            chosenFormat = ytdl.chooseFormat(info.formats, {
                quality: 'highest',
                filter: 'audioandvideo'
            });
        }

        if (!chosenFormat || !chosenFormat.url) {
            throw new Error('Formato não encontrado.');
        }

        // Retorna o link direto em JSON para o frontend
        return res.status(200).json({
            downloadUrl: chosenFormat.url,
            title: info.videoDetails.title
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: 'Falha ao extrair o link. O vídeo pode estar restrito ou o YouTube bloqueou o IP do servidor.'
        });
    }
}
