import * as functions from 'firebase-functions'
import { downloadNewsContent } from './scripts/seed.js'
import { findCommonNews } from './scripts/search.js'
import { getNewsBodys } from './scripts/generate.js'
import "firebase-functions/logger/compat";

export const scrapeForNews = functions
    .runWith({ memory: '2GB' })
    .pubsub.schedule('every 15 minutes').onRun(async () => {
        const context = {}
        await downloadNewsContent(context)
        await findCommonNews(context)
        await getNewsBodys(context)
    })