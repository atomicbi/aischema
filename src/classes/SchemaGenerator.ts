import OpenAI from 'openai'
import { Batch, ChatCompletionMessageParam, ChatModel } from 'openai/resources'
import { concurrentP } from '../util/concurrent'
import { SchemaJob, SchemaJobOptions } from './SchemaJob'

interface BatchRequest {
  custom_id: string
  method: 'POST'
  url: '/v1/chat/completions'
  body: {
    model: (string & {}) | ChatModel
    messages: ChatCompletionMessageParam[]
    max_tokens?: number
  }
}

export type BatchResult<T extends object> = {
  status: Exclude<Batch['status'], 'completed'>
} | {
  status: 'completed'
  records: T[]
}

export interface SchemaGeneratorOptions {
  apiKey?: string
  model?: (string & {}) | ChatModel
}

export class SchemaGenerator {
  private model: (string & {}) | ChatModel
  private openai: OpenAI
  private jobs: SchemaJob<object>[] = []

  static async run<T extends object>(job: SchemaJobOptions<T>, options: SchemaGeneratorOptions = {}) {
    const generator = new SchemaGenerator(options)
    return generator.run(new SchemaJob(job))
  }

  static async all<T extends object>(jobs: SchemaJobOptions<T>[], options: SchemaGeneratorOptions = {}) {
    const generator = new SchemaGenerator(options)
    generator.add(...jobs.map((job) => new SchemaJob(job)))
    return generator.all()
  }

  static async concurrent<T extends object>(jobs: SchemaJobOptions<T>[], options: SchemaGeneratorOptions & { concurrency?: number } = {}) {
    const generator = new SchemaGenerator(options)
    generator.add(...jobs.map((job) => new SchemaJob(job)))
    return generator.concurrent(options.concurrency)
  }

  static async batch<T extends object>(name: string, jobs: SchemaJobOptions<T>[], options: SchemaGeneratorOptions = {}) {
    const generator = new SchemaGenerator(options)
    generator.add(...jobs.map((job) => new SchemaJob(job)))
    return generator.batch(name)
  }

  static async batchStatus<T extends object>(batchId: string, options: SchemaGeneratorOptions = {}) {
    const generator = new SchemaGenerator(options)
    return generator.getBatchResults<T>(batchId)
  }

  constructor(options: SchemaGeneratorOptions = {}) {
    this.model = options.model ?? 'gpt-4o-mini'
    this.openai = new OpenAI({ apiKey: options.apiKey })
  }

  add<T extends object>(...jobs: SchemaJob<T>[]) {
    this.jobs = this.jobs.concat(jobs)
  }

  async run<T extends object>(job: SchemaJob<T>): Promise<T> {
    const response = await this.openai.beta.chat.completions.parse({
      model: this.model,
      response_format: job.format,
      messages: [
        { role: 'system', content: job.system },
        { role: 'user', content: job.prompt }
      ]
    })
    const result = response.choices[0].message.parsed
    if (!result) { throw new Error('Unable to generate object') }
    return result
  }

  async all<T extends object = object>(): Promise<T[]> {
    const jobs = this.jobs
    this.jobs = []
    return Promise.all(jobs.map((job) => this.run(job as SchemaJob<T>)))
  }

  async concurrent<T extends object = object>(concurrency = 5): Promise<T[]> {
    const jobs = this.jobs as SchemaJob<T>[]
    this.jobs = []
    return concurrentP<T>(jobs.map((job) => () => this.run(job)), concurrency)
  }

  async batch(name: string) {
    const jobs = this.jobs
    this.jobs = []
    const requests = jobs.map<BatchRequest>((job, index) => ({
      custom_id: `${name}-${index + 1}`,
      url: '/v1/chat/completions',
      method: 'POST',
      body: {
        model: this.model,
        messages: [{ role: 'system', content: job.system }, { role: 'user', content: job.prompt }],
        response_format: job.format,
        max_tokens: job.maxTokens
      }
    }))
    const contents = requests.map((request) => JSON.stringify(request)).join('\n')
    const blob = new Blob([contents], { type: 'application/jsonl' })
    const file = new File([blob], `${name}.jsonl`, { type: 'application/jsonl' })
    const fileResponse = await this.openai.files.create({ file, purpose: 'batch' })
    const batchResponse = await this.openai.batches.create({
      endpoint: '/v1/chat/completions',
      input_file_id: fileResponse.id,
      completion_window: '24h',
      metadata: { name }
    })
    return batchResponse
  }

  async getBatchResults<T extends object>(batchId: string): Promise<BatchResult<T>> {
    const batch = await this.openai.batches.retrieve(batchId)
    if (batch.status !== 'completed' || !batch.output_file_id) {
      return { status: batch.status as Exclude<Batch['status'], 'completed'> }
    }
    const response = await this.openai.files.content(batch.output_file_id)
    const text = await response.text()
    const lines = text.trim().split('\n').map((line) => JSON.parse(line))
    const messages = lines.map<string>((line) => line.response.body.choices[0].message.content)
    const records = messages.map<T>((value) => JSON.parse(value))
    return { status: batch.status as 'completed', records }
  }
}
