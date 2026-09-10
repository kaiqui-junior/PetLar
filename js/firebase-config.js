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
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
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
