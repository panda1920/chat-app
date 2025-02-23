import { z } from 'zod'
import { Message } from '../../domain/models/message'

const MessagePayload = Message.pick({ message: true })

export const ChatClientDto = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('messageText'),
    payload: MessagePayload,
  }),
])
