from flask import Flask, render_template, jsonify, request
import requests
import os
import firebase_admin
from firebase_admin import credentials, db
import json

app = Flask(__name__)


# Load Firebase credentials from environment variable
firebase_config_json = os.environ.get('FIREBASE_CONFIG')  # Get JSON from environment variable

if firebase_config_json:
    firebase_config = json.loads(firebase_config_json)  # Convert JSON string to dictionary
    cred = credentials.Certificate(firebase_config)
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://uma-erp-default-rtdb.firebaseio.com/'
    })
else:
    raise ValueError("FIREBASE_CONFIG environment variable is missing!")

# Global variable to store the token
firebase_token = None

def update_firebase_token(event):
    """Update the global token variable whenever the Firebase token changes."""
    global firebase_token
    firebase_token = event.data  # Automatically updates when token changes
    print(f"Updated Firebase Token: {firebase_token}")

# Attach a listener to Firebase to monitor token changes
token_ref = db.reference("my/token")
token_ref.listen(update_firebase_token)

def make_request(endpoint, student_code, elective_period):
    """Make requests to external API using the latest token"""
    global firebase_token
    if not firebase_token:
        return {"error": "Authentication token not available"}, 401

    url = f"http://37.60.229.241:8085/service-uma/{endpoint}"
    headers = {
        "Authorization": f"Bearer {firebase_token}",
        "Content-Type": "application/json"
    }
    payload = {
        "code": student_code,
        "period": elective_period
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response_data = response.json()

        if response.status_code == 200:
            return response_data, 200
        elif response.status_code == 401:
            return {"error": "Unauthorized access. Please re-authenticate."}, 401
        elif response.status_code == 404:
            return {"error": f"No data found for {endpoint} with the given code and period."}, 404
        else:
            return {"error": f"Failed to retrieve {endpoint} data", "details": response_data}, response.status_code
    except Exception as e:
        return {"error": "An unexpected error occurred.", "details": str(e)}, 500

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/get-attendance", methods=["POST"])
def get_attendance():
    student_code = request.json.get("student_code")
    elective_period = request.json.get("elective_period")
    data, status_code = make_request("grupoa/attendance", student_code, elective_period)
    return jsonify({"attendance_data": data.get("data", {})}) if status_code == 200 else jsonify(data), status_code

@app.route("/get-schedule", methods=["POST"])
def get_schedule():
    student_code = request.json.get("student_code")
    elective_period = request.json.get("elective_period")
    data, status_code = make_request("grupoa/course-schedules", student_code, elective_period)
    return jsonify({"schedule_data": data.get("data", [])}) if status_code == 200 else jsonify(data), status_code

@app.route("/get-grades", methods=["POST"])
def get_grades():
    student_code = request.json.get("student_code")
    elective_period = request.json.get("elective_period")
    data, status_code = make_request("grupoa/course-qualifications", student_code, elective_period)
    return jsonify({"grades_data": data.get("data", {})}) if status_code == 200 else jsonify(data), status_code

@app.route("/get-payments", methods=["POST"])
def get_payments():
    student_code = request.json.get("student_code")
    elective_period = request.json.get("elective_period")
    data, status_code = make_request("grupoa/payment", student_code, elective_period)
    return jsonify({"payments_data": data.get("data", [])}) if status_code == 200 else jsonify(data), status_code

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
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
