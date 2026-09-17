/* ==========================================================================
   firebase-config.js
   Configuração do Firebase para o projeto PetLar.

   >>> SUBSTITUA os valores abaixo pelas credenciais do SEU projeto Firebase <<<

   Onde encontrar suas credenciais:
   1. Acesse https://console.firebase.google.com/
   2. Crie um projeto (ou selecione um existente)
   3. Vá em "Configurações do projeto" (ícone de engrenagem) > "Geral"
   4. Role até "Seus aplicativos" e clique no ícone "</>" (Web) para criar um app web
   5. O Firebase vai te mostrar um objeto firebaseConfig igual ao abaixo.
      Copie e cole os valores reais no lugar dos placeholders.
   ========================================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyAonz10Oh3nI7BYc9DiYboOhUJ70ak9Ayk",
  authDomain: "petlar-47cf9.firebaseapp.com",
  projectId: "petlar-47cf9",
  storageBucket: "petlar-47cf9.firebasestorage.app",
  messagingSenderId: "237840983840",
  appId: "1:237840983840:web:612301b8c2e5c9c0f31945",
};

// Inicializa o Firebase (usando SDK compat, carregado via <script> no HTML)
firebase.initializeApp(firebaseConfig);

// Instâncias globais usadas em todo o site
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// UID de administradores. Alternativamente, use o campo "role":"admin"
// no documento do usuário em /users/{uid} (recomendado - veja README.md).
const ADMIN_EMAILS = [
  // "admin@petlar.com"
];
