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

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Cấu hình Upload.io
const UPLOAD_IO_API_KEY = "public_223k24L7LbmWwYTvovkRQEzW2ELz";
const UPLOAD_IO_ACCOUNT_ID = "223k24L";

// Hàm upload file lên Upload.io
async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`https://api.bytescale.com/v2/accounts/${UPLOAD_IO_ACCOUNT_ID}/uploads/binary`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${UPLOAD_IO_API_KEY}` },
        body: formData
    });

    const result = await response.json();
    return result.fileUrl; // Trả về URL file đã upload
}

// Xử lý khi chọn file
document.getElementById("file-input").addEventListener("change", async function (event) {
    const file = event.target.files[0];
    if (!file) return;

    // Hiển thị preview file trước khi gửi
    document.getElementById("file-preview").innerHTML = `
        <div class="preview-item">
            <a href="#" id="file-link">📁 ${file.name}</a>
            <button onclick="removeFile()">❌</button>
        </div>`;
    
    // Upload file lên Upload.io
    const fileUrl = await uploadFile(file);
    document.getElementById("file-link").href = fileUrl;
});

// Hàm gửi tin nhắn (có thể kèm file)
async function sendMessage() {
    const input = document.getElementById("message-input");
    const message = input.value.trim();
    const fileUrl = document.querySelector("#file-preview a")?.href || null;

    if (!message && !fileUrl) return;

    // Lưu vào Firebase
    push(ref(db, "messages"), { 
        user: username,  
        text: message, 
        file: fileUrl, 
        timestamp: Date.now() 
    });

    // Xóa input và preview file sau khi gửi
    input.value = "";
    removeFile();
}

// Hàm xóa file khỏi preview
function removeFile() {
    document.getElementById("file-preview").innerHTML = "";
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

    // Nếu có file, thêm link file vào tin nhắn
    if (msg.file) {
        div.innerHTML += `<br><a href="${msg.file}" target="_blank">📎 File đính kèm</a>`;
    }

    // Hiển thị thời gian
    const time = new Date(msg.timestamp);
    const formattedTime = `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
    div.innerHTML += `<div class="timestamp">${formattedTime}</div>`;

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
window.removeFile = removeFile;