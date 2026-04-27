if (!firebase.apps.length) {
  const firebaseConfig = {
    apiKey: "AIzaSyB6ltcNGs_YuZwLjIr9XTHiVEkgqXVgoQ",
    authDomain: "https://investbtc.netlify.app",
    projectId: "c18965ac-89d5-4893-855f-61a02f38c9f1"
  };

  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();