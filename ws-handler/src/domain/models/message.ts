import { z, ZodError } from 'zod'
import { InternalServerError, ParsingError } from '../../app/errors'

export const Message = z.object({
  chatId: z
    .string()
    .min(1)
    .max(32)
    .describe('ID of chat that message belongs to'),
  message: z
    .string()
    .min(1)
    .max(1000)
    .describe('The message text typed in by the user'),
  from: z
    .string()
    .min(1)
    .max(32)
    .describe('The userId of the author of this message'),
  createdAt: z
    .number()
    .gte(1_000_000_000_000)
    .lte(9_999_999_999_999)
    .describe('When the message was entered, in unix timestamp'),
})

export type Message = z.infer<typeof Message>

export function parseMessage(input?: string) {
  const errorPrefix = 'Message parse error'
  if (input === undefined)
    throw new ParsingError(`${errorPrefix}: Input string not found`)

  try {
    return Message.parse(JSON.parse(input))
  } catch (e) {
    if (e instanceof SyntaxError)
      throw new ParsingError(`${errorPrefix}: Failed to parse JSON string`)
    if (e instanceof ZodError) {
      e.issues.map((issue) => console.error(JSON.stringify(issue)))
      throw new ParsingError(`${errorPrefix}: Failed to parse message object`)
    }

    console.error(JSON.stringify(e))
    throw new InternalServerError(`${errorPrefix}: Unexpected error`)
  }
}

export function serializeMessage(message: Message) {
  return JSON.stringify(message)
}
