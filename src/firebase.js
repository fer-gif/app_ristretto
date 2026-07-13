import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBKDLrDOJ1sY65xAlfPJkJRavbvAuuAt-k",
  authDomain: "ristrettoapp-e7857.firebaseapp.com",
  projectId: "ristrettoapp-e7857",
  storageBucket: "ristrettoapp-e7857.firebasestorage.app",
  messagingSenderId: "441978261845",
  appId: "1:441978261845:web:6b985bb20625903bd69fdc",
  measurementId: "G-2QFHGGK5T5"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore con persistencia local multianclaje (Soporte Offline para múltiples pestañas)
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export { db };
