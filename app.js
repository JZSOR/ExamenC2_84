const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

// Configurar el motor de vistas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para parsear datos del formulario
app.use(bodyParser.urlencoded({ extended: true }));

// Función para cargar el archivo JSON con los alumnos
function loadAlumnos() {
    const data = fs.readFileSync(path.join(__dirname, 'alumnos.json'), 'utf8');
    return JSON.parse(data);
}

// Ruta principal: formulario para seleccionar filtros y tipo de vista
app.get('/', (req, res) => {
    res.render('index');
});

// Ruta para procesar el formulario y filtrar los datos
app.post('/filtrar', (req, res) => {
    const { nivel, turno, vista } = req.body;
    let alumnos = loadAlumnos();

    // Filtrar por nivel si no se seleccionó "todos"
    if (nivel !== 'todos') {
        alumnos = alumnos.filter(alumno => {
            if (nivel === 'primaria') return alumno.nivel === 1;
            if (nivel === 'secundaria') return alumno.nivel === 2;
            if (nivel === 'preparatoria') return alumno.nivel === 3;
        });
    }

    // Filtrar por turno si no se seleccionó "todos"
    if (turno !== 'todos') {
        alumnos = alumnos.filter(alumno => {
            if (turno === 'matutino') return alumno.turno === 1;
            if (turno === 'vespertino') return alumno.turno === 2;
        });
    }

    // Renderizar la vista solicitada
    if (vista === 'detalle') {
        res.render('detalle', { alumnos });
    } else if (vista === 'resumen') {
        const total = alumnos.length;
        const promedio = total > 0 ? alumnos.reduce((sum, alumno) => sum + alumno.calificacion, 0) / total : 0;
        const menores = alumnos.filter(alumno => alumno.promedio <= 7).length;
        const mayores = alumnos.filter(alumno => alumno.promedio >= 7).length;
        res.render('resumen', { total, promedio, menores, mayores });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
