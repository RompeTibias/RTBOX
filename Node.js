const express = require('express');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let salas = {}; // Guardará las salas activas en memoria

// Crear una sala
app.get('/crear-sala', (req, res) => {
    const codigoSala = Math.random().toString(36).substr(2, 6).toUpperCase();
    salas[codigoSala] = { jugadores: [] };
    res.json({ codigo: codigoSala });
});

// Conectar un jugador a una sala
io.on('connection', (socket) => {
    console.log('Jugador conectado:', socket.id);

    socket.on('unirse-sala', (codigoSala) => {
        if (salas[codigoSala]) {
            socket.join(codigoSala);
            salas[codigoSala].jugadores.push(socket.id);
            io.to(codigoSala).emit('jugador-unido', socket.id);
            console.log(`Jugador ${socket.id} se unió a la sala ${codigoSala}`);
        } else {
            socket.emit('error', 'Sala no encontrada');
        }
    });

    // Desconectar jugador
    socket.on('disconnect', () => {
        for (const [codigo, sala] of Object.entries(salas)) {
            sala.jugadores = sala.jugadores.filter(j => j !== socket.id);
            if (sala.jugadores.length === 0) delete salas[codigo]; // Elimina la sala si está vacía
        }
        console.log('Jugador desconectado:', socket.id);
    });
});

server.listen(3000, () => console.log('Servidor corriendo en el puerto 3000'));
