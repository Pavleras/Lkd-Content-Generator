$(document).ready(function () {
    // Manejar el envío del formulario de chat
    $('#chatForm').on('submit', function (e) {
        e.preventDefault();

        const message = $('#message').val(); // Mensaje del usuario

        if (!message) {
            alert('Escribe un mensaje.');
            return;
        }

        // Hacer la solicitud al backend
        $.ajax({
            url: `/execute_flow/`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ question: message }),
            success: function (response) {
                console.log('Respuesta del servidor:', response); // Depuración
                // Asegúrate de acceder al campo "text" en la respuesta
                if (response.text) {
                    const renderedMarkdown = marked.parse(response.text);
                    $('#chatbox').append(`<p><b>Tú:</b> ${message}</p>`);
                    $('#chatbox').append(`<div><b>Flowise:</b> <div>${renderedMarkdown}</div></div>`);
                        // Mostrar el indicador de carga
                    $('#loading').removeClass('d-none');
                    $('#response').addClass('d-none').text('');
                } else {
                    $('#chatbox').append(`<p><b>Error:</b> La respuesta no contiene texto válido.</p>`);
                }
                $('#message').val(''); // Limpiar el campo de entrada
            },
            error: function (xhr) {
                $('#loading').addClass('d-none'); // Ocultar el indicador de carga
                $('#response').removeClass('d-none')
                              .removeClass('alert-success')
                              .addClass('alert-danger')
                              .text(xhr.responseJSON?.error || 'Error desconocido.');
                alert('Error al enviar el mensaje: ' + (xhr.responseJSON?.error || 'Error desconocido'));
            }
        });
    });
});
