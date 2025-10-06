const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');

// Importar rutas
const administrativosRoutes = require('./routes/administrativos');
const usuariosRoutes = require('./routes/usuarios');
const membresiasRoutes = require('./routes/membresias');
const registroMembresiasRoutes = require('./routes/registroMembresias');
const pagosRoutes = require('./routes/pagos');

// Importa modelos aquí para sincronizar
require('./models/administrativo');
require('./models/usuario');
require('./models/membresia');
require('./models/registroMembresia');
require('./models/pago');

// Crear la aplicación Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.get('/', (req, res) => res.json({ message: 'API Gym funcionando!' }));
app.use('/api/administrativos', administrativosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/membresias', membresiasRoutes);
app.use('/api/registro-membresias', registroMembresiasRoutes);
app.use('/api/pagos', pagosRoutes);

// Sincroniza modelos con la BD
sequelize.sync({ force: false })  // ⚠️ force:true borra y crea todo de nuevo
  .then(() => {
    console.log('Base de datos conectada y modelos sincronizados');
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Servidor corriendo en puerto ${process.env.PORT || 3000}`);
    });
  })
  .catch(err => console.error('Error al conectar a la base de datos:', err));