console.log("Script loaded");

let studentData = {}; // Variable to store the loaded student data

document.getElementById("load-data-button").addEventListener("click", loadStudentData);
document.getElementById("send-button").addEventListener("click", sendMessage);
document.getElementById("user-input").addEventListener("keydown", function (event) {
    if (event.key === "Enter") sendMessage();
});


// Keyword-based responses
const keywordResponses = {
    "the university": "🏫 Welcome to Universidad Maria Auxiliadora! We strive to provide a quality educational experience to all our students. 🌟",
    "quality management": "✅ We are committed to Quality Management in all aspects of our institution. 📋",
    "teachers": "👩‍🏫 Our teachers are experts in their fields and dedicated to your success. 💡",
    "campuses": "🏢 We have modern campuses with state-of-the-art facilities to support your education. 🌐",
    "social responsibility": "🌍 We actively participate in social responsibility initiatives to support our community. 🤝",
    "covid": "😷 Our actions against COVID-19 include strict safety protocols and support for the community. 🛡️",
    "transparency portal": "🔍 Visit our Transparency Portal to explore our initiatives and regulations: [Link]. 🌐",
    "regulations": "📜 You can find our Regulations and Resolutions in the institutional repository. 📘",
    "repository-institutional": "📚 Our Institutional Repository contains a wealth of academic resources for you to explore. 🌟",
    "i said uma": "🎓 I SAID UMA is our slogan to inspire and motivate our students and staff. 💪",
    "scientific publications": "📖 Explore our scientific publications to stay updated on the latest research. 🔬",

    // Undergraduate Programs
    "artificial intelligence": "🤖 Our Artificial Intelligence Engineering program prepares you for the future of technology. 🚀",
    "business": "🌍 Our International Business and Administration program gives you the tools to thrive in global markets. 📈",
    "administration and marketing": "📊 Learn the art of managing and marketing with our Administration and Marketing program. 💼",
    "accounting and finance": "💰 Our Accounting and Finance program develops your financial expertise. 📊",
    "pharmacy and biochemistry": "⚗️ Discover the science behind health in our Pharmacy and Biochemistry program. 🧪",
    "infirmary": "🩺 Train to be a healthcare professional in our Infirmary program. 💙",
    "nutrition": "🥗 Our Nutrition and Dietetics program focuses on health and well-being. 🏋️",
    
    "psychology": "🧠 Understand the human mind and behavior in our Psychology program. 💭",
    "medical technology": "🩺 Our Medical Technology programs specialize in clinical laboratory, pathological anatomy, physical therapy, and rehabilitation. 👨‍🔬",

    // Graduate Programs
    "mastery": "🎓 Advance your career with our Master's programs. 📘",
    "specialization": "📚 Our Second Specialization Professional programs offer advanced expertise in various fields. 🏆",
    "graduates": "🎓 We offer extensive support and resources for our graduates. 🎉",
    "continuing education": "📖 Our Continuing Education programs are designed to help you grow professionally. 🚀",

    // Admission
    "admission": "📞 For information about the admission process, call on +51 982 887 246, or WhatsApp on +51 914 569 313. 💬",
    "high school": "🎓 If you've finished high school, we have exciting undergraduate programs waiting for you! 🚀",
    "technician": "🔧 Technicians can continue their education with our specialized programs. 📘",
    "move": "🚚 Thinking about transferring? Learn about our transfer options. 🔄",
    "vocational guidance": "🧭 Get vocational guidance to choose the program that best suits your interests. 🌟",
    "admission regulations": "📜 Check out our Admission Regulations to learn more. 🧐",

    // Campus Life
    "degrees": "🎓 We offer various degrees and titles across multiple disciplines. 📖",
    "ombudsman": "🛡️ The University Ombudsman's Office ensures fairness and equity for all students. ⚖️",
    "wellness": "💆‍♂️ Our University Wellness program focuses on your mental and physical health. 🩺",
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
    "undergraduate": "📚 We offer many undergraduate programs like: 1️⃣ Ingeniería de Inteligencia Artificial, 2️⃣ Administración y Negocios Internacionales, 3️⃣ Administración y Marketing, 4️⃣ Contabilidad y Finanzas, 5️⃣ Farmacia y Bioquímica, 6️⃣ Enfermería, 7️⃣ Nutrición y Dietética, 8️⃣ Psicología, 9️⃣ Tecnología Médica en Laboratorio Clínico y Anatomía Patológica, 🔟 Tecnología Médica en Terapia Física y Rehabilitación. 🎓",
    "postgraduate": "📘 We offer many postgraduate programs like: 1️⃣ Maestría, 2️⃣ Segunda Especialización Profesional, 3️⃣ Diplomados, 4️⃣ Educación Continua. 🎓"

};

async function loadStudentData() {
    const studentCode = document.getElementById("student-code").value.trim();
    const electivePeriod = document.getElementById("elective-period").value;

    if (!studentCode || !electivePeriod) {
        displayMessage("Please enter both Student Code and select an Elective Period to load data.", "bot-response");
        return;
    }

    try {
        // Fetch data from all necessary endpoints
        const attendance = await fetchStudentData("attendance", studentCode, electivePeriod);
        const schedule = await fetchStudentData("schedule", studentCode, electivePeriod);
        const grades = await fetchStudentData("grades", studentCode, electivePeriod);
        const payments = await fetchStudentData("payments", studentCode, electivePeriod);

        // Store data for the specific student
        studentData = { attendance, schedule, grades, payments };

        displayMessage("Data loaded successfully. You can now ask questions.", "bot-response");
    } catch (error) {
        console.error("Error loading student data:", error);
        displayMessage("Error loading student data. Please try again.", "bot-response");
    }
}

async function fetchStudentData(dataType, studentCode, electivePeriod) {
    const urlMap = {
        attendance: "/get-attendance",
        schedule: "/get-schedule",
        grades: "/get-grades",
        payments: "/get-payments"
    };

    try {
        const response = await fetch(urlMap[dataType], {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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

function sendMessage() {
    const userInput = document.getElementById("user-input").value.trim();
    if (userInput === "") return;

    displayMessage(userInput, "user-message");

    // Show typing animation
    const chatBox = document.getElementById("chat-box");
    const typingAnimation = document.createElement("div");
    typingAnimation.className = "message bot-response typing-animation";
    typingAnimation.innerHTML = `<span>.</span><span>.</span><span>.</span>`;
    chatBox.appendChild(typingAnimation);
    chatBox.scrollTop = chatBox.scrollHeight;

    setTimeout(() => {
        typingAnimation.remove();

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

function generateKeywordResponse(userInput) {
    const lowerCaseInput = userInput.toLowerCase();
    for (const keyword in keywordResponses) {
        if (lowerCaseInput.includes(keyword)) {
            return keywordResponses[keyword];
        }
    }
    return "I'm sorry, I couldn't find any information about that. Can you try asking something else?";
}

function generateResponse(userInput) {
    userInput = userInput.toLowerCase();

    if (userInput.includes("attendance")) return formatAttendanceResponse();
    if (userInput.includes("schedule")) return formatScheduleResponse();
    if (userInput.includes("grades")) return formatGradesResponse();
    if (userInput.includes("payments")) return formatPaymentsResponse();

    return generateKeywordResponse(userInput);
}

function formatAttendanceResponse() {
    if (!studentData.attendance || Object.keys(studentData.attendance).length === 0) {
        return "No attendance data available for this student.";
    }

    let table = `<div class="table-responsive"><table class="table table-bordered table-striped">
                    <thead><tr><th>Course</th><th>Date</th><th>Status</th></tr></thead><tbody>`;
    
    for (const [courseCode, courseInfo] of Object.entries(studentData.attendance)) {
        courseInfo.attendance.forEach(record => {
            table += `<tr><td>${courseInfo.courseName}</td><td>${record.date}</td><td>${record.state}</td></tr>`;
        });
    }

    table += `</tbody></table></div>`;
    return table;
}

function formatScheduleResponse() {
    if (!studentData.schedule || studentData.schedule.length === 0) {
        return "No schedule data available for this student.";
    }

    let table = `<div class="table-responsive"><table class="table table-bordered table-striped">
                    <thead><tr><th>Course</th><th>Day</th><th>Time</th><th>Modality</th><th>Teacher</th></tr></thead><tbody>`;

    studentData.schedule.forEach(item => {
        table += `<tr><td>${item.courseName}</td><td>${item.day}</td><td>${item.hour}</td><td>${item.modality}</td><td>${item.teacherName}</td></tr>`;
    });

    table += `</tbody></table></div>`;
    return table;
}

function formatGradesResponse() {
    if (!studentData.grades || Object.keys(studentData.grades).length === 0) {
        return "No grades data available for this student.";
    }

    let table = `<div class="table-responsive"><table class="table table-bordered table-striped">
                    <thead><tr><th>Course</th><th>Evaluation</th><th>Score</th><th>Status</th></tr></thead><tbody>`;

    for (const [courseCode, courseInfo] of Object.entries(studentData.grades)) {
        courseInfo.qualifications.forEach(record => {
            table += `<tr><td>${courseInfo.courseName}</td><td>${record.evaluationName}</td><td>${record.qualification}</td><td>${record.state}</td></tr>`;
        });
    }

    table += `</tbody></table></div>`;
    return table;
}

function formatPaymentsResponse() {
    if (!studentData.payments || studentData.payments.length === 0) {
        return "No payment data available for this student.";
    }

    let table = `<div class="table-responsive"><table class="table table-bordered table-striped">
                    <thead><tr><th>Description</th><th>Amount</th><th>Due Date</th><th>Status</th></tr></thead><tbody>`;

    studentData.payments.forEach(item => {
        table += `<tr><td>${item.paymentDescription}</td><td>${item.fee}</td><td>${item.expirationDate}</td><td>${item.paymentState === 'p' ? 'Paid' : 'Pending'}</td></tr>`;
    });

    table += `</tbody></table></div>`;
    return table;
}

function displayMessage(message, className) {
    const chatBox = document.getElementById("chat-box");
    chatBox.style.display = "block";
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${className}`;
    messageDiv.innerHTML = message;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}





document.addEventListener('DOMContentLoaded', () => {
    // Initialize animated background
    const doodle = document.querySelector('css-doodle');
    doodle.innerHTML = `
        :doodle {
            @grid: 15x1 / 100vmax;
            overflow: hidden;
        }
        
        @place-cell: center;
        @size: calc(@i * 10%);
        border-radius: 50%;
        border: 1px solid hsla(calc(20 * @i), 70%, 68%, @r.8);
        transform: rotate(@r(360deg)) scale(@r(.1, 1.5));
        animation: rotate @r(20s, 40s) linear infinite;
        
        @keyframes rotate {
            from { transform: rotate(0) }
            to { transform: rotate(360deg) }
        }
    `;

    // Initialize UI elements
    initChat();
});

let studentData = {};
let isProcessing = false;

function initChat() {
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    
    sendButton.addEventListener('click', processMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !isProcessing) processMessage();
    });
    
    document.getElementById('load-data-button').addEventListener('click', loadStudentData);
}

async function processMessage() {
    if (isProcessing) return;
    
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    if (!message) return;

    isProcessing = true;
    addMessage(message, 'user');
    userInput.value = '';
    
    showTypingIndicator();
    
    try {
        const response = await getBotResponse(message);
        addMessage(response, 'bot');
    } catch (error) {
        addMessage('Sorry, I encountered an error. Please try again.', 'bot');
    }
    
    isProcessing = false;
}

async function getBotResponse(message) {
    // Existing response logic here
    // Add your existing keyword response system
    // Add API calls as needed
    
    // Temporary dummy response
    return "This is a sample response. Implement your logic here.";
}

function addMessage(content, sender) {
    const chatBody = document.getElementById('chat-box');
    const messageDiv = document.createElement('div');
    
    messageDiv.className = `message ${sender}-message`;
    messageDiv.innerHTML = `
        <div class="${sender}-avatar">
            <i class="fas fa-${sender === 'bot' ? 'robot' : 'user'}"></i>
        </div>
        <div class="message-content">${content}</div>
    `;
    
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function showTypingIndicator() {
    const chatBody = document.getElementById('chat-box');
    const typingDiv = document.createElement('div');
    
    typingDiv.className = 'message bot-response typing-indicator';
    typingDiv.innerHTML = `
        <div class="bot-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    chatBody.appendChild(typingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Existing data loading and processing functions
// Add your existing loadStudentData, fetchStudentData, etc. functions here
