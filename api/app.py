from flask import Flask, request, jsonify
from flask_cors import CORS
import nbformat
from nbconvert import PythonExporter
import pandas as pd
import os
import numpy as np

app = Flask(__name__)
CORS(app)

# Load all CSV files
DATA_DIR = os.path.dirname(os.path.abspath(__file__))

def load_dataframes():
    dfs = {}
    csv_files = {
        'description': 'description.csv',
        'diets': 'diets.csv',
        'medical_data': 'medical data.csv',
        'medications': 'medications.csv',
        'precautions': 'precautions_df.csv',
        'symptom_severity': 'Symptom-severity.csv',
        'symptoms': 'symtoms_df.csv',
        'training': 'Training.csv',
        'workout': 'workout_df.csv'
    }
    
    for key, filename in csv_files.items():
        try:
            file_path = os.path.join(DATA_DIR, filename)
            if os.path.exists(file_path):
                dfs[key] = pd.read_csv(file_path)
                print(f"Loaded {filename}")
            else:
                print(f"File not found: {filename}")
        except Exception as e:
            print(f"Error loading {filename}: {str(e)}")
    
    return dfs

def get_disease_info(disease_name):
    """Get all information related to a disease"""
    try:
        # Get disease description
        description_row = dataframes['description'][dataframes['description']['Disease'] == disease_name]
        description = description_row['Description'].iloc[0] if not description_row.empty else "Description not available"

        # Get precautions
        precautions_row = dataframes['precautions'][dataframes['precautions']['Disease'] == disease_name]
        precautions = []
        if not precautions_row.empty:
            for i in range(1, 5):
                precaution = precautions_row[f'Precaution_{i}'].iloc[0]
                if pd.notna(precaution) and precaution.strip():
                    precautions.append(precaution)

        # Get medications
        medications_row = dataframes['medications'][dataframes['medications']['Disease'] == disease_name]
        medications = []
        if not medications_row.empty:
            for i in range(1, 6):  # Assuming up to 5 medications
                col_name = f'Medication_{i}'
                if col_name in medications_row.columns:
                    medication = medications_row[col_name].iloc[0]
                    if pd.notna(medication) and medication.strip():
                        medications.append(medication)

        # Get diet recommendations
        diet_row = dataframes['diets'][dataframes['diets']['Disease'] == disease_name]
        diet = []
        if not diet_row.empty:
            for i in range(1, 6):  # Assuming up to 5 diet recommendations
                col_name = f'Diet_{i}'
                if col_name in diet_row.columns:
                    diet_rec = diet_row[col_name].iloc[0]
                    if pd.notna(diet_rec) and diet_rec.strip():
                        diet.append(diet_rec)

        # Get workout recommendations
        workout_row = dataframes['workout'][dataframes['workout']['Disease'] == disease_name]
        workouts = []
        if not workout_row.empty:
            for i in range(1, 6):  # Assuming up to 5 workout recommendations
                col_name = f'Workout_{i}'
                if col_name in workout_row.columns:
                    workout = workout_row[col_name].iloc[0]
                    if pd.notna(workout) and workout.strip():
                        workouts.append(workout)

        return {
            'description': description,
            'precautions': precautions,
            'medications': medications,
            'diet': diet,
            'workouts': workouts
        }
    except Exception as e:
        print(f"Error getting disease info: {str(e)}")
        return None

def predict_disease(symptoms_list):
    """Predict disease based on symptoms"""
    try:
        # Get all symptoms from the training data
        all_symptoms = dataframes['symptoms']['Symptom'].unique()
        
        # Create input vector (0 for absent, 1 for present symptoms)
        input_vector = np.zeros(len(all_symptoms))
        for symptom in symptoms_list:
            if symptom in all_symptoms:
                idx = np.where(all_symptoms == symptom)[0][0]
                input_vector[idx] = 1
        
        # For now, return a sample disease - replace this with your actual model prediction
        # You'll need to integrate your model's prediction logic here
        sample_diseases = dataframes['description']['Disease'].unique()
        predicted_disease = np.random.choice(sample_diseases)
        
        return predicted_disease
    except Exception as e:
        print(f"Error in disease prediction: {str(e)}")
        return None

# Load data on startup
try:
    print("Loading dataframes...")
    dataframes = load_dataframes()
    print("Setup complete!")
except Exception as e:
    print(f"Error during setup: {str(e)}")
    dataframes = {}

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        symptoms = data.get('input', '').split(',')
        symptoms = [s.strip() for s in symptoms]
        
        # Predict disease based on symptoms
        predicted_disease = predict_disease(symptoms)
        if not predicted_disease:
            return jsonify({
                'status': 'error',
                'error': 'Could not predict disease from given symptoms'
            }), 400
        
        # Get detailed information about the predicted disease
        disease_info = get_disease_info(predicted_disease)
        if not disease_info:
            return jsonify({
                'status': 'error',
                'error': 'Could not find information for predicted disease'
            }), 400
        
        result = {
            'disease': predicted_disease,
            'description': disease_info['description'],
            'precautions': disease_info['precautions'],
            'medications': disease_info['medications'],
            'diet': disease_info['diet'],
            'workouts': disease_info['workouts']
        }
        
        return jsonify({
            'status': 'success',
            'result': result
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500

@app.route('/api/data_info', methods=['GET'])
def get_data_info():
    try:
        info = {}
        for name, df in dataframes.items():
            info[name] = {
                'rows': len(df),
                'columns': list(df.columns)
            }
        
        return jsonify({
            'status': 'success',
            'data_info': info
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)