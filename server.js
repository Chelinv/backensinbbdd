const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Datos en memoria (se perderán al reiniciar el servidor)
let alumnos = [
  { nombre: 'Juan Pérez', cal1: 80, cal2: 70, cal3: 90 },
  { nombre: 'Ana Gómez', cal1: 40, cal2: 50, cal3: 45 },
  { nombre: 'Carlos López', cal1: 90, cal2: 85, cal3: 80 }
];

// Calcular calificaciones finales
alumnos = alumnos.map(alumno => ({
  ...alumno,
  calFinal: (alumno.cal1 * 0.2) + (alumno.cal2 * 0.3) + (alumno.cal3 * 0.5),
  observacion: ((alumno.cal1 * 0.2) + (alumno.cal2 * 0.3) + (alumno.cal3 * 0.5)) >= 60 ? 'Aprobado' : 'Reprobado'
}));

// Obtener todos los alumnos
app.get('/alumnos', (req, res) => {
  res.json(alumnos);
});

// Agregar un nuevo alumno
app.post('/alumnos', (req, res) => {
  const { nombre, cal1, cal2, cal3 } = req.body;
  const calFinal = (cal1 * 0.2) + (cal2 * 0.3) + (cal3 * 0.5);
  const observacion = calFinal >= 60 ? 'Aprobado' : 'Reprobado';

  const nuevoAlumno = { nombre, cal1, cal2, cal3, calFinal, observacion };
  alumnos.push(nuevoAlumno);
  res.status(201).json(nuevoAlumno);
});

// Obtener estadísticas
app.get('/estadisticas', (req, res) => {
  const totalAprobados = alumnos.filter(a => a.observacion === 'Aprobado').length;
  const totalReprobados = alumnos.filter(a => a.observacion === 'Reprobado').length;
  res.json({ totalAprobados, totalReprobados });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://127.0.0.1:${PORT}`);
});

module.exports = app;
