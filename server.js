const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// 🔗 Conectar con MongoDB Compass
const MONGO_URI = 'mongodb+srv://chelinv2004:MD1217cv2019@cluster0.xfa8v.mongodb.net/calificaciones'; // Cambia 'escuela' por el nombre de tu base de datos

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error al conectar a MongoDB:', err));

// 📌 Definir esquema de alumnos
const alumnoSchema = new mongoose.Schema({
  nombre: String,
  cal1: Number,
  cal2: Number,
  cal3: Number,
  calFinal: Number,
  observacion: String
});

const Alumno = mongoose.model('Alumno', alumnoSchema);

// 📌 Datos quemados
const datosIniciales = [
  { nombre: 'Juan Pérez', cal1: 80, cal2: 70, cal3: 90 },
  { nombre: 'Ana Gómez', cal1: 40, cal2: 50, cal3: 45 },
  { nombre: 'Carlos López', cal1: 90, cal2: 85, cal3: 80 }
];

// 📌 Función para insertar datos quemados si la base de datos está vacía
const insertarDatosIniciales = async () => {
  const count = await Alumno.countDocuments(); // Verifica si ya existen datos
  if (count === 0) {
    const datosConCalculo = datosIniciales.map(alumno => ({
      ...alumno,
      calFinal: (alumno.cal1 * 0.2) + (alumno.cal2 * 0.3) + (alumno.cal3 * 0.5),
      observacion: ((alumno.cal1 * 0.2) + (alumno.cal2 * 0.3) + (alumno.cal3 * 0.5)) >= 60 ? 'Aprobado' : 'Reprobado'
    }));

    await Alumno.insertMany(datosConCalculo);
    console.log('✅ Datos iniciales insertados en MongoDB');
  } else {
    console.log('ℹ️ La base de datos ya tiene datos, no se insertaron nuevos registros.');
  }
};

// 📌 Llamar la función cuando la conexión a MongoDB se haya realizado
mongoose.connection.once('open', insertarDatosIniciales);

// 📌 Obtener todos los alumnos
app.get('/alumnos', async (req, res) => {
  try {
    const alumnos = await Alumno.find();
    res.json(alumnos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los alumnos' });
  }
});

// 📌 Agregar un nuevo alumno
app.post('/alumnos', async (req, res) => {
  try {
    const { nombre, cal1, cal2, cal3 } = req.body;
    const calFinal = (cal1 * 0.2) + (cal2 * 0.3) + (cal3 * 0.5);
    const observacion = calFinal >= 60 ? 'Aprobado' : 'Reprobado';

    const nuevoAlumno = new Alumno({ nombre, cal1, cal2, cal3, calFinal, observacion });
    await nuevoAlumno.save();

    res.status(201).json(nuevoAlumno);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar alumno' });
  }
});

// 📌 Obtener estadísticas
app.get('/estadisticas', async (req, res) => {
  try {
    const alumnos = await Alumno.find();
    const totalAprobados = alumnos.filter(a => a.observacion === 'Aprobado').length;
    const totalReprobados = alumnos.filter(a => a.observacion === 'Reprobado').length;
    res.json({ totalAprobados, totalReprobados });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// 📌 Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://127.0.0.1:${PORT}`);
});

module.exports = app;
