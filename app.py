from flask import Flask, render_template, jsonify, request
import requests
import os
import firebase_admin
from firebase_admin import credentials, db

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Replace with a secure key

# Initialize Firebase Admin SDK
cred = credentials.Certificate("firebase-admin-sdk.json")  # Place your Firebase JSON key file here
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://uma-erp-default-rtdb.firebaseio.com/'  # Your Firebase Realtime Database URL
})

# Base URL for the external API
API_BASE_URL = "http://37.60.229.241:8085/service-uma"

def get_firebase_token():
    """Fetch the latest token from Firebase Realtime Database"""
    try:
        ref = db.reference("my/token")  # Adjusted to match the database structure in your screenshot
        token = ref.get()
        if token:
            return token
        else:
            print("No token found in Firebase.")
            return None
    except Exception as e:
        print(f"Error fetching token from Firebase: {str(e)}")
        return None

def make_request(endpoint, student_code, elective_period):
    """Make requests to external API using the latest token"""
    url = f"{API_BASE_URL}/{endpoint}"
    token = get_firebase_token()  # Fetch the latest token dynamically

    if not token:
        return {"error": "Authentication token not available"}, 401

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    payload = {
        "code": student_code,
        "period": elective_period
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response_data = response.json()  # Attempt to parse JSON response

        if response.status_code == 200:
            return response_data, 200
        elif response.status_code == 401:
            return {"error": "Unauthorized access. Please re-authenticate."}, 401
        elif response.status_code == 404:
            return {"error": f"No data found for {endpoint} with the given code and period."}, 404
        else:
            return {"error": f"Failed to retrieve {endpoint} data", "details": response_data}, response.status_code
    except ValueError:
        return {"error": "Invalid response format from the API"}, 500
    except Exception as e:
        return {"error": "An unexpected error occurred."}, 500

@app.route("/")
def home():
    return render_template("index.html")

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

@app.route("/get-response", methods=["POST"])
def get_response():
    user_message = request.json.get("message", "").lower()
    response = "I'm here to help with questions about your attendance, schedule, grades, and payments. Please ask specifically about one of these."

    if "attendance" in user_message:
        response = "You can ask about your attendance records."
    elif "schedule" in user_message:
        response = "You can ask about your class schedule."
    elif "grades" in user_message or "qualification" in user_message:
        response = "You can ask about your grades."
    elif "payments" in user_message or "fee" in user_message:
        response = "You can ask about your payments or fees."

    return jsonify({"response": response})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Use PORT from environment variable or default to 5000
    app.run(host="0.0.0.0", port=port, debug=True)
