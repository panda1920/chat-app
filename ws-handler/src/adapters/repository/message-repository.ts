import {
  type AttributeValue,
  DynamoDBClient,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb'
import { InternalServerError } from '../../app/errors'
import { logger } from '../../app/logger'
import { type Message } from '../../domain/models/message'

const client = new DynamoDBClient()
const tableName = process.env.DYNAMO_CHAT_TABLE_NAME || ''
const partitionKeyName = process.env.DYNAMO_CHAT_TABLE_PARITION_KEY || ''
const sortKeyName = process.env.DYNAMO_CHAT_TABLE_SORT_KEY || ''

export async function postMessage(message: Message) {
  logger.info('Posting message to dynamo')

  try {
    const command = new PutItemCommand({
      TableName: tableName,
      Item: {
        [partitionKeyName]: { S: createPartitionKey(message.chatId) },
        [sortKeyName]: {
          S: createSortKey(message.from, message.createdAt),
        },
        message: convertMessageToAttributeValue(message),
      },
    })
    return await client.send(command)
  } catch (e) {
    logger.warn(e)
    throw new InternalServerError('Failed to save message in dynamo')
  }
}

function convertMessageToAttributeValue(message: Message) {
  return {
    M: {
      chatId: { S: message.chatId },
      from: { S: message.from },
      message: { S: message.message },
      createdAt: { N: message.createdAt.toString() },
    } satisfies Record<keyof Message, AttributeValue>,
  }
}

function createPartitionKey(chatId: Message['chatId']) {
  return `ChatRoom#${chatId}`
}

function createSortKey(from: Message['from'], createdAt: Message['createdAt']) {
  return `Message#${from}#${createdAt.toString()}`
}
