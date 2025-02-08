import { CompressionTypes } from 'kafkajs'
import { producer } from './client'
import { type Message } from '../../domain/models'

const CHAT_MESSAGE_TOPIC = 'chat-messages'

export async function subscribeForMessage(
  callback: (message: Message) => Promise<void>,
) {
  // TODO: implement
  // subscribe current websocket connection to a message broker
  // make sure callback is invoked when a new message arrives
  console.log('subscribing to broker!')
}

export async function publishMessage(message: Message) {
  await producer.send({
    compression: CompressionTypes.GZIP,
    topic: CHAT_MESSAGE_TOPIC,
    messages: [{ key: message.chatId, value: JSON.stringify(message) }],
  })
  console.log('publishing to broker!')
}
