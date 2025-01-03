import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { Config } from '../config/env'

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

  async postMessage(message: string) {
    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: {
        [this.partitionKeyName]: { S: 'ChatRoom#' + '1' }, // temporary chatroomId
        [this.sortKeyName]: {
          S: 'Message#' + '1' + '#' + new Date().getTime().toString(), // temporary, userId
        },
        message: { S: message },
      },
    })
    return await this.client.send(command)
  }
}
