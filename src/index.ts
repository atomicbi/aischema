import { SchemaGenerator, SchemaGeneratorOptions } from './classes/SchemaGenerator'
import { SchemaJobOptions } from './classes/SchemaJob'

export * from './classes/SchemaGenerator'
export * from './classes/SchemaJob'
export * from './util/concurrent'

export async function run<T extends object>(job: SchemaJobOptions<T>, options: SchemaGeneratorOptions = {}) {
  return SchemaGenerator.run<T>(job, options)
}

export async function all<T extends object>(jobs: SchemaJobOptions<T>[], options: SchemaGeneratorOptions = {}) {
  return SchemaGenerator.all<T>(jobs, options)
}

export async function concurrent<T extends object>(jobs: SchemaJobOptions<T>[], options: SchemaGeneratorOptions & { concurrency?: number } = {}) {
  return SchemaGenerator.concurrent<T>(jobs, options)
}

export async function batch<T extends object>(name: string, jobs: SchemaJobOptions<T>[], options: SchemaGeneratorOptions = {}) {
  return SchemaGenerator.batch<T>(name, jobs, options)
}

export async function batchStatus<T extends object>(batchId: string, options: SchemaGeneratorOptions = {}) {
  return SchemaGenerator.batchStatus<T>(batchId, options)
}

export default SchemaGenerator
