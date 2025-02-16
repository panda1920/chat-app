import { hostname } from 'node:os'
import { Kafka, logLevel, type logCreator } from 'kafkajs'
import { logger } from '../../app/logger'
import { type RequestContext, type MessageReturner } from '../../app/types'
import { parseMessage } from '../../domain/models/message'

// https://kafka.apache.org/documentation/#producerconfigs_client.id
const CLIENT_ID = 'chat-app'
export const MESSAGES_TOPIC = 'chat-messages'

// create custom logger for kafka client
// https://kafka.js.org/docs/custom-logger
const kafkaLogCreator: logCreator = (mainLevel: logLevel) => {
  const toPinoLogLevel = (level: logLevel) => {
    switch (level) {
      case logLevel.NOTHING:
      case logLevel.ERROR:
        return 'error'
      case logLevel.DEBUG:
        return 'debug'
      case logLevel.INFO:
        return 'info'
      case logLevel.WARN:
        return 'warn'
    }
  }
  const kafkaLogger = logger.child(
    { name: 'ws-handler-kafka' },
    { level: toPinoLogLevel(mainLevel) },
  )

  return ({ level, log }) => {
    const { message, ...extra } = log
    kafkaLogger[toPinoLogLevel(level)](extra, message)
  }
}

// create kafka client
// https://kafka.js.org/docs/configuration
const kafka = new Kafka({
  clientId: CLIENT_ID,
  brokers: [process.env.BROKER_HOST || ''],
  // logLevel: logLevel.ERROR,
  logCreator: kafkaLogCreator,
})

// https://kafka.js.org/docs/producing
export const producer = kafka.producer()

// https://kafka.js.org/docs/consuming
export const consumer = kafka.consumer({ groupId: hostname() })

export async function setupBroker() {
  await producer.connect()

  await consumer.connect()
  // for my usecase it felt like having one subscription per-server is the most optimal
  await consumer.subscribe({ topics: [MESSAGES_TOPIC], fromBeginning: false })
  await consumer.run({
    eachMessage: async ({ message, heartbeat, pause }) => {
      logger.info('Consumed message from broker')

      // for now it is assumed that the consumer is subscribed to one topic only
      // so I am not checking which topic message is coming from
      const decoded = parseMessage(message.value?.toString())

      // send message to all subscriptions that have the same chatId
      const subscriptions = subscriptionsByChatId[decoded.chatId] ?? []
      await Promise.allSettled(
        subscriptions.map((callback) => callback(decoded)),
      )
    },
  })

  // cleanup code when the server terminates
  // https://github.com/tulios/kafkajs/blob/master/examples/producer.js
  const errorTypes = ['unhandledRejection', 'uncaughtException'] as const
  const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'] as const

  errorTypes.map((type) => {
    process.on(type, async (e) => {
      logger.error(e, 'Terminating due to error')
      try {
        await producer.disconnect()
        await consumer.disconnect()
        // when exceptions occur there is no way for nodejs to return to its normal processing
        // which is why forceful termination with exit() is required here
        process.exit(0)
      } catch {
        process.exit(1)
      }
    })
  })

  signalTraps.map((signal) => {
    // because signals can be sent multiple times, once() ensures duplicate cleanup is not possible
    process.once(signal, async () => {
      logger.info(`Terminating due to signal: ${signal}`)
      try {
        await producer.disconnect()
        await consumer.disconnect()
      } finally {
        // unlike exit(), kill() resends SIGKILL to nodejs
        // provides nodejs a chance to perform potential cleanups
        process.kill(process.pid, signal)
      }
    })
  })
}

// all subscriptions go here
export const subscriptionsByChatId: Record<
  RequestContext['chatId'],
  MessageReturner[]
> = {}
