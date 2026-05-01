// js/firebase-init.js
// Reads config from window.__CONFIG__ which is injected by server.js at request time.
// API keys never live in this file — they come from .env on the server.

import { initializeApp }                          from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword,
         signInWithEmailAndPassword, signOut,
         onAuthStateChanged, updateProfile }       from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc,
         updateDoc, deleteDoc, collection,
         getDocs, query, where,
         arrayUnion, arrayRemove }                 from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const cfg = window.__CONFIG__?.firebaseConfig;

if (!cfg || cfg === '%%FIREBASE_CONFIG%%') {
  console.error('Firebase config missing — check your .env and server.js');
} else {
  try {
    const app  = initializeApp(cfg);
    const auth = getAuth(app);
    const db   = getFirestore(app);

    // Expose to non-module scripts via window
    Object.assign(window, {
      _auth: auth, _db: db,
      _fsDoc: doc, _fsSetDoc: setDoc, _fsGetDoc: getDoc,
      _fsUpdateDoc: updateDoc, _fsDeleteDoc: deleteDoc,
      _fsCollection: collection, _fsGetDocs: getDocs,
      _fsQuery: query, _fsWhere: where,
      _fsArrayUnion: arrayUnion, _fsArrayRemove: arrayRemove,
      _createUser: createUserWithEmailAndPassword,
      _signIn: signInWithEmailAndPassword,
      _signOut: signOut, _updateProfile: updateProfile,
      firebaseReady: true,
    });

    // Auth state — handled in app.js but fired from here
    onAuthStateChanged(auth, user => {
      // Wait for app.js to be ready
      if (typeof handleAuthChange === 'function') handleAuthChange(user);
      else window.addEventListener('appReady', () => handleAuthChange(user), { once: true });
    });

  } catch (e) {
    console.error('Firebase init failed:', e.message);
  }
}
