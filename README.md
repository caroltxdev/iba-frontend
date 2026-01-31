# Ĩbá Frontend - Sistema de Monitoramento Ambiental Comunitário

Interface web para registro e consulta de ocorrências ambientais comunitárias.

## 🚀 Tecnologias

- HTML5
- CSS3
- JavaScript (ES6+)
- Fetch API (comunicação com backend)

## 📋 Requisitos

- Navegador moderno (Chrome, Firefox, Edge)
- Python 3.x OU Node.js (para servidor HTTP local)
- Backend rodando em `http://localhost:8080`

## 🌐 Como Rodar

### Opção 1: Python (Recomendado)
```bash
cd iba-frontend/src
python -m http.server 4200
```

Acesse: **http://localhost:4200/registrar.html**

### Opção 2: Node.js
```bash
cd iba-frontend/src
npx http-server -p 4200
```

### Opção 3: VS Code Live Server

1. Instale a extensão **"Live Server"** no VS Code
2. Abra a pasta `iba-frontend/src` no VS Code
3. Clique com botão direito em `registrar.html`
4. Escolha **"Open with Live Server"**

## 📱 Páginas da Aplicação

### Registrar Ocorrência
**URL:** `http://localhost:4200/registrar.html`

Permite registrar novas ocorrências ambientais com:
- Tipo (Queimada, Desmatamento, Poluição, Garimpo, Outros)
- Data da ocorrência
- Descrição breve
- Localização (latitude/longitude)
- Foto (opcional)

### Consultar Ocorrências
**URL:** `http://localhost:4200/consultar.html`

Lista todas as ocorrências registradas com:
- Filtros por tipo e período
- Visualização em cards
- Detalhes completos ao clicar
- Mapa de localização

### Dashboard
**URL:** `http://localhost:4200/dashboard.html`

Exibe estatísticas e análises:
- Total de ocorrências
- Distribuição por tipo
- Evolução mensal
- Gráficos interativos
- Geração de relatório PDF

## 📦 Estrutura do Projeto
```
iba-frontend/
├── src/
│   ├── css/
│   │   ├── registrar.css
│   │   ├── consultar.css
│   │   └── dashboard.css
│   ├── js/
│   │   └── api.js              # Comunicação com backend
│   ├── img/
│   │   └── ...                 # Imagens e ícones
│   ├── registrar.html
│   ├── consultar.html
│   ├── dashboard.html
│   ├── registrarjs.js
│   ├── consultarjs.js
│   └── dashboardjs.js
└── README.md
```

## 🔧 Configuração

### Alterar URL da API

Se o backend estiver em outra porta/host, edite `src/js/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
// Altere para sua URL
```

### CORS

O backend já está configurado para aceitar requisições de:
- `http://localhost:4200`
- `http://127.0.0.1:5500` (Live Server)

Se usar outra porta, configure no backend em `CorsConfig.java`.

## 🎨 Funcionalidades

### Página de Registro
- ✅ Formulário validado
- ✅ Seleção de tipo de ocorrência
- ✅ Data obrigatória
- ✅ Descrição (5-280 caracteres)
- ✅ Coordenadas geográficas
- ✅ Upload de foto (opcional)

### Página de Consulta
- ✅ Lista paginada de ocorrências
- ✅ Filtros por tipo e data
- ✅ Visualização em cards
- ✅ Painel de detalhes
- ✅ Mapa integrado (Google Maps)

### Dashboard
- ✅ Cards de estatísticas
- ✅ Gráfico de barras por mês
- ✅ Filtros de período
- ✅ Geração de PDF

## 🐛 Solução de Problemas

### Backend não responde
**Erro:** `Failed to fetch` ou `CORS policy`

**Solução:**
1. Verifique se o backend está rodando: `http://localhost:8080/swagger-ui.html`
2. Confirme a URL no `api.js`
3. Verifique o CORS no backend

### Imagens não carregam
**Erro:** 404 nas imagens

**Solução:**
1. Verifique se está na pasta correta (`src/`)
2. Confirme o caminho das imagens no HTML

### Porta ocupada
**Erro:** `Address already in use`

**Solução:** Use outra porta:
```bash
python -m http.server 3000
# Acesse: http://localhost:3000
```

## 📝 Exemplos de Uso

### Registrar uma Ocorrência

1. Acesse `http://localhost:4200/registrar.html`
2. Selecione o tipo: **QUEIMADA**
3. Data: **2026-01-29**
4. Descrição: **"Foco de incêndio detectado na região norte"**
5. Latitude: **-15.123456**
6. Longitude: **-47.654321**
7. Clique em **"+ NOVA OCORRÊNCIA"**

### Consultar Ocorrências

1. Acesse `http://localhost:4200/consultar.html`
2. Selecione filtros (opcional)
3. Clique em uma ocorrência para ver detalhes
4. Visualize localização no mapa

### Visualizar Estatísticas

1. Acesse `http://localhost:4200/dashboard.html`
2. Defina período (data inicial/final)
3. Clique em **"Aplicar Filtros"**
4. Visualize gráficos e estatísticas
5. Clique em **"Gerar Relatório PDF"** para baixar

## 🔗 Integração com Backend

A aplicação se comunica com o backend através da API REST:

- **POST** `/api/occurrences` - Criar ocorrência
- **GET** `/api/occurrences` - Listar ocorrências
- **GET** `/api/occurrences/{id}` - Buscar por ID
- **GET** `/api/stats/summary` - Estatísticas
- **GET** `/api/reports/pdf` - Gerar PDF

Documentação completa: `http://localhost:8080/swagger-ui.html`

## 👥 Desenvolvido por

Ana Teixeira - [LinkedIn](https://www.linkedin.com/in/ana-teixeira-bb072625b/)

## 📄 Licença

MIT
