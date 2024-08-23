  require('dotenv').config(); // Carregar variáveis de ambiente

  const express = require('express');
  const axios = require('axios');
  const cors = require('cors');

  const app = express();
  const port = process.env.PORT || 3000;
  const token = process.env.TOKEN;

  app.use(cors());
  app.use(express.json());

  // Rota para buscar clientes
  app.post('/api/proxy/cliente', async (req, res) => {
    try {
      console.log('Requisição recebida:', req.body); // Adicione logs para depuração
      const response = await axios.post('https://feitosatelecom.com.br/webservice/v1/cliente', req.body, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(token).toString('base64')}`,
          ixcsoft: "listar",
        }
      });
      res.json(response.data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error.message); // Log detalhado
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Erro ao conectar com a API de Clientes" });
    }
  });

  // Rota para buscar boletos
  app.post('/api/proxy/boletos', async (req, res) => {
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
  app.post('/api/proxy/contratos', async (req, res) => {
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

  //Rota para Criar Oss
  app.post('/api/proxy/oss', async (req, res) => {
    const { clienteId } = req.body;

    if (!clienteId) {
      return res.status(400).json({ error: 'ClienteId não fornecido' });
    }

    try {
      console.log('Buscando OSS do Cliente...');

      // Enviar a requisição para a API externa com o clienteId fornecido
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

      // Filtrar os registros retornados para garantir que apenas OSS com o id_cliente correto sejam retornados
      const filteredRecords = response.data.registros.filter(record => record.id_cliente === clienteId);

      res.json(filteredRecords);
    } catch (error) {
      console.error('Erro ao buscar OSS:', error.response ? error.response.data : error.message);
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Erro ao conectar com a API de OSS" });
    }
  });

  // Rota para criar OSS
  app.post('/api/proxy/criar-oss', async (req, res) => {
    const { clienteId, tipo, id_assunto, id_filial, origem_endereco, prioridade, setor, mensagem, status } = req.body;

    if (!clienteId || !tipo || !id_assunto || !id_filial || !origem_endereco || !prioridade || !setor || !status) {
      return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' });
    }

    try {
      console.log('Criando OSS para o Cliente...');
      const response = await axios.post(
        'https://feitosatelecom.com.br/webservice/v1/su_oss_chamado',
        {
          tipo,
          id_ticket: "",
          protocolo: "",
          id_assunto,
          id_cliente: clienteId,
          id_estrutura: "",
          id_filial,
          id_login: "",
          id_contrato_kit: "",
          origem_endereco,
          origem_endereco_estrutura: "",
          latitude: "",
          longitude: "",
          prioridade,
          melhor_horario_agenda: "",
          setor,
          id_tecnico: "",
          mensagem,
          idx: "",
          status,
          gera_comissao: "",
          liberado: "",
          impresso: "",
          preview: "",
          id_wfl_param_os: "",
          id_wfl_tarefa: "",
          id_su_diagnostico: "",
          regiao_manutencao: "",
          origem_cadastro: "",
          origem_change_endereco: "",
          status_sla: "",
          ultima_atualizacao: "",
          id_cidade: "",
          bairro: "",
          endereco: "",
          complemento: "",
          referencia: "",
          id_condominio: "",
          bloco: "",
          apartamento: "",
          data_abertura: "",
          data_inicio: "",
          data_hora_analise: "",
          data_agenda: "",
          data_agenda_final: "",
          data_hora_encaminhado: "",
          data_hora_assumido: "",
          data_hora_execucao: "",
          data_final: "",
          data_fechamento: "",
          data_prazo_limite: "",
          data_reservada: "",
          data_reagendar: "",
          data_prev_final: "",
          mensagem_resposta: "",
          justificativa_sla_atrasado: "",
          valor_unit_comissao: "",
          valor_total_comissao: ""
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
      console.error('Erro ao criar OSS:', error.message);
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Erro ao conectar com a API de OSS" });
    }
  });

// Rota para buscar dados de contrato do cliente
app.get('/proxy/cliente-contrato', async (req, res) => {
  try {
    const clienteId = req.query.clienteId; // Obtendo clienteId da query string

    if (!clienteId) {
      return res.status(400).json({ error: 'Cliente ID não fornecido' });
    }

    // Faz a requisição para a API da Feitosa Telecom usando o clienteId
    const response = await axios.get(`https://feitosatelecom.com.br/webservice/v1/cliente_contrato/${clienteId}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(token).toString('base64')}`,
      }
    });

    // Retorna a resposta da API para o frontend
    res.json(response.data);

  } catch (error) {
    console.error('Erro ao buscar contrato:', error.message);
    res.status(500).json({ error: 'Erro ao buscar contrato do cliente' });
  }
});

// Rota para desbloqueio de confiança
app.post('/api/proxy/desbloqueio-confianca', async (req, res) => {
  const { id } = req.body;

  console.log('Dados recebidos no backend:', req.body);

  if (!id) {
    console.error('ID do contrato não fornecido.');
    return res.status(400).json({ error: 'Contrato ID não fornecido' });
  }

  try {
    console.log('Desbloqueando Confiança para o Contrato...');
    const response = await axios.post(
      'https://feitosatelecom.com.br/webservice/v1/desbloqueio_confianca',
      { id },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(token).toString('base64')}`,
        }
      }
    );

    console.log('Resposta da API externa:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Erro ao desbloquear confiança:', error.message);
    console.error('Detalhes do erro:', error.response?.data);
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Erro ao conectar com a API de desbloqueio de confiança" });
  }
});

//Rota pra desconectar login
app.post('/proxy/desconectarClientes', async (req, res) => {
  const { id_cliente, id_contrato } = req.body;

  if (!id_cliente || !id_contrato) {
      return res.status(400).send({ error: 'id_cliente e id_contrato são obrigatórios' });
  }

  try {
      const response = await axios({
          method: 'PUT',
          url: 'https://HOST/webservice/v1/radusuarios/desconectar',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${Buffer.from(token).toString('base64')}`
          },
          data: {
              id_cliente: id_cliente,
              id_contrato: id_contrato,
              // Adicione outros campos necessários para a desconexão aqui
          }
      });

      res.send(response.data);
  } catch (error) {
      console.error('Erro ao desconectar o cliente:', error);
      res.status(500).send({ error: 'Erro ao desconectar o cliente' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});


app.listen(port, () => {
  console.log(`Servidor proxy rodando na porta ${port}`);
});

  module.exports = app;