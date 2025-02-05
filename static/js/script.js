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



// Keyword-based responses
const keywordResponses = {
    "about the university": "🏫 Welcome to Universidad Maria Auxiliadora! We strive to provide a quality educational experience to all our students. 🌟For more information visit our website https://uma.edu.pe/",
    
    "teachers": "👩‍🏫 Our teachers are experts in their fields and dedicated to your success. 💡",
   
    "social responsibility": "🌍 We actively participate in social responsibility initiatives to support our community. 🤝",
    
    "transparency portal": "🔍 Visit our Transparency Portal to explore our initiatives and regulations: For more information visit our website https://uma.edu.pe/. 🌐",
    "regulations": "📜 You can find our Regulations and Resolutions in the institutional repository. 📘",
    "repository-institutional": "📚 Our Institutional Repository contains a wealth of academic resources for you to explore. 🌟",
    
    "scientific publications": "📖 Explore our scientific publications to stay updated on the latest research. 🔬",

    // Undergraduate Programs
    "artificial intelligence": "🤖 Our Artificial Intelligence Engineering program prepares you for the future of technology. 🚀",
    "business": "🌍 Our International Business and Administration program gives you the tools to thrive in global markets. 📈 For more information visit our website https://uma.edu.pe/",
    "administration and marketing": "📊 Learn the art of managing and marketing with our Administration and Marketing program. 💼For more information visit our website https://uma.edu.pe/",
    "accounting and finance": "💰 Our Accounting and Finance program develops your financial expertise. 📊For more information visit our website https://uma.edu.pe/",
    "pharmacy and biochemistry": "⚗️ Discover the science behind health in our Pharmacy and Biochemistry program. 🧪For more information visit our website https://uma.edu.pe/",
    "infirmary": "🩺 Train to be a healthcare professional in our Infirmary program. 💙For more information visit our website https://uma.edu.pe/",
    "nutrition": "🥗 Our Nutrition and Dietetics program focuses on health and well-being. 🏋️For more information visit our website https://uma.edu.pe/",
    
    "psychology": "🧠 Understand the human mind and behavior in our Psychology program. 💭For more information visit our website https://uma.edu.pe/",
    "medical technology": "🩺 Our Medical Technology programs specialize in clinical laboratory, pathological anatomy, physical therapy, and rehabilitation. 👨‍🔬For more information visit our website https://uma.edu.pe/",

    // Graduate Programs
    "mastery": "🎓 Advance your career with our Master's programs. 📘",
    "specialization": "📚 Our Second Specialization Professional programs offer advanced expertise in various fields. 🏆",
    "graduates": "🎓 We offer extensive support and resources for our graduates. 🎉For more information visit our website https://uma.edu.pe/",
    

    // Admission
    "admission": "📞 For information about the admission process, call on +51 982 887 246, or WhatsApp on +51 914 569 313. 💬",
    "high school": "🎓 If you've finished high school, we have exciting undergraduate programs waiting for you! 🚀",
   
    
    "vocational guidance": "🧭 Get vocational guidance to choose the program that best suits your interests. 🌟For more information visit our website https://uma.edu.pe/",
    "admission regulations": "📜 Check out our Admission Regulations to learn more. 🧐For more information visit our website https://uma.edu.pe/",

    // Campus Life
    "degrees": "🎓 We offer various degrees and titles across multiple disciplines. 📖For more information visit our website https://uma.edu.pe/",
   
   
    "library": "📚 Our library is stocked with academic resources to support your studies. 📖",
    "umacitos nursery": "👶 The Umacitos Nursery is here to support student parents by providing excellent childcare. 💕",

    // Greetings
    "hi": "👋 Hello! How can I assist you today? 😊",
    "hello": "👋 Hi there! What can I help you with? 🤗",
    "how are you": "😊 I'm just a bot, but I'm here to help you! 🤖",
    "thank you": "🙏 You're welcome! Let me know if there's anything else I can assist with. 🌟",
    "bye": "👋 Goodbye! Have a great day! 🌈",

    // Contact Information
    "mail": "📧 For queries, you can mail us at admision@uma.edu.pe. 📬",
    "location": "📍 The university is located at Canto Bello 431, San Juan de Lurigancho, Lima 15408. 🌍",
    "address": "📍 You can visit us at Canto Bello 431, San Juan de Lurigancho, Lima 15408. 🏫",

    // Programs Summary
    "undergraduate": "📚 We offer many undergraduate programs like: 1️⃣ Ingeniería de Inteligencia Artificial, 2️⃣ Administración y Negocios Internacionales, 3️⃣ Administración y Marketing, 4️⃣ Contabilidad y Finanzas, 5️⃣ Farmacia y Bioquímica, 6️⃣ Enfermería, 7️⃣ Nutrición y Dietética, 8️⃣ Psicología, 9️⃣ Tecnología Médica en Laboratorio Clínico y Anatomía Patológica, 🔟 Tecnología Médica en Terapia Física y Rehabilitación. 🎓For more information visit our website https://uma.edu.pe/",
    "postgraduate": "📘 We offer many postgraduate programs like: 1️⃣ Maestría, 2️⃣ Segunda Especialización Profesional, 3️⃣ Diplomados, 4️⃣ Educación Continua. 🎓For more information visit our website https://uma.edu.pe/"

};








// Function to fetch data from the Flask backend
async function fetchData(endpoint, studentCode, electivePeriod) {
    if (!userToken) {
        console.log("User not authenticated. Authenticating...");
        await authenticateUser();
    }

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userToken}`
            },
            body: JSON.stringify({ student_code: studentCode, elective_period: electivePeriod })
        });

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return null;
    }
}

// Load student data from backend
async function loadStudentData() {
    const studentCode = document.getElementById("student-code").value.trim();
    const electivePeriod = document.getElementById("elective-period").value;

    if (!studentCode || !electivePeriod) {
        displayMessage("Please enter both Student Code and select an Elective Period.", "bot-response");
        return;
    }

    const attendance = await fetchData("/get-attendance", studentCode, electivePeriod);
    const schedule = await fetchData("/get-schedule", studentCode, electivePeriod);
    const grades = await fetchData("/get-grades", studentCode, electivePeriod);
    const payments = await fetchData("/get-payments", studentCode, electivePeriod);

    studentData = { attendance, schedule, grades, payments };
    displayMessage("Data loaded successfully. You can now ask questions.", "bot-response");
}

// Function to send user messages
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

// Generate response based on user input
function generateResponse(userInput) {
    userInput = userInput.toLowerCase();

    if (userInput.includes("attendance")) return "You can check your attendance records.";
    if (userInput.includes("schedule")) return "You can check your class schedule.";
    if (userInput.includes("grades")) return "You can check your grades.";
    if (userInput.includes("payments")) return "You can check your payments.";

    return generateKeywordResponse(userInput);
}

// Generate a response based on predefined keywords
function generateKeywordResponse(userInput) {
    const lowerCaseInput = userInput.toLowerCase();
    for (const keyword in keywordResponses) {
        if (lowerCaseInput.includes(keyword)) {
            return keywordResponses[keyword];
        }
    }
    return "I'm sorry, I couldn't find any information about that. Can you try asking something else?";
}

// Function to display messages in chat
function displayMessage(message, className) {
    const chatBox = document.getElementById("chat-box");
    chatBox.style.display = "block";
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${className}`;
    messageDiv.innerHTML = message;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}
















function generateKeywordResponse(userInput) {
    const lowerCaseInput = userInput.toLowerCase();
    for (const keyword in keywordResponses) {
        if (lowerCaseInput.includes(keyword)) {
            return keywordResponses[keyword];
        }
    }
    return "🤖 I'm sorry, I couldn't find any information about that. Can you try asking something else?";
}
