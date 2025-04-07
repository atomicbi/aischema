import { config } from 'dotenv'
import { SchemaGenerator } from '../src/classes/SchemaGenerator'
import { HeroSchema } from './schema/HeroSchema'

config({ path: '.env' })

async function main() {
  const hero = await SchemaGenerator.run({
    schema: HeroSchema,
    prompt: 'Generate a random fantasy role playing character'
  }, { apiKey: process.env.OPENAI_KEY })
  console.info('hero', hero)
}

main()
