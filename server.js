var http = require('http')
var fs = require('fs')
var path = require('path')
const app = http.createServer(requestHandler)

function requestHandler(request, response) {
    console.log('Received request for ${request.url}')
    var filePath = './client' + request.url
    if (filePath == './client/') {
        filePath = './client/index.html'
    }
    var extname = String(path.extname(filePath)).toLowerCase()
    console.log(`🖥 Serving ${filePath}`)
    var mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
    }
    var contentType = mimeTypes[extname] || 'application/octet-stream'
    fs.readFile(filePath, function (error, content) {
        if (error) {
            if (error.code == 'ENOENT') {
                fs.readFile('./client/404.html', function (error, content) {
                    response.writeHead(404, { 'Content-Type': contentType })
                    response.end(content, 'utf-8')
                })
            } else {
                response.writeHead(500)
                response.end('Sorry, there was an error: ' + error.code + ' ..\n')
            }
        } else {
            response.writeHead(200, { 'Content-Type': contentType })
            response.end(content, 'utf-8')
        }
    })
}

app.listen(process.env.PORT || 5000)
console.log(`🖥 HTTP Server running at ${process.env.PORT || 5000}`)

const io = require('socket.io')(app, {
    path: '/socket.io',
})

io.attach(app, {
    cors: {
        origin: 'http://localhost',
        methods: ['GET', 'POST'],
        credentials: true,
        transports: ['websocket', 'polling'],
    },
    allowEIO3: true,
})

var user_list = {}

io.on('connection', (socket) => {
    console.log(socket.id)

    socket.on('new-connection', (data) => {
        console.log(data)
        user_list[socket.id] = data.username
        socket.emit('welcome-message', {
            user: 'server',
            message: `Hello ${data.username}! Welcome to the chat. User count: ${Object.keys(user_list).length}`,
        })
    })

    socket.on('new-message', (data) => {
        console.log(`${data.user} sent a message`)
        socket.broadcast.emit('broadcast-message', {
            user: user_list[data.user],
            message: data.message,
        })
    })
})