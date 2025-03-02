import { randomUUID } from 'node:crypto'
import { z, ZodError } from 'zod'
import { InternalServerError, ParsingError } from '../../app/errors'
import { logger } from '../../app/logger'

export const MessageValidator = z.object({
  id: z.string().min(1).max(36).describe('ID of message'),
  chatId: z
    .string()
    .min(1)
    .max(36)
    .describe('ID of chat that message belongs to'),
  message: z.string().min(1).max(1000).describe('Text'),
  fromId: z.string().min(1).max(32).describe('The userId of the author'),
  createdAt: z
    .number()
    .gte(1_000_000_000_000)
    .lte(9_999_999_999_999)
    .describe('When the message was created, in unix timestamp milliseconds'),
})

export type MessageProps = z.infer<typeof MessageValidator>

export class Message {
  private readonly props: MessageProps
  private constructor(unvalidatedProps: MessageProps) {
    this.props = MessageValidator.parse(unvalidatedProps)
  }

  static create(props: Omit<MessageProps, 'id' | 'createdAt'>) {
    const messageProps = {
      ...props,
      id: randomUUID(),
      createdAt: Date.now(),
    }
    return new Message(messageProps)
  }

  static parseFromString(s?: string) {
    const errorPrefix = 'Message parse error'
    if (s === undefined)
      throw new ParsingError(`${errorPrefix}: Input string not found`)

    try {
      return new Message(JSON.parse(s))
    } catch (e) {
      if (e instanceof SyntaxError)
        throw new ParsingError(`${errorPrefix}: Failed to parse JSON string`)
      if (e instanceof ZodError) {
        e.issues.map((issue) => logger.error(JSON.stringify(issue)))
        throw new ParsingError(`${errorPrefix}: Failed to parse message object`)
      }

      logger.error(e)
      throw new InternalServerError(`${errorPrefix}: Unexpected error`)
    }
  }

  getProps() {
    return this.props
  }

  serialize() {
    return JSON.stringify(this.props)
  }

  // getters
  get id() {
    return this.props.id
  }
  get chatId() {
    return this.props.chatId
  }
  get message() {
    return this.props.message
  }
  get fromId() {
    return this.props.fromId
  }
  get createdAt() {
    return this.props.createdAt
  }
}
