import { jsonSchemaToZod } from '@n8n/json-schema-to-zod'
import { convertSchema } from '@sodaru/yup-to-json-schema'
import { JSONSchema7 } from 'json-schema'
import yup from 'yup'
import zod from 'zod'

export function anyToZod<T>(schema: JSONSchema7 | yup.AnyObjectSchema | zod.Schema<T>): zod.Schema<T> {
  if (schema instanceof zod.Schema) { return schema }
  if (schema instanceof yup.ObjectSchema) { return yupToZod(schema) }
  if (schema.type === 'object' && schema.properties) { return jsonToZod<T>(schema) }
  throw new Error('Invalid Schema')
}

export function jsonToZod<T>(schema: JSONSchema7): zod.Schema<T> {
  const result = jsonSchemaToZod(schema)
  if (result instanceof zod.Schema) { return result }
  throw new Error('Invalid Schema')
}

export function yupToJson(schema: yup.AnyObjectSchema): JSONSchema7 {
  return convertSchema(schema)
}

export function yupToZod(schema: yup.AnyObjectSchema): zod.ZodTypeAny {
  const jsonSchema = yupToJson(schema)
  delete jsonSchema.default
  return jsonToZod(jsonSchema)
}
