import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-database.js";

// Cấu hình Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD_8HXx0No6MBrz_aTQ-z9C43wVkL9GdxY",
    authDomain: "takehi-webchat.firebaseapp.com",
    databaseURL: "https://takehi-webchat-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "takehi-webchat",
    storageBucket: "takehi-webchat.appspot.com",
    messagingSenderId: "683823627022",
    appId: "1:683823627022:web:0b542b89002bb723ae755f",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Lấy username từ localStorage hoặc yêu cầu nhập mới
let username = localStorage.getItem("chat_username");
if (!username) {
    username = prompt("Nhập tên của bạn:");
    localStorage.setItem("chat_username", username);
}

// Hàm gửi tin nhắn
function sendMessage() {
    const input = document.getElementById("message-input");
    const message = input.value.trim();
    
    if (message) {
        const timestamp = new Date().toISOString(); // Lưu thời gian gửi
        push(ref(db, "messages"), { user: username, text: message, timestamp });
        input.value = "";
    }
}

// Hàm định dạng thời gian (HH:mm:ss)
function formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString("vi-VN", { 
        hour: "2-digit", 
        minute: "2-digit", 
        second: "2-digit" 
    });
}

// Nhận tin nhắn từ Firebase
onChildAdded(ref(db, "messages"), (snapshot) => {
    const msg = snapshot.val();
    const chatBox = document.getElementById("chat-box");

    // Tạo div chứa tin nhắn
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    if (msg.user === username) {
        messageDiv.classList.add("my-message");
    } else {
        messageDiv.classList.add("other-message");
    }

    // Nội dung tin nhắn + thời gian gửi
    messageDiv.innerHTML = `
        <div class="message-content">
            <strong>${msg.user}</strong>: ${msg.text}
        </div>
        <div class="timestamp">${formatTime(msg.timestamp)}</div>
    `;

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // Cuộn xuống tin nhắn mới nhất
});

// Bấm Enter để gửi tin nhắn
document.getElementById("message-input").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }
});

// Đưa hàm sendMessage vào global để dùng trong HTML
window.sendMessage = sendMessage;