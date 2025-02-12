import { CompressionTypes } from 'kafkajs'
import { producer, MESSAGES_TOPIC, subscriptionsByChatId } from './client'
import { logger } from '../../app/logger'
import { type RequestContext, type MessageReturner } from '../../app/types'
import { serializeMessage, type Message } from '../../domain/models/message'

export async function subscribeForMessage(
  chatId: RequestContext['chatId'],
  callback: MessageReturner,
) {
  if (subscriptionsByChatId[chatId]) {
    subscriptionsByChatId[chatId].push(callback)
  } else {
    subscriptionsByChatId[chatId] = [callback]
  }
}

export async function unsubscribeForMessage(
  chatId: RequestContext['chatId'],
  callback: MessageReturner,
) {
  if (!subscriptionsByChatId[chatId]) return

  subscriptionsByChatId[chatId] = subscriptionsByChatId[chatId].filter(
    (subscription) => subscription !== callback,
  )
}

export async function publishMessage(message: Message) {
  logger.info('Publishing message to broker')
  await producer.send({
    compression: CompressionTypes.GZIP,
    topic: MESSAGES_TOPIC,
    messages: [{ key: message.chatId, value: serializeMessage(message) }],
  })
}
