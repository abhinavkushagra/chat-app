const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.static(path.join(__dirname, '../public')))

const server = http.createServer(app)
const io = socketio(server)


io.on('connection', socket => {              //triggers everytime when a new client connects
    console.log('New Socket Connection')   
    socket.on('join', (options, callback) => {
        const {error, user} = addUser({id: socket.id, ...options})
        if(error){
           return callback(error)
        }
        socket.join(user.roomname)
        socket.emit('message', generateMessage('Welcome!'))
        socket.broadcast.to(user.roomname).emit('message', generateMessage(`${user.username} has joined!`))
        io.to(user.roomname).emit('roomData', {
            roomname: user.roomname,
            users: getUsersInRoom(user.roomname)
        })
        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }
        const user = getUser(socket.id)
        if(user){
            io.to(user.roomname).emit('message', generateMessage(user.username, message))
            callback()
        }
    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)
        if(user){
            io.to(user.roomname).emit('locationMessage', generateLocationMessage(user.username, `https://www.google.co.in/maps?q=${location.latitude},${location.longitude}`))
            callback()
        }
    })
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user){
            io.to(user.roomname).emit('message', generateMessage(`${user.username} has left the chat room!`))
            io.to(user.roomname).emit('roomData', {
                roomname: user.roomname,
                users: getUsersInRoom(user.roomname)
            })
        }
        
    })
})

app.get('',(req, res) => {
    res.render('index')
})

server.listen(port, () => {
    console.log('Server is running on ' + port)
})



