import z from 'zod'
import { generateArray, generateObject, GenerateOptions } from './util/generate'

export { GenerateOptions }

export async function generate<T extends object>(schema: z.ZodType<T>, options: GenerateOptions = {}): Promise<T> {
  const def = schema._def as { typeName: 'ZodArray' | 'ZodObject' }
  if (def.typeName === 'ZodObject') {
    return generateObject(schema, options)
  } else if (def.typeName === 'ZodArray') {
    return generateArray(schema, options)
  } else {
    throw new Error('Invalid Schema')
  }
}
