$(document).ready(function () {
    $('#uploadForm').on('submit', function (e) {
        e.preventDefault();

        const fileInput = $('#fileInput')[0].files[0];
        if (!fileInput) {
            $('#uploadStatus').html('<div class="alert alert-danger">Por favor, selecciona un archivo.</div>');
            return;
        }

        const formData = new FormData();
        formData.append('file', fileInput);

        $.ajax({
            url: '/upload',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                $('#uploadStatus').html(`<div class="alert alert-success">${response.message}</div>`);

                // Ocultar el mensaje después de 3 segundos
                setTimeout(function () {
                    $('#uploadStatus').html('');
                }, 3000);
            },
            error: function (xhr) {
                const errorMessage = xhr.responseJSON?.error || 'Error desconocido al subir el archivo.';
                $('#uploadStatus').html(`<div class="alert alert-danger">${errorMessage}</div>`);
            }
        });
    });
});
