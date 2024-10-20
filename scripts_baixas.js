let requisicoesBaixadas = JSON.parse(localStorage.getItem('requisicoesBaixadas')) || [];
let fotosRequisicao = JSON.parse(localStorage.getItem('fotosRequisicao')) || {};

// Função para renderizar a tabela de requisições baixadas
function renderizarTabela(requisicoesFiltradas = requisicoesBaixadas) {
    const tbody = document.getElementById('baixasBody');
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
            <td>${requisicao.responsavel}</td>
            <td>
                <button onclick="verFotos(${requisicao.numero})">📷 Ver Fotos</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Função para buscar requisições baixadas por código ou nome
document.getElementById('searchBtn')?.addEventListener('click', function () {
    const searchValue = document.getElementById('searchCodigo').value.toLowerCase();
    const requisicoesFiltradas = requisicoesBaixadas.filter(req => 
        req.codigo.toLowerCase().includes(searchValue) || req.nome.toLowerCase().includes(searchValue)
    );
    renderizarTabela(requisicoesFiltradas);
});

// Função para visualizar fotos da requisição baixada
function verFotos(numero) {
    const fotos = fotosRequisicao[numero] || [];
    if (fotos.length > 0) {
        alert('Fotos da requisição:\n' + fotos.map(foto => `<img src="${foto}" alt="Foto da Requisição">`).join(''));
    } else {
        alert('Nenhuma foto disponível para esta requisição.');
    }
}

// Inicializa a tabela de baixas
renderizarTabela();
