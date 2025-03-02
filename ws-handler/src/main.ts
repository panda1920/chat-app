import { setupBroker } from './adapters/pubsub/client'
import { setupServer } from './adapters/websocket/setup'

async function main() {
  const port = parseInt(process.env.PORT || '3000')
  await setupBroker()
  await setupServer(port)
}

main()
