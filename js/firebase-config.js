const firebaseConfig = {
  apiKey: "AIzaSyAonz10Oh3nI7BYc9DiYboOhUJ70ak9Ayk",
  authDomain: "petlar-47cf9.firebaseapp.com",
  projectId: "petlar-47cf9",
  storageBucket: "petlar-47cf9.firebasestorage.app",
  messagingSenderId: "237840983840",
  appId: "1:237840983840:web:612301b8c2e5c9c0f31945",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

const ADMIN_EMAILS = [];
