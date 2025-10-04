import os

import numpy as np
import pandas as pd

import joblib

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'Uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
MODEL_PATH = 'Random Forest Model.pkl'


# A simple route
@app.route('/')
def home():
    return "Ahoy! API is alive ⚡"


# Route to upload a file
@app.route('/predict', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file part in request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No file selected'}), 400

    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)

    data = pd.read_csv(file_path).drop('rowid', axis=1)
    model = joblib.load(MODEL_PATH)
    prediction = model.predict(data)
    return jsonify({'success': True, 'prediction': prediction.tolist()})


if __name__ == '__main__':
    app.run(debug=True)
