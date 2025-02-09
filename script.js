import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-storage.js";

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
const storage = getStorage(app);

// Lấy username từ localStorage hoặc yêu cầu nhập mới
let username = localStorage.getItem("chat_username");
if (!username) {
    username = prompt("Nhập tên của bạn:");
    localStorage.setItem("chat_username", username);
}

// Gửi tin nhắn văn bản
function sendMessage() {
    const input = document.getElementById("message-input");
    const message = input.value.trim();
    
    if (message) {
        const timestamp = new Date().toISOString();
        push(ref(db, "messages"), { user: username, text: message, timestamp, type: "text" });
        input.value = "";
    }
}

// Gửi file (ảnh, tài liệu)
function sendFile() {
    const fileInput = document.getElementById("file-input");
    const file = fileInput.files[0];

    if (file) {
        const fileRef = storageRef(storage, `uploads/${Date.now()}_${file.name}`);
        uploadBytes(fileRef, file).then((snapshot) => {
            getDownloadURL(snapshot.ref).then((url) => {
                const timestamp = new Date().toISOString();
                push(ref(db, "messages"), { user: username, fileUrl: url, fileName: file.name, timestamp, type: "file" });
            });
        });

        fileInput.value = ""; // Reset input file
    }
}

// Định dạng thời gian (HH:mm:ss)
function formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// Nhận tin nhắn từ Firebase
onChildAdded(ref(db, "messages"), (snapshot) => {
    const msg = snapshot.val();
    const chatBox = document.getElementById("chat-box");

    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    if (msg.user === username) {
        messageDiv.classList.add("my-message");
    } else {
        messageDiv.classList.add("other-message");
    }

    // Kiểm tra kiểu tin nhắn (văn bản hoặc file)
    if (msg.type === "text") {
        messageDiv.innerHTML = `
            <div class="message-content">
                <strong>${msg.user}</strong>: ${msg.text}
            </div>
            <div class="timestamp">${formatTime(msg.timestamp)}</div>
        `;
    } else if (msg.type === "file") {
        messageDiv.innerHTML = `
            <div class="message-content">
                <strong>${msg.user}</strong>: <a href="${msg.fileUrl}" target="_blank">📎 ${msg.fileName}</a>
            </div>
            <div class="timestamp">${formatTime(msg.timestamp)}</div>
        `;
    }

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
});

// Bấm Enter để gửi tin nhắn
document.getElementById("message-input").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }
});

// Đưa sendMessage & sendFile vào global
window.sendMessage = sendMessage;
window.sendFile = sendFile;