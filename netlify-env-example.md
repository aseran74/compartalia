# Variables de Entorno para Netlify

Para que la aplicación funcione correctamente en Netlify, necesitas configurar las siguientes variables de entorno en el panel de Netlify:

## Variables Requeridas:

```
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
VITE_GOOGLE_MAPS_API_KEY=tu_clave_de_google_maps
VITE_GOOGLE_PLACES_API_KEY=tu_clave_de_google_places
VITE_NOMINATIM_API_URL=https://nominatim.openstreetmap.org
```

## Cómo configurar en Netlify:

1. Ve a tu sitio en Netlify
2. Ve a Site settings > Environment variables
3. Agrega cada variable con su valor correspondiente
4. Haz un redeploy del sitio

## Nota:
- Las variables deben empezar con `VITE_` para que Vite las incluya en el build
- No incluyas comillas en los valores
- Asegúrate de que las claves de API tengan los permisos correctos
