import { initBroker } from './adapters/pubsub/client'
import { setupServer } from './adapters/websocket/setup'
import { authorize } from './app/auth'
import { onMessage, onConnect } from './app/handlers'

function main() {
  const port = parseInt(process.env.PORT || '3000')
  initBroker()
  setupServer({ port, onMessage, authorize, onConnect })
}

main()
