/* ==========================================================================
   pets.js - Funções compartilhadas de busca de pets e favoritos
   Usado em: index.html, pets.html, ong.html
   ========================================================================== */

let CURRENT_USER = null;
let USER_FAVORITES = new Set();

function onAuthReady(user){
  CURRENT_USER = user;
  if(user){
    carregarFavoritosUsuario(user.uid).then(() => atualizarBotoesFavorito());
  } else {
    USER_FAVORITES = new Set();
    atualizarBotoesFavorito();
  }
}

async function carregarFavoritosUsuario(uid){
  const snap = await db.collection('favorites').where('userId', '==', uid).get();
  USER_FAVORITES = new Set(snap.docs.map(d => d.data().petId));
}

function atualizarBotoesFavorito(){
  document.querySelectorAll('.js-fav-btn').forEach(btn => {
    const petId = btn.dataset.id;
    if(USER_FAVORITES.has(petId)){
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Delegação de evento para os botões de favoritar dentro dos cards
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.js-fav-btn');
  if(!btn) return;
  e.preventDefault();

  if(!CURRENT_USER){
    showToast('Você precisa estar logado para favoritar um pet.', 'warning');
    return;
  }

  const petId = btn.dataset.id;
  btn.disabled = true;
  try{
    if(USER_FAVORITES.has(petId)){
      const snap = await db.collection('favorites')
        .where('userId', '==', CURRENT_USER.uid)
        .where('petId', '==', petId).get();
      snap.forEach(doc => doc.ref.delete());
      USER_FAVORITES.delete(petId);
      showToast('Removido dos favoritos.', 'success');
    } else {
      await db.collection('favorites').add({
        userId: CURRENT_USER.uid,
        petId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      USER_FAVORITES.add(petId);
      showToast('Adicionado aos favoritos!', 'success');
    }
    atualizarBotoesFavorito();
  }catch(err){
    showToast(traduzirErroFirebase(err), 'error');
  }
  btn.disabled = false;
});

// ---------- Busca de pets ----------
// Busca todos os pets disponíveis (status != adotado por padrão) e filtra no cliente,
// evitando a necessidade de índices compostos no Firestore.
async function buscarPets({ ownerId = null, ongId = null, incluirAdotados = true } = {}){
  let query = db.collection('pets');
  if(ownerId){
    query = query.where('ownerId', '==', ownerId);
  } else if(ongId){
    query = query.where('ongId', '==', ongId);
  }
  const snap = await query.get();
  let pets = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  if(!ownerId && !incluirAdotados){
    pets = pets.filter(p => p.status !== 'adotado');
  }
  pets.sort((a, b) => {
    const ta = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
    const tb = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
    return tb - ta;
  });
  return pets;
}

function aplicarFiltrosPets(pets, filtros){
  return pets.filter(p => {
    if(filtros.species && p.species !== filtros.species) return false;
    if(filtros.sex && p.sex !== filtros.sex) return false;
    if(filtros.age && p.age !== filtros.age) return false;
    if(filtros.size && p.size !== filtros.size) return false;
    if(filtros.state && p.state !== filtros.state) return false;
    if(filtros.city && !(p.city || '').toLowerCase().includes(filtros.city.toLowerCase())) return false;
    if(filtros.breed && !(p.breed || '').toLowerCase().includes(filtros.breed.toLowerCase())) return false;
    if(filtros.status && p.status !== filtros.status) return false;
    if(filtros.hasOng === 'com' && !p.ongId) return false;
    if(filtros.hasOng === 'sem' && p.ongId) return false;
    if(filtros.busca){
      const alvo = `${p.name} ${p.breed} ${p.city} ${p.state}`.toLowerCase();
      if(!alvo.includes(filtros.busca.toLowerCase())) return false;
    }
    return true;
  });
}
