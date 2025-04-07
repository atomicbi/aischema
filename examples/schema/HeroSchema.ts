import z from 'zod'

export const Races = ['Dwarf', 'Elf', 'Orc', 'Goblin', 'Human', 'Gnome', 'Beast', 'Undead', 'Dragonborn', 'Fairy'] as const

export const HeroSchema = z.object({
  name: z.string().describe('The firstname and lastname of the hero'),
  age: z.number().int().min(10).max(250).describe('The age of the hero, must be a prime number'),
  race: z.enum(Races).describe('The race of the hero'),
  class: z.enum(['Warrior', 'Druid', 'Mage']).describe('The class of the hero'),
  blessed: z.boolean().describe('Whether the hero has received the blessing of the ancients'),
  inventory: z.array(z.object({
    name: z.string().describe('The name of the inventory item'),
    qty: z.string().min(1).max(20).describe('The quantity of the inventory item')
  }).describe('A fantasy inventory item')).min(5).describe('The inventory of the hero. Elves should always have arrows')
})
