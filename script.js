<script>

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.auto-atendimento button');
    const formContainer = document.getElementById('formContainer');
    const autoAtendimento = document.getElementById('auto-atendimento');
    const modal = document.getElementById('myModal');
    const span = document.querySelector('.close');
    
    // Exibe o formulário ao clicar no botão
    document.getElementById('openForm').addEventListener('click', () => {
        formContainer.style.display = 'block';
        document.getElementById('openForm').style.display = 'none';
    });
    
    // Função para buscar dados do cliente
    async function buscarClientes(cpf) {
        try {
            console.log("Fazendo requisição para o servidor proxy...");

            const response = await fetch('http://localhost:3000/proxy/cliente', {
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
                exibirResultado(cliente);
            } else {
                exibirResultado(null);
            }
        } catch (error) {
            console.error("Erro ao buscar clientes:", error.message);
        }
    }
    
    // Função para exibir o resultado da busca
    function exibirResultado(cliente) {
        const resultDiv = document.getElementById("result");

        if (cliente) {
            resultDiv.innerHTML = `
                <h2>Encontrei! Boas vindas, ${cliente.razao}!</h2>
            `;
            autoAtendimento.style.display = 'flex';
        } else {
            resultDiv.innerHTML = "<p>Cliente não encontrado.</p>";
            autoAtendimento.style.display = 'none';
        }
    }

    // Adiciona o listener ao formulário
    document.getElementById("cpfForm").addEventListener("submit", function(event) {
        event.preventDefault();
        const cpf = document.getElementById("cpf").value;
        buscarClientes(cpf);
    });
    
    // Adiciona o listener aos botões da auto-atendimento
    buttons.forEach(button => {
        button.addEventListener('click', async () => {
            if (button.getAttribute('data-page') === 'Boleto') {
                // Abre o modal ao clicar no botão "Boleto"
                modal.style.display = "block";
                await buscarBoletos();
            } else if (button.getAttribute('data-page') === 'Contrato') {
                // Abre o modal ao clicar no botão "Contrato"
                modal.style.display = "block";
                await buscarContratos();
            } else if (button.getAttribute('data-page') === 'Oss') {
                // Abre o modal ao clicar no botão "Oss"
                modal.style.display = "block";
                await buscarOss();
            }
            // Adicionar ações para outros botões conforme necessário
        });
    });

    // Função para buscar boletos
    async function buscarBoletos() {
        try {
            console.log("Fazendo requisição para o servidor proxy...");

            const clienteId = localStorage.getItem('clienteId');

            if (!clienteId) {
                console.error('Cliente com o id não encontrado');
                return;
            }

            const response = await fetch('http://localhost:3000/proxy/boletos', {
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
                boletoContent.innerHTML = '<ul>' + data.registros.map(boleto => `<li>Código: ${boleto.id} - Venc.: ${boleto.data_vencimento} - Valor: ${boleto.valor} - Download: <a href="${boleto.gateway_link}">Download</a></li>`).join('') + '</ul>';
            } else {
                boletoContent.innerHTML = '<p>Nenhum boleto encontrado.</p>';
            }

        } catch (error) {
            console.error("Erro ao buscar boletos:", error.message);
        }
    }

    // Função para buscar contratos
    async function buscarContratos() {
        try {
            console.log("Fazendo requisição para o servidor proxy...");

            const clienteId = localStorage.getItem('clienteId');

            if (!clienteId) {
                console.error('Cliente com o id não encontrado');
                return;
            }

            const response = await fetch('http://localhost:3000/proxy/contratos', {
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
                contratoContent.innerHTML = '<ul>' + data.registros.map(contrato => `<li>ID: ${contrato.id} - Data Início: ${contrato.data_inicio} - Data Fim: ${contrato.data_fim} - Valor: ${contrato.valor}</li>`).join('') + '</ul>';
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

            const response = await fetch('http://localhost:3000/proxy/oss', {
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
                    sortname: "su_oss_chamado.id",
                    sortorder: "desc",
                })
            });

            if (!response.ok) {
                throw new Error("Erro na requisição");
            }

            const data = await response.json();
            console.log(data.registros);

            const ossContent = document.getElementById('ossContent');
            if (data.registros && data.registros.length > 0) {
                ossContent.innerHTML = '<ul>' + data.registros.map(oss => `<li>Chamado nº: ${oss.id}
                    <p>Protocolo: ${oss.protocolo}</p>
                    <p>Abertura: ${oss.data_abertura}</p>
                    <p>Status: ${oss.status}</p>
                    <p>Detalhes: ${oss.mensagem_resposta}</p>
                    <p>Endereço: ${oss.endereco}</p>
                    <p>Fechamento: ${oss.data_fechamento}</p></li>`).join('') + '</ul>';    
            } else {
                ossContent.innerHTML = '<p>Nenhuma OSS encontrada.</p>';
            }

        } catch (error) {
            console.error("Erro ao buscar OSS:", error.message);
        }
    }

    // Fecha o modal ao clicar no 'x'
    span.onclick = function() {
        modal.style.display = "none";
    }

    // Fecha o modal se o usuário clicar fora da modal
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }
});


    </script>