import { config } from 'dotenv'
import z from 'zod'
import { generate } from '../src/index'

config({ path: '.env' })

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
