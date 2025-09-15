#!/usr/bin/env python3
"""
Simple test server to verify Flask setup
"""

from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "success": True,
        "status": "healthy",
        "message": "Test server is running"
    }), 200

@app.route('/test', methods=['GET'])
def test_endpoint():
    """Test endpoint"""
    return jsonify({
        "success": True,
        "message": "Test endpoint working"
    }), 200

if __name__ == '__main__':
    print("Starting test server on port 5004...")
    app.run(host='0.0.0.0', port=57079, debug=False)
