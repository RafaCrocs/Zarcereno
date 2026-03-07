
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";


const firebaseConfig = {
    apiKey: "AIzaSyBCiFCeNAwi-gM4tW-AiFW8MVNPwO37pwg",
    authDomain: "zarcereno-f6b3b.firebaseapp.com",
    projectId: "zarcereno-f6b3b",
    storageBucket: "zarcereno-f6b3b.firebasestorage.app",
    messagingSenderId: "618781671699",
    appId: "1:618781671699:web:8ef59b0326b9013a3bdae6"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
