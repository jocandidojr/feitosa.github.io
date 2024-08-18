document.addEventListener('DOMContentLoaded', () => {                
    const buttons = document.querySelectorAll('.auto-atendimento button');
    const formContainer = document.getElementById('formContainer');
    const autoAtendimento = document.getElementById('auto-atendimento');
    const modal = document.getElementById('myModal');
    const topNavbar = document.getElementById('top-navbar');
    const cpfInput = document.getElementById('cpf');
    const span = document.querySelector('.close'); 
    
    // Função para fazer logout
    function logout() {
        localStorage.removeItem('clienteId');
        window.location.href = '/index.html'; // Redireciona para a tela de login
    }
    
    // Adiciona o listener ao botão de logout
    const logoutButton = document.querySelector('.logoutbutton');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
    
    // Exibe o formulário ao clicar no botão
    const openFormButton = document.getElementById('openForm');
    if (openFormButton) {
        openFormButton.addEventListener('click', () => {
            formContainer.style.display = 'block';
            openFormButton.style.display = 'none';
        });
    }
    
    // Função para buscar dados do cliente e validar login
    async function buscarClientes(cpf) {
        try {
            console.log("Fazendo requisição para o servidor proxy...");
    
            const response = await fetch('https://feitosa-github-io.vercel.app/api/proxy/cliente', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    qtype: "cnpj_cpf",
                    query: cpf,
                    oper: "=",
                    page: "1",
                    rp: "20",
                    sortname: "cliente.id",
                    sortorder: "desc",
                })
            });
    
            if (!response.ok) {
                throw new Error("Erro na requisição");
            }
    
            const data = await response.json();
            const cliente = data.registros ? data.registros[0] : null;
            const clienteId = cliente ? cliente.id : null;
    
            if (clienteId) {
                localStorage.setItem("clienteId", clienteId);
                const senhaInput = document.getElementById("pass-hidden").value;
    
                // Verifica se a senha digitada é igual à senha do cliente
                if (cliente.senha === senhaInput) {
                    // Mostra a div auto-atendimento
                    autoAtendimento.style.display = 'flex';                                
                    // Oculta o formulário após validação
                    cpfForm.style.display = 'none';
                    // Exibe a top-navbar após login
                    topNavbar.classList.add('show');
                    exibirResultado(cliente);
                } else {
                    exibirErro("Senha incorreta.");
                }
            } else {
                exibirResultado(null);
            }
        } catch (error) {
            console.error("Erro ao buscar clientes:", error.message);
            exibirErro("Erro ao buscar cliente.");
        }
    }
    
    // Função para exibir o resultado da busca
    function exibirResultado(cliente) {
        const resultDiv = document.getElementById("result");
    
        if (cliente) {
            resultDiv.innerHTML = `<div class="textoProfile">

<h1>Olá,<br>${cliente.razao}!</h1>
<p><span>Meu endereço de instalação:</span> ${cliente.endereco}</p>
<p><span>Meu contato:</span> ${cliente.telefone_celular} </p></div>`;
        } else {
            resultDiv.innerHTML = "<p>Cliente não encontrado.</p>";
            autoAtendimento.style.display = 'none';
        }
    }

    

    // Função para exibir mensagens de erro
    function exibirErro(mensagem) {
        const resultDiv = document.getElementById("result");
        resultDiv.innerHTML = `<p style="color: red;">${mensagem}</p>`;
        autoAtendimento.style.display = 'none';
    }
    
    // Adiciona o listener ao formulário
    const cpfForm = document.getElementById("cpfForm");
    if (cpfForm) {
        cpfForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const cpf = document.getElementById("cpf").value;
            buscarClientes(cpf);
        });
    }
    
    // Adiciona o listener aos botões da auto-atendimento
    buttons.forEach(button => {
        button.addEventListener('click', async () => {
            const page = button.getAttribute('data-page');
            if (page) {
                modal.style.display = "block";
                if (page === 'Boleto') {
                    await buscarBoletos();
                } else if (page === 'Contrato') {
                    await buscarContratos();
                } else if (page === 'Oss') {
                    await buscarOss();
                } else if (page === 'criarOss') {
                    await criarOss();
                } else if (page === 'desbloqueio') {
                    await desbloqueio();
                }
            }
        });
    });
    
// Função para formatar a data no formato dia/mês/ano
function formatarData(data) {
const partes = data.split('-'); // Supondo que a data vem no formato yyyy-mm-dd
return `${partes[2]}/${partes[1]}/${partes[0]}`; // Formato dia/mês/ano
}

// Função para buscar boletos
async function buscarBoletos() {
try {
console.log("Fazendo requisição para o servidor proxy...");

const clienteId = localStorage.getItem('clienteId');

if (!clienteId) {
console.error('Cliente com o id não encontrado');
return;
}

const response = await fetch('https://feitosa-github-io.vercel.app/api/proxy/boletos', {
method: 'POST',
headers: {
    'Content-Type': 'application/json',
},
body: JSON.stringify({ clienteId })
});

if (!response.ok) {
throw new Error("Erro na requisição");
}

const data = await response.json();
console.log(data.registros);

const boletoContent = document.getElementById('boletoContent');
if (data.registros && data.registros.length > 0) {
// Filtrar boletos com status "A", "R", ou "P"
const boletosFiltrados = data.registros.filter(boleto => {
    return ["A", "R", "P"].includes(boleto.status);
});

// Ordenar boletos: não vencidos primeiro (ordenados pelo vencimento), depois vencidos
const hoje = new Date();
const boletosOrdenados = boletosFiltrados.sort((a, b) => {
    const vencimentoA = new Date(a.data_vencimento);
    const vencimentoB = new Date(b.data_vencimento);

    // Primeiro os não vencidos, ordenados por data de vencimento
    if (vencimentoA >= hoje && vencimentoB >= hoje) {
        return vencimentoA - vencimentoB;
    }
    // Em seguida os vencidos, ordenados por data de vencimento
    if (vencimentoA < hoje && vencimentoB < hoje) {
        return vencimentoA - vencimentoB;
    }
    // Coloca os não vencidos acima dos vencidos
    return vencimentoA >= hoje ? -1 : 1;
});

const resultadosLimitados = boletosOrdenados.slice(0, 12);

boletoContent.innerHTML = '<ul>' + resultadosLimitados.map(boleto => {
    const vencimento = new Date(boleto.data_vencimento);
    let classeVencido = ''; 
    let classePago = '';

    // Lógica para considerar pago ou vencido
    if (vencimento < hoje && boleto.status === "A") {
        classeVencido = 'vencido'; // Considera vencido se a data for anterior e status "A"
    } else if (boleto.status === "R") {
        classePago = 'pago'; // Adiciona classe 'pago' para boletos com status "R"
    }

    return `
        <li class="textoModalBoletos ${classeVencido} ${classePago}">
            <h4>
                <p><span>Fatura nº:</span> ${boleto.id} | 
                    <span>Vencimento:</span> ${formatarData(boleto.data_vencimento)}</p>
                <p><span>Mensalidade:</span> R$: ${boleto.valor}</p>
                <p><span>Status:</span> ${boleto.status === "A" ? "Aberto" : boleto.status === "R" ? "Pago" : "Vencido"}</p>  
                <p><span>Download:</span> <a href="${boleto.gateway_link}" target="_blank">Clique aqui para baixar</a>
            </h4>
        </li>`;
}).join('') + '</ul>';
} else {
boletoContent.innerHTML = '<p>Nenhum boleto encontrado.</p>';
}

} catch (error) {
console.error("Erro ao buscar boletos:", error.message);
}
}


// Função para formatar o CPF
function formatCPF(cpf) {
    cpf = cpf.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
    cpf = cpf.substring(0, 11); // Limita a 11 caracteres

    // Aplica a formatação padrão do CPF
    if (cpf.length > 9) {
        cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (cpf.length > 6) {
        cpf = cpf.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (cpf.length > 3) {
        cpf = cpf.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }

    return cpf;
}

// Adiciona o evento de input para formatar o CPF
cpfInput.addEventListener('input', () => {
    cpfInput.value = formatCPF(cpfInput.value);
});

});
    
// Função para buscar contratos
async function buscarContratos() {
try {
console.log("Fazendo requisição para o servidor proxy...");

const clienteId = localStorage.getItem('clienteId');

if (!clienteId) {
console.error('Cliente com o id não encontrado');
return;
}

const response = await fetch('https://feitosa-github-io.vercel.app/api/proxy/contratos', {
method: 'POST',
headers: {
    'Content-Type': 'application/json',
},
body: JSON.stringify({
    qtype: "id_cliente",
    query: clienteId,
    oper: "=",
    page: "1",
    rp: "20",
    sortname: "cliente_contrato.id",
    sortorder: "desc",
})
});

if (!response.ok) {
throw new Error("Erro na requisição");
}

const data = await response.json();
console.log(data.registros);

const contratoContent = document.getElementById('contratoContent');
if (data.registros && data.registros.length > 0) {
contratoContent.innerHTML = '<ul>' + data.registros.map((contrato, index) => {
    // Definindo o tipo e status de conexão
    const tipoContrato = contrato.tipo === "I" ? "Internet" : "Desconhecido";
    const statusConexao = contrato.status_internet === "A" ? "Ativo" : 
                          contrato.status_internet === "CM" ? "Suspenso" : 
                          "Desconhecido";
    const statusContrato = contrato.status === "A" ? "Ativo" :  
                           contrato.status === "I" ? "Inativo/Cancelado" : 
                           "Desconhecido";
    
    // Adicionar <hr> entre os itens, exceto após o último item
    const hrTag = index < data.registros.length - 1 ? '<hr>' : '';                                     

    return `
        <li class="textoModalOutros">
            <h4>
                <p><span>Contrato nº:</span> ${contrato.id}  <span>Status do contrato:</span> ${statusContrato}</p>
                <p><span>Serviço contratado:</span> ${tipoContrato}</p>
                <p><span>Status da conexão:</span> ${statusConexao}</p>
                <p><span>Plano de internet:</span> ${contrato.contrato}</p>
            </h4>
        </li>${hrTag}`;
}).join('') + '</ul>';
} else {
contratoContent.innerHTML = '<p>Nenhum contrato encontrado.</p>';
}

} catch (error) {
console.error("Erro ao buscar contratos:", error.message);
}
}

// Função para buscar OSS
async function buscarOss() {
try {
console.log("Fazendo requisição para o servidor proxy...");

const clienteId = localStorage.getItem('clienteId');

if (!clienteId) {
console.error('Cliente com o id não encontrado');
return;
}

const response = await fetch('https://feitosa-github-io.vercel.app/api/proxy/oss', {
method: 'POST',
headers: {
    'Content-Type': 'application/json',
},
body: JSON.stringify({ clienteId })
});

if (!response.ok) {
throw new Error("Erro na requisição");
}

const data = await response.json();
console.log(data);

const ossContent = document.getElementById('ossContent');

if (data && data.length > 0) {
// Limita o número de registros a 5
const resultadosLimitados = data.slice(0, 5);

// Gera o HTML para os registros limitados
ossContent.innerHTML = '<ul>' + resultadosLimitados.map(oss => `<li class="textoModalOutros">
        <h4>
            <p><span>Ordem de serviço:</span> ${oss.id} | <span>Protocolo:</span> ${oss.protocolo}</p>
            <p><span>Endereço de atendimento:</span></p> <p>${oss.endereco}</p>
            <p><span>Resumo da solicitação:</span> ${oss.mensagem}</p>
            <p><h2><span>Solução:</span> ${oss.mensagem_resposta}</p></h2>
        </h4>
    </li>`).join('') + '</ul>';
} else {
ossContent.innerHTML = '<p>Nenhuma OSS encontrada.</p>';
}

} catch (error) {
console.error("Erro ao buscar OSS:", error.message);
}
}

async function criarOss() {
try {
console.log("Exibindo o formulário de OSS...");

const clienteId = localStorage.getItem('clienteId');
if (!clienteId) {
console.error('Cliente com o id não encontrado');
return;
}

const criarOssContent = document.getElementById('criarOssContent');

const formHtml = `
<form id="ossForm">
    <div style="display: none;">
        <input type="hidden" id="tipo" name="tipo" value="C" />
        <input type="hidden" id="id_assunto" name="id_assunto" value="1" />
        <input type="hidden" id="id_cliente" name="id_cliente" value="${clienteId}" />
        <input type="hidden" id="id_filial" name="id_filial" value="1" />
        <input type="hidden" id="origem_endereco" name="origem_endereco" value="M" />
        <input type="hidden" id="prioridade" name="prioridade" value="1" />
        <input type="hidden" id="setor" name="setor" value="1" />
        <input type="hidden" id="status" name="status" value="A" />
    </div>

    <div>
        <label for="assunto">Sobre qual assunto deseja falar?</label>
        <select id="assunto" name="assunto" required>
            <option value="8">Manutenção</option>
            <option value="6">Financeiro</option>
        </select>
    </div>

    <div>
        <label for="mensagem">Como podemos te ajudar?</label>
        <textarea id="mensagem" name="mensagem" required></textarea>
    </div>

    <button type="submit">Abrir novo chamado</button>
</form>
`;

criarOssContent.innerHTML = formHtml;
document.getElementById('myModal').style.display = 'block';

document.getElementById('ossForm').addEventListener('submit', async function(event) {
event.preventDefault();

console.log("Fazendo requisição para o servidor proxy...");

const formData = new FormData(event.target);
const formObject = Object.fromEntries(formData.entries());

const response = await fetch('https://feitosa-github-io.vercel.app/api/proxy/criar-oss', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(formObject)
});

if (!response.ok) {
    const errorText = await response.text();
    console.error("Erro na requisição:", errorText);
    throw new Error("Erro na requisição");
}

const data = await response.json();
console.log("Resposta do servidor:", data);

let resultHtml = '';
if (data.success) {
    resultHtml = `<p>OSS criada com sucesso!</p>`;
} else {
    resultHtml = `<p>Erro ao criar OSS: ${data.message}</p>`;
}

criarOssContent.innerHTML = resultHtml;
});

} catch (error) {
console.error("Erro ao abrir OSS:", error.message);
}
}


// Função para limpar o conteúdo do modal
function limparModal() {
const boletoContent = document.getElementById('boletoContent');
const contratoContent = document.getElementById('contratoContent');
const ossContent = document.getElementById('ossContent');
const desbloqueioContent = document.getElementById('desbloqueioContent');
const criarOssContent = document.getElementById('criarOssContent');

if (boletoContent) boletoContent.innerHTML = '';
if (contratoContent) contratoContent.innerHTML = '';
if (ossContent) ossContent.innerHTML = '';
if (desbloqueioContent) desbloqueioContent.innerHTML = ''; 
if (criarOssContent) criarOssContent.innerHTML = ''; 
}

document.addEventListener('DOMContentLoaded', () => {
const cpfInput = document.getElementById('cpf');

// Função para formatar o CPF
function formatCPF(cpf) {
cpf = cpf.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
cpf = cpf.substring(0, 11); // Limita a 11 caracteres

// Aplica a formatação padrão do CPF
if (cpf.length > 9) {
cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
} else if (cpf.length > 6) {
cpf = cpf.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
} else if (cpf.length > 3) {
cpf = cpf.replace(/(\d{3})(\d{1,3})/, '$1.$2');
}

return cpf;
}

// Adiciona o evento de input para formatar o CPF
cpfInput.addEventListener('input', () => {
cpfInput.value = formatCPF(cpfInput.value);
});
});

const clienteId = localStorage.getItem('clienteId');
console.log('clienteId do localStorage:', clienteId);