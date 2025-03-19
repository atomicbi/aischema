import { OpenAI } from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { ChatModel } from 'openai/resources'
import z from 'zod'
import { formatSchema } from './format'

export interface GenerateOptions {
  prompt?: string
  model?: (string & {}) | ChatModel
}

export async function generateObject<T extends object>(schema: z.ZodType<T>, { prompt, model = 'gpt-4o-mini' }: GenerateOptions = {}): Promise<T> {
  const content = prompt ?? schema.description
  if (!content) { throw new Error('No prompt provided') }
  const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY })
  const format = zodResponseFormat(schema, 'Schema')
  if (!format.json_schema.schema) { throw new Error('Invalid Schema') }
  formatSchema(format.json_schema.schema)
  const response = await openai.beta.chat.completions.parse({
    model,
    response_format: format,
    messages: [
      { role: 'system', content: 'You are a helpful object generator' },
      { role: 'user', content }
    ]
  })
  const result = response.choices[0].message.parsed
  if (!result) { throw new Error('Unable to generate object') }
  return result
}

export async function generateArray<T extends object>(schema: z.ZodType<T>, options: GenerateOptions = {}): Promise<T> {
  const prompt = options.prompt ?? schema.description
  if (!prompt) { throw new Error('No prompt provided') }
  const container = z.object({ items: schema })
  const result = await generateObject(container, { ...options, prompt })
  if (!result.items) { throw new Error('Invalid response') }
  return result.items
}
