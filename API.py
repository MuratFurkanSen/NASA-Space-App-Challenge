from flask import Flask, jsonify, request

app = Flask(__name__)

# A simple route
@app.route('/')
def home():
    return "Ahoy! API is alive ⚡"

# Example GET endpoint
@app.route('/greet/<name>', methods=['GET'])
def greet(name):
    return jsonify({"message": f"Hello, {name}!"})

# Example POST endpoint
@app.route('/echo', methods=['POST'])
def echo():
    data = request.json  # expects JSON
    return jsonify({"you_sent": data})

if __name__ == '__main__':
    app.run(debug=True)
