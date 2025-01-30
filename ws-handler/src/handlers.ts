import { publish, subscribe } from './broker'
import { type Message } from './models'

export async function onConnection(sendMessage: (message: Message) => void) {
  await subscribe(async (message) => {
    sendMessage(message)
  })
}

export async function onMessage(message: Message) {
  await publish(message)
}
