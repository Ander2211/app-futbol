// ============================================================
// ARCHIVO: lib/supabase.js
// DESCRIPCIÓN: Configuración del cliente Supabase
//
// ⚠️  INSTRUCCIONES PARA EL ESTUDIANTE:
//    1. Ve a https://supabase.com y crea/abre tu proyecto
//    2. En Settings → API, copia tu URL y tu anon key
//    3. Pega los valores en las constantes de abajo
// ============================================================

import { createClient } from '@supabase/supabase-js';

// URL del proyecto Supabase
const SUPABASE_URL = 'https://nniwuhmhuokztiwaknoz.supabase.co';

// Llave anónima pública — segura para usar en la app
// NUNCA uses la service_role key aquí, esa expone toda la BD
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uaXd1aG1odW9renRpd2Frbm96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NTU1MjEsImV4cCI6MjA5MzEzMTUyMX0.gJvpGNkmGTTb_JwqgjMhkz-r3O1q82PqnMoGQpT7Zio';

// Creamos y exportamos el cliente para usarlo en toda la app
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);