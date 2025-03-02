import { z } from 'zod'
import { MessageValidator } from '../../domain/models/message'

const MessagePayload = MessageValidator.pick({ message: true })

export const ChatClientDto = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('messageText'),
    payload: MessagePayload,
  }),
  z.object({
    type: z.literal('ping'),
  }),
])
