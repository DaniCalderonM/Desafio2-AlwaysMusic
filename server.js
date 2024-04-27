// Conexion a base de datos
const pool = require('./conexion.js');
// manejo de errores
const manejoErrores = require('./manejoErrores.js');
// argv
const { funcion, rut, nombre, curso, nivel, tabla } = require('./manejoProcess.js');
// para habiltar el uso del archivo de ambiente .env
require('dotenv').config();
// console.log('tabla desde env: ',process.env.TABLA) // esto fue porq en algun momento no funciona pero ahora si, creo que estaba cargando (?)

//FUNCIONES

//Funcion para validar rut
const validarRut = (rut) => {
    const rutExpReg = /^\d{1,2}\.\d{3}\.\d{3}-(\d{1,2}|[K])$/
    return rutExpReg.test(rut);
}
//Funcion para consultar todos los estudiantes
const getEstudiantes = async () => {
    try {
        // Definición del objeto queryJson con el texto de la consulta y el modo de fila
        const queryJson = {
            rowMode: 'array', // Devuelve los resultados en formato de arreglo
            text: `SELECT * FROM ${tabla}`
        };

        // Ejecución de la consulta utilizando el objeto queryJson
        const res = await pool.query(queryJson);

        // Verificar si se obtuvieron resultados
        if (res.rowCount !== 0) {
            console.log("Registro actual de Estudiantes:", res.rows);
        } else {
            throw new Error("No hay registros de estudiantes");
        }
    } catch (error) {
        // Manejo general de errores
        manejoErrores(error, pool, tabla);
    }
}

// Funcion para consultar por rut
const consultaRut = async ({ rut }) => {
    try {
        // Verificar si se proporcionó el campo rut
        if (!rut) {
            throw new Error("Debe ingresar el campo rut");
        }

        // Validar el formato del rut
        if (!validarRut(rut)) {
            throw new Error("El rut ingresado no tiene el formato correcto, ejemplo: 11.111.111-1/-k");
        }

        // Definición del objeto queryJson con el texto de la consulta y los valores de los parámetros
        const queryJson = {
            text: 'SELECT * FROM estudiantes WHERE rut = $1', // Consulta parametrizada
            values: [rut] // Valor del parámetro rut
        };

        // Ejecución de la consulta utilizando el objeto queryJson
        const res = await pool.query(queryJson);

        // Verificar si se encontró algún estudiante con el rut especificado
        if (res.rows.length === 0) {
            throw new Error("El rut ingresado no existe");
        } else {
            console.log("Estudiante consultado: ", res.rows[0]);
        }
    } catch (error) {
        // Manejo general de errores
        manejoErrores(error, pool, tabla);
    }
}

// Funcion para agregar un nuevo estudiante
const nuevoEstudiante = async ({ rut, nombre, curso, nivel }) => {
    try {
        // Verificar si se proporcionaron todos los campos necesarios
        if (!rut || !nombre || !curso || !nivel) {
            throw new Error("Debe ingresar los campos rut, nombre, curso y nivel");
        }

        // Validar el formato del rut
        if (!validarRut(rut)) {
            throw new Error("El rut ingresado no tiene el formato correcto, ejemplo: 11.111.111-1/-k");
        }

        // Definición del objeto queryJson con el texto de la consulta y los valores de los parámetros
        const queryJson = {
            text: 'INSERT INTO estudiantes (rut, nombre, curso, nivel) VALUES ($1, $2, $3, $4) RETURNING *', // Consulta parametrizada
            values: [rut, nombre, curso, nivel] // Valores de los parámetros
        };

        // Ejecución de la consulta utilizando el objeto queryJson
        const res = await pool.query(queryJson);

        // Mensajes de éxito
        console.log(`Estudiante ${nombre} agregado con éxito`);
        console.log("Estudiante Agregado: ", res.rows[0]);
    } catch (error) {
        // Manejo general de errores
        manejoErrores(error, pool, tabla);
    }
}

// Funcion para editar un estudiante por su rut
const editarEstudiante = async ({ rut, nombre, curso, nivel }) => {
    try {
        // Verificar si se proporcionaron todos los campos necesarios
        if (!rut || !nombre || !curso || !nivel) {
            throw new Error("Debe ingresar los campos rut, nombre, curso y nivel");
        }

        // Validar el formato del rut
        if (!validarRut(rut)) {
            throw new Error("El rut ingresado no tiene el formato correcto, ejemplo: 11.111.111-1/-k");
        }

        // Definición del objeto queryJson con el texto de la consulta y los valores de los parámetros
        const queryJson = {
            text: 'UPDATE estudiantes SET nombre = $2, curso = $3, nivel = $4 WHERE rut = $1 RETURNING *', // Consulta parametrizada
            values: [rut, nombre, curso, nivel] // Valores de los parámetros
        };

        // Ejecución de la consulta utilizando el objeto queryJson
        const res = await pool.query(queryJson);

        // Verificar si se encontró algún estudiante con el rut especificado
        if (res.rowCount === 0) {
            throw new Error("El estudiante ingresado no existe");
        } else {
            // Mensajes de éxito
            console.log(`Estudiante ${nombre} editado con éxito`);
            console.log("Estudiante Editado: ", res.rows[0]);
        }
    } catch (error) {
        // Manejo general de errores
        manejoErrores(error, pool, tabla);
    }
}

// Funcion para eliminar un estudiante por su rut
const eliminarEstudiante = async ({ rut }) => {
    try {
        // Verificar si se proporcionó el campo rut
        if (!rut) {
            throw new Error("Debe ingresar el campo rut");
        }

        // Validar el formato del rut
        if (!validarRut(rut)) {
            throw new Error("El rut ingresado no tiene el formato correcto, ejemplo: 11.111.111-1/-k");
        }

        // Definición del objeto queryJson con el texto de la consulta y los valores de los parámetros
        const queryJson = {
            text: 'DELETE FROM estudiantes WHERE rut = $1 RETURNING *', // Consulta parametrizada
            values: [rut] // Valor del parámetro rut
        };

        // Ejecución de la consulta utilizando el objeto queryJson
        const res = await pool.query(queryJson);

        // Verificar si se eliminó algún estudiante con el rut especificado
        if (res.rowCount === 0) {
            throw new Error("El rut ingresado no existe");
        } else {
            console.log(`Registro de Estudiante con rut ${rut} eliminado con éxito`);
        }
    } catch (error) {
        // Manejo general de errores
        manejoErrores(error, pool, tabla);
    }
}

// Objeto funciones con propiedades asociadas a funciones asincronas
const funciones = {
    nuevo: nuevoEstudiante,
    rut: consultaRut,
    consulta: getEstudiantes,
    editar: editarEstudiante,
    eliminar: eliminarEstudiante
};

// Arreglo con todas las funciones validas declaradas en las keys de objeto funciones
const arregloFunciones = Object.keys(funciones);

// Funcion IIFE que recibe de la linea de comando y llama funciones asincronas
(async () => {
    // recibir funciones y campos de la linea de comando
    (arregloFunciones.includes(funcion) == true)
        ? await funciones[funcion]({ rut, nombre, curso, nivel })
        : console.log("La funcion ingresada " + funcion + " no es valida")
    pool.end()
})()

// instrucciones de uso:
// ingresar nuevo estudiante: node server nuevo 13.245.003-8 'Pedro Paramo' 'Biologia' 5
// consultar todos: node server consulta
// consultar por rut: node server rut 13.245.003-8
// editar estudiante por nombre: node server editar 13.245.003-8 'Pedro Paramo' 'Biologia II' 8
// eliminar estudiante por rut:  node server eliminar 13.245.003-8 (editado) 