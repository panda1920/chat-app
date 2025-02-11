import { pino } from 'pino'
import { contextStorage } from './storage'

// create pino options
// https://github.com/pinojs/pino/blob/main/docs/api.md#options
const options = {
  name: 'main',
  level: 'trace',
  mixin() {
    return {
      // insert readable time, along with the default timestamp
      readableTime: new Date().toISOString(),
      // insert request context to output if available
      req: contextStorage.getStore(),
    }
  },
  formatters: {
    level(label, _number) {
      // output loglevel name instead of arbitrary number
      return { level: label.toUpperCase() }
    },
  },
} satisfies Parameters<typeof pino>[0]

// create destination
// https://github.com/pinojs/pino/blob/main/docs/transports.md
// transport, unlike the pino.definition, writes log in a separate worker thread
const transport = pino.transport({
  target: 'pino/file',
  // level: 'info', // transport can have a separate log level to the logger
  options: {
    destination: 1, // send to STDOUT file descriptor
  },
})

export const logger = pino(options, transport)
