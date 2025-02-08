import {
  publishMessage,
  subscribeForMessage,
} from '../adapters/pubsub/kafka-broker'
import { type Message } from '../domain/models'

// TODO: consider when and what to subscribe to
// originally i was considering subscribing per connection
// but that seems to be a bad idea
export async function onConnection(sendMessage: (message: Message) => void) {
  await subscribeForMessage(async (message) => {
    sendMessage(message)
  })
}

export async function handleMessage(message: Message) {
  await publishMessage(message)
}
