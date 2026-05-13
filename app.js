let aulas = JSON.parse(localStorage.getItem('aulas')) || [];
let cursosAsignados = JSON.parse(localStorage.getItem('cursos')) || [];

function agregarAula() {
    const cap = parseInt(document.getElementById('aulaCapacidad').value);
    if (!cap || cap <= 0) return alert("Capacidad inválida");
    aulas.push({ id: aulas.length + 1, capacidad: cap });
    localStorage.setItem('aulas', JSON.stringify(aulas));
    actualizarVistaAulas();
}

function actualizarVistaAulas() {
    const lista = document.getElementById('listaAulas');
    if (lista) lista.innerHTML = aulas.map(a => `<li class="list-group-item">Aula ${a.id} - Capacidad: ${a.capacidad}</li>`).join('');
}

// LÓGICA DE PROGRAMACIÓN DINÁMICA
function verificarCompatibilidadPD(nuevoCurso, aulaId) {
    let cursosEnAula = cursosAsignados.filter(c => c.aulaId === aulaId);
    cursosEnAula.push(nuevoCurso);
    
    // Ordenar por tiempo de finalización (requisito para PD en intervalos)
    cursosEnAula.sort((a, b) => a.fin - b.fin);
    
    let n = cursosEnAula.length;
    let dp = new Array(n).fill(0);
    dp[0] = 1; // El primer curso siempre se puede tomar solo

    for (let i = 1; i < n; i++) {
        let tomarActual = 1;
        let ultimoValido = -1;
        
        // Buscar el último curso compatible usando los resultados de subproblemas previos (PD)
        for (let j = i - 1; j >= 0; j--) {
            if (cursosEnAula[j].fin <= cursosEnAula[i].inicio) {
                ultimoValido = j;
                break;
            }
        }
        
        if (ultimoValido !== -1) tomarActual += dp[ultimoValido];
        
        // El estado actual es el máximo entre tomar el curso o no tomarlo
        dp[i] = Math.max(tomarActual, dp[i - 1]);
    }
    
    // Si el valor máximo de la tabla DP es igual al total de cursos, no hay conflicto global
    return dp[n - 1] === n;
}

function asignarCurso() {
    const alumnos = parseInt(document.getElementById('cAlumnos').value);
    const inicio = parseInt(document.getElementById('cInicio').value);
    const fin = parseInt(document.getElementById('cFin').value);
    const consola = document.getElementById('mensajeConsola');

    if (isNaN(alumnos) || inicio >= fin) {
        consola.innerHTML = `<div class="alert alert-warning">Datos de tiempo incoherentes.</div>`;
        return;
    }

    let asignado = false;
    for (let aula of aulas) {
        if (alumnos <= aula.capacidad) {
            const cursoTemporal = { alumnos, inicio, fin };
            if (verificarCompatibilidadPD(cursoTemporal, aula.id)) {
                cursoTemporal.id = cursosAsignados.length + 1;
                cursoTemporal.aulaId = aula.id;
                cursosAsignados.push(cursoTemporal);
                localStorage.setItem('cursos', JSON.stringify(cursosAsignados));
                consola.innerHTML = `<div class="alert alert-success">✅ Asignado con éxito al Aula ${aula.id} vía PD.</div>`;
                asignado = true;
                break;
            }
        }
    }

    if (!asignado) {
        consola.innerHTML = `<div class="alert alert-danger"><strong>⚠️ Error de Superposición:</strong> Conflicto detectado. El sistema no se truncó, intenta otro horario.</div>`;
    }
}
// Función para eliminar un curso específico
function eliminarCurso(id) {
    // Confirmación visual antes de borrar
    if (confirm("¿Estás seguro de que deseas eliminar este curso?")) {
        // Filtrar el arreglo para quitar el curso con el ID proporcionado
        cursosAsignados = cursosAsignados.filter(c => c.id !== id);
        
        // Guardar la nueva lista en localStorage
        localStorage.setItem('cursos', JSON.stringify(cursosAsignados));
        
        // Si estamos en la página de horarios, recargamos la tabla
        if (typeof renderizarTabla === 'function') {
            renderizarTabla();
        } else {
            // Si estamos en el index, solo notificamos
            alert("Curso eliminado correctamente.");
        }
    }
}

actualizarVistaAulas();

