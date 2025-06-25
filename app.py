"""
Flask application that provides a translation API using OpenAI's GPT model.
This backend is designed for a healthcare translator web application.
"""

from flask import Flask, request, render_template, jsonify
from flask_cors import CORS
from utils.translate import translate_text

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Allow cross-origin requests for frontend JS integration

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/translate', methods=['POST'])
def translate():
    data = request.get_json()
    text = data.get('text')
    target_lang = data.get('target_language')

    if not text or not target_lang:
        return jsonify({'error': 'Missing "text" or "target_language".'}), 400

    try:
        translated = translate_text(text, target_lang)
        return jsonify({'translated': translated})
    except Exception as e:
        return jsonify({'error': f'Translation failed: {str(e)}'}), 500
    
if __name__ == "__main__":
    app.run(debug=True)
