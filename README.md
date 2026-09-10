# 🐾 PetLar — Sistema Web de Adoção de Pets (TCC)

Plataforma completa para adoção de animais, onde qualquer usuário cadastrado
pode publicar um pet para adoção (com ou sem vínculo a uma ONG), buscar
pets disponíveis, favoritar anúncios e denunciar conteúdo inadequado.

Tecnologias: **HTML + CSS + JavaScript puro (vanilla) + Firebase**
(Authentication, Firestore Database e Storage). Não requer Node.js,
build tools nem frameworks — basta um servidor estático.

---

## 1. Estrutura de pastas

```
pet-adoption/
├── index.html              Página inicial
├── pets.html                Catálogo de pets com filtros
├── pet.html                 Detalhes de um pet (?id=)
├── login.html                Login
├── cadastro.html             Cadastro de usuário
├── publicar.html              Publicar/editar anúncio de pet
├── perfil.html                 Perfil do usuário logado
├── meus-anuncios.html          Anúncios do usuário logado
├── favoritos.html               Pets favoritados
├── ong.html                       Página pública de uma ONG (?id=)
├── cadastrar-ong.html              Cadastro de ONG
├── admin.html                       Painel administrativo
├── css/
│   └── style.css                    Todo o CSS do projeto (design system)
├── js/
│   ├── firebase-config.js            Configuração/credenciais do Firebase
│   ├── utils.js                       Funções auxiliares (toasts, labels, etc.)
│   ├── header.js                       Header, menu mobile, footer, sessão
│   ├── auth.js                          Cadastro, login, logout, senha
│   └── pets.js                           Busca de pets e favoritos
├── firestore.rules                        Regras de segurança do Firestore
├── storage.rules                           Regras de segurança do Storage
└── README.md
```

---

## 2. Criando o projeto no Firebase

1. Acesse **https://console.firebase.google.com/** e clique em "Adicionar projeto".
2. Dê um nome (ex: `petlar-tcc`) e finalize a criação.
3. No menu lateral, ative os seguintes produtos:
   - **Authentication** → aba "Sign-in method" → ative **E-mail/senha**.
   - **Firestore Database** → "Criar banco de dados" → inicie em **modo de produção**
     (as regras de segurança do arquivo `firestore.rules` cuidarão do acesso).
   - **Storage** → "Vamos começar" → também em modo de produção.
4. Volte em **Configurações do projeto (⚙) → Geral → Seus aplicativos**,
   clique no ícone **"</>"** (Web), dê um apelido ao app e registre.
5. O Firebase mostrará um objeto `firebaseConfig`. Copie os valores.

### Onde colocar suas credenciais

Abra o arquivo **`js/firebase-config.js`** e substitua os placeholders:

```js
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};
```

pelos valores reais copiados do console do Firebase. Nenhum outro arquivo
precisa ser alterado — todas as páginas usam este arquivo central.

---

## 3. Publicando as regras de segurança

Você pode colar o conteúdo manualmente no console (mais simples para TCC)
ou usar a Firebase CLI.

### Opção A — Manual (recomendado para TCC)
- **Firestore:** Console → Firestore Database → aba "Regras" → cole o
  conteúdo de `firestore.rules` → Publicar.
- **Storage:** Console → Storage → aba "Regras" → cole o conteúdo de
  `storage.rules` → Publicar.

### Opção B — Via Firebase CLI
```bash
npm install -g firebase-tools
firebase login
firebase init            # selecione Firestore e Storage, aponte para os arquivos .rules existentes
firebase deploy --only firestore:rules,storage:rules
```

---

## 4. Estrutura do banco de dados (Firestore)

Coleções criadas automaticamente pelo próprio sistema ao ser usado
(não é necessário criar manualmente):

**users/{uid}**
```
name, email, city, state, phone, profileImage,
ongId (string|null), role ("user" | "admin"),
blocked (bool), createdAt
```

**pets/{petId}**
```
ownerId, ongId (string|null), name, species, breed, sex, age, size,
city, state, description, story, vaccinated (bool), neutered (bool),
specialNeeds, contactMethod, images (array), mainImage,
status ("disponivel" | "pendente" | "adotado"), createdAt
```

**ongs/{ongId}**
```
ownerId, name, cnpj, description, city, state, address, phone, email,
instagram, website, logo, images, status ("pendente"|"aprovada"|"rejeitada"),
createdAt
```

**favorites/{favId}**
```
userId, petId, createdAt
```

**reports/{reportId}**
```
petId, petName, reportedBy, reason, description,
status ("pendente"|"resolvida"), createdAt
```

---

## 5. Criando o primeiro usuário administrador

O painel `admin.html` só é acessível a usuários com `role: "admin"`
no Firestore. Para criar o seu:

1. Cadastre-se normalmente pelo site (`cadastro.html`).
2. No **Console do Firebase → Firestore Database → coleção `users`**,
   encontre o documento com o seu UID.
3. Edite o campo `role` de `"user"` para `"admin"`.
4. Faça logout/login novamente — o link "Painel admin" aparecerá no
   menu do usuário.

---

## 6. Como executar o projeto localmente

Como o projeto é 100% estático (HTML/CSS/JS), basta servir os arquivos
por HTTP (não abra o `index.html` direto com duplo-clique, pois módulos
e o Firebase podem ter restrições em `file://`).

**Opção 1 — VS Code:** instale a extensão "Live Server" e clique em
"Go Live" com `index.html` aberto.

**Opção 2 — Python:**
```bash
cd pet-adoption
python -m http.server 8000
```
Depois acesse `http://localhost:8000`.

**Opção 3 — Firebase Hosting (para publicar de verdade):**
```bash
firebase init hosting     # aponte o diretório público para a pasta pet-adoption
firebase deploy --only hosting
```

---

## 7. Fluxo de uso resumido

1. Usuário se cadastra (`cadastro.html`) → perfil criado automaticamente no Firestore.
2. Usuário publica um pet (`publicar.html`) escolhendo "pessoa física" ou "minha ONG".
3. Opcionalmente, cadastra uma ONG (`cadastrar-ong.html`) para publicar em nome dela.
4. Visitantes navegam pelo catálogo (`pets.html`), aplicam filtros e veem detalhes (`pet.html`).
5. Usuários logados podem favoritar, demonstrar interesse e denunciar anúncios.
6. O dono do anúncio gerencia tudo em `meus-anuncios.html` (editar, excluir, marcar como adotado).
7. O administrador acompanha tudo pelo `admin.html`.

---

## 8. Observações importantes

- As consultas ao Firestore foram propositalmente feitas com filtros
  simples + ordenação no lado do cliente (JavaScript), evitando a
  necessidade de criar índices compostos manualmente — ideal para
  ambiente de apresentação de TCC.
- Os dados de contato do responsável só aparecem na página de detalhes
  para usuários autenticados, atendendo ao requisito de não expor dados
  desnecessariamente.
- O cadastro de ONG já entra com status "aprovada" para simplificar
  testes; o administrador pode alterar o status (pendente/aprovada/
  rejeitada) a qualquer momento pelo painel admin.
