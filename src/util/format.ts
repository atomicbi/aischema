import { JSONSchema7 } from 'json-schema'

export type FormatSchemaFn = (value: JSONSchema7, parts: string[]) => void

function extract<K extends keyof JSONSchema7>(property: JSONSchema7, parts: string[], key: K, fn: (value: NonNullable<JSONSchema7[K]>) => string | undefined) {
  if (!(key in property) || property[key] == null) { return }
  const part = fn(property[key]!)
  if (part != null) { parts.push(part) }
  delete property[key]
}

const formatInteger: FormatSchemaFn = (property, parts) => {
  extract(property, parts, 'minimum', (value) => `Larger than or equal to ${value}`)
  extract(property, parts, 'maximum', (value) => `Smaller than or equal to ${value}`)
  extract(property, parts, 'exclusiveMinimum', (value) => `Larger than ${value}`)
  extract(property, parts, 'exclusiveMaximum', (value) => `Smaller than ${value}`)
}

const formatString: FormatSchemaFn = (property, parts) => {
  if (property.minLength && property.maxLength && property.minLength === property.maxLength) {
    parts.push(`Must be exactly ${property.minLength} characters long`)
    delete property.minLength
    delete property.maxLength
  } else {
    extract(property, parts, 'minLength', (value) => `Must be ${value} or more characters long`)
    extract(property, parts, 'maxLength', (value) => `Must be ${value} or fewer characters long`)
  }
  extract(property, parts, 'format', (value) => `Must be of type ${value}`)
  extract(property, parts, 'pattern', (value) => {
    if (value.startsWith('^')) { return `Must start with "${value.substring(1)}"` }
    if (value.endsWith('$')) { return `Must end with "${value.substring(0, value.length - 1)}"` }
    return `Must include "${value}"`
  })
}

export function formatSchema(schema: JSONSchema7) {
  if (schema.type === 'object' && schema.properties) {
    schema.required = Object.entries(schema.properties).map(([key, property]) => {
      if (typeof property === 'boolean') { return key }
      if (property.type === 'array' || property.type === 'object') {
        formatSchema(property)
      } else {
        const parts = property.description ? [property.description] : []
        if (property.type === 'integer') { formatInteger(property, parts) }
        if (property.type === 'string') { formatString(property, parts) }
        property.description = parts.join('; ')
      }
      return key
    })
  } else if (schema.type === 'array') {
    const parts = schema.description ? [schema.description] : []
    if (schema.minItems) {
      parts.push(`At least ${schema.minItems} items`)
      delete schema.minItems
    }
    schema.description = parts.join('; ')
    const items = Array.isArray(schema.items) ? schema.items : [schema.items]
    for (const item of items) {
      if (item && typeof item !== 'boolean') {
        formatSchema(item)
      }
    }
  }
}
