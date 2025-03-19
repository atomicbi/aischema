# aischema

> AI Zod Schema Examples Generator

* This tool will generate structured output through OpenAI given a `zod` schema.
* OpenAI Structure Output has several limitations on structured output:
  * Many zod validation rules are not supported, and will result in an error (e.g. `min`, `minLength`, `includes`, etc...).
  * Top-level arrays are not supported (only object).
* aischema solves this by converting your Zod structure to a OpenAI-compatible format:
  * Top-level arrays are supported. Under the hood, aischema will create a temporary top-level object.
  * Unsupported validation rules are converted into natural-language instructions (for each property).
  * You can provide a `description` (using zod `describe`) for each property.
* Option: You can choose any OpenAI model that supports structured output.
* Option: You can provide a custom prompt to give general instructions on what the AI should generate.

## Usage

```ts
const result = await generate(schema, options)
```

* `schema`: a Zod schema
* `options`: optional
  * `prompy`: The system prompt. Default: schema "description"
  * `model`: The OpenAI model. Default: `gpt-4o-mini`

## Example

```ts
import z from 'zod'
import { generate } from 'aischema'

// Set your OpenAI Key
process.env.OPENAI_KEY = '...'

async function main() {
  // Generate 5 heroes
  const heroes = await generate(z.array(z.object({
    name: z.string().endsWith('Alpha').describe('The firstname and lastname of the hero'),
    age: z.number().int().min(10).max(250).gte(10).describe('The age of the hero, must be a prime number'),
    race: z.enum(['Elf', 'Dwarf', 'Orc', 'Human']).describe('The race of the hero'),
    class: z.enum(['Warrior', 'Druid', 'Mage']).describe('The class of the hero'),
    blessed: z.boolean().describe('Whether the hero has received the blessing of the ancients'),
    inventory: z.array(z.object({
      name: z.string().describe('The name of the inventory item'),
      qty: z.string().min(1).max(20).describe('The quantity of the inventory item')
    }).describe('A fantasy inventory item')).min(5).describe('The inventory of the hero. Elves should always have arrows')
  })).min(5).describe('A group of fantasy role playing hero characters'))

  // Print result
  console.info('heroes', heroes)
}

main()
```
