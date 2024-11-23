
/**
 * Verifica se o usuário está autenticado.
 * 
 * @function checkAuthentication
 * @returns {void}
 */
function checkAuthentication() {
    // Recupera o token de autenticação do localStorage
    const authToken = localStorage.getItem('authToken');
    
    // Páginas que requerem autenticação
    const protectedPages = [
        'dashboard.html'
        // Adicione outras páginas aquis
    ];

    // Página atual
    const currentPage = window.location.pathname.split('/').pop();

    // Verifica se a página atual é protegida
    const isProtectedPage = protectedPages.includes(currentPage);

    // Se for página protegida e não tiver token, redireciona para login
    if (isProtectedPage && !authToken) {
       
        window.location.href = 'index.html';
        alert('Você precisa estar autenticado para acessar esta página.');
    }
}

// Função de login
const validUser = atob("ZGV2QHRlaWF4LmNvbQ==");
    const validPassword = atob("MTIzNDU2");


    

/**
 * Função para realizar login com username e password
 *
 * @param {string} username Usuário = dev@teiax.com
 * @param {string} password Senha = 123456
 *
 * Verifica credenciais com as constantes validUser e validPassword,
 *   e se forem válidas, armazena um token de autenticação no localStorage
 *   e redireciona para a página de dashboard.
 */
function login(username, password) {
    // Simulação de verificação de credenciais 
    // NO MUNDO REAL, ISSO DEVE SER FEITO NO BACKEND
    if (username === validUser && password === validPassword) {
        // Gera um token simples (no mundo real, deve ser gerado no backend)
        const token = btoa(`${username}:${password}`);
        
        // Armazena o token
        localStorage.setItem('authToken', token);
        
        // Redireciona para dashboard
        window.location.href = 'dashboard.html';
    } else {
        alert('Credenciais inválidas');
    }
}

// Função de logout
function logout() {
    // Remove o token
    localStorage.removeItem('authToken');
    
    // Redireciona para página de login
    window.location.href = 'index.html';
}

// Adiciona event listeners quando o DOM estiver carregado


document.addEventListener('DOMContentLoaded', () => {
    // Verifica autenticação
    checkAuthentication();

    // Captura botão de login se existir
    const loginForm = document.querySelector('#login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.querySelector('#username').value;
            const password = document.querySelector('#password').value;
            login(username, password);
        });
    }

    // Captura botão de logout se existir
    const logoutButton = document.querySelector('.logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});