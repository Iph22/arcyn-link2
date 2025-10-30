import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function chatWithClaude(messages: Array<{ role: string; content: string }>) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages,
  })

  return response
}

export async function summarizeChat(messages: string[]) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Summarize the following conversation in a concise way:\n\n${messages.join('\n')}`,
      },
    ],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}

export async function getCodeHelp(code: string, question: string) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `Code:\n\`\`\`\n${code}\n\`\`\`\n\nQuestion: ${question}`,
      },
    ],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}

export async function analyzeDocument(documentText: string) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `Analyze this document and provide key insights, main topics, and a summary:\n\n${documentText}`,
      },
    ],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}

export async function generateEmbeddings(text: string) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  })

  const data = await response.json()
  return data.data[0].embedding
}
