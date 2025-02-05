console.log("✅ Script Loaded");

// Import Firebase SDK
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDNr5AKYaeuTsWmEMM5zPYZnt1e7BkunHo",
    authDomain: "uma-erp.firebaseapp.com",
    databaseURL: "https://uma-erp-default-rtdb.firebaseio.com",
    projectId: "uma-erp",
    storageBucket: "uma-erp.appspot.com",
    messagingSenderId: "325913232044",
    appId: "1:325913232044:web:d38c9440e65df8dce39509",
    measurementId: "G-LP9MM0VV1G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Global variable to store the latest token
let userToken = "";

/**
 * 🔹 Fetch the latest Postman token from Firebase Realtime Database
 */
async function fetchFirebaseToken() {
    console.log("🔄 Fetching token from Firebase...");
    try {
        const tokenRef = ref(database, "my/token"); // Path where token is stored in Firebase
        const snapshot = await get(tokenRef);
        if (snapshot.exists()) {
            userToken = snapshot.val();
            console.log("✅ Firebase Token Retrieved:", userToken.slice(0, 30) + "..."); // Partial token for security
            return userToken;
        } else {
            console.error("❌ No token found in Firebase.");
            return null;
        }
    } catch (error) {
        console.error("⚠️ Error fetching token from Firebase:", error);
        return null;
    }
}

// Global variable to store student data
let studentData = {};

// Ensure the Load Data button exists before adding event listeners
document.addEventListener("DOMContentLoaded", function () {
    const loadDataButton = document.getElementById("load-data-button");

    if (loadDataButton) {
        loadDataButton.addEventListener("click", loadStudentData);
        console.log("✅ Load Data button event listener attached.");
    } else {
        console.error("❌ Load Data button not found in DOM.");
    }
});

/**
 * 🔹 Load student data by making API requests to Flask backend
 */
async function loadStudentData() {
    console.log("🔄 Load Data button clicked...");

    const studentCode = document.getElementById("student-code").value.trim();
    const electivePeriod = document.getElementById("elective-period").value;

    if (!studentCode || !electivePeriod) {
        displayMessage("⚠️ Please enter both Student Code and select an Elective Period.", "bot-response");
        return;
    }

    console.log(`📨 Fetching data for Student Code: ${studentCode}, Period: ${electivePeriod}`);

    await fetchFirebaseToken();  // Ensure the token is updated

    studentData.attendance = await fetchData("/get-attendance", studentCode, electivePeriod);
    studentData.schedule = await fetchData("/get-schedule", studentCode, electivePeriod);
    studentData.grades = await fetchData("/get-grades", studentCode, electivePeriod);
    studentData.payments = await fetchData("/get-payments", studentCode, electivePeriod);

    displayMessage("✅ Data loaded successfully. You can now ask questions.", "bot-response");
}

/**
 * 🔹 Fetch data from Flask API using Firebase token
 */
async function fetchData(endpoint, studentCode, electivePeriod) {
    if (!userToken) {
        console.log("🔄 Fetching new Firebase token...");
        await fetchFirebaseToken();
    }

    if (!userToken) {
        console.error("⚠️ No valid token available.");
        return null;
    }

    try {
        console.log(`📡 Fetching data from ${endpoint}...`);
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userToken}`
            },
            body: JSON.stringify({ student_code: studentCode, elective_period: electivePeriod })
        });

        const responseData = await response.json();
        console.log(`✅ Data received from ${endpoint}:`, responseData);
        return responseData;
    } catch (error) {
        console.error(`❌ Error fetching ${endpoint}:`, error);
        return null;
    }
}

/**
 * 🔹 Function to send user messages
 */
function sendMessage() {
    const userInput = document.getElementById("user-input").value.trim();
    if (userInput === "") return;

    displayMessage(userInput, "user-message");

    setTimeout(() => {
        if (Object.keys(studentData).length === 0) {
            const response = generateKeywordResponse(userInput);
            displayMessage(response, "bot-response");
        } else {
            const response = generateResponse(userInput);
            displayMessage(response, "bot-response");
        }
    }, 1500);

    document.getElementById("user-input").value = "";
}

/**
 * 🔹 Generate response based on user input
 */
function generateResponse(userInput) {
    userInput = userInput.toLowerCase();

    if (userInput.includes("attendance")) return "📊 You can check your attendance records.";
    if (userInput.includes("schedule")) return "📅 You can check your class schedule.";
    if (userInput.includes("grades")) return "📖 You can check your grades.";
    if (userInput.includes("payments")) return "💰 You can check your payments.";

    return generateKeywordResponse(userInput);
}

/**
 * 🔹 Function to display messages in chat
 */
function displayMessage(message, className) {
    const chatBox = document.getElementById("chat-box");
    chatBox.style.display = "block";
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${className}`;
    messageDiv.innerHTML = message;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}
