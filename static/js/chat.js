$(document).ready(function () {
    // Llamar al endpoint para obtener las conversaciones
    $.ajax({
        url: '/get_conversations', // Endpoint en Flask
        type: 'GET',
        success: function (data) {
            const sessionButtons = $('#session-buttons');
            const sessions = {};

            // Organizar los mensajes por sesión
            data.forEach(message => {
                const sessionId = message.sessionId;
                if (!sessions[sessionId]) {
                    sessions[sessionId] = { messages: [], content: message.content || "Sin título" };
                }
                sessions[sessionId].messages.push(message);
            });

            // Generar un botón para cada sesión
            Object.keys(sessions).forEach(sessionId => {
                const button = $(`
                    <button class="btn btn-primary btn-block mb-2 text-truncate" 
                            data-session-id="${sessionId}" 
                            title="${sessions[sessionId].content}">
                        ${sessions[sessionId].content}
                    </button>
                `);

                // Manejar el clic en cada botón
                button.on('click', function () {
                    const messages = sessions[sessionId].messages;
                    displayMessages(messages);
                });

                sessionButtons.append(button);
            });
        },
        error: function (xhr) {
            console.error('Error al obtener las conversaciones:', xhr.responseJSON?.error || 'Error desconocido.');
        }
    });

    // Función para mostrar los mensajes de una sesión seleccionada
    function displayMessages(messages) {
        const sessionContent = $('#session-content');
        sessionContent.empty(); // Limpiar el contenido existente

        messages.forEach(message => {
            const renderedMarkdown = marked.parse(message.content);
            const messageHtml = `
                <div class="card mb-3">
                    <div class="card-body">
                        <p><strong>Rol:</strong> ${message.role}</p>
                        <p><strong>Fecha:</strong> ${message.createdDate}</p>
                        <p><strong>Contenido:</strong> ${renderedMarkdown}</p>
                    </div>
                </div>
            `;
            sessionContent.append(messageHtml);
        });
    }
});
