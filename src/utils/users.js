const users = []

const addUser = ({id, username, roomname}) => {
    username = username.trim().toLowerCase()
    roomname = roomname.trim().toLowerCase()

    if(!username || !roomname){
       return {
            error :'Username and Roomname required!'
       }
    }

    const existingUser = users.find(user => user.roomname === roomname && user.username === username)

    if(existingUser){
        return {
            error: 'User already exists!'
        }
    }

    const user = {
        id,
        username,
        roomname
    }

    users.push(user)

    return {
         user 
    }
}

const removeUser = id => {
    const index = users.findIndex(user => user.id === id)
    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

const getUser = id =>  users.find(user => user.id === id)

const getUsersInRoom = roomname => users.filter(user => user.roomname === roomname)


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}