import axios from 'axios';
import { load } from 'cheerio';
import { Estadao } from '../newsChannels/nc-estadao.js';
import { Folha } from '../newsChannels/nc-folha.js';
import { R7 } from '../newsChannels/nc-r7.js';
import { G1 } from '../newsChannels/nc-g1.js';
import { embed } from '../services/openai.js';

/** @type {import('./newsChannel').NewsChannel[]} **/

const loadSiteMaps = async () => {
	const newsChannels = [new Estadao(), new R7(), new G1(), new Folha()];

	const sitemapsData = await Promise.all(
		newsChannels.map(async (newsChannel) => {
			const name = newsChannel.constructor.name;
			const news = await newsChannel.latestNews(30);
			return {
				portal: name,
				instance: newsChannel,
				news
			};
		})
	);

	return sitemapsData;
};

const downloadContent = async (portal, url) => {
	const response = await axios.get(url);
	const html = response.data;
	const $ = load(html);

	const title = portal.sanitizeTitle($('title').eq(0).text());
	const embedding = await embed(title);

	return {
		title,
		embedding,
		url
	};
};

export const downloadNewsContent = async (context) => {
	console.log('\nBaixando sitemaps...');
	const sitemapsData = await loadSiteMaps();
	console.log(sitemapsData.length.toString() + ' sitemaps baixados!\n');

	context.news = {}

	console.log('Baixando notícias...');
	const downloadPromises = sitemapsData.map(async (item) => {
		const { portal, news } = item;

		const newsPromises = news.map((url) =>
			downloadContent(item.instance, url)
		);

		const newsData = await Promise.all(newsPromises);

		context.news[portal] = newsData;
	});

	await Promise.all(downloadPromises);
	console.log('Noticias baixadas!\n');
};

if (import.meta.main) {
	await downloadNewsContent();
}
