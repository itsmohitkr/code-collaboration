const express = require('express');
const app = express()
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4:uuidv4}=require('uuid')

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`);
}) 

app.get('/:room', (req, res) => {
    res.render('room',{roomId:req.params.room})  // pass the room id to roo.ejs
})

io.on('connection',(socket) => {
    socket.on('join-room', (roomId, userId) => {
        // console.log("joined the room");
        socket.join(roomId)
        socket.to(roomId).emit('user-connected', userId);

        // messages
        socket.on('message', (msg) => {
            socket.to(roomId).emit('message', msg)
        })

        // editor area
        socket.on('text_data', (text) => {
            socket.to(roomId).emit('text_data', text)
        })

        // notification message

        socket.emit("notification", "welcome 👏 to the code </> collaboration app 💻.");
        socket.broadcast.emit("notification", `A new user has joined the chat. 🤩`)
        
        socket.on("disconnect", () => {
            io.emit("notification", `A user has left the chat.😞`)
        })

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId)
        })

    })
})



server.listen(process.env.PORT || 3030, () => {
    console.log('server has started on http://localhost:3030');
})