from flask import Flask, request, render_template, jsonify
import requests
import os
import json

app = Flask(__name__)

# Configuración de la API de Flowise
FLOWISE_API_URL = "http://localhost:3000/api/v1"
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
FLOWISE_API_TOKEN = "dJ0_aNPuS8kmnQYYHXymkZbTxCJHa8er8XTzaa1kgE0"


@app.route('/')
def index():
    """Carga la página principal."""
    return render_template('index.html')


@app.route('/invoice-validator')
def invoice_validator():
    """Renderiza la página de validación de facturas."""
    return render_template('invoice-validator.html')


@app.route('/conversations')
def conversations():
    """Renderiza la página de conversaciones."""
    return render_template('conversations.html')


@app.route('/execute_flow/', methods=['POST'])
def execute_flow():
    """Envía una pregunta a Flowise y retorna la respuesta."""
    payload = request.json
    if not payload or "question" not in payload:
        return jsonify({"error": "El cuerpo debe incluir un campo 'question'"}), 400

    url = f"{FLOWISE_API_URL}/prediction/c015d97b-7eba-43db-9408-c7fb42314cfd"
    headers = {"Authorization": f"Bearer {FLOWISE_API_TOKEN}"}

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500


@app.route('/upload', methods=['POST'])
def upload_file():
    """Sube un archivo y lo envía a Flowise."""
    if 'file' not in request.files or not request.files['file'].filename:
        return jsonify({'error': 'Archivo no seleccionado'}), 400

    file = request.files['file']
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)

    url = f"{FLOWISE_API_URL}/document-store/upsert/01f977c3-35a7-4602-93d3-6398d38d48de"
    headers = {"Authorization": f"Bearer {FLOWISE_API_TOKEN}"}
    docId = "7d94411e-4e44-40e6-a702-3baa992841dc"
    
    try:
        with open(file_path, 'rb') as f:
            form_data = {"files": (file.filename, f)}
            body_data = {
                "docId": docId,
                # override existing configuration
                # "loader": "",
                "splitter": json.dumps({"name":"recursiveCharacterTextSplitter","config":{"chunkSize":20000}})
                # "vectorStore": "",
                # "embedding": "",
                # "recordManager": "",
            }

            response = requests.post(url, headers=headers, files=form_data, data=body_data)
            response.raise_for_status()
        return jsonify({'message': 'File uploaded successfully'}), 200
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500


@app.route('/get_conversations', methods=['GET'])
def get_conversations():
    """Recupera los mensajes de una conversación específica."""
    url = f"{FLOWISE_API_URL}/chatmessage/c015d97b-7eba-43db-9408-c7fb42314cfd"
    headers = {"Authorization": f"Bearer {FLOWISE_API_TOKEN}"}

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
