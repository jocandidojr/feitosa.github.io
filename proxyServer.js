const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const token = '8:6ab19d7128d35b06a4db7768d24e72d458d61e6f5f90dab67aca8bedb8e15323';

// Rota para buscar clientes
app.post('/proxy/cliente', async (req, res) => {
  try {
    const response = await axios.post('https://feitosatelecom.com.br/webservice/v1/cliente', req.body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(token).toString('base64')}`,
        ixcsoft: "listar",
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Erro ao conectar com a API de Clientes" });
  }
});

// Rota para buscar boletos
app.post('/proxy/boletos', async (req, res) => {
  const { clienteId } = req.body;

  if (!clienteId) {
    return res.status(400).json({ error: 'ClienteId não fornecido' });
  }

  try {
    console.log('Buscando boletos do Cliente...');

    const response = await axios.post(
      'https://feitosatelecom.com.br/webservice/v1/fn_areceber',
      {
        qtype: "id_cliente",
        query: clienteId,
        oper: "=",
        page: "1",
        rp: "20",
        sortname: "fn_areceber.id",
        sortorder: "desc",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(token).toString('base64')}`,
          ixcsoft: "listar",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Erro ao buscar boletos:", error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Erro ao conectar com a API de Boletos" });
  }
});

// Rota para buscar contratos
app.post('/proxy/contratos', async (req, res) => {
  try {
    const response = await axios.post('https://feitosatelecom.com.br/webservice/v1/cliente_contrato', req.body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(token).toString('base64')}`,
        ixcsoft: "listar",
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error("Erro ao buscar contratos:", error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Erro ao conectar com a API de Contratos" });
  }
});

// Nova Rota para buscar OSS
app.post('/proxy/oss', async (req, res) => {
  const { clienteId } = req.body;

  if (!clienteId) {
    return res.status(400).json({ error: 'ClienteId não fornecido' });
  }

  try {
    console.log('Buscando OSS do Cliente...');

    const response = await axios.post(
      'https://feitosatelecom.com.br/webservice/v1/su_oss_chamado',
      {
        qtype: "id_cliente",
        query: clienteId,
        oper: "=",
        page: "1",
        rp: "20",
        sortname: "su_oss_chamado.id",
        sortorder: "desc",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(token).toString('base64')}`,
          ixcsoft: "listar",
        },
      }
    );

    res.json(response.data.registros);
  } catch (error) {
    console.error('Erro ao buscar OSS:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Erro ao conectar com a API de OSS" });
  }
});

// Rota para criar OSS
app.post('/proxy/criar-oss', async (req, res) => {
  try {
    const { clienteId } = req.body;

    if (!clienteId) {
      return res.status(400).json({ error: 'ClienteId não fornecido' });
    }

    console.log('Criando OSS para o Cliente...');

    const response = await axios.post(
      'https://feitosatelecom.com.br/webservice/v1/su_oss_chamado',
      {
        "tipo": "C",
        "id_ticket": "",
        "protocolo": "",
        "id_assunto": "1",
        "id_cliente": clienteId,
        "id_estrutura": "",
        "id_filial": "1",
        "id_login": "",
        "id_contrato_kit": "",
        "origem_endereco": "M",
        "origem_endereco_estrutura": "",
        "latitude": "",
        "longitude": "",
        "prioridade": "1",
        "melhor_horario_agenda": "",
        "setor": "1",
        "id_tecnico": "",
        "mensagem": "Chamado de Teste de Rota",
        "idx": "",
        "status": "A",
        "gera_comissao": "",
        "liberado": "",
        "impresso": "",
        "preview": "",
        "id_wfl_param_os": "",
        "id_wfl_tarefa": "",
        "id_su_diagnostico": "",
        "regiao_manutencao": "",
        "origem_cadastro": "",
        "origem_change_endereco": "",
        "status_sla": "",
        "ultima_atualizacao": "",
        "id_cidade": "",
        "bairro": "",
        "endereco": "",
        "complemento": "",
        "referencia": "",
        "id_condominio": "",
        "bloco": "",
        "apartamento": "",
        "data_abertura": "",
        "data_inicio": "",
        "data_hora_analise": "",
        "data_agenda": "",
        "data_agenda_final": "",
        "data_hora_encaminhado": "",
        "data_hora_assumido": "",
        "data_hora_execucao": "",
        "data_final": "",
        "data_fechamento": "",
        "data_prazo_limite": "",
        "data_reservada": "",
        "data_reagendar": "",
        "data_prev_final": "",
        "mensagem_resposta": "",
        "justificativa_sla_atrasado": "",
        "valor_unit_comissao": "",
        "valor_total_comissao": ""
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(token).toString('base64')}`,
          ixcsoft: "inserir",
        }
      }
    );

    res.json(response.data);
        
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Erro ao criar OSS:",
        error.response ? error.response.data : error.message
      );
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Erro ao criar OSS" });
    } else {
      console.error("Erro inesperado:", error);
      res.status(500).json({ error: "Erro inesperado ao criar OSS" });
    }
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

