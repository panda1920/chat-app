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

// index内で使用する項目は二重に保存しないようにする
type PartitionKeyAttribute = 'chatId'
type SortKeyAttribute = 'createdAt'
type DynamoMessageAttribute = keyof Omit<
  Message,
  PartitionKeyAttribute | SortKeyAttribute
>

export async function postMessage(message: Message) {
  logger.info('Posting message to dynamo')

  try {
    const command = new PutItemCommand({
      TableName: tableName,
      Item: convertToDynamoMessageItem(message),
    })
    return await client.send(command)
  } catch (e) {
    logger.warn(e)
    throw new InternalServerError('Failed to save message in dynamo')
  }
}

function convertToDynamoMessageItem(
  message: Message,
): Record<DynamoMessageAttribute & string, AttributeValue> {
  return {
    [partitionKeyName]: {
      S: createPartitionKey(message.chatId),
    },
    [sortKeyName]: { S: createSortKey(message.createdAt) },
    id: { S: message.id },
    from: { S: message.from },
    message: { S: message.message },
  }
}

function createPartitionKey(attribute: Message[PartitionKeyAttribute]) {
  return `ChatRoom#${attribute}`
}

function createSortKey(attribute: Message[SortKeyAttribute]) {
  return `Message#${attribute.toString()}`
}
