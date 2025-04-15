document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const success = await login(email, password);
            
            if (success) {
                // Redirigir según el rol del usuario
                const userRole = getUserRole();
                switch(userRole) {
                    case 'ADM':
                        window.location.href = 'admin/dashboard.html';
                        break;
                    case 'JEF':
                        window.location.href = 'jefe/dashboard.html';
                        break;
                    case 'OPE':
                        window.location.href = 'operario/dashboard.html';
                        break;
                    case 'CLI':
                        window.location.href = 'cliente/dashboard.html';
                        break;
                    default:
                        window.location.href = 'index.html';
                }
            } else {
                // Mostrar mensaje de error
                alert('Credenciales incorrectas. Por favor, inténtelo de nuevo.');
            }
        } catch (error) {
            console.error('Error en el proceso de login:', error);
            alert('Ha ocurrido un error. Por favor, inténtelo de nuevo más tarde.');
        }
    });
}); 