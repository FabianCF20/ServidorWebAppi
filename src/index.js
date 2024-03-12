const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config');

const app = express();

// Conexión a la base de datos MongoDB
mongoose.connect(config.mongoURI)
    .then(() => console.log('Conexión a MongoDB exitosa'))
    .catch(err => console.error('Error al conectar a MongoDB:', err));

// Definir el modelo de usuario
const User = mongoose.model('User', {
    username: String,
    password: String
});

app.use(bodyParser.json());

// Ruta para obtener todos los usuarios registrados
app.get('/users', (req, res) => {
    // Buscar todos los usuarios en la base de datos
    User.find()
        .then(users => {
            res.status(200).json(users);
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

// Ruta para el registro de usuarios
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Validar datos de entrada
    if (!username || !password) {
        return res.status(400).json({ error: 'Se requieren un nombre de usuario y una contraseña' });
    }

    // Validar longitud de contraseña
    if (password.length < 6 || password.length > 20) {
        return res.status(400).json({ error: 'La contraseña debe tener entre 6 y 20 caracteres' });
    }

    // Verificar si el nombre de usuario ya está en uso
    User.findOne({ username })
        .then(existingUser => {
            if (existingUser) {
                return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
            }

            // Crear un nuevo usuario
            const newUser = new User({ username, password });

            // Guardar el usuario en la base de datos
            return newUser.save();
        })
        .then(() => res.status(200).json({ message: 'Usuario registrado exitosamente' }))
        .catch(err => res.status(400).json({ error: err.message }));
});

// Ruta para el inicio de sesión
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Validar datos de entrada
    if (!username || !password) {
        return res.status(400).json({ error: 'Se requieren un nombre de usuario y una contraseña' });
    }

    // Buscar el usuario en la base de datos
    User.findOne({ username, password })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Credenciales incorrectas' });
            }
            res.status(200).json({ message: 'Inicio de sesión exitoso' });
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
    console.log('Servidor en ejecución en el puerto 3000');
});