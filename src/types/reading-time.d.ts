declare module 'reading-time' {
  interface ReadingTimeResult {
    text: string
    minutes: number
    time: number
    words: number
  }

  interface ReadingTimeOptions {
    wordsPerMinute?: number
  }

  function readingTime(text: string, options?: ReadingTimeOptions): ReadingTimeResult

  export = readingTime
}