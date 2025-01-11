import {
  AttributeValue,
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Config } from '../config/env'
import { Message } from '../entity/message'

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

  async postMessage(message: string) {
    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: {
        [this.partitionKeyName]: { S: this.createPartitionKey(1) }, // temporary chatroomId
        [this.sortKeyName]: {
          S: this.createSortKey(1, new Date()), // temporary, userId
        },
        message: { S: message },
      },
    })
    return await this.client.send(command)
  }

  async getMessages(chatRoomId: number) {
    // batch requires primary key (both partition key and sortkey)
    // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchGetItem.html
    // query requires just the partition key
    // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html

    // need to replace value with a placeholder because dynamo throws error with '#'
    const keyExpression = `${this.partitionKeyName} = :value`
    const expressionValue = {
      ':value': { S: this.createPartitionKey(chatRoomId) },
    }
    const items = []
    // dynamo has can only retrieve 25 items at a time
    // pagination required to get all results
    // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html
    while (true) {
      let cursor = undefined
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

  private createPartitionKey(chatRoomId: number) {
    return `ChatRoom#${chatRoomId}`
  }

  private createSortKey(userId: number, d: Date) {
    return `Message#${userId}#${d.getTime().toString()}`
  }

  private convertDynamoItemToMessage(item: Record<string, AttributeValue>) {
    const [_1, chatRoomid] = item[this.partitionKeyName].S.split('#')
    const [_2, userId, createdAt] = item[this.sortKeyName].S.split('#')

    return {
      message: item.message.S,
      createdBy: parseInt(userId),
      chatRoomId: parseInt(chatRoomid),
      createdAt: parseInt(createdAt),
    } satisfies Message
  }
}
