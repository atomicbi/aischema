import { config } from 'dotenv'
import z from 'zod'
import { SchemaGenerator } from '../src/classes/SchemaGenerator'

config({ path: '.env' })

async function main() {

  // Define schema
  const schema = z.object({
    name: z.string().describe('The firstname and lastname of the hero'),
    age: z.number().int().min(10).max(250).describe('The age of the hero, must be a prime number'),
    race: z.enum(['Elf', 'Dwarf', 'Orc', 'Human']).describe('The race of the hero'),
    class: z.enum(['Warrior', 'Druid', 'Mage']).describe('The class of the hero'),
    blessed: z.boolean().describe('Whether the hero has received the blessing of the ancients'),
    inventory: z.array(z.object({
      name: z.string().describe('The name of the inventory item'),
      qty: z.string().min(1).max(20).describe('The quantity of the inventory item')
    }).describe('A fantasy inventory item')).min(5).describe('The inventory of the hero. Elves should always have arrows')
  })

  // Generate Job Options
  const names = ['Aldric Stormblade', 'Seraphina Valeheart', 'Darian Ironfist', 'Lyra Moonshadow', 'Thalric Duskbane']
  const jobs = names.map((name) => ({ schema, prompt: `Generate the hero "${name}"` }))

  // Create Batch
  const batchResponse = await SchemaGenerator.batch('heroes', jobs, { apiKey: process.env.OPENAI_KEY! })
  console.info('created', batchResponse.id)

  // Await Batch Completion
  while (true) {
    await new Promise((resolve) => { setTimeout(resolve, 5000) })
    const batch = await SchemaGenerator.batchStatus(batchResponse.id, { apiKey: process.env.OPENAI_KEY! })
    console.info('status', batch.status)
    if (batch.status === 'completed') {
      console.info('results', batch.records)
      break
    }
  }
}

main()
