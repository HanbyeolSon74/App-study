import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDIY4-EXItTBNjxEwW_WSwlT3Pdc1iwchA",
  authDomain: "app-study-9c1cb.firebaseapp.com",
  projectId: "app-study-9c1cb",
  storageBucket: "app-study-9c1cb.appspot.com",
  messagingSenderId: "260540002582",
  appId: "1:260540002582:web:03ecd4afa44b024a762037",
  measurementId: "G-N6CK2GS04X",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
