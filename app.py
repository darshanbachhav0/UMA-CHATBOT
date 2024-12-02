# from flask import Flask, render_template, jsonify, request
# import requests

# app = Flask(__name__)
# app.secret_key = 'your_secret_key'  # Replace with a secure key

# # Base URL for the external API
# API_BASE_URL = "http://37.60.229.241:8085/service-uma"
# AUTH_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vMzcuNjAuMjI5LjI0MTo4MDg1L3NlcnZpY2UtdW1hL2xvZ2luIiwiaWF0IjoxNzMyNDIzOTczLCJleHAiOjE3MzI0Mjc1NzMsIm5iZiI6MTczMjQyMzk3MywianRpIjoiVzJTcXU2TTRIcXNyWlBidSIsInN1YiI6IjIiLCJwcnYiOiIyM2JkNWM4OTQ5ZjYwMGFkYjM5ZTcwMWM0MDA4NzJkYjdhNTk3NmY3In0.MOwjkZ-P_UKaTeNEKa6o0RwaOf5TJgx2Z9qzzURYDPw"

# def make_request(endpoint, student_code, elective_period):
#     url = f"{API_BASE_URL}/{endpoint}"
#     headers = {
#         "Authorization": f"Bearer {AUTH_TOKEN}",
#         "Content-Type": "application/json"
#     }
#     payload = {
#         "code": student_code,
#         "period": elective_period
#     }

#     response = requests.post(url, headers=headers, json=payload)
#     print(f"Request to {url} with payload {payload} returned status {response.status_code}")
    
#     try:
#         response_data = response.json()  # Attempt to parse JSON response
#     except ValueError:
#         response_data = {"error": "Invalid response format"}
#         print("Error: Invalid response format")
#         return response_data, response.status_code
    
#     print("Response Data:", response_data)  # Log the parsed response data or error

#     if response.status_code == 200:
#         return response_data, 200
#     elif response.status_code == 401:
#         return {"error": "Unauthorized access. Please re-authenticate."}, 401
#     elif response.status_code == 404:
#         return {"error": f"No data found for {endpoint} with the given code and period."}, 404
#     else:
#         return {"error": f"Failed to retrieve {endpoint} data", "details": response_data}, response.status_code

# @app.route("/")
# def home():
#     return render_template("index.html")

# @app.route("/get-attendance", methods=["POST"])
# def get_attendance():
#     student_code = request.json.get("student_code")
#     elective_period = request.json.get("elective_period")

#     data, status_code = make_request("grupoa/attendance", student_code, elective_period)
#     if status_code == 200:
#         return jsonify({"attendance_data": data.get("data", {})})
#     return jsonify(data), status_code

# @app.route("/get-schedule", methods=["POST"])
# def get_schedule():
#     student_code = request.json.get("student_code")
#     elective_period = request.json.get("elective_period")

#     data, status_code = make_request("grupoa/course-schedules", student_code, elective_period)
#     if status_code == 200:
#         return jsonify({"schedule_data": data.get("data", [])})
#     return jsonify(data), status_code

# @app.route("/get-grades", methods=["POST"])
# def get_grades():
#     student_code = request.json.get("student_code")
#     elective_period = request.json.get("elective_period")

#     data, status_code = make_request("grupoa/course-qualifications", student_code, elective_period)
#     if status_code == 200:
#         return jsonify({"grades_data": data.get("data", {})})
#     return jsonify(data), status_code

# @app.route("/get-payments", methods=["POST"])
# def get_payments():
#     student_code = request.json.get("student_code")
#     elective_period = request.json.get("elective_period")

#     data, status_code = make_request("grupoa/payment", student_code, elective_period)
#     if status_code == 200:
#         return jsonify({"payments_data": data.get("data", [])})
#     return jsonify(data), status_code

# @app.route("/get-response", methods=["POST"])
# def get_response():
#     user_message = request.json.get("message").lower()
#     response = "I'm here to help with questions about your attendance, schedule, grades, and payments. Please ask specifically about one of these."

#     if "attendance" in user_message:
#         response = "You can ask about your attendance records."
#     elif "schedule" in user_message:
#         response = "You can ask about your class schedule."
#     elif "grades" in user_message or "qualification" in user_message:
#         response = "You can ask about your grades."
#     elif "payments" in user_message or "fee" in user_message:
#         response = "You can ask about your payments or fees."

#     return jsonify({"response": response})

# if __name__ == "__main__":
#     app.run(debug=True)



















from flask import Flask, render_template, jsonify, request
import requests
import os

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Replace with a secure key

# Base URL for the external API
API_BASE_URL = "http://37.60.229.241:8085/service-uma"
AUTH_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vMzcuNjAuMjI5LjI0MTo4MDg1L3NlcnZpY2UtdW1hL2xvZ2luIiwiaWF0IjoxNzMzMTcyMzk1LCJleHAiOjE3MzMxNzU5OTUsIm5iZiI6MTczMzE3MjM5NSwianRpIjoiOFg5VVFPSXc4QWtTcWpGSSIsInN1YiI6IjIiLCJwcnYiOiIyM2JkNWM4OTQ5ZjYwMGFkYjM5ZTcwMWM0MDA4NzJkYjdhNTk3NmY3In0.WbYRezk-GP90Y7l13LmAB0YQrEpTvgmQmxXvBGLzQew"

# Utility function to make requests to the external API
def make_request(endpoint, student_code, elective_period):
    url = f"{API_BASE_URL}/{endpoint}"
    headers = {
        "Authorization": f"Bearer {AUTH_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "code": student_code,
        "period": elective_period
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        print(f"Request to {url} with payload {payload} returned status {response.status_code}")
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
        print("Error: Response was not valid JSON")
        return {"error": "Invalid response format from the API"}, 500
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return {"error": "An unexpected error occurred."}, 500

# Routes for the Flask app
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/get-attendance", methods=["POST"])
def get_attendance():
    student_code = request.json.get("student_code")
    elective_period = request.json.get("elective_period")

    data, status_code = make_request("grupoa/attendance", student_code, elective_period)
    if status_code == 200:
        return jsonify({"attendance_data": data.get("data", {})})
    return jsonify(data), status_code

@app.route("/get-schedule", methods=["POST"])
def get_schedule():
    student_code = request.json.get("student_code")
    elective_period = request.json.get("elective_period")

    data, status_code = make_request("grupoa/course-schedules", student_code, elective_period)
    if status_code == 200:
        return jsonify({"schedule_data": data.get("data", [])})
    return jsonify(data), status_code

@app.route("/get-grades", methods=["POST"])
def get_grades():
    student_code = request.json.get("student_code")
    elective_period = request.json.get("elective_period")

    data, status_code = make_request("grupoa/course-qualifications", student_code, elective_period)
    if status_code == 200:
        grades_data = data.get("data", {})
        return jsonify({"grades_data": grades_data})
    return jsonify(data), status_code

@app.route("/get-payments", methods=["POST"])
def get_payments():
    student_code = request.json.get("student_code")
    elective_period = request.json.get("elective_period")

    data, status_code = make_request("grupoa/payment", student_code, elective_period)
    if status_code == 200:
        return jsonify({"payments_data": data.get("data", [])})
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

# Run the Flask app
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Use PORT from environment variable or default to 5000
    app.run(host="0.0.0.0", port=port, debug=True)
