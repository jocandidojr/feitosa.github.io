// Fecha o modal quando o usuário clica no X
const span = document.querySelector('.close');

const modal = document.getElementById('myModal'); // Certifique-se de que o ID do modal está correto
if (span && modal) {
span.addEventListener('click', () => {
modal.style.display = 'none';
limparModal(); // Limpa o conteúdo ao fechar o modal
});
}

// Fecha o modal quando o usuário clica fora dele
window.addEventListener('click', (event) => {
if (event.target === modal) {
modal.style.display = 'none';
limparModal(); // Limpa o conteúdo ao fechar o modal
}
});

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
    console.log("Validando usuário de acesso...");

    const response = await fetch('https://feitosatelecom.com.br/api/proxy/cliente', {
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
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro na requisição: ${errorData.message || "Erro desconhecido"}`);
    }

    const data = await response.json();
    const cliente = data.registros ? data.registros[0] : null;
    const clienteId = cliente ? cliente.id : null;

    if (clienteId) {
      localStorage.setItem("clienteId", clienteId);

      // Mostra a div auto-atendimento
      autoAtendimento.style.display = 'flex';
      // Oculta o formulário após validação
      cpfForm.style.display = 'none';
      exibirResultado(cliente);
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
<h1>Boas vindas,<br>${cliente.razao}!</h1>
<p><span>Meu endereço de instalação:</span> ${cliente.endereco}</p>
<p><span>Meu contato:</span> ${cliente.telefone_celular}</p>
</div>
<div class="logoutbutton">
<button id="logoutButton">Sair</button>

</div>`;

// Adiciona o manipulador de evento ao botão de logout
document.getElementById("logoutButton").addEventListener("click", () => {
// Remove o clienteId do localStorage
localStorage.removeItem("clienteId");

// Redireciona para a tela de login
window.location.href = "index.html";
});
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
} else if (page === 'informarPagamento') {
await informarPagamento();
} else if (page === 'faq-prov') {
await duvidas();
} else if (page === 'reiniciar') {
await reiniciarConexao();
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
console.log("Buscando boletos...");

const clienteId = localStorage.getItem('clienteId');

if (!clienteId) {
console.error('Cliente com o id não encontrado');
return;
}

const response = await fetch('https://feitosatelecom.com.br/api/proxy/boletos', {
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

return `<li class="textoModalBoletos ${classeVencido} ${classePago}" style="background-color: ${boleto.status === 'A' ? '#e2e3e5' : boleto.status === 'R' ? '#808080' : 'transparent'};">
    <div class="boleto-pix-linha" style="color: #10107A; justify-content: space-between; display: flex; align-items: center;">
        
        <div class="boleto-baixar" style="flex-grow: 1; text-align: center;">
            <strong>
                <a href="${boleto.gateway_link}.pdf" target="_blank">
                    <img src="/assets/a_pix_.png" alt="Copiar PIX" class="pix-img">
                </a>
            </strong>
        </div>
        <div class="boleto-baixar" style="flex-grow: 1; text-align: center;">
            <strong>
                <a href="${boleto.gateway_link}.pdf" target="_blank">
                    <img src="/assets/a_bar-code_.png" alt="Baixar Boleto" class="btn-boleto-img">
                </a>
            </strong>
        </div>
        <div class="boleto-status" style="flex-grow: 1; text-align: center;">
            <p>
                ${boleto.status === 'A' ? 'Aberto' : boleto.status === 'R' ? 'Pago' : 'Não disponível'}
            </p>
        </div>
        <div class="boleto-valor" style="flex-grow: 1; text-align: center;">
            <p>R$ ${boleto.valor}</p>
        </div>
        <div class="boleto-vencimento" style="flex-grow: 1; text-align: center;">
            <p>${formatarData(boleto.data_vencimento)}</p>
        </div>
    </div>
</li>

`;
}).join('') + '</ul>';
} else {
boletoContent.innerHTML = '<p>Nenhum boleto encontrado.</p>';
}

} catch (error) {
console.error("Erro ao buscar boletos:", error.message);
}
}

// Função para copiar linha digitável
function copiarLinhaDigitavel(id) {
const element = document.getElementById(`linhaDigitavel${id}`);
const linhaDigitavel = element.textContent;

// Criar um elemento temporário para seleção do texto
const tempInput = document.createElement('input');
tempInput.value = linhaDigitavel;
document.body.appendChild(tempInput);

// Selecionar o conteúdo do elemento temporário
tempInput.select();
document.execCommand('copy');

// Remover o elemento temporário
document.body.removeChild(tempInput);

// Alerta de confirmação
alert('Linha digitável copiada para a área de transferência!');
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

// Função para buscar contratos e armazenar contratoId
async function buscarContratos() {
try {
console.log("Consultando dados do contrato...");

const clienteId = localStorage.getItem('clienteId');

if (!clienteId) {
console.error('Cliente ID não encontrado');
return;
}

const response = await fetch('https://feitosatelecom.com.br/api/proxy/contratos', {
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
throw new Error("Erro na requisição: " + response.statusText);
}

const data = await response.json();
console.log('Dados da resposta:', data);

const contratoContent = document.getElementById('contratoContent');
if (data.registros && data.registros.length > 0) {
// Armazena o primeiro contratoId no localStorage
const contratoId = data.registros[0].id;
console.log('Contrato ID obtido:', contratoId);
localStorage.setItem('contratoId', contratoId);

contratoContent.innerHTML = '<ul>' + data.registros.map((contrato, index) => {
const tipoContrato = contrato.tipo === "I" ? "Internet" : "Desconhecido";
const statusConexao = contrato.status_internet === "A" ? "Ativo" : 
              contrato.status_internet === "CM" ? "Suspenso" : 
              "Desconhecido";
const statusContrato = contrato.status === "A" ? "Ativo" :  
               contrato.status === "I" ? "Inativo/Cancelado" : 
               "Desconhecido";

const hrTag = index < data.registros.length - 1 ? '<hr>' : '';

return `<li class="textoModalOutros" style="color: #10107A;">
<div class="cliente-info" style="padding: -10px;">
    <h4>
        <center>
            <div class="info-item" style="display: flex; align-items: center; margin-bottom: 10px;">
                <img src="/assets/plano_internet_.png" alt="Plano de Internet" style="margin-right: 10px;">
                <h2>${statusContrato}</h2>
            </div>
            <div class="info-item" style="display: flex; align-items: center; margin-bottom: 10px;">
                <img src="/assets/plano_mensalidade_.png" alt="Plano de Internet" style="margin-right: 10px;">
                <h2>${contrato.contrato}</h2>
            </div>
        </center>
    </h4>
</div>
</li>
${hrTag}
`;
}).join('') + '</ul>';
} else {
contratoContent.innerHTML = '<p>Nenhum contrato encontrado.</p>';
}

} catch (error) {
console.error("Erro ao buscar contratos:", error.message);
}
}



// Função para buscar OSs
async function buscarOss() {
try {
console.log("Consultando histórico de atendimentos...");

const clienteId = localStorage.getItem('clienteId');

if (!clienteId) {
console.error('Cliente com o id não encontrado');
return;
}

const response = await fetch('https://feitosatelecom.com.br/api/proxy/oss', {
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
// Filtra OSS com status diferente de "F"
const ossFiltradas = data.filter(oss => oss.status !== 'FG');

// Limita o número de registros a 5
const resultadosLimitados = ossFiltradas.slice(0, 3);

if (resultadosLimitados.length > 0) {
// Mapeamento de status para descrição
const statusMap = {
A: 'Em aberto',
AN: 'Em análise',
EN: 'Encaminhada',
AS: 'Assumida',
AG: 'Agendada',
DS: 'Em deslocamento',
EX: 'Em execução',
F: 'Finalizado',
RAG: 'Reagendar'
};

// Gera o HTML para os registros limitados
ossContent.innerHTML = '<ul>' + resultadosLimitados.map(oss => {
const statusDescricao = statusMap[oss.status] || oss.status; // Usa a descrição mapeada ou o status original
return `<li class="info-item" style="background-color: #e8e7e7; color: #10107A; width: 100%; box-sizing: border-box;">
    <br>
    <div class="info-top" style="display: flex; justify-content: space-between; width: 100%; box-sizing: border-box;">
        <div class="info" style="flex: 1; text-align: left;">
            <img src="/assets/os_protocolo_.png" alt="Protocolo" class="info-img">
            <p><strong>Protocolo:</strong>${oss.id} ${oss.protocolo}</p>
        </div>
        <div class="info" style="flex: 1; text-align: left;">
            <img src="/assets/os_tipo_.png" alt="Tipo" class="info-img">
            <p><strong>Tipo:</strong>Cliente</p>
        </div>
    </div>
    <div class="info-bottom" style="display: flex; justify-content: space-between; width: 100%; box-sizing: border-box; margin-top: 10px;">
        <div class="info" style="flex: 1; text-align: left;">
            <img src="/assets/os_detalhes_.png" alt="Detalhes" class="info-img">
            <p><strong>Detalhes:</strong>${oss.mensagem}</p>
        </div>
        <div class="info" style="flex: 1; text-align: left;">
            <img src="/assets/os_servico_.png" alt="Serviço realizado" class="info-img">
            <p><strong>Serviço realizado:</strong>${oss.mensagem_resposta}</p>
        </div>
    </div>
    <div class="status" style="width: 100%; max-width: 500px; box-sizing: border-box; text-align: center; background-color: ${statusDescricao === 'Finalizado' ? '#808080' : '#009245'}; padding: 10px; border-radius: 8px; margin-top: 10px;">
        <h5 style="color: white; margin: 0; display: inline-block;">
            Status: ${statusDescricao}
        </h5>
    </div>
</li>
`;
}).join('') + '</ul>';
} else {
// Mensagem quando não há OSSs para exibir
ossContent.innerHTML = `<div class="textoModalOutros">
<h4><center>
    <img src="/assets/a_atencao_.png" alt="Ícone de ajuda" class="ajuda-img" style="margin-bottom: 10px;">
    <p>No momento, não há atendimentos em aberto para você.</p>
    <p>Se você precisa de ajuda, abra um novo chamado ou fale com a gente através do Whatsapp.</p>
</center></h4>
</div>
`;
}
} else {
// Mensagem para quando não há OSSs retornadas
ossContent.innerHTML = `
<div class="textoModalOutros">
<h4><center>
<p>No momento, não há atendimentos em aberto para você.</p>
<p>Se você precisa de ajuda, abra um novo chamado ou fale com a gente através do Whatsapp.</p>
</center></h4>
</div>
`;
}

} catch (error) {
console.error("Erro ao buscar OSS:", error.message);
}
}


// Função para criar OSS
async function criarOss() {
  try {
    console.log("Exibindo o formulário de OSS...");

    const clienteId = localStorage.getItem('clienteId');
    if (!clienteId) {
      console.error('Cliente com o id não encontrado');
      return;
    }

    const criarOssContent = document.getElementById('criarOssContent');

    const formHtml = `<form id="ossForm">
      <div style="font-weight: bold; background-color: #2c66c5; color: #ffffff; padding: 10px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">
          <p style="font-size:25px">Mudou de número?</p>
          <p>Adicione na descrição. </p>
      </div>
      <br>
      <div style="display: none;">
          <input type="hidden" id="tipo" name="tipo" value="C" />
          <input type="hidden" id="id_cliente" name="id_cliente" value="${clienteId}" />
          <input type="hidden" id="id_filial" name="id_filial" value="1" />
          <input type="hidden" id="id_atendente" name="id_atendente" value="1" />
          <input type="hidden" id="origem_endereco" name="origem_endereco" value="M" />
          <input type="hidden" id="prioridade" name="prioridade" value="N" />
          <input type="hidden" id="setor" name="setor" value="1" />
          <input type="hidden" id="status" name="status" value="A" />
      </div>

      <div class="inputBox">
          <label for="assunto" class="labelinput" style="text-align: center; color: #10107A; font-size: 16px; padding: 10px; font-weight: bold;">
              Sobre qual assunto deseja falar?
          </label><br>
          <select id="id_assunto" name="id_assunto" class="inputUser" style="color: #10107A;" required>
              <option value="8">Suporte técnico</option>
              <option value="6">Financeiro</option>
          </select>
      </div>
      <div class="inputBox">
          <label for="mensagem" class="labelinput" style="text-align: center; color: #10107A; font-size: 16px; padding: 10px; font-weight: bold;">
             <center>Descreva o motivo do seu contato:</center>
          </label><br>
          <textarea id="mensagem" name="mensagem" class="inputUser" style="color: #10107A; font-size: 16px;" placeholder="" required></textarea>
      </div>
      <button type="submit" style="background-color: #10107A; color: #ffffff; padding: 10px 20px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">
          Abrir novo chamado
      </button>
    </form>`;

    criarOssContent.innerHTML = formHtml;
    document.getElementById('myModal').style.display = 'block';

    document.getElementById('ossForm').addEventListener('submit', async function(event) {
      event.preventDefault();

      console.log("Registrando o chamado...");

      const formData = new FormData(event.target);
      const formObject = Object.fromEntries(formData.entries());

      console.log("Dados enviados:", formObject);

      const payload = {
        tipo: formObject.tipo,
        id_assunto: formObject.id_assunto,
        id_cliente: formObject.id_cliente,
        id_filial: formObject.id_filial,
        origem_endereco: formObject.origem_endereco,
        prioridade: formObject.prioridade,
        setor: formObject.setor,
        mensagem: formObject.mensagem,
        status: formObject.status,
        id_atendente: '1'
      };

      console.log("Payload que está sendo enviado:", JSON.stringify(payload));

      try {
        const response = await fetch('https://feitosatelecom.com.br/api/proxy/criar-oss', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Erro na requisição:", errorText);
          throw new Error("Erro na requisição");
        }

        const data = await response.json();
        console.log("Resposta do servidor:", data);

        let resultHtml = '';
        if (data.type === 'success') {
          resultHtml = `
            <div class="textoModalOutros" style="justify-content: center;">
              <h4><center>
                <img src="/assets/a_atencao_.png" alt="Ícone de ajuda" class="ajuda-img" style="margin-bottom: 10px;">
                <p>Seu atendimento foi registrado sob o código ${data.id}. Nosso time retornará o contato em até 24h.</p>
                </center></h4>
            </div>`;
        } else {
          resultHtml = `
            <div class="textoModalOutros" style="justify-content: center;">
              <h4><center>
                <img src="/assets/a_atencao_.png" alt="Ícone de ajuda" class="ajuda-img" style="margin-bottom: 10px;">
                <p>Não foi possível registrar seu atendimento: ${data.message || data.error} Solicite ajuda através dos nossos canais.</p>
                </center></h4>
            </div>`;
        }

        criarOssContent.innerHTML = resultHtml;
      } catch (error) {
        console.error("Erro ao criar OSS:", error.message);
        criarOssContent.innerHTML = `
          <div class="textoModalOutros" style="justify-content: center;">
            <h4><center>
              <img src="/assets/a_atencao_.png" alt="Ícone de ajuda" class="ajuda-img" style="margin-bottom: 10px;">
              <p>Não foi possível registrar seu atendimento. Solicite ajuda através dos nossos canais.</p>
              </center></h4>
          </div>`;
      }
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
const pagamentoContent = document.getElementById('pagamentoContent');
const duvidasContent = document.getElementById('duvidasContent');
const criarOssContent = document.getElementById('criarOssContent');
const reiniciarContent= document.getElementById('reiniciarContent');

if (boletoContent) boletoContent.innerHTML = '';
if (contratoContent) contratoContent.innerHTML = '';
if (ossContent) ossContent.innerHTML = '';
if (desbloqueioContent) desbloqueioContent.innerHTML = ''; 
if (pagamentoContent) pagamentoContent.innerHTML = '';
if (duvidasContent) duvidasContent.innerHTML = '';  
if (criarOssContent) criarOssContent.innerHTML = '';
if (reiniciarContent) reiniciarContent.innerHTML = ''; 
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

// Função para reiniciar a conexão
async function reiniciarConexao() {
const reiniciarContent = document.getElementById('reiniciarContent');

try {
// Obtém o clienteId do localStorage
const clienteId = localStorage.getItem('clienteId');
console.log('Cliente ID obtido do localStorage:', clienteId);

if (!clienteId) {
console.error('ID do cliente não encontrado no localStorage.');
reiniciarContent.innerHTML = `
<div class="textoModalOutros">
<h4><center>
<p>ID do cliente não encontrado.</p>
<p>Por favor, verifique se o ID está disponível no localStorage.</p>
</center></h4>
</div>
`;
return;
}

// Faz a requisição para buscar os usuários
const usuariosResponse = await fetch('https://feitosatelecom.com.br/api/proxy/usuarios', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({ clienteId })
});

console.log('Resposta da API para buscar usuários:', usuariosResponse);

if (!usuariosResponse.ok) {
const errorData = await usuariosResponse.text(); 
console.error('Erro ao buscar usuários:', errorData);
reiniciarContent.innerHTML = 'Erro ao buscar usuários: ' + (errorData || usuariosResponse.statusText);
return;
}

const usuariosResult = await usuariosResponse.json();
console.log('Usuários obtidos:', usuariosResult);

// Acessa a lista de registros de usuários
const usuarios = usuariosResult.registros;
if (!usuarios || usuarios.length === 0) {
console.error('Nenhum usuário encontrado para o cliente.');
reiniciarContent.innerHTML = `
<div class="textoModalOutros">
<h4><center>
<p>Nenhum usuário encontrado para o cliente.</p>
<p>Por favor, consulte nosso atendimento.</p>
</center></h4>
</div>
`;
return;
}

// Obtém o ID do primeiro usuário
const loginId = usuarios[0].id;
console.log('ID do login obtido:', loginId);

// Armazena o loginId no localStorage
localStorage.setItem('loginId', loginId);
console.log('loginId armazenado no localStorage:', localStorage.getItem('loginId'));

// Envia a requisição para reiniciar a conexão usando o loginId
const requestBody = JSON.stringify({ id: loginId });
console.log('Enviando requisição para reinício de conexão com corpo:', requestBody);

const response = await fetch('https://feitosatelecom.com.br/api/proxy/reiniciar-conexao', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: requestBody
});

console.log('Resposta da API para reiniciar conexão:', response);

if (!response.ok) {
const errorData = await response.text(); 
console.error('Erro ao reiniciar a conexão:', errorData);
reiniciarContent.innerHTML = 'Erro ao reiniciar a conexão: ' + (errorData || response.statusText);
return;
}

const result = await response.json();
console.log('Resultado do reinício de conexão:', result);

if (result.type === 'error') {
reiniciarContent.innerHTML = `
<div class="textoModalOutros">
<h4><center>
<p>Não é possível reiniciar a conexão no momento.</p>
<p>Consulte nosso atendimento.</p>
</center></h4>
</div>
`;
} else {
reiniciarContent.innerHTML = `
<div class="textoModalOutros" style="justify-content: center;">
<h4><center>
<img src="/assets/a_atencao_.png" alt="Ícone de ajuda" class="ajuda-img" style="margin-bottom: 10px;">
<p>Conexão reiniciada com sucesso!</p>
<p><span>Aguarde 2(dois) minutos e verifique sua conexão.</span></p>
<p>Se o problema persistir, abra um novo chamado.</p>
</center></h4>
</div>
`;
}

} catch (error) {
console.error("Erro ao reiniciar a conexão. Consulte nosso atendimento.", error.message);
reiniciarContent.innerHTML = `
<div class="textoModalOutros">
<h4><center>
<p>Erro ao reiniciar a conexão.</p>
<p>Consulte nosso atendimento.</p>
</center></h4>
</div>
`;
}
}

// Função para desbloqueio de confiança
async function desbloqueio() {
const desbloqueioContent = document.getElementById('desbloqueioContent');

try {
const contratoId = localStorage.getItem('contratoId');
console.log('Contrato ID obtido do localStorage:', contratoId);

if (!contratoId) {
console.error('ID do contrato não encontrado no localStorage.');
desbloqueioContent.innerHTML = `
            <div class="textoModalOutros" style="height: 100px; display: flex; align-items: center; margin-bottom: 10px; width: 90%; padding: 20px;">
                 <img src="/assets/plano_liberacao_.png" alt="Plano Liberação">
                    <p>Desbloqueio de confiança não está disponível no momento. Consulte nosso atendimento.</p>
            </div>
        `;
return;
}

const requestBody = JSON.stringify({ id: contratoId });
console.log('Enviando requisição para desbloqueio de confiança com corpo:', requestBody);

const response = await fetch('https://feitosatelecom.com.br/api/proxy/desbloqueio-confianca', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: requestBody
});

console.log('Resposta da API:', response);

if (!response.ok) {
const errorData = await response.text(); // Mudar para text() para melhor depuração
console.error('Erro ao desbloquear confiança:', errorData);
desbloqueioContent.innerHTML = 'Erro ao desbloquear confiança: ' + (errorData || response.statusText);
return;
}

const result = await response.json();
console.log('Resultado do desbloqueio de confiança:', result);

if (result.type === 'error') {
if (result.message.includes("Não é possível utilizar o botão 'Desbloqueio de confiança'")) {
desbloqueioContent.innerHTML = `
            <div class="textoModalOutros" style="height: 100px; display: flex; align-items: center; margin-bottom: 10px; width: 90%; padding: 20px;">
                <img src="assets/plano_liberacao_.png" alt="Plano Liberação">
                <p>Desbloqueio de confiança não está disponível no momento. Consulte nosso atendimento.</p>
            </div>
`;
} else {
desbloqueioContent.innerHTML = `
            <div class="textoModalOutros" style="height: 100px; display: flex; align-items: center; margin-bottom: 10px; width: 90%; padding: 20px;">
                <img src="assets/plano_liberacao_.png" alt="Plano Liberação">
                <p>Desbloqueio de confiança não está disponível no momento. Consulte nosso atendimento.</p>
            </div>`;
}
} else {
desbloqueioContent.innerHTML = `
            <div class="textoModalOutros" style="height: 100px; display: flex; align-items: center; margin-bottom: 10px; width: 90%; padding: 20px;">
                <img src="assets/plano_liberacao_.png" alt="Plano Liberação">
                <p>Desbloqueio de confiança não está disponível no momento. Consulte nosso atendimento.</p>
            </div>
`;
}

} catch (error) {
console.error("Desbloqueio de confiança não está disponível no momento. Consulte nosso atendimento.", error.message);
desbloqueioContent.innerHTML = `
            <div class="textoModalOutros" style="height: 100px; display: flex; align-items: center; margin-bottom: 10px; width: 90%; padding: 20px;">
                <img src="assets/plano_liberacao_.png" alt="Plano Liberação">
                <p>Desbloqueio de confiança não está disponível no momento. Consulte nosso atendimento.</p>
            </div>`;
}

}


// Função para informar pagamento
async function informarPagamento() {
const pagamentoContent = document.getElementById('pagamentoContent');

try {
const contratoId = localStorage.getItem('contratoId');
console.log('Contrato ID obtido do localStorage:', contratoId);

if (!contratoId) {
console.error('ID do contrato não encontrado no localStorage.');
pagamentoContent.innerHTML = `
            <div class="textoModalOutros" style="height: 100px; display: flex; align-items: center; margin-bottom: 10px; width: 90%; padding: 20px;">
                <img src="assets/plano_liberacao_.png" alt="Plano Liberação">
                <p>Liberação não está disponível no momento. Consulte nosso atendimento.</p>
            </div>
        `;
return;
}

const requestBody = JSON.stringify({ id: contratoId });
console.log('Enviando requisição para informar pagamento com corpo:', requestBody);

const response = await fetch('https://feitosatelecom.com.br/api/proxy/informar-pagamento', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: requestBody
});

console.log('Resposta da API:', response);

if (!response.ok) {
const errorData = await response.text(); // Mudar para text() para melhor depuração
console.error('Erro ao informar pagamento:', errorData);
pagamentoContent.innerHTML = 'Erro ao informar pagamento: ' + (errorData || response.statusText);
return;
}

const result = await response.json();
console.log('Resultado do informar pagamento:', result);

if (result.type === 'error') {
pagamentoContent.innerHTML = `
            <div class="textoModalOutros" style="height: 100px; display: flex; align-items: center; margin-bottom: 10px; width: 90%; padding: 20px;">
                <img src="assets/confirm_pgto_.png" alt="Plano Liberação">
                <p>Liberação não está disponível no momento. Consulte nosso atendimento.</p>
            </div>`;
} else {
pagamentoContent.innerHTML = `
            <div class="textoModalOutros" style="height: 100px; display: flex; align-items: center; margin-bottom: 10px; width: 90%; padding: 20px;">
                <img src="assets/confirm_pgto_.png" alt="Plano Liberação">
                <p>Liberação não está disponível no momento. Consulte nosso atendimento.</p>
            </div>`;
}

} catch (error) {
console.error("Hum... Parece que essa opção não está disponível no momento. Clique no botão de ajuda e fale com um de nossos atendentes.", error.message);
pagamentoContent.innerHTML = `<div class="textoModalOutros" style="height: 100px; display: flex; align-items: center; margin-bottom: 10px; width: 90%; padding: 20px;">
                <img src="assets/confirm_pgto_.png" alt="Plano Liberação">
                <p>Liberação não está disponível no momento. Consulte nosso atendimento.</p>
            </div>`;
}
}

// Função para exibir seção de dúvidas
function duvidas() {
// Conteúdo de FAQ
const faqContent = `
<div class="faq-container">
<div class="FAQ" id="FAQ">
    <h2>Dúvidas Frequentes (FAQ)</h2>
    <br><br>
    <div class="faq-container">
        <div class="faq-item">
            <div class="faq-question">Como faço para contratar?</div>
            <div class="faq-answer">Entre em contato conosco através de nossos canais de atendimento. A instalação é gratuita e será agendada para a data mais conveniente para você.</div>
        </div>
        <div class="faq-item">
            <div class="faq-question">Qual a área de cobertura?</div>
            <div class="faq-answer">Estamos crescendo! Atendemos as regiões de Bilinguim, Tacima e Dona Inês. Para conferir se o serviço está disponível para sua casa ou empresa, entre em contato com nossa equipe.</div>
        </div>
        <div class="faq-item">
            <div class="faq-question">O suporte técnico é gratuito?</div>
            <div class="faq-answer">Sim, oferecemos suporte técnico gratuito aos nossos clientes. Nossa equipe está disponível de segunda a sábado para ajudar a resolver quaisquer problemas.</div>
        </div>
        <div class="faq-item">
            <div class="faq-question">Estou sem conexão, o que posso fazer?</div>
            <div class="faq-answer">
                Se você estiver sem conexão, siga os passos abaixo:
                <ul><br>
                    <p><b>1.</b> Verifique se todos os cabos estão conectados corretamente.</p><br>
                    <p><b>2.</b> Reinicie seu roteador desligando-o por 10 segundos e ligando-o novamente.</p><br>
                    <p><b>3.</b> Certifique-se de que sua conta está em dia.</p><br>
                    <p><b>4.</b> Se o problema persistir, entre em contato com nosso suporte técnico.</p>
                </ul>
            </div>
        </div>
        <div class="faq-item">
            <div class="faq-question">Dicas para melhorar o sinal:</div>
            <div class="faq-answer">
                Para melhorar a qualidade da conexão, siga estas dicas:
                <ul><br>
                    <p><b>1.</b> Posicione o roteador em uma área central da casa, longe de obstáculos.</p><br>
                    <p><b>2.</b> Evite o uso de micro-ondas e telefones sem fio próximos ao roteador.</p><br>
                    <p><b>3.</b> Verifique se o firmware do roteador está atualizado.</p><br>
                    <p><b>4.</b> Limite o número de dispositivos conectados simultaneamente.</p>
                </ul>
            </div>
        </div>
        <div class="faq-item">
            <div class="faq-question">Posso mudar de plano após a instalação?</div>
            <div class="faq-answer">Sim, você pode mudar de plano a qualquer momento. Basta entrar em contato com nossa equipe para fazer a alteração desejada.</div>
        </div>
        </div>
        <br><br>
        <h3>Não encontrou o que procurava? Fale com nosso time.</h3>
    </div>
</div>`;

// Insere o conteúdo de FAQ no modal
document.getElementById('duvidasContent').innerHTML = faqContent;

// Exibe o modal
const modal = document.getElementById('myModal');
modal.style.display = 'block';

// Adiciona comportamento para alternar a visibilidade das respostas
const faqQuestions = document.querySelectorAll('.faq-question');
faqQuestions.forEach(question => {
    question.addEventListener('click', function () {
        // Fecha todas as respostas
        const allAnswers = document.querySelectorAll('.faq-answer');
        allAnswers.forEach(answer => {
            answer.style.display = 'none';
        });

        // Remove classe 'active' de todos os itens
        const allItems = document.querySelectorAll('.faq-item');
        allItems.forEach(item => {
            item.classList.remove('active');
        });

        // Alterna a exibição da resposta correspondente
        const parentItem = this.parentElement;
        const answer = parentItem.querySelector('.faq-answer');

        // Exibe a resposta da pergunta clicada
        if (answer.style.display === 'block') {
            answer.style.display = 'none';  // Se já estiver visível, oculta
            parentItem.classList.remove('active');
        } else {
            answer.style.display = 'block'; // Caso contrário, exibe
            parentItem.classList.add('active');
        }
    });
});
}