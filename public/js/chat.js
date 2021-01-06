const socket = io()

const form = document.querySelector('form')
const message_input = document.querySelector('#message')
const submission = document.querySelector('#send')
const  location_btn = document.querySelector('#send-location')
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const usersTemplate = document.querySelector('#sidebar-template').innerHTML
const messages = document.querySelector('#messages')
const sidebar = document.querySelector('#sidebar')

const {username, roomname} = Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoScroll = () => {
    const $newMessage = messages.lastElementChild
    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)

    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = messages.offsetHeight

    const containerHeight = messages.scrollHeight

    const scrollOffset = messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        messages.scrollTop = messages.scrollHeight
    }
}



socket.on('message', message => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', roomData => {
    const html = Mustache.render(usersTemplate, {
        roomname : roomData.roomname,
        users: roomData.users
    })
    sidebar.innerHTML = html
})

socket.on('locationMessage', locationMessage => {
    console.log(locationMessage)
    const html = Mustache.render(locationTemplate, {
        username: locationMessage.username,
        url: locationMessage.url,
        createdAt: moment(locationMessage.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    messages.style.marginLeft = "auto"
    messages.style.width = "60%"
    autoScroll()
})

form.addEventListener('submit', e =>{
    e.preventDefault()
    submission.setAttribute('disabled', 'disabled')

    socket.emit('sendMessage', message_input.value, error => {
        submission.removeAttribute('disabled')
        message_input.value = ''
        message_input.focus()
        if(error){
            return console.log(error)
        }
        console.log('Message Delivered!')
    })
})

location_btn.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Not Available!')
    }
    location_btn.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition(location => {
        socket.emit('sendLocation', { latitude: location.coords.latitude, longitude: location.coords.longitude}, () => {
            location_btn.removeAttribute('disabled')
            console.log('Location Shared!')
        })
    })
})

socket.emit('join', {username, roomname}, error => {
    if(error){
        alert(error)
        location.href = '/'
    }
})





