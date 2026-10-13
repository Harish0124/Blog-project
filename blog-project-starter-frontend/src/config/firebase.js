// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyBXq8U9DU7qjFiS5jlEFziaPckofRCRptI",
  authDomain: "blog-app-d3c4d.firebaseapp.com",
  projectId: "blog-app-d3c4d",
  storageBucket: "blog-app-d3c4d.firebasestorage.app",
  messagingSenderId: "791088464150",
  appId: "1:791088464150:web:720419f859e004ae84d037",
  measurementId: "G-1MQZLVGVM3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default auth;
