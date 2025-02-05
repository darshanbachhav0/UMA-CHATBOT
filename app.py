from flask import Flask, render_template, jsonify, request
import requests
import os
import firebase_admin
from firebase_admin import credentials, auth

# Initialize Flask app
app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Replace with a secure key

# Initialize Firebase Admin SDK
cred = credentials.Certificate("firebase-adminsdk.json")  # Replace with your Firebase Admin SDK JSON file
firebase_admin.initialize_app(cred)

# Base URL for the external API
API_BASE_URL = "http://37.60.229.241:8085/service-uma"

def get_firebase_token():
    """Fetch the latest Postman token from Firebase Authentication."""
    try:
        # Fetch list of users (this assumes the token is stored in a custom claim or database)
        users = auth.list_users().iterate_all()
        for user in users:
            if 'customToken' in user.custom_claims:
                return user.custom_claims['customToken']
        return None
    except Exception as e:
        print(f"Error fetching Firebase token: {str(e)}")
        return None

def make_request(endpoint, student_code, elective_period):
    """Make a request to the external API with the Firebase token."""
    url = f"{API_BASE_URL}/{endpoint}"
    token = get_firebase_token()
    
    if not token:
        return {"error": "Failed to fetch Firebase token"}, 500

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
        print(f"Request to {url} with payload {payload} returned status {response.status_code}")
        response_data = response.json()

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
    return jsonify({"attendance_data": data.get("data", {})}), status_code

@app.route("/get-schedule", methods=["POST"])
def get_schedule():
    student_code = request.json.get("student_code")
    elective_period = request.json.get("elective_period")
    data, status_code = make_request("grupoa/course-schedules", student_code, elective_period)
    return jsonify({"schedule_data": data.get("data", [])}), status_code

@app.route("/get-grades", methods=["POST"])
def get_grades():
    student_code = request.json.get("student_code")
    elective_period = request.json.get("elective_period")
    data, status_code = make_request("grupoa/course-qualifications", student_code, elective_period)
    return jsonify({"grades_data": data.get("data", {})}), status_code

@app.route("/get-payments", methods=["POST"])
def get_payments():
    student_code = request.json.get("student_code")
    elective_period = request.json.get("elective_period")
    data, status_code = make_request("grupoa/payment", student_code, elective_period)
    return jsonify({"payments_data": data.get("data", [])}), status_code

@app.route("/get-response", methods=["POST"])
def get_response():
    user_message = request.json.get("message", "").lower()
    responses = {
        "attendance": "You can ask about your attendance records.",
        "schedule": "You can ask about your class schedule.",
        "grades": "You can ask about your grades.",
        "payments": "You can ask about your payments or fees."
    }
    for keyword, response in responses.items():
        if keyword in user_message:
            return jsonify({"response": response})
    return jsonify({"response": "I'm here to help. Ask about attendance, schedule, grades, or payments."})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
