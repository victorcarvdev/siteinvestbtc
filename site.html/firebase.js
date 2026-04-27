const firebaseConfig = {
  apiKey: "SUA_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_ID"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();