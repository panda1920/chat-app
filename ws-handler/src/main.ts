import { setupBroker } from './adapters/pubsub/client'
import { setupServer } from './adapters/websocket/setup'
import { authorize } from './app/auth'
import { onMessage, onConnect, onDisconnect } from './app/handlers'

function main() {
  const port = parseInt(process.env.PORT || '3000')
  setupBroker()
  setupServer({ port, onMessage, authorize, onConnect, onDisconnect })
}

main()
