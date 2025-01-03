// provide typing to ConfigService
export type Config = {
  PORT: number
  DYNAMO_CHAT_TABLE_NAME: string
  DYNAMO_CHAT_TABLE_PARITION_KEY: string
  DYNAMO_CHAT_TABLE_SORT_KEY: string
}

// do all conversions and validations here
export default () =>
  ({
    PORT: parseInt(process.env.PORT, 10) || 3000,
    DYNAMO_CHAT_TABLE_NAME: process.env.DYNAMO_CHAT_TABLE_NAME || '',
    DYNAMO_CHAT_TABLE_PARITION_KEY:
      process.env.DYNAMO_CHAT_TABLE_PARITION_KEY || '',
    DYNAMO_CHAT_TABLE_SORT_KEY: process.env.DYNAMO_CHAT_TABLE_SORT_KEY || '',
  }) satisfies Config
