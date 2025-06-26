const http = require('http').createServer();
const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000", // Adjust if your React app runs on a different port
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room ${room}`);
    });

    socket.on('offer', (offer, room) => {
        socket.to(room).emit('offer', offer, socket.id);
    });

    socket.on('answer', (answer, room) => {
        socket.to(room).emit('answer', answer, socket.id);
    });

    socket.on('ice-candidate', (candidate, room) => {
        socket.to(room).emit('ice-candidate', candidate, socket.id);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

http.listen(3000, () => {
    console.log('Signaling server listening on port 3000');
});