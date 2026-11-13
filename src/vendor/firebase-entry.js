export { initializeApp } from "firebase/app";
export { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from "firebase/auth";
export { getFirestore, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, collection, query, where, orderBy, limit, runTransaction, serverTimestamp, Timestamp } from "firebase/firestore/lite";
