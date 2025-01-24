import { createServer } from 'node:http'
import { WebSocketServer } from 'ws'

function main() {
  const server = createServer()
  const wss = new WebSocketServer({
    noServer: true,
    // port: 3000,
  })

  // websocket setting
  wss.on('connection', (ws, req) => {
    ws.on('error', console.error)

    console.log('You have made a connection!')

    ws.on('message', (data) => {
      console.log(`You have received a following data!: ${data}`)
      ws.send('Thank you for the data :)')
    })
  })

  // http server setting
  server.on('upgrade', (req, socket, head) => {
    socket.on('error', console.error)

    // put some sort of authentication here
    console.log(`headers: ${JSON.stringify(req.headers)}`)
    console.log(`method: ${JSON.stringify(req.method)}`)
    console.log(`url: ${JSON.stringify(req.url)}`)

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req)
    })
  })
  server.on('error', (err) => {
    console.error(err)
  })

  const port = 3000
  server.listen(port, '0.0.0.0', () =>
    console.log(`Listening on port: ${port}`),
  )
}

main()
