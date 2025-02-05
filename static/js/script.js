console.log("Script loaded");

let studentData = {}; // Store student data

document.getElementById("load-data-button").addEventListener("click", loadStudentData);
document.getElementById("send-button").addEventListener("click", sendMessage);
document.getElementById("user-input").addEventListener("keydown", function (event) {
    if (event.key === "Enter") sendMessage();
});

// Function to get Firebase Auth Token
async function getAuthToken() {
    try {
        const response = await fetch("/get-auth-token");
        const data = await response.json();
        return data.token || null;
    } catch (error) {
        console.error("Error fetching auth token:", error);
        return null;
    }
}

// Function to load student data
async function loadStudentData() {
    const studentCode = document.getElementById("student-code").value.trim();
    const electivePeriod = document.getElementById("elective-period").value;

    if (!studentCode || !electivePeriod) {
        displayMessage("❗ Please enter both Student Code and select an Elective Period.", "bot-response");
        return;
    }

    const authToken = await getAuthToken();
    if (!authToken) {
        displayMessage("❌ Authentication failed. Please try again later.", "bot-response");
        return;
    }

    try {
        const attendance = await fetchStudentData("attendance", studentCode, electivePeriod, authToken);
        const schedule = await fetchStudentData("schedule", studentCode, electivePeriod, authToken);
        const grades = await fetchStudentData("grades", studentCode, electivePeriod, authToken);
        const payments = await fetchStudentData("payments", studentCode, electivePeriod, authToken);

        studentData = { attendance, schedule, grades, payments };

        displayMessage("✅ Data loaded successfully. You can now ask questions.", "bot-response");
    } catch (error) {
        console.error("Error loading student data:", error);
        displayMessage("⚠️ Error loading student data. Please try again.", "bot-response");
    }
}

// Function to fetch student data from different endpoints
async function fetchStudentData(dataType, studentCode, electivePeriod, authToken) {
    const urlMap = {
        attendance: "/get-attendance",
        schedule: "/get-schedule",
        grades: "/get-grades",
        payments: "/get-payments"
    };

    try {
        const response = await fetch(urlMap[dataType], {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ student_code: studentCode, elective_period: electivePeriod })
        });

        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(`Failed to load ${dataType} data - ${responseData.error || "Unknown error"}`);
        }

        return responseData[`${dataType}_data`] || {};
    } catch (error) {
        console.error(`Failed to fetch ${dataType}:`, error.message);
        throw error;
    }
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






// Function to display messages
function displayMessage(message, className) {
    const chatBox = document.getElementById("chat-box");
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${className}`;
    messageDiv.innerHTML = message;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}
