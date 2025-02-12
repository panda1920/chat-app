import { setupBroker } from './adapters/pubsub/client'
import { setupServer } from './adapters/websocket/setup'
import { onMessage, onConnect, onDisconnect, onRequest } from './app/handlers'

function main() {
  const port = parseInt(process.env.PORT || '3000')
  setupBroker()
  setupServer({
    port,
    onMessage,
    onRequest: onRequest,
    onConnect,
    onDisconnect,
  })
}

main()
