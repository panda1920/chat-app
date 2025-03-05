import {
  AttributeValue,
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Config } from '../config/env'
import { Message } from '../entity/message'

type PartitionKeyAttribute = 'chatId'
type SortKeyAttribute = 'createdAt'
type DynamoMessageAttribute = keyof Omit<
  Message,
  PartitionKeyAttribute | SortKeyAttribute
>

@Injectable()
export default class MessageRepository {
  constructor(private readonly configService: ConfigService<Config>) {
    this.client = new DynamoDBClient()

    // get required environment variables
    this.tableName = this.configService.get('DYNAMO_CHAT_TABLE_NAME', {
      infer: true,
    })
    this.partitionKeyName = this.configService.get(
      'DYNAMO_CHAT_TABLE_PARITION_KEY',
      {
        infer: true,
      },
    )
    this.sortKeyName = this.configService.get('DYNAMO_CHAT_TABLE_SORT_KEY', {
      infer: true,
    })
  }
  private readonly client: DynamoDBClient
  private readonly tableName: string
  private readonly partitionKeyName: string
  private readonly sortKeyName: string
  private readonly logger = new Logger(MessageRepository.name)

  async postMessage(message: Message) {
    this.logger.log('Posting message to dynamo')

    try {
      const command = new PutItemCommand({
        TableName: this.tableName,
        Item: this.convertToDynamoMessageItem(message),
      })
      return await this.client.send(command)
    } catch (e) {
      this.logger.warn(e)
      throw new InternalServerErrorException('Failed to save message in dynamo')
    }
  }

  async getMessages(chatId: string, lastCreatedAt?: number) {
    // batch requires primary key (both partition key and sortkey)
    // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchGetItem.html
    // query requires just the partition key
    // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html

    // need to replace value with a placeholder because dynamo throws error with '#'
    const keyExpression = `${this.partitionKeyName} = :value`
    const expressionValue = {
      ':value': { S: this.createPartitionKey(chatId) },
    }
    // start reading from a particular primarkey, if requested
    let cursor: Record<string, AttributeValue> | undefined = lastCreatedAt
      ? {
          [this.partitionKeyName]: { S: this.createPartitionKey(chatId) },
          [this.sortKeyName]: { S: this.createSortKey(lastCreatedAt) },
        }
      : undefined
    const items = []

    // dynamo can only retrieve 25 items at a time
    // pagination required to get all results
    // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html
    while (true) {
      const command = new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: keyExpression,
        ExpressionAttributeValues: expressionValue,
        ExclusiveStartKey: cursor,
      })

      const { Items, LastEvaluatedKey, ...rest } =
        await this.client.send(command)
      this.logger.log(`Dynamodb query result: ${JSON.stringify(rest)}`)

      if (Items) items.push(...Items)
      if (LastEvaluatedKey) {
        cursor = LastEvaluatedKey
      } else {
        // no more data
        break
      }
    }

    return items.map((item) => this.convertDynamoItemToMessage(item))
  }

  private convertToDynamoMessageItem(
    message: Message,
  ): Record<DynamoMessageAttribute & string, AttributeValue> {
    return {
      [this.partitionKeyName]: {
        S: this.createPartitionKey(message.chatId),
      },
      [this.sortKeyName]: { S: this.createSortKey(message.createdAt) },
      id: { S: message.id },
      fromId: { S: message.fromId },
      text: { S: message.text },
    }
  }

  private createPartitionKey(attribute: Message[PartitionKeyAttribute]) {
    return `ChatRoom#${attribute}`
  }

  private createSortKey(attribute: Message[SortKeyAttribute]) {
    return `Message#${attribute.toString()}`
  }

  private convertDynamoItemToMessage(
    item: Record<DynamoMessageAttribute & string, AttributeValue>,
  ): Message {
    const { text, fromId, id, ...rest } = item
    const [_1, chatId] = rest[this.partitionKeyName].S.split('#')
    const [_2, createdAt] = rest[this.sortKeyName].S.split('#')

    return {
      id: id.S,
      chatId,
      fromId: fromId.S,
      text: text.S,
      createdAt: parseInt(createdAt),
    }
  }
}
