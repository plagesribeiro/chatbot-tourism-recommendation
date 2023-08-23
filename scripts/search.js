const findSimilarNews = async (newsContents) => {
	const portals = Object.keys(newsContents);

	const commonNews = [];
	// Percorrer todas as combinações possíveis de portais
	for (let i = 0; i < portals.length - 1; i++) {
		for (let j = i + 1; j < portals.length; j++) {
			const portalA = portals[i];
			const portalB = portals[j];

			const newsA = newsContents[portalA];
			const newsB = newsContents[portalB];

			// Percorrer todas as combinações possíveis de notícias
			for (let k = 0; k < newsA.length; k++) {
				for (let l = 0; l < newsB.length; l++) {
					const newsItemA = newsA[k];
					const newsItemB = newsB[l];

					if (newsItemA?.title && newsItemB?.title) {
						const similarity = cosinesim(
							newsItemA.embedding,
							newsItemB.embedding
						);

						if (similarity >= 0.9) {
							let foundCluster = false;

							for (const items of commonNews) {
								const foundItemA = items.find(
									(item) =>
										item.portal === portalA &&
										item.index === k &&
										item
								);
								const foundItemB = items.find(
									(item) => item.portal === portalB && item.index === l
								);

								if (foundItemA) {
									items.push({
										portal: portalB,
										index: l,
										title: newsItemB.title,
										url: newsItemB.url,
										similarity
									});
									foundCluster = true;
									break;
								} else if (foundItemB) {
									items.push({
										portal: portalA,
										index: k,
										title: newsItemA.title,
										url: newsItemA.url,
										similarity
									});
									foundCluster = true;
									break;
								}
							}

							if (!foundCluster) {
								commonNews.push([
									{
										portal: portalA,
										index: k,
										title: newsItemA.title,
										url: newsItemA.url,
										similarity
									},
									{
										portal: portalB,
										index: l,
										title: newsItemB.title,
										url: newsItemB.url,
										similarity
									}
								]);
							}
						}
					}
				}
			}
		}
	}

	return commonNews;
};

function cosinesim(A, B) {
	var dotproduct = 0;
	var mA = 0;
	var mB = 0;
	for (let i = 0; i < A.length; i++) {
		// here you missed the i++
		dotproduct += A[i] * B[i];
		mA += A[i] * A[i];
		mB += B[i] * B[i];
	}
	mA = Math.sqrt(mA);
	mB = Math.sqrt(mB);
	var similarity = dotproduct / (mA * mB); // here you needed extra brackets
	return similarity;
}

export const findCommonNews = async (context) => {
	const EstadaoNews = context.news.Estadao;
	const FolhaNews = context.news.Folha;
	const R7News = context.news.R7;
	const G1News = context.news.G1;

	const newsContents = {
		Estadao: EstadaoNews ?? [],
		Folha: FolhaNews ?? [],
		R7: R7News ?? [],
		G1: G1News ?? []
	};

	console.log('Inicializando busca de notícias similares...');
	const commonNews = await findSimilarNews(newsContents);
	console.log(commonNews.length.toString() + ' notícias em comum achadas!\n');

	context.commonNews = commonNews;
};

if (import.meta.main) {
	await findCommonNews();
}
