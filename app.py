from flask import Flask, render_template, jsonify, request
import requests
import os
import firebase_admin
from firebase_admin import credentials, auth

# Initialize Flask app
app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Replace with a secure key

# Initialize Firebase Admin SDK
cred = credentials.Certificate("firebase-adminsdk.json")
firebase_admin.initialize_app(cred)

# Base URL for the external API
API_BASE_URL = "http://37.60.229.241:8085/service-uma"

# Function to get Firebase Auth Token
def get_firebase_token():
    """Generates and returns a fresh Firebase authentication token."""
    try:
        custom_token = auth.create_custom_token("your-service-user")
        return custom_token.decode("utf-8")
    except Exception as e:
        print(f"Error generating Firebase token: {e}")
        return None

# Function to make API requests with authentication
def make_request(endpoint, student_code, elective_period):
    """Makes an authenticated request to the external API."""
    auth_token = get_firebase_token()
    
    if not auth_token:
        return {"error": "Failed to obtain authentication token"}, 500
    
    url = f"{API_BASE_URL}/{endpoint}"
    headers = {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }
    payload = {
        "code": student_code,
        "period": elective_period
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        print(f"Request to {url} with payload {payload} returned status {response.status_code}")

        if response.status_code == 200:
            return response.json(), 200
        elif response.status_code == 401:
            return {"error": "Unauthorized access. Please re-authenticate."}, 401
        elif response.status_code == 404:
            return {"error": f"No data found for {endpoint} with the given code and period."}, 404
        else:
            return {"error": f"Failed to retrieve {endpoint} data"}, response.status_code
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return {"error": "An unexpected error occurred."}, 500

# API Endpoints
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/get-auth-token", methods=["GET"])
def get_auth_token():
    """Returns a fresh Firebase auth token."""
    token = get_firebase_token()
    if not token:
        return jsonify({"error": "Failed to generate token"}), 500
    return jsonify({"token": token})

@app.route("/get-attendance", methods=["POST"])
def get_attendance():
    student_code = request.json.get("student_code")
    elective_period = request.json.get("elective_period")
    data, status_code = make_request("grupoa/attendance", student_code, elective_period)
    return jsonify(data), status_code

@app.route("/get-schedule", methods=["POST"])
def get_schedule():
    student_code = request.json.get("student_code")
    elective_period = request.json.get("elective_period")
    data, status_code = make_request("grupoa/course-schedules", student_code, elective_period)
    return jsonify(data), status_code

@app.route("/get-grades", methods=["POST"])
def get_grades():
    student_code = request.json.get("student_code")
    elective_period = request.json.get("elective_period")
    data, status_code = make_request("grupoa/course-qualifications", student_code, elective_period)
    return jsonify(data), status_code

@app.route("/get-payments", methods=["POST"])
def get_payments():
    student_code = request.json.get("student_code")
    elective_period = request.json.get("elective_period")
    data, status_code = make_request("grupoa/payment", student_code, elective_period)
    return jsonify(data), status_code

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
