/* ============================================
   BUDZ SPORTS HUB — Firebase Integration
   ============================================ */

import { initializeApp } from "firebase/app";
import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp
} from "firebase/firestore";

// ------------------------------------
// Firebase Config
// ------------------------------------
const firebaseConfig = {
    apiKey: "AIzaSyB-pwMoZ0jc9ESdqDrPpsZzfOPk96pMQgY",
    authDomain: "budshub-ed94d.firebaseapp.com",
    projectId: "budshub-ed94d",
    storageBucket: "budshub-ed94d.firebasestorage.app",
    messagingSenderId: "1043175106650",
    appId: "1:1043175106650:web:def4d86374d654d0c29063",
    measurementId: "G-K7WTN4FXY1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ------------------------------------
// Generate a human-readable booking #
// e.g. BSH-A3K7MQ
// ------------------------------------
function generateBookingNumber() {
    // Omit confusing chars: 0/O, 1/I, 5/S
    const chars = 'ABCDEFGHJKLMNPQRTUVWXYZ2346789';
    let num = 'BSH-';
    for (let i = 0; i < 6; i++) {
        num += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return num;
}

// ------------------------------------
// Save a booking to Firestore
// Returns { success, bookingNumber, id }
// ------------------------------------
export async function saveBooking(data) {
    const bookingNumber = generateBookingNumber();

    const docRef = await addDoc(collection(db, "bookings"), {
        ...data,
        bookingNumber,
        status:    "pending",
        createdAt: serverTimestamp()
    });

    console.log(`✅ Booking saved — ID: ${docRef.id} | #${bookingNumber}`);
    return { success: true, id: docRef.id, bookingNumber };
}
