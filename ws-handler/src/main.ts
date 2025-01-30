import { createServer } from 'node:http'
import { WebSocketServer } from 'ws'
import { authenticate } from './auth'
import { onConnection, onMessage } from './handlers'
import { type Message } from './models'

function main() {
  const server = createServer((_, res) => {
    // basic http listener that returns error
    res.writeHead(400)
    res.end('This is a websocket server. Upgrade required.')
  })
  const wss = new WebSocketServer({
    noServer: true,
  })

  // websocket setting
  wss.on('connection', async (ws, req) => {
    // TODO: maybe I should keep some connection state here, extracted from req
    ws.on('error', console.error)
    console.log('You have made a connection!')

    const sendMessage = (message: Message) => {
      ws.send(JSON.stringify(message))
    }

    await onConnection(sendMessage)

    ws.on('message', async (data) => {
      // TODO: parse incoming data from message and pass to onMessage
      const dummyMessage = {
        from: 111,
        message: 'hello world',
        createdAt: 1767052800,
      } satisfies Message
      await onMessage(dummyMessage)

      console.log(`You have received the following data!: ${data}`)
      ws.send('Thank you for the data :)')
    })
  })

  // http server setting
  server.on('upgrade', async (req, socket, head) => {
    socket.on('error', onSocketError)

    // TODO: parse parameters and pass to authenticate()
    console.log(`headers: ${JSON.stringify(req.headers)}`)
    console.log(`method: ${JSON.stringify(req.method)}`)
    console.log(`url: ${JSON.stringify(req.url)}`)
    const result = await authenticate()
    if (!result) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
      socket.destroy()
      return
    }

    socket.removeListener('error', onSocketError)

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req)
    })
  })
  server.on('error', (err) => {
    console.error(err)
  })

  const port = parseInt(process.env.PORT || '3000')
  server.listen(port, '0.0.0.0', () =>
    console.log(`Listening on port: ${port}`),
  )
}

function onSocketError(error: Error) {
  console.error(error)
}

main()
