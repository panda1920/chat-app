import { type Message } from './models'

export async function subscribe(callback: (message: Message) => Promise<void>) {
  // TODO: implement
  // subscribe current websocket connection to a message broker
  // make sure callback is invoked when a new message arrives
  console.log('subscribing to broker!')
}

export async function publish(message: Message) {
  // TODO: implement
  // publish new message coming from the current websocket connection to the broker
  console.log('publishing to broker!')
}
