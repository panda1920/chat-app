import { hostname } from 'node:os'
import { Kafka } from 'kafkajs'
import { parseMessage, type Message } from '../../domain/models/message'

// https://kafka.apache.org/documentation/#producerconfigs_client.id
const CLIENT_ID = 'chat-app'
export const MESSAGES_TOPIC = 'chat-messages'

// https://kafka.js.org/docs/configuration
const kafka = new Kafka({
  clientId: CLIENT_ID,
  brokers: [process.env.BROKER_HOST || ''],
  // logLevel: logLevel.ERROR,
})

// https://kafka.js.org/docs/producing
export const producer = kafka.producer()

// https://kafka.js.org/docs/consuming
export const consumer = kafka.consumer({ groupId: hostname() })

export async function initBroker() {
  await producer.connect()

  await consumer.connect()
  // for my usecase it felt like having one subscription per-server is the most optimal
  await consumer.subscribe({ topics: [MESSAGES_TOPIC], fromBeginning: false })
  await consumer.run({
    eachMessage: async ({ message, heartbeat, pause }) => {
      // for now it is assumed that the consumer is subscribed to one topic only
      // so I am not checking which topic message is coming from
      const decoded = parseMessage(message.value?.toString())

      // send message to all subscriptions that have the same chatId
      const subscriptions = subscriptionsByChatId[decoded.chatId] ?? []
      Promise.allSettled(subscriptions.map((callback) => callback(decoded)))
    },
  })
}

// all subscriptions go here
export const subscriptionsByChatId: Record<
  Message['chatId'],
  ((message: Message) => Promise<void>)[]
> = {}
