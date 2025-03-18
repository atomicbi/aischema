import { config } from 'dotenv'
import { readFileSync } from 'fs'
import yup from 'yup'
import zod from 'zod'
import { generate } from '../src/index'

config({ path: '.env' })

async function main() {

  // Zod Schema
  console.info('json', await generate(JSON.parse(readFileSync('fixtures/person.json', 'utf-8'))))

  // Zod Schema
  console.info('zod', await generate(zod.object({
    name: zod.string().describe('An elvish name'),
    age: zod.number().int().describe('Their age, a prime number, above 150')
  }).describe('Generate a fantasy character')))

  // Yup Schema
  console.info('yup', await generate(yup.object({
    name: yup.string().description('An elvish name').required(),
    age: yup.number().integer().description('Their age, a prime number, above 150').required()
  }).description('Generate a fantasy character')))
}

main()
