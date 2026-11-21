// api/download.js
import ytdl from '@distube/ytdl-core';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const { url, format } = req.body;
    if (!ytdl.validateURL(url)) {
        return res.status(400).json({ error: 'URL inválida.' });
    }

    try {
        // Pega as informações e o formato desejado
        const info = await ytdl.getInfo(url);
        let chosenFormat;

        if (format === 'mp3') {
            // Para MP3, pega o melhor áudio disponível
            chosenFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });
        } else {
            // Para MP4, tenta pegar um formato que já tenha vídeo e áudio juntos
            // (nem sempre disponível em alta qualidade, mas é o mais simples para redirecionamento)
            chosenFormat = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: 'audioandvideo' });
        }

        if (!chosenFormat || !chosenFormat.url) {
            throw new Error('Formato não encontrado para redirecionamento direto.');
        }

        // 🔥 A MÁGICA: Redireciona o navegador para a URL direta do stream.
        // A Vercel não processa o arquivo, apenas aponta o caminho.
        res.redirect(302, chosenFormat.url);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Falha ao extrair o link. O vídeo pode ser restrito.' });
    }
}
