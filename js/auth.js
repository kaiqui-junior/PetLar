/* ==========================================================================
   auth.js - Cadastro, login, logout, recuperação de senha
   ========================================================================== */

// ---------- Cadastro ----------
async function registrarUsuario({ name, email, password, city, state, phone }){
  const cred = await auth.createUserWithEmailAndPassword(email, password);
  const uid = cred.user.uid;

  await db.collection('users').doc(uid).set({
    name,
    email,
    city: city || '',
    state: state || '',
    phone: phone || '',
    profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2E9E6B&color=fff`,
    ongId: null,
    role: 'user',
    blocked: false,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  await cred.user.updateProfile({ displayName: name });
  return cred.user;
}

// ---------- Login ----------
async function loginUsuario(email, password){
  const cred = await auth.signInWithEmailAndPassword(email, password);

  // verifica se usuário está bloqueado
  const snap = await db.collection('users').doc(cred.user.uid).get();
  if(snap.exists && snap.data().blocked){
    await auth.signOut();
    throw { code: 'auth/user-disabled' };
  }
  return cred.user;
}

// ---------- Recuperação de senha ----------
function recuperarSenha(email){
  return auth.sendPasswordResetEmail(email);
}

// ---------- Helpers de página protegida ----------
function exigirLogin(callback){
  auth.onAuthStateChanged((user) => {
    if(!user){
      showToast('Você precisa estar logado para acessar esta página.', 'warning');
      setTimeout(() => window.location.href = 'login.html', 1200);
    } else {
      callback(user);
    }
  });
}

async function exigirAdmin(callback){
  auth.onAuthStateChanged(async (user) => {
    if(!user){
      showToast('Acesso restrito. Faça login.', 'warning');
      setTimeout(() => window.location.href = 'login.html', 1200);
      return;
    }
    const snap = await db.collection('users').doc(user.uid).get();
    const data = snap.exists ? snap.data() : null;
    if(!data || data.role !== 'admin'){
      showToast('Você não tem permissão para acessar o painel administrativo.', 'error');
      setTimeout(() => window.location.href = 'index.html', 1400);
      return;
    }
    callback(user, data);
  });
}

async function getUserData(uid){
  const snap = await db.collection('users').doc(uid).get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
}
