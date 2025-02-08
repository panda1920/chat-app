import { hostname } from 'node:os'
import { Kafka } from 'kafkajs'

// https://kafka.apache.org/documentation/#producerconfigs_client.id
const CLIENT_ID = 'chat-app'

// https://kafka.js.org/docs/configuration
export const kafka = new Kafka({
  clientId: CLIENT_ID,
  brokers: [process.env.BROKER_HOST],
  // logLevel: logLevel.ERROR,
})

// https://kafka.js.org/docs/producing
export const producer = kafka.producer()

export const consumer = kafka.consumer({ groupId: hostname() })

export async function initBroker() {
  await producer.connect()
}
