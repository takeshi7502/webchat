import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-database.js";

// Cấu hình Firebase (Chỉ dùng để lưu tin nhắn)
const firebaseConfig = {
    apiKey: "AIzaSyD_8HXx0No6MBrz_aTQ-z9C43wVkL9GdxY",
    authDomain: "takehi-webchat.firebaseapp.com",
    databaseURL: "https://takehi-webchat-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "takehi-webchat",
    storageBucket: "takehi-webchat.appspot.com",
    messagingSenderId: "683823627022",
    appId: "1:683823627022:web:0b542b89002bb723ae755f"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Cấu hình Upload.io
const UPLOAD_IO_API_KEY = "public_223k24L7LbmWwYTvovkRQEzW2ELz";
const UPLOAD_IO_ACCOUNT_ID = "223k24L";

// Hàm upload ảnh lên Upload.io
async function uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`https://api.bytescale.com/v2/accounts/${UPLOAD_IO_ACCOUNT_ID}/uploads/binary`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${UPLOAD_IO_API_KEY}` },
        body: formData
    });

    const result = await response.json();
    return result.fileUrl; // Trả về URL ảnh đã upload
}

// Xử lý khi chọn ảnh
document.getElementById("file-input").addEventListener("change", async function (event) {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
        alert("Chỉ hỗ trợ gửi ảnh!");
        return;
    }

    // Hiển thị preview ảnh trước khi gửi
    const preview = document.getElementById("file-preview");
    preview.innerHTML = `<img src="${URL.createObjectURL(file)}" class="preview-img">
                         <button onclick="removeImage()">❌</button>`;
    
    // Upload ảnh lên Upload.io
    const imageUrl = await uploadImage(file);
    preview.dataset.imageUrl = imageUrl;
});

// Hàm gửi tin nhắn (có thể kèm ảnh)
async function sendMessage() {
    const input = document.getElementById("message-input");
    const message = input.value.trim();
    const imageUrl = document.getElementById("file-preview").dataset.imageUrl || null;

    if (!message && !imageUrl) return;

    // Lưu tin nhắn (kèm link ảnh nếu có) vào Firebase
    push(ref(db, "messages"), { 
        user: username,  
        text: message, 
        image: imageUrl, 
        timestamp: Date.now() 
    });

    // Xóa input và preview ảnh sau khi gửi
    input.value = "";
    removeImage();
}

// Hàm xóa ảnh khỏi preview
function removeImage() {
    document.getElementById("file-preview").innerHTML = "";
    document.getElementById("file-preview").dataset.imageUrl = "";
    document.getElementById("file-input").value = "";
}

// Lắng nghe tin nhắn từ Firebase
onChildAdded(ref(db, "messages"), (snapshot) => {
    const msg = snapshot.val();
    const chatBox = document.getElementById("chat-box");

    // Tạo div hiển thị tin nhắn
    const div = document.createElement("div");
    div.classList.add("message", msg.user === username ? "my-message" : "other-message");

    // Nội dung tin nhắn
    div.innerHTML = `<strong>${msg.user}:</strong> ${msg.text}`;

    // Nếu có ảnh, hiển thị ảnh
    if (msg.image) {
        div.innerHTML += `<br><img src="${msg.image}" class="chat-image">`;
    }

    // Hiển thị thời gian
    const time = new Date(msg.timestamp);
    div.innerHTML += `<div class="timestamp">${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}</div>`;

    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
});

// Cho phép bấm Enter để gửi tin nhắn
document.getElementById("message-input").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }
});

// Yêu cầu nhập tên khi vào trang
let username = localStorage.getItem("chat_username");
if (!username) {
    username = prompt("Nhập tên của bạn:");
    localStorage.setItem("chat_username", username);
}

// Đưa sendMessage vào global để dùng onclick
window.sendMessage = sendMessage;
window.removeImage = removeImage;

// Lấy trạng thái Dark Mode từ localStorage
const darkModeToggle = document.getElementById("dark-mode-toggle");
const body = document.body;

if (localStorage.getItem("darkMode") === "enabled") {
    body.classList.add("dark-mode");
    darkModeToggle.textContent = "☀️";
}

// Bật/tắt Dark Mode khi nhấn nút
darkModeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");

    if (body.classList.contains("dark-mode")) {
        localStorage.setItem("darkMode", "enabled");
        darkModeToggle.textContent = "☀️";
    } else {
        localStorage.setItem("darkMode", "disabled");
        darkModeToggle.textContent = "🌙";
    }
});