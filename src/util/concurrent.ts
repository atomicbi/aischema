export async function concurrentP<T>(queue: (() => Promise<T>)[], concurrency: number): Promise<T[]> {
  let index = 0
  const results: T[] = []
  const execThread = async () => {
    while (index < queue.length) {
      const curIndex = index++
      results[curIndex] = await queue[curIndex]()
    }
  }
  const threads = []
  for (let thread = 0; thread < concurrency; thread++) {
    threads.push(execThread())
  }
  await Promise.all(threads)
  return results
}
