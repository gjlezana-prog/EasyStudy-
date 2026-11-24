EASYSTUDY — Sitio listo para Netlify

CONTENIDO
- Generador de resúmenes con IA
- Mini examen de 5 preguntas con puntaje y explicaciones
- Guardado local de resúmenes
- Modo oscuro/claro
- Diseño adaptable a celular y computadora

PUBLICAR EN NETLIFY
1. Descomprimí EasyStudy.zip.
2. Subí la carpeta/proyecto a un repositorio GitHub o arrastrá la carpeta a Netlify.
3. En Netlify: Site configuration > Environment variables.
4. Agregá OPENAI_API_KEY con tu clave secreta de API.
5. Volvé a desplegar el sitio.

IMPORTANTE
La web puede publicarse sin la clave, pero el generador y el mini examen no funcionarán hasta configurar OPENAI_API_KEY.
No pongas la clave en index.html ni en app.js. Se usa una Netlify Function para mantenerla del lado del servidor.
La API puede generar costos según el uso y las tarifas vigentes del proveedor.
