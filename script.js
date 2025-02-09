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

// Lấy username từ localStorage
let username = localStorage.getItem("chat_username");
if (!username) {
    username = prompt("Nhập tên của bạn:");
    localStorage.setItem("chat_username", username);
}

// Hiển thị preview file khi chọn
document.getElementById("file-input").addEventListener("change", function () {
    const file = this.files[0];
    const preview = document.getElementById("file-preview");

    if (file) {
        preview.textContent = `📎 ${file.name}`;
        preview.style.display = "block";
    } else {
        preview.textContent = "";
        preview.style.display = "none";
    }
});

// Hàm gửi tin nhắn hoặc file
async function sendMessage() {
    const input = document.getElementById("message-input");
    const fileInput = document.getElementById("file-input");
    const message = input.value.trim();
    const file = fileInput.files[0];

    // Nếu có file thì tải lên Firebase Storage
    if (file) {
        const filePath = `uploads/${Date.now()}_${file.name}`;
        const fileRef = storageRef(storage, filePath);
        
        try {
            await uploadBytes(fileRef, file);
            const fileUrl = await getDownloadURL(fileRef);

            // Gửi tin nhắn chứa file
            push(ref(db, "messages"), {
                user: username,
                text: message || "[Đã gửi một file]",
                fileUrl: fileUrl,
                fileName: file.name,
                timestamp: Date.now()
            });

            fileInput.value = ""; // Reset file input
            document.getElementById("file-preview").style.display = "none"; // Ẩn preview file
        } catch (error) {
            console.error("Lỗi tải file:", error);
        }
    } 

    // Gửi tin nhắn nếu có nội dung
    if (message) {
        push(ref(db, "messages"), {
            user: username,
            text: message,
            fileUrl: "",
            fileName: "",
            timestamp: Date.now()
        });
    }

    input.value = "";
}

// Lắng nghe tin nhắn mới từ Firebase
onChildAdded(ref(db, "messages"), (snapshot) => {
    const msg = snapshot.val();
    const chatBox = document.getElementById("chat-box");

    // Tạo div tin nhắn
    const div = document.createElement("div");
    div.classList.add("message");
    if (msg.user === username) {
        div.classList.add("my-message");
    } else {
        div.classList.add("other-message");
    }

    // Hiển thị thời gian
    const time = new Date(msg.timestamp);
    const formattedTime = `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;

    // Hiển thị nội dung tin nhắn
    div.innerHTML = `<strong>${msg.user}:</strong> ${msg.text} <br> <span class="timestamp">${formattedTime}</span>`;

    // Nếu có file, thêm link tải xuống
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

// Bấm Enter để gửi tin nhắn nhanh hơn
document.getElementById("message-input").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }
});

// Nút "+" chọn file
document.getElementById("file-button").addEventListener("click", function () {
    document.getElementById("file-input").click();
});

// Gán sự kiện click cho nút gửi
document.getElementById("send-button").addEventListener("click", sendMessage);

// Đưa sendMessage vào global
window.sendMessage = sendMessage;