import os
import joblib

import numpy as np
import pandas as pd

from flask import Flask, jsonify, request
from flask_cors import CORS

from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

from xgboost import XGBClassifier
from ModelPipeline import create_pipeline

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'Uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
MODEL_PATH = 'Trained Models/Random Forest Model.joblib'


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
    return jsonify({'success': True, 'predictions': prediction.tolist()})


@app.route('/tweak', methods=['POST'])
def hyper_parameter_tweaking():
    try:
        n_estimators = request.args.get('n_estimators')
        learning_rate = request.args.get('learning_rate')
        max_depth = request.args.get('max_depth')
        min_child_weight = request.args.get('min_child_weight')
        subsample = request.args.get('subsample')
        colsample_bytree = request.args.get('colsample_bytree')
    except KeyError:
        return jsonify({'success': False, 'message': 'One of the parameters is missing'}), 400

    if 'file' in request.files:
        file = request.files['file']
        if file.filename != '':
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
            file.save(file_path)
            new_data = pd.read_csv(file_path).drop('rowid', axis=1, errors='ignore')
            shared_data = pd.read_csv('Shared Data.csv').drop('rowid', axis=1, errors='ignore')
            if new_data.columns != shared_data.columns:
                return jsonify({'success': False, 'message': 'New Data Cols does not Match Requested Format'}), 400
            if new_data.dtypes != shared_data.dtypes:
                return jsonify({'success': False, 'message': 'New Data Types does not Match Requested Format'}), 400

            shared_data = pd.concat([new_data, shared_data], )
            shared_data.to_csv('Shared Data.csv', index=False)

    data = pd.read_csv('Shared Data.csv').drop('rowid', axis=1, errors='ignore')
    X = data.drop('koi_disposition', axis=1)
    y = data['koi_disposition']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    new_model = XGBClassifier(n_estimators=n_estimators,
                              learning_rate=learning_rate,
                              max_depth=max_depth,
                              min_child_weight=min_child_weight,
                              subsample=subsample,
                              colsample_bytree=colsample_bytree, )
    new_model_pipeline = create_pipeline(new_model)
    new_model_pipeline.fit(X_train, y_train)

    prediction = new_model_pipeline.predict(X_test)
    return jsonify({'success': True,
                    'accuracy_score': accuracy_score(y_test, prediction),
                    'confusion_matrix': confusion_matrix(y_test, prediction)})


@app.route('/get_header_info', methods=['GET'])
def send_header_info():
    return jsonify({'success': True, 'file_count': len(os.listdir(UPLOAD_FOLDER))})


if __name__ == '__main__':
    app.run(debug=True)
