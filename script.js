// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-database.js";

// Cấu hình Firebase (Lấy từ config.js thay vì process.env)
const firebaseConfig = {
    apiKey: firebaseConfigData.apiKey,
    authDomain: firebaseConfigData.authDomain,
    databaseURL: firebaseConfigData.databaseURL,
    projectId: firebaseConfigData.projectId,
    storageBucket: firebaseConfigData.storageBucket,
    messagingSenderId: firebaseConfigData.messagingSenderId,
    appId: firebaseConfigData.appId,
    measurementId: firebaseConfigData.measurementId
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Yêu cầu người dùng nhập tên khi vào trang
let username = localStorage.getItem("chat_username");
if (!username) {
    username = prompt("Nhập tên của bạn:");
    localStorage.setItem("chat_username", username); // Lưu vào localStorage
}

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