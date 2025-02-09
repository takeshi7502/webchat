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

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);

// Lấy username từ localStorage hoặc yêu cầu nhập
let username = localStorage.getItem("chat_username");
if (!username) {
    username = prompt("Nhập tên của bạn:");
    localStorage.setItem("chat_username", username);
}

// Hàm gửi tin nhắn hoặc file
async function sendMessage() {
    const input = document.getElementById("message-input");
    const fileInput = document.getElementById("file-input");
    const message = input.value.trim();
    const file = fileInput.files[0];

    if (message || file) {
        let fileUrl = "";

        // Nếu có file, tải lên Firebase Storage trước
        if (file) {
            const filePath = `uploads/${Date.now()}_${file.name}`;
            const fileRef = storageRef(storage, filePath);
            await uploadBytes(fileRef, file);
            fileUrl = await getDownloadURL(fileRef);
        }

        // Gửi tin nhắn lên Firebase Database
        push(ref(db, "messages"), {
            user: username,
            text: message,
            fileUrl: fileUrl,
            fileName: file ? file.name : "",
            timestamp: Date.now()
        });

        // Xóa input sau khi gửi
        input.value = "";
        fileInput.value = "";
    }
}

// Lắng nghe tin nhắn mới từ Firebase
onChildAdded(ref(db, "messages"), (snapshot) => {
    const msg = snapshot.val();
    const chatBox = document.getElementById("chat-box");

    // Tạo div hiển thị tin nhắn
    const div = document.createElement("div");
    div.classList.add("message");
    if (msg.user === username) {
        div.classList.add("my-message");
    } else {
        div.classList.add("other-message");
    }

    // Thời gian gửi
    const time = new Date(msg.timestamp);
    const formattedTime = `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;

    // Nội dung tin nhắn
    div.innerHTML = `<strong>${msg.user}:</strong> ${msg.text} <br> <span class="timestamp">${formattedTime}</span>`;

    // Nếu có file, hiển thị file
    if (msg.fileUrl) {
        const fileLink = document.createElement("a");
        fileLink.href = msg.fileUrl;
        fileLink.target = "_blank";
        fileLink.textContent = `📎 ${msg.fileName}`;
        fileLink.classList.add("file-link");
        div.appendChild(fileLink);
    }

    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
});

// Bấm Enter để gửi tin nhắn
document.getElementById("message-input").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }
});

// Gán sự kiện click cho nút gửi
document.getElementById("send-button").addEventListener("click", sendMessage);

// Gán sự kiện click cho nút "+" để chọn file
document.getElementById("file-button").addEventListener("click", function () {
    document.getElementById("file-input").click();
});

// Đưa sendMessage vào global
window.sendMessage = sendMessage;