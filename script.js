import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-database.js";

// Cấu hình Firebase
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Gửi tin nhắn
function sendMessage() {
    const input = document.getElementById("message-input");
    const message = input.value.trim();
    if (message) {
        push(ref(db, "messages"), { 
            user: username,  // Lưu tên người gửi
            text: message, 
            timestamp: Date.now() 
        });
        input.value = "";
    }
}

// Nhận tin nhắn từ Firebase
onChildAdded(ref(db, "messages"), (snapshot) => {
    const msg = snapshot.val();
    const chatBox = document.getElementById("chat-box");

    // Tạo div hiển thị tin nhắn
    const div = document.createElement("div");
    div.innerHTML = `<strong>${msg.user}:</strong> ${msg.text}`;
    
    // Nếu tin nhắn của chính mình, thêm class "my-message"
    if (msg.user === username) {
        div.classList.add("my-message");
    }

    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
});

// Bấm Enter để gửi tin nhắn
document.getElementById("message-input").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Ngăn xuống dòng trong ô input
        sendMessage(); // Gọi hàm gửi tin nhắn
    }
});

// Đưa sendMessage vào global
window.sendMessage = sendMessage;

// Yêu cầu người dùng nhập tên khi vào trang
let username = localStorage.getItem("chat_username");
if (!username) {
    username = prompt("Nhập tên của bạn:");
    localStorage.setItem("chat_username", username); // Lưu vào localStorage
}