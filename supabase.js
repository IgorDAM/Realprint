// supabase.js

// URLs y claves de Supabase
const SUPABASE_URL ='https://zcpivnfdfpppimgyjpti.supabase.co'; // Reemplaza con tu URL real de Supabase
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjcGl2bmZkZnBwcGltZ3lqcHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MzYxODEsImV4cCI6MjA2MDMxMjE4MX0.2so46AMmFTEpxxY_YK1-Sy0dJ5U6MwrJQXJHe6szy6I';        // Reemplaza con tu clave pública

// Inicializar el cliente de Supabase
const supabase = supabaseJs.createClient(supabaseUrl, supabaseKey);

// Funciones auxiliares para operaciones comunes con la base de datos

// Obtener todos los registros de una tabla
async function getAllRecords(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*');
    
  if (error) {
    console.error(`Error al obtener registros de ${tableName}:`, error);
    return null;
  }
  
  return data;
}

// Obtener un registro por ID
async function getRecordById(tableName, id) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error(`Error al obtener registro #${id} de ${tableName}:`, error);
    return null;
  }
  
  return data;
}

// Insertar un nuevo registro
async function insertRecord(tableName, record) {
  const { data, error } = await supabase
    .from(tableName)
    .insert([record])
    .select();
    
  if (error) {
    console.error(`Error al insertar en ${tableName}:`, error);
    return { success: false, error };
  }
  
  return { success: true, data };
}

// Actualizar un registro existente
async function updateRecord(tableName, id, updates) {
  const { data, error } = await supabase
    .from(tableName)
    .update(updates)
    .eq('id', id)
    .select();
    
  if (error) {
    console.error(`Error al actualizar registro #${id} en ${tableName}:`, error);
    return { success: false, error };
  }
  
  return { success: true, data };
}

// Eliminar un registro
async function deleteRecord(tableName, id) {
  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error(`Error al eliminar registro #${id} de ${tableName}:`, error);
    return { success: false, error };
  }
  
  return { success: true };
}