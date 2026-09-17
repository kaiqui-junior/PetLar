/* ==========================================================================
   header.js - Header, menu mobile e footer, comuns a todas as páginas.
   Cada página só precisa ter:
     <div id="site-header"></div>  e  <div id="site-footer"></div>
   e incluir este script.
   ========================================================================== */

function renderHeaderSkeleton(activePage){
  const header = document.getElementById('site-header');
  if(!header) return;

  header.innerHTML = `
    <div class="container">
      <a href="index.html" class="logo">🐾 Pet<span>Lar</span></a>

      <nav class="nav-desktop">
        <a href="index.html" data-page="index">Início</a>
        <a href="pets.html" data-page="pets">Encontrar pets</a>
        <a href="publicar.html" data-page="publicar">Publicar pet</a>
        <a href="cadastrar-ong.html" data-page="ong">Minha ONG</a>
      </nav>

      <div class="header-actions">
        <form class="header-search" onsubmit="event.preventDefault(); window.location.href='pets.html?busca=' + encodeURIComponent(this.q.value);">
          <input type="text" name="q" placeholder="Buscar Pets...">
        </form>
        <div id="auth-area"></div>
        <button class="mobile-toggle" id="mobile-toggle-btn" aria-label="Menu">☰</button>
      </div>
    </div>
    <div class="nav-mobile" id="nav-mobile">
      <a href="index.html">Início</a>
      <a href="pets.html">Encontrar pets</a>
      <a href="publicar.html">Publicar pet</a>
      <a href="cadastrar-ong.html">Minha ONG</a>
      <div id="auth-area-mobile"></div>
    </div>
  `;

  // marca link ativo
  header.querySelectorAll(`[data-page="${activePage}"]`).forEach(el => el.classList.add('active'));

  document.getElementById('mobile-toggle-btn').addEventListener('click', () => {
    document.getElementById('nav-mobile').classList.toggle('open');
  });
}

function renderAuthArea(user, userData){
  const desktop = document.getElementById('auth-area');
  const mobile = document.getElementById('auth-area-mobile');
  if(!desktop || !mobile) return;

  if(!user){
    desktop.innerHTML = `
      <a href="login.html" class="btn btn-outline btn-sm"><span class="btn-text">Entrar</span></a>
      <a href="publicar.html" class="btn btn-primary btn-sm"><span class="btn-text">Publicar pet</span></a>
    `;
    mobile.innerHTML = `
      <a href="login.html" class="btn btn-outline btn-block">Entrar</a>
      <a href="cadastro.html" class="btn btn-primary btn-block">Cadastrar-se</a>
    `;
    return;
  }

  const nome = (userData && userData.name) ? userData.name : (user.email || 'Usuário');
  const foto = (userData && userData.profileImage) ? userData.profileImage : `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=2E9E6B&color=fff`;
  const isAdmin = userData && userData.role === 'admin';

  desktop.innerHTML = `
    <a href="publicar.html" class="btn btn-primary btn-sm"><span class="btn-text">Publicar pet</span></a>
    <div class="user-menu" id="user-menu">
        <button class="user-avatar-btn" id="user-menu-btn"><img src="${foto}" alt="${nome}"></button>
        <div class="user-dropdown" id="user-dropdown">
        <a href="perfil.html">👤 Meu perfil</a>
        <a href="meus-anuncios.html">🐶 Meus anúncios</a>
        <a href="favoritos.html">❤ Favoritos</a>
        ${isAdmin ? '<a href="admin.html">⚙ Painel admin</a>' : ''}
        <button id="logout-btn-desktop">🚪 Sair</button>
      </div>
    </div>
  `;
  mobile.innerHTML = `
    <a href="perfil.html">👤 Meu perfil</a>
    <a href="meus-anuncios.html">🐶 Meus anúncios</a>
    <a href="favoritos.html">❤ Favoritos</a>
    ${isAdmin ? '<a href="admin.html">⚙ Painel admin</a>' : ''}
    <button id="logout-btn-mobile" class="btn btn-danger btn-block">Sair</button>
  `;

  document.getElementById('user-menu-btn').addEventListener('click', () => {
    document.getElementById('user-dropdown').classList.toggle('open');
  });
  document.getElementById('logout-btn-desktop').addEventListener('click', fazerLogout);
  document.getElementById('logout-btn-mobile').addEventListener('click', fazerLogout);

  // fecha dropdown ao clicar fora do menu (botão + dropdown inteiros)
  document.addEventListener('click', function(e){
    const dropdown = document.getElementById('user-dropdown');
    const userMenu = document.getElementById('user-menu');
    if(dropdown && userMenu && !userMenu.contains(e.target)){
      dropdown.classList.remove('open');
    }
  });
}

function renderFooterHTML(){
  const footer = document.getElementById('site-footer');
  if(!footer) return;
  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div>
          <h4>🐾 PetLar</h4>
          <p>Plataforma criada para conectar animais que precisam de um lar a pessoas dispostas a adotar com responsabilidade e amor. Projeto acadêmico (TCC) sem fins comerciais.</p>
        </div>
        <div>
          <h4>Navegação</h4>
          <a href="index.html">Início</a><br>
          <a href="pets.html">Encontrar pets</a><br>
          <a href="publicar.html">Publicar pet</a><br>
          <a href="cadastrar-ong.html">Cadastrar ONG</a>
        </div>
        <div>
          <h4>Minha conta</h4>
          <a href="login.html">Entrar</a><br>
          <a href="cadastro.html">Criar conta</a><br>
          <a href="perfil.html">Meu perfil</a><br>
          <a href="favoritos.html">Favoritos</a>
        </div>
        <div>
          <h4>Sobre</h4>
          <p>Trabalho de Conclusão de Curso<br>Desenvolvido com HTML, CSS, JavaScript e Firebase.</p>
        </div>
      </div>
      <div class="footer-bottom">© ${new Date().getFullYear()} PetLar — Projeto acadêmico de adoção de animais.</div>
    </div>
  `;
}

// Inicializa header/footer e observa estado de autenticação
function initLayout(activePage){
  renderHeaderSkeleton(activePage);
  renderFooterHTML();
  renderAuthArea(null, null);

  auth.onAuthStateChanged(async (user) => {
    if(user){
      let userData = null;
      try{
        const snap = await db.collection('users').doc(user.uid).get();
        if(snap.exists) userData = snap.data();
      }catch(e){ console.error(e); }
      renderAuthArea(user, userData);
      if(typeof onAuthReady === 'function') onAuthReady(user, userData);
    } else {
      renderAuthArea(null, null);
      if(typeof onAuthReady === 'function') onAuthReady(null, null);
    }
  });
}

function fazerLogout(){
  auth.signOut().then(() => {
    showToast('Você saiu da sua conta.', 'success');
    setTimeout(() => window.location.href = 'index.html', 800);
  });
}
