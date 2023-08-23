import { Configuration, OpenAIApi } from 'openai'

/** @type {import('./newsChannel').NewsChannel[]} **/

const configuration = new Configuration({
    apiKey: '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',
})

const openai = new OpenAIApi(configuration)

export async function embed(text) {
    const response = await openai.createEmbedding({
        model: 'text-embedding-ada-002',
        input: text,
    })
    return response.data.data[0].embedding
}

export async function generateSimilarNews(news) {
    let newsBodys = ''

    let goodNewsCounter = 0
    for (let i = 0; i < news.length && goodNewsCounter < 2; i++) {
        if (news[i].content) {
            if (news[i].content.length > 3500) {
                news[i].content = news[i].content.substring(0, 3500)
            }
            newsBodys += `Notícia ${i + 1}:\nTítulo:${news[i].title}\nCorpo:${news[i].content}\n\n`
            goodNewsCounter++
        }
    }

    if (goodNewsCounter === 0) {
        return ''
    }
    const prompt = `${newsBodys} Considere o corpo e título das acima e reescreva as notícias em um resumo com até 600 palavras. A notícia deve ser escrita em terceira pessoa e deve conter pelo menos 3 parágrafos. No corpo das notícias podem ter coisas não relevantes para a notícia, ignore-as. \n\nCorpo da nova notícia:`

    const response = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt,
        max_tokens: 1000,
    })

    return response.data.choices[0].text
}
