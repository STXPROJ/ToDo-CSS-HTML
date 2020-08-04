function getTareas() {
    let tareas = JSON.parse(localStorage.getItem("tareas"));
    if (!tareas) {
        tareas = [];
        localStorage.setItem("tareas", JSON.stringify(tareas));
    }
    return tareas;
}

function setTarea(tarea) {
    let tareas = getTareas();
    tareas.push(tarea);
    var indexTarea = tareas.indexOf(tarea);
    tareas[indexTarea].IdTarea = indexTarea + 1;
    localStorage.setItem("tareas", JSON.stringify(tareas));
}

function refreshTareas(tareas) {
    localStorage.setItem("tareas", JSON.stringify(tareas));
}



let tarea = {
    IdTarea: 0,
    Titulo: "",
    Descripcion: "",
    IsComplete: false,
    Fecha: new Date()
};

export { getTareas, setTarea, tarea, refreshTareas }