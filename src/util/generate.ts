/* eslint-disable @typescript-eslint/no-explicit-any */
import { createOpenAI } from '@ai-sdk/openai'
import '@sodaru/yup-to-json-schema'
import { extendSchema } from '@sodaru/yup-to-json-schema'
import { generateObject } from 'ai'
import { addMethod, AnyObject, ObjectSchema, Schema } from 'yup'
import zod from 'zod'
import { anyToZod } from '../util/schema'

extendSchema({ addMethod, Schema })

export interface GenerateOptions {
  prompt?: string
}

export async function generate<T extends AnyObject>(anySchema: ObjectSchema<T>, options?: GenerateOptions): Promise<T>
export async function generate<T>(anySchema: zod.Schema<T, zod.ZodTypeDef, any>, options?: GenerateOptions): Promise<T>
export async function generate<T>(anySchema: any, options: GenerateOptions = {}): Promise<T> {
  const provider = createOpenAI({ apiKey: process.env.OPENAI_KEY })
  const model = provider.languageModel('gpt-4o-mini', { structuredOutputs: true })
  const schema = anyToZod<T>(anySchema)
  const prompt = options.prompt ?? schema.description
  if (!prompt) { throw new Error('A prompt is requred') }
  const { object } = await generateObject({ model, schema, prompt })
  return object
}
