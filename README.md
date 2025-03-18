# aigen

> AI Yup Schema Examples Generator

* Supports `yup`, `zod` and `Json Schema`
* Generates example objects using OpenAI gpt-4o-mini
* Supports the `description` field for tailored prompt instructions per field

## Usage

```ts
import yup from 'yup'
import zod from 'zod'
import { generate } from 'aigen'

// Set your OpenAI Key
process.env.OPENAI_KEY = '...'

async function main() {
  // Zod Schema
  const zodResult = await generate(zod.object({
    name: zod.string().describe('An elvish name'),
    age: zod.number().int().describe('Their age')
  }).describe('Generate a fantasy character'))
  console.info('zodResult', zodResult)

  // Yup Schema
  const yupResult = await generate(yup.object({
    name: yup.string().description('An elvish name').required(),
    age: yup.number().integer().description('Their age').required()
  }).description('Generate a fantasy character'))
  console.info('yupResult', yupResult)

  // JSON Schema
  const jsonResult = await generate({
    '$id': 'https://schema.atomicbi/person.schema.json',
    '$schema': 'https://json-schema.org/draft-07/schema',
    'title': 'Person',
    'type': 'object',
    'description': 'A random american person',
    'properties': {
      'firstName': { 'type': 'string', 'description': 'The person\'s first name.' },
      'lastName': { 'type': 'string', 'description': 'The person\'s last name.' },
      'age': { 'description': 'Age in years which must be equal to or greater than zero.', 'type': 'integer' }
    },
    'required': ['firstName', 'lastName', 'age']
  })
  console.info('jsonResult', jsonResult)
}

main()
```
