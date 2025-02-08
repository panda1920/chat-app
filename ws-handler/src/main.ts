import { initBroker } from './adapters/pubsub/client'
import { setupServer } from './adapters/websocket/setup'
import { authorize } from './app/auth'
import { handleMessage, onConnection } from './app/handlers'

function main() {
  const port = parseInt(process.env.PORT || '3000')
  initBroker()
  setupServer({ port, handleMessage, authorize, onConnection })
}

main()
