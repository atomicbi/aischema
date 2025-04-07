import { zodResponseFormat } from 'openai/helpers/zod'
import { AutoParseableResponseFormat } from 'openai/lib/parser'
import { z } from 'zod'
import { formatSchema } from '../util/format'

export interface SchemaJobOptions<T extends object> {
  schema: z.ZodType<T>
  system?: string
  prompt?: string
  name?: string
  maxTokens?: number
}

export class SchemaJob<T extends object> {
  schema: z.ZodType<T>
  system: string
  prompt: string
  name: string
  maxTokens?: number
  format: AutoParseableResponseFormat<T>

  constructor(options: SchemaJobOptions<T>) {
    this.schema = options.schema
    this.system = options.system ?? 'You are a helpful object generator'
    this.prompt = options.prompt ?? this.schema.description ?? 'Generate the requested object'
    this.name = options.name ?? 'Schema'
    this.maxTokens = options.maxTokens
    this.format = zodResponseFormat(this.schema, this.name)
    if (!this.format.json_schema.schema) { throw new Error('Invalid Schema') }
    formatSchema(this.format.json_schema.schema)
  }
}
