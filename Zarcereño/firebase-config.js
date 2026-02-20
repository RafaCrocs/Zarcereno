// Importa las funciones que necesitas de los SDKs que necesitas
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// TODO: Reemplaza la siguiente configuración con la de tu proyecto de Firebase
// Tienes que ir a la consola de Firebase > Project settings > General > Your apps > SDK setup and configuration
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
