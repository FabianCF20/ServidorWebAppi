const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config');

const app = express();

// Conexión a la base de datos MongoDB
mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conexión a MongoDB exitosa'))
    .catch(err => console.error('Error al conectar a MongoDB:', err));

// Definir el modelo de usuario
const Cliente = mongoose.model('Cliente', {
    UserName: String,
    Password: String,
    Name: String,
    PhoneNumber: Number,
    Plate: String,
});

// Modelo de vehículo
const Vehiculo = mongoose.model('Vehiculo', {
    marca: String,
    modelo: String,
    año: Number,
    placa: String
});

// Modelo de factura
const Factura = mongoose.model('Factura', {
    numero: String,
    cliente: String,
    total: Number
});

app.use(bodyParser.json());

// Ruta para obtener todos los usuarios registrados
app.get('/cliente', async (req, res) => {
    try {
        const clientes = await Cliente.find();
        res.status(200).json(clientes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para el registro de usuarios
app.post('/register', async (req, res) => {
    const { UserName, Password, Name, PhoneNumber, Plate } = req.body;

    try {
        if (!UserName || !Password || !Name || !PhoneNumber || !Plate) {
            throw new Error('Se requieren todos los campos: nombre de usuario, contraseña, nombre, número de teléfono y placa');
        }

        if (Password.length < 6 || Password.length > 20) {
            throw new Error('La contraseña debe tener entre 6 y 20 caracteres');
        }

        const existingUser = await Cliente.findOne({ UserName: UserName });
        if (existingUser) {
            throw new Error('El nombre de usuario ya está en uso');
        }

        const newUser = new Cliente({ UserName, Password, Name, PhoneNumber, Plate });
        await newUser.save();

        res.status(200).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Ruta para el inicio de sesión
app.post('/login', async (req, res) => {
    const { UserName, Password } = req.body;

    try {
        if (!UserName || !Password) {
            throw new Error('Se requieren un nombre de usuario y una contraseña');
        }

        const cliente = await Cliente.findOne({ UserName: UserName, Password: Password });
        if (!cliente) {
            throw new Error('Credenciales incorrectas');
        }

        res.status(200).json({ message: 'Inicio de sesión exitoso' });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

// Ruta para obtener todos los vehículos
app.get('/vehiculos', async (req, res) => {
    try {
        const vehiculos = await Vehiculo.find();
        res.status(200).json(vehiculos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para registrar un nuevo vehículo
app.post('/vehiculos', async (req, res) => {
    const { marca, modelo, año, placa } = req.body;

    try {
        if (!marca || !modelo || !año || !placa) {
            throw new Error('Se requieren todos los campos: marca, modelo, año y placa');
        }

        const nuevoVehiculo = new Vehiculo({ marca, modelo, año, placa });
        await nuevoVehiculo.save();

        res.status(200).json({ message: 'Vehículo registrado exitosamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Ruta para obtener todas las facturas
app.get('/facturas', async (req, res) => {
    try {
        const facturas = await Factura.find();
        res.status(200).json(facturas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para registrar una nueva factura
app.post('/facturas', async (req, res) => {
    const { numero, cliente, total } = req.body;

    try {
        if (!numero || !cliente || !total) {
            throw new Error('Se requieren todos los campos: número, cliente y total');
        }

        const nuevaFactura = new Factura({ numero, cliente, total });
        await nuevaFactura.save();

        res.status(200).json({ message: 'Factura registrada exitosamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
    console.log('Servidor en ejecución en el puerto 3000');
});