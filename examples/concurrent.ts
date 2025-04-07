import { config } from 'dotenv'
import { SchemaGenerator } from '../src/classes/SchemaGenerator'
import { HeroSchema, Races } from './schema/HeroSchema'

config({ path: '.env' })

async function main() {
  const jobs = Races.map((race) => ({ schema: HeroSchema, prompt: `Generate a role playing character for a ${race}` }))
  const heroes = await SchemaGenerator.concurrent(jobs, { apiKey: process.env.OPENAI_KEY })
  console.info('heroes', heroes)
}

main()
