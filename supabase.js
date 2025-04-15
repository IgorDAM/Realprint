// supabase.js

// URLs y claves de Supabase
const SUPABASE_URL ='https://zcpivnfdfpppimgyjpti.supabase.co'; // Reemplaza con tu URL real de Supabase
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjcGl2bmZkZnBwcGltZ3lqcHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MzYxODEsImV4cCI6MjA2MDMxMjE4MX0.2so46AMmFTEpxxY_YK1-Sy0dJ5U6MwrJQXJHe6szy6I';        // Reemplaza con tu clave pública

// Inicializar el cliente de Supabase
const supabase = supabaseJs.createClient(supabaseUrl, supabaseKey);

// Funciones auxiliares para operaciones comunes con la base de datos

// Funciones de autenticación
async function signUp(email, password) {
    return await supabase.auth.signUp({
        email,
        password,
    });
}

async function signIn(email, password) {
    return await supabase.auth.signInWithPassword({
        email,
        password,
    });
}

async function signOut() {
    return await supabase.auth.signOut();
}

async function getCurrentUser() {
    return await supabase.auth.getUser();
}

// Función para redirigir al usuario si no está autenticado
async function checkAuth(redirectUrl = 'index.html') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = redirectUrl;
    }
    return user;
}
