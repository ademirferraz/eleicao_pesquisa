#!/bin/bash
echo "🚀 Iniciando a reconstrução do FrankAlexandre..."

# 1. Organização de Pastas
mkdir -p src

# 2. Movendo arquivos para a src (se estiverem na raiz)
[ -f App.tsx ] && mv App.tsx src/
[ -f main.tsx ] && mv main.tsx src/
[ -f index.css ] && mv index.css src/

# 3. Criando o index.html na RAIZ (O Mapa)
cat << 'HTML' > index.html
<!DOCTYPE html>
<html lang="pt-br">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sistema Eleitoral - Dr. Ademir Ferraz</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
HTML

# 4. Criando o src/main.tsx (O Interruptor)
cat << 'TSX' > src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
TSX

# 5. Limpeza de Cache
rm -rf node_modules/.vite

echo "✅ Tudo organizado! Agora é só rodar: npx vite"
