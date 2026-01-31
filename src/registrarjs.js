document.addEventListener('DOMContentLoaded', () => {
  const btn  = document.getElementById('menu-btn');
  const menu = document.getElementById('menu');

  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    menu.classList.toggle('is-open');
  });

  menu.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') menu.classList.remove('is-open');
  });
});
// registrarjs.js
let map;
let marker;
let selectedLocation = { lat: -15.7801, lng: -47.9292 }; // Brasília como padrão

// Inicializa o mapa do Google Maps
function initMap() {
    map = new google.maps.Map(document.getElementById('mapa'), {
        center: selectedLocation,
        zoom: 12
    });

    marker = new google.maps.Marker({
        position: selectedLocation,
        map: map,
        draggable: true
    });

    // Atualiza a localização quando o marcador é movido
    marker.addListener('dragend', function() {
        selectedLocation = {
            lat: marker.getPosition().lat(),
            lng: marker.getPosition().lng()
        };
    });

    // Permite clicar no mapa para mover o marcador
    map.addListener('click', function(event) {
        selectedLocation = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
        };
        marker.setPosition(selectedLocation);
    });
}

// Função para lidar com o envio do formulário
async function handleSubmit(event) {
    event.preventDefault();

    const tipo = document.getElementById('tipo').value;
    const data = document.getElementById('data').value;
    const descricao = document.getElementById('desc').value;
    const foto = document.getElementById('foto').files[0];

    // Validação básica
    if (tipo === '#' || !tipo) {
        alert('Por favor, selecione um tipo de denúncia');
        return;
    }

    if (!data) {
        alert('Por favor, selecione uma data');
        return;
    }

    if (!descricao || descricao.trim() === 'Escreva aqui' || descricao.trim() === '') {
        alert('Por favor, forneça uma descrição');
        return;
    }

    // Monta o objeto de dados
    const occurrenceData = {
        type: tipo.toUpperCase(),
        date: data,
        description: descricao,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        photoUrl: foto ? foto.name : null // Por enquanto só o nome do arquivo
    };

    try {
        // Mostra loading
        const btn = document.querySelector('.novaOcorrencia');
        btn.disabled = true;
        btn.textContent = 'ENVIANDO...';

        // Chama a API
        const response = await createOccurrence(occurrenceData);

        // Sucesso!
        alert('Ocorrência registrada com sucesso!');
        
        // Limpa o formulário
        document.getElementById('tipo').value = '#';
        document.getElementById('data').value = '';
        document.getElementById('desc').value = 'Escreva aqui';
        document.getElementById('foto').value = '';

        // Reseta o mapa
        selectedLocation = { lat: -15.7801, lng: -47.9292 };
        marker.setPosition(selectedLocation);
        map.setCenter(selectedLocation);

    } catch (error) {
        alert('Erro ao registrar ocorrência: ' + error.message);
    } finally {
        // Restaura o botão
        const btn = document.querySelector('.novaOcorrencia');
        btn.disabled = false;
        btn.textContent = '+ NOVA OCORRÊNCIA';
    }
}

// Event listener quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    // Conecta o botão ao evento de submit
    const btn = document.querySelector('.novaOcorrencia');
    if (btn) {
        btn.addEventListener('click', handleSubmit);
    }

    // Menu toggle (já existente)
    const menuBtn = document.getElementById('menu-btn');
    const menu = document.getElementById('menu');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', function() {
            menu.classList.toggle('active');
        });
    }
});

// Carrega o Google Maps quando a página carrega
window.initMap = initMap;