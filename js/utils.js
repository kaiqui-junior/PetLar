/* ==========================================================================
   utils.js - Funções auxiliares usadas em todas as páginas
   ========================================================================== */

// ---------- Toasts (mensagens de sucesso/erro/aviso) ----------
function ensureToastContainer(){
  let c = document.getElementById('toast-container');
  if(!c){
    c = document.createElement('div');
    c.id = 'toast-container';
    document.body.appendChild(c);
  }
  return c;
}

function showToast(message, type = 'success', duration = 3500){
  const container = ensureToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity .3s';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ---------- Tradução de mensagens de erro do Firebase ----------
function traduzirErroFirebase(error){
  const code = error && error.code ? error.code : '';
  const map = {
    'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
    'auth/invalid-email': 'E-mail inválido.',
    'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
    'auth/user-not-found': 'E-mail ou senha incorretos.',
    'auth/wrong-password': 'E-mail ou senha incorretos.',
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
    'auth/network-request-failed': 'Falha de conexão. Verifique sua internet.',
    'auth/user-disabled': 'Esta conta foi bloqueada pelo administrador.',
    'permission-denied': 'Você não tem permissão para realizar esta ação.'
  };
  return map[code] || (error && error.message) || 'Ocorreu um erro inesperado. Tente novamente.';
}

// ---------- Modal de confirmação genérico ----------
function confirmarAcao(titulo, mensagem){
  return new Promise((resolve) => {
    const overlay = document.getElementById('confirm-modal');
    overlay.querySelector('.js-confirm-title').textContent = titulo;
    overlay.querySelector('.js-confirm-message').textContent = mensagem;
    overlay.classList.add('open');

    const btnOk = overlay.querySelector('.js-confirm-ok');
    const btnCancel = overlay.querySelector('.js-confirm-cancel');

    function cleanup(result){
      overlay.classList.remove('open');
      btnOk.removeEventListener('click', onOk);
      btnCancel.removeEventListener('click', onCancel);
      resolve(result);
    }
    function onOk(){ cleanup(true); }
    function onCancel(){ cleanup(false); }

    btnOk.addEventListener('click', onOk);
    btnCancel.addEventListener('click', onCancel);
  });
}

function injectConfirmModal(){
  if(document.getElementById('confirm-modal')) return;
  const div = document.createElement('div');
  div.id = 'confirm-modal';
  div.className = 'modal-overlay';
  div.innerHTML = `
    <div class="modal-box">
      <h3 class="js-confirm-title">Confirmar ação</h3>
      <p class="js-confirm-message">Tem certeza?</p>
      <div class="modal-actions">
        <button class="btn btn-ghost js-confirm-cancel">Cancelar</button>
        <button class="btn btn-danger js-confirm-ok">Confirmar</button>
      </div>
    </div>`;
  document.body.appendChild(div);
}

// ---------- Formatação ----------
function formatarData(timestamp){
  if(!timestamp) return '-';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function getParam(name){
  return new URLSearchParams(window.location.search).get(name);
}

function debounce(fn, delay = 400){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ---------- Mapas de rótulos (usados em cards, filtros e detalhes) ----------
const LABELS = {
  species: { cachorro: 'Cachorro', gato: 'Gato', outros: 'Outro' },
  sex: { macho: 'Macho', femea: 'Fêmea' },
  age: { filhote: 'Filhote', jovem: 'Jovem', adulto: 'Adulto', idoso: 'Idoso' },
  size: { pequeno: 'Pequeno', medio: 'Médio', grande: 'Grande' },
  status: { disponivel: 'Disponível', pendente: 'Pendente', adotado: 'Adotado' },
  ongStatus: { pendente: 'Pendente', aprovada: 'Aprovada', rejeitada: 'Rejeitada' }
};

const ESTADOS_BR = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

function petCardHTML(pet){
  const img = pet.mainImage || (pet.images && pet.images[0]) || 'https://placehold.co/400x300?text=Pet';
  const badge = pet.status === 'adotado'
    ? `<span class="pet-card-badge adopted">Adotado</span>`
    : `<span class="pet-card-badge">Disponível</span>`;
  return `
  <div class="pet-card" data-id="${pet.id}">
    <a href="pet.html?id=${pet.id}" class="pet-card-img">
      <img src="${img}" alt="${pet.name}" loading="lazy">
      ${badge}
    </a>
    <button class="pet-card-fav js-fav-btn" data-id="${pet.id}" title="Favoritar">♥</button>
    <div class="pet-card-body">
      <h3>${pet.name}</h3>
      <div class="pet-card-meta">
        <span>${LABELS.species[pet.species] || pet.species}</span>
        <span>${pet.breed || 'SRD'}</span>
        <span>${LABELS.age[pet.age] || pet.age}</span>
        <span>${LABELS.sex[pet.sex] || pet.sex}</span>
      </div>
      <div class="pet-card-location">📍 ${pet.city || ''}/${pet.state || ''}</div>
    </div>
    <div class="pet-card-footer">
      <a href="pet.html?id=${pet.id}" class="btn btn-outline btn-block btn-sm">Ver detalhes</a>
    </div>
  </div>`;
}

document.addEventListener('DOMContentLoaded', injectConfirmModal);

// ---------- Busca de cidades por estado (API pública do IBGE) ----------
async function buscarCidadesPorUF(uf){
  const resp = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
  if(!resp.ok) throw new Error('Falha ao buscar cidades do IBGE');
  const data = await resp.json();
  return data.map(m => m.nome).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

function preencherSelectComoCarregando(selectEl, texto = 'Carregando cidades...'){
  selectEl.innerHTML = `<option value="">${texto}</option>`;
  selectEl.disabled = true;
}

// ---------- Upload de imagens via Cloudinary (gratuito, sem necessidade de cartão) ----------
const CLOUDINARY_CLOUD_NAME = "px9ptpxc";
const CLOUDINARY_UPLOAD_PRESET = "petlar";
async function uploadParaCloudinary(file){
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const resp = await fetch(url, { method: 'POST', body: formData });
  if(!resp.ok){
    const errData = await resp.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'Falha ao enviar imagem. Verifique sua conexão.');
  }
  const data = await resp.json();
  return data.secure_url;
}