let requisicoes = JSON.parse(localStorage.getItem('requisicoes')) || [];
let requisicoesBaixadas = JSON.parse(localStorage.getItem('requisicoesBaixadas')) || [];
let fotosRequisicao = JSON.parse(localStorage.getItem('fotosRequisicao')) || {};
let baixaModal = document.getElementById('baixaModal');
let fotoModal = document.getElementById('fotoModal');
let cameraPreview = document.getElementById('cameraPreview');
let cameraCanvas = document.getElementById('cameraCanvas');
let selectedRequisicao = null;
let fotoCapturada = null;

// Função para adicionar uma nova requisição
document.getElementById('addRequisicaoBtn')?.addEventListener('click', function () {
    const novaRequisicao = {
        numero: requisicoes.length + 1,
        codigo: 'MAT' + (requisicoes.length + 1),
        nome: 'Material ' + (requisicoes.length + 1),
        dataHora: new Date().toLocaleString(),
        transferencia: 'Interna',
        solicitante: 'João',
        status: 'Pendente'
    };
    requisicoes.push(novaRequisicao);
    localStorage.setItem('requisicoes', JSON.stringify(requisicoes));
    renderizarTabela();
});

// Função para buscar requisições por código ou nome
document.getElementById('searchBtn')?.addEventListener('click', function () {
    const searchValue = document.getElementById('searchCodigo').value.toLowerCase();
    const requisicoesFiltradas = requisicoes.filter(req => 
        req.codigo.toLowerCase().includes(searchValue) || req.nome.toLowerCase().includes(searchValue)
    );
    renderizarTabela(requisicoesFiltradas);
});

// Função para renderizar a tabela de requisições
function renderizarTabela(requisicoesFiltradas = requisicoes) {
    const tbody = document.getElementById('requisicoesBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    requisicoesFiltradas.forEach(requisicao => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${requisicao.numero}</td>
            <td>${requisicao.codigo}</td>
            <td>${requisicao.nome}</td>
            <td>${requisicao.dataHora}</td>
            <td>${requisicao.transferencia}</td>
            <td>${requisicao.solicitante}</td>
            <td>${requisicao.status}</td>
            <td>
                <button onclick="baixarRequisicao(${requisicao.numero})">Dar Baixa</button>
                <button onclick="gerenciarFotos(${requisicao.numero})">📷 Ver Fotos</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Função para baixar a requisição
function baixarRequisicao(numero) {
    selectedRequisicao = numero;
    baixaModal.style.display = 'block';
}

// Função para confirmar a baixa e mover para "Requisições com Baixa Realizada"
document.getElementById('confirmBaixaBtn')?.addEventListener('click', function () {
    const responsavel = document.getElementById('responsavel').value;
    if (responsavel) {
        const requisicaoIndex = requisicoes.findIndex(req => req.numero === selectedRequisicao);
        if (requisicaoIndex !== -1) {
            const requisicao = requisicoes[requisicaoIndex];
            requisicoes.splice(requisicaoIndex, 1);
            requisicao.responsavel = responsavel;
            requisicao.status = 'Baixada';
            requisicoesBaixadas.push(requisicao);
            localStorage.setItem('requisicoes', JSON.stringify(requisicoes));
            localStorage.setItem('requisicoesBaixadas', JSON.stringify(requisicoesBaixadas));
            renderizarTabela();
            baixaModal.style.display = 'none';
        }
    }
});

// Função para gerenciar fotos da requisição
function gerenciarFotos(numero) {
    selectedRequisicao = numero;
    fotoModal.style.display = 'block';

    if (fotosRequisicao[numero]) {
        document.getElementById('fotoPreview').innerHTML = fotosRequisicao[numero].map(foto => `
            <img src="${foto}">
        `).join('');
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
            cameraPreview.srcObject = stream;
        });
    }
}

// Função para capturar foto da câmera
document.getElementById('tirarFotoBtn')?.addEventListener('click', function () {
    const context = cameraCanvas.getContext('2d');
    cameraCanvas.width = cameraPreview.videoWidth;
    cameraCanvas.height = cameraPreview.videoHeight;
    context.drawImage(cameraPreview, 0, 0, cameraCanvas.width, cameraCanvas.height);
    fotoCapturada = cameraCanvas.toDataURL('image/png');
    document.getElementById('fotoPreview').innerHTML += `<img src="${fotoCapturada}">`;
});

// Função para enviar fotos
document.getElementById('enviarFotosBtn')?.addEventListener('click', function () {
    if (!fotosRequisicao[selectedRequisicao]) {
        fotosRequisicao[selectedRequisicao] = [];
    }
    fotosRequisicao[selectedRequisicao].push(fotoCapturada);
    localStorage.setItem('fotosRequisicao', JSON.stringify(fotosRequisicao));
    fotoModal.style.display = 'none';
});

// Inicializa a tabela de requisições
renderizarTabela();
