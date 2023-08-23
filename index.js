import { getNewsBodys } from './scripts/generate.js'
import { findCommonNews } from './scripts/search.js'
import { downloadNewsContent } from './scripts/seed.js'

const run = async () => {
    const context = {}
    await downloadNewsContent(context)
    await findCommonNews(context)
    await getNewsBodys(context)
}

await run()
