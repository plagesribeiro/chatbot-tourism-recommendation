import axios from 'axios';
import cheerio from 'cheerio';
import { generateSimilarNews } from '../services/openai.js';
import { sendEmail } from '../services/mail.js';

function formatText(text) {
	// TODO: formatar o texto

	// dont allow more than 1 spaces in a row
	text = text.replace(/\s{2,}/g, ' ');
	// dont allow more than 1 line breaks in a row
	text = text.replace(/\n{2,}/g, '\n');
	// dont allow more than 1 tabs in a row
	text = text.replace(/\t{2,}/g, '\t');

	return text;
}

const generateNewNews = async (news) => {
	const response = await generateSimilarNews(news);

	return response;
};

// funciona para o Estadão
export async function getNewsBodys(context) {
	console.log('Buscando corpo das notícias...');
	let unifiedResponse = '';
	for (let i = 0; i < context.commonNews.length; i++) {
		let unifiedNews = [];
		for (const newsItem of context.commonNews[i]) {
			const response = await axios.get(newsItem.url);
			const html = response.data;
			const $ = cheerio.load(html);
			let content = $('div.news-body').text().trim();
			if (content === '') {
				content = $('div.c-news__body').text().trim();
				if (content === '') {
					content = $('article.toolkit-media-content').text().trim();
					if (content === '') {
						content = $('p.content-text__container').text().trim();
					}
				}
			}

			const objectToSave = {
				portal: newsItem.portal,
				title: newsItem.title,
				url: newsItem.url,
				content: formatText(content)
			};

			unifiedNews.push(objectToSave);
		}

		console.log('Gerando notícia...');
		const newNews = await generateNewNews(unifiedNews);
		if (newNews) {
			console.log('Notícia gerada!\n');

			let headlinesAndUrls = '';
			for (let i = 0; i < unifiedNews.length; i++) {
				headlinesAndUrls += `<strong>Título:</strong> ${unifiedNews[i].title}<br><strong>Link:</strong> ${unifiedNews[i].url}<br>`;
			}
			unifiedResponse += `<h1 style="margin:0;">Notícia ${i + 1}:</h1>
			<h3>Notícias similares encontradas:</h3>
			${headlinesAndUrls}
			<br><strong>Corpo da notícia gerada:</strong>
			<br>${newNews}
			<br><br>`;
		}
	}

	if (unifiedResponse) {
		console.log('Enviando email...');
		await sendEmail('Notícias geradas', unifiedResponse);
	} else {
		console.log('Nenhuma notícia gerada.');
	}
}

if (import.meta.main) {
	await getNewsBodys();
}
