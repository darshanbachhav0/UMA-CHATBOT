let studentData = {};
let recognition = null;
let isListening = false;

document.addEventListener('DOMContentLoaded', () => {
    initVoiceRecognition();
    document.getElementById('load-data').addEventListener('click', loadStudentData);
    document.getElementById('send-btn').addEventListener('click', sendMessage);
    document.getElementById('user-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});

const keywordResponses = { /* keep your existing keyword responses object */ };

function initVoiceRecognition() { /* keep your existing initVoiceRecognition function */ }

async function loadStudentData() {
    const studentCode = document.getElementById('student-code').value.trim();
    const period = document.getElementById('elective-period').value;
    const loadBtn = document.getElementById('load-data');

    if (!studentCode || !period) {
        displayMessage('Please enter both Student Code and select Period', 'bot-response');
        return;
    }

    try {
        // Show loading state
        loadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        loadBtn.disabled = true;

        // Fetch data sequentially with error handling
        studentData = {
            attendance: await fetchData('attendance', studentCode, period),
            schedule: await fetchData('schedule', studentCode, period),
            grades: await fetchData('grades', studentCode, period),
            payments: await fetchData('payments', studentCode, period)
        };

        document.getElementById('voice-btn').disabled = false;
        displayMessage('Data loaded successfully! Voice input activated!', 'bot-response');
    } catch (error) {
        console.error('Data load error:', error);
        displayMessage(`Error: ${error.message}`, 'bot-response');
    } finally {
        // Reset button state
        loadBtn.innerHTML = '<i class="fas fa-database me-2"></i>Load Data';
        loadBtn.disabled = false;
    }
}

async function fetchData(endpoint, code, period) {
    try {
        const response = await fetch(`/get-${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student_code: code, elective_period: period })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `Failed to load ${endpoint} data`);
        }

        return data[`${endpoint}_data`] || [];
        
    } catch (error) {
        throw new Error(`Failed to fetch ${endpoint}: ${error.message}`);
    }
}

function sendMessage() { /* keep your existing sendMessage function */ }

function generateResponse(message) {
    // First check for data-related queries
    if (Object.keys(studentData).length > 0) {
        if (message.includes('attendance')) return formatAttendanceResponse();
        if (message.includes('schedule')) return formatScheduleResponse();
        if (message.includes('grade')) return formatGradesResponse();
        if (message.includes('payment')) return formatPaymentsResponse();
    }

    // Then check keyword responses
    const lowerMessage = message.toLowerCase();
    for (const [keyword, response] of Object.entries(keywordResponses)) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
            return response;
        }
    }

    // Default response
    return "I'm here to help with university-related queries. Please ask about admissions, programs, or student services.";
}

// Add this new function to show typing indicator
function showTypingIndicator() {
    const chatBox = document.getElementById('chat-box');
    const typing = document.createElement('div');
    typing.className = 'message bot-response typing';
    typing.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    chatBox.appendChild(typing);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    setTimeout(() => typing.remove(), 1000);
}



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



function initVoiceRecognition() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            isListening = true;
            document.getElementById('voice-status').classList.remove('d-none');
            document.getElementById('voice-btn').classList.add('active');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('user-input').value = transcript;
            sendMessage();
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            displayMessage("Sorry, I didn't catch that. Please try again.", 'bot-response');
        };

        recognition.onend = () => {
            isListening = false;
            document.getElementById('voice-status').classList.add('d-none');
            document.getElementById('voice-btn').classList.remove('active');
        };

        document.getElementById('voice-btn').addEventListener('click', () => {
            if (!isListening) recognition.start();
        });
    } else {
        document.getElementById('voice-btn').style.display = 'none';
    }
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

function displayMessage(content, type) {
    const chatBox = document.getElementById('chat-box');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = content;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}
