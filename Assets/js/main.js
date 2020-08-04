import * as core from './core.js';


$(document).ready(function() {
    $('#mb-toggle').prop("checked", false);
    showTareas();

    // Nueva Tarea Img
    $('.sin-tareas').click(function() {
            toggleModal();
        })
        // REMOVER VALIDACION
    $('.ml-input,.ml-textarea').on('keyup', function() {
        let val = $(this).val();
        if (val != "") {
            if ($(this).is('input'))
                $(this).removeClass("invalid-input");
            else if ($(this).is('textarea'))
                $(this).removeClass("invalid-textarea");
            else if ($(this).is('select'))
                $(this).removeClass("invalid-select");
        }
    })

    // GUARDAR O MODIFICAR TAREA
    $('#btnModalSave').click(function(e) {
        let tarea = core.tarea;
        tarea.Titulo = $('#Titulo').val();
        tarea.Descripcion = $('#Descripcion').val();
        tarea.IsComplete = ($('#Estado').val() == "true" ? true : false);

        tarea.IdTarea = $('#IdTarea').val();
        if (validarCamposRequeridos()) {
            if (validarMaxCaracteres())
                if (tarea.IdTarea > 0)
                    updateTarea(tarea)
                else
                    insertTarea(tarea);
        } else
            alert("Favor llenar los datos requeridos");
        verifySelectedTask();
    })

    //NUEVA TAREA
    $('#btnNew,#mb-btn-new').click(function() {
            toggleModal();
        })
        // EDITAR TAREA
    $('#btnEdit,#mb-btn-edit').click(function() {

            let tareaHtml = $('.task-selected')[0];
            let id = $(tareaHtml).data('id');
            let tareas = core.getTareas();
            let tarea = tareas[id - 1];
            toggleModal(false);
            setDatosModal(tarea);

        })
        // Marcar Tareas como Completadas 
    $('#btnComplete,#mb-btn-complete').click(function() {
            let tareas = $('.task-selected');
            $.each(tareas, function(key, val) {
                let id = $(this).data("id");
                $('.task-icon', this).addClass('task-completed')
                $(this).removeClass('task-selected');
                updateEstadoTarea(id, true);
            })
        })
        // Marcar Tareas como Pendientes 
    $('#btnPending,#mb-btn-pending').click(function() {
            let tareas = $('.task-selected');
            $.each(tareas, function(key, val) {
                let id = $(this).data("id");
                $('.task-icon', this).removeClass('task-completed')
                $(this).removeClass('task-selected');
                updateEstadoTarea(id, false);
            })
        })
        // Eliminar Tareas
    $('#btnDelete,#mb-btn-delete').click(function() {
        let tareas = $('.task-selected');
        $.each(tareas, function(key, val) {
            let id = $(this).data("id");
            deleteTarea(id);
        })
    })
    $('#btnFilterAll').click(function() {
        showTareas();
    })
    $('#btnFilterCompleted').click(function() {
        showTareas(true)
    })
    $('#btnFilterPending').click(function() {
        showTareas(false);
    })


    $.each($('.mb-nav-item'), function(key, val) {
        $(this).click(function() {
            $('#mb-toggle').prop("checked", false);
        })
    })



});

function insertTarea(tarea) {
    core.setTarea(tarea);
    showTareas();
    toggleModal();
}

function updateTarea(tarea) {
    let tareas = core.getTareas();
    tareas[tarea.IdTarea - 1] = tarea;
    core.refreshTareas(tareas);
    showTareas();
    toggleModal();

}

function updateEstadoTarea(index, estado) {
    let tareas = core.getTareas();
    tareas[index - 1].IsComplete = estado;
    unselectTask(index);
    core.refreshTareas(tareas);
}

function deleteTarea(index) {
    let tareas = core.getTareas();
    tareas.pop(index - 1);
    core.refreshTareas(tareas);
    unselectTask(index);
    showTareas();

}





function showTareas(state) {
    $('#tasks').empty();
    let tareas = core.getTareas();

    if (typeof state != 'undefined')
        tareas = tareas.filter(function(tarea) {
            return tarea.IsComplete == state;
        });
    if (tareas.length > 0) {
        $('.sin-tareas').css("display", "none");
        $('#chk-tasks').removeAttr("disabled");
        $('.task-header .checkbox-label>.checkbox-custom').removeClass("disabled");
        for (let tarea of tareas) {
            appendTarea(tarea);
        }
    } else {
        $('.sin-tareas').css("display", "block");
        $('#chk-tasks').attr("disabled", "disabled");
        $('.task-header .checkbox-label>.checkbox-custom').addClass("disabled");
    }

    // CONTAR TAREAS SELECCIONADAS
    $('input[type=checkbox]').on('click change', function() {

        if (this.id == "chk-tasks")
            if ($(this).prop("checked"))
                changeSelectAllTask(true)
            else
                changeSelectAllTask(false)
        verifySelectedTask(this);

    })
    verifySelectedTask()
    let iconos = $('.task-icon');
    $.each(iconos, function(key, val) {
        $(this).on("click", function() {
            let id = $(val).parents(".task").data("id");
            let chk = $(this).siblings(`.checkbox-label`);
            unselectTask(id, $(':first-child', chk));
            let isComplete = false;
            if ($(val).hasClass('task-completed')) {
                isComplete = true
            }
            if (isComplete) {
                updateEstadoTarea(id, false);
                $(val).removeClass('task-completed')
            } else {
                updateEstadoTarea(id, true);
                $(val).addClass('task-completed')
            }

        })
    })
}


function appendTarea(tarea) {
    let taskHtml = $(`
    <li class="task" data-id="${tarea.IdTarea}">
    <label class="checkbox-label" >
        <input type="checkbox" id="chk-task-${tarea.IdTarea}" />
        <span class="checkbox-custom"></span>
    </label>
    <p class="task-title">${tarea.Titulo}</p>
    <div class="task-icon  ${tarea.IsComplete ? "task-completed":""}">
        <i class="far fa-check-circle icon fa-2x"></i>
    </div>
    <p class="task-description">${tarea.Descripcion}</p>
</li>
    `)
    $('#tasks').append(taskHtml)
    let titleHtml = $('.task-title', taskHtml);
    let descripcionHtml = $('.task-description', taskHtml);
    titleHtml.on("click", function() {
        $(descripcionHtml).slideToggle('slow');
    })

}

function validarCamposRequeridos() {
    let resp = true;
    let camposvalidar = $('#ModalComponent .requerido');
    $.each(camposvalidar, function(key, input) {
        let val = $(input).val();
        let id = $(input).attr("id");
        if (!val || val == "") {
            resp = false;
            if ($(this).is('input'))
                $(input).addClass("invalid-input");
            else if ($(this).is('textarea'))
                $(input).addClass("invalid-textarea");
            else if ($(this).is('select'))
                $(input).addClass("invalid-select");
        }
    })
    return resp
}

function validarMaxCaracteres() {
    let resp = true;
    let camposvalidar = $('#ModalComponent .valid-length');
    $.each(camposvalidar, function(key, input) {
        let maxLength = $(input).data("max-length");
        let val = $(input).val();
        let invalidMessage = $(input).siblings('.invalid-message');
        if (val.length >= maxLength) {
            $(invalidMessage).html('El titulo es demasiado largo, favor resumirlo');
            resp = false;
        } else
            $(invalidMessage).html('');
    });
    return resp;
}



function unselectTask(index, chk) {
    $(`#chk-task-${index}`).prop('checked', false);
    $('#chk-tasks').prop('checked', false);
    verifySelectedTask(chk)
}

function verifySelectedTask(chk) {
    let selected = $('input[type=checkbox]:checked:not(#chk-tasks,#mb-toggle)').length;
    let alltask = $('input[type=checkbox]:not(#chk-tasks,#mb-toggle)').length;
    if (alltask == selected)
        $('#chk-tasks').prop('checked', true);
    else
        $('#chk-tasks').prop('checked', false);
    if (selected > 1 || selected == 0) {
        $('#btnEdit').attr("disabled", "disabled").removeClass("btn-edit-hover");
        $('#mb-btn-edit').css("display", "none");
    } else {
        $('#btnEdit').removeAttr("disabled").addClass("btn-edit-hover");
        $('#mb-btn-edit').css("display", "flex")
    }


    if ($(chk).prop('checked'))
        $(chk).parents('.task').addClass('task-selected');
    else
        $(chk).parents('.task').removeClass("task-selected", 1000, "swing");
}

function changeSelectAllTask(state) {
    let tasks = $('input[type=checkbox]')
    $.each(tasks, function(key, val) {
        let id = $(val).attr("id");
        $(val).prop('checked', state);
        if (id != "chk-tasks")
            verifySelectedTask(val);
    })
}

function toggleModal(isNew = true) {
    if (!isNew)
        $('#ModalComponent-Title').html("Modificar Tarea")
    else
        $('#ModalComponent-Title').html("Nueva Tarea")
    $('#ModalComponent').modal('toggle');
    $('#IdTarea').val('');
    $('#Titulo').val('');
    $('#Descripcion').val('');
    $('#Estado').val('false');
}

function setDatosModal(tarea) {
    $('#IdTarea').val(tarea.IdTarea)
    $('#Titulo').val(tarea.Titulo);
    $('#Descripcion').val(tarea.Descripcion);
    $('#Estado').val(`${tarea.IsComplete}`);
}