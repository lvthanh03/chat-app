console.log('Loaded chat.js')

var socket = io.connect();

var username = prompt('Hello! Type in your username:')

if (username == '') {
    username = 'Guest' + Math.floor(Math.random() * 1000)
}

if (username !== null) {
    socket.emit('new-connection', { username })
}

socket.on('welcome-message', (data) => {
    addMessage(data, false)
})

function addMessage(data, isSelf = false) {
    const messageElement = document.createElement('div')
    messageElement.classList.add('message')

    if (isSelf) {
        messageElement.classList.add('self-message')
        messageElement.innerHTML = `${data.message}`
    } else {
        if (data.user === 'server') {
            messageElement.classList.add('server-message')
            messageElement.innerHTML = `${data.message}`
        } else {
            messageElement.classList.add('others-message')
            messageElement.innerHTML = `<strong>${data.user}:</strong> ${data.message}`
        }
    }
    const chat_Container = document.getElementById('chat_Container')

    chat_Container.append(messageElement)
}

const messageForm = document.getElementById('messageForm')

messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const messageInput = document.getElementById('messageInput')

    if (messageInput.value !== '') {
        let newMessage = messageInput.value
        socket.emit('new-message', { user: socket.id, message: newMessage })
        addMessage({ message: newMessage }, true)
        messageInput.value = ''
    } else {
        messageInput.classList.add('error')
    }
})

socket.on('broadcast-message', (data) => {
    console.log(data)
    addMessage(data, false)
})