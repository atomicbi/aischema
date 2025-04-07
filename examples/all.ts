import { config } from 'dotenv'
import { SchemaGenerator } from '../src/classes/SchemaGenerator'
import { HeroSchema } from './schema/HeroSchema'

config({ path: '.env' })

async function main() {
  const heroes = await SchemaGenerator.all([{
    schema: HeroSchema,
    prompt: 'Generate a random dwarf role playing character'
  }, {
    schema: HeroSchema,
    prompt: 'Generate a random elf role playing character'
  }, {
    schema: HeroSchema,
    prompt: 'Generate a random orc role playing character'
  }], { apiKey: process.env.OPENAI_KEY })
  console.info('heroes', heroes)
}

main()
