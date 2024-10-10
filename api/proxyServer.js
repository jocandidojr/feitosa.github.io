require('dotenv').config();
//require('dotenv').config({ path: '/root/website/.env' });

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const https = require('https');

const app = express();
const port = process.env.PORT || 3000;
const token = process.env.TOKEN;
const apiUrl = process.env.API_URL; // Usando a variável API_URL do .env

app.use(cors());
app.use(express.json());

// Criar um agente para ignorar erros de SSL (auto-assinado ou sem SSL)
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// Rota para buscar clientes
app.post('/api/proxy/cliente', async (req, res) => {
  console.log('Requisição recebida para /api/proxy/cliente:', req.body); // Log do corpo da requisição
  try {
    const response = await axios.post(`${apiUrl}/cliente`, req.body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(token).toString('base64')}`,
        ixcsoft: "listar",
      },
      httpsAgent: httpsAgent // Adicionando o agente para desativar verificação SSL
    });

    console.log("Resposta da API:", response.data); // Log da resposta da API
    res.json(response.data);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error.message);

    if (error.response) {
      console.error("Detalhes do erro:", error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error("Erro genérico:", error);
      res.status(500).json({ error: "Erro ao conectar com a API de Clientes" });
    }
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
      `${apiUrl}/fn_areceber`, // Usando a variável apiUrl
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
        httpsAgent: httpsAgent // Desativando a verificação SSL
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
    const response = await axios.post(
      `${apiUrl}/cliente_contrato`, // Usando a variável apiUrl
      req.body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(token).toString('base64')}`,
          ixcsoft: "listar",
        },
        httpsAgent: httpsAgent // Desativando a verificação SSL
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Erro ao buscar contratos:", error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Erro ao conectar com a API de Contratos" });
  }
});

// Rota para buscar OSS
app.post('/api/proxy/oss', async (req, res) => {
  const { clienteId } = req.body;

  if (!clienteId) {
    return res.status(400).json({ error: 'ClienteId não fornecido' });
  }

  try {
    console.log('Buscando OSS do Cliente...');

    // Enviar a requisição para a API externa usando a variável apiUrl do .env
    const response = await axios.post(
      `${apiUrl}/su_oss_chamado`, // Usando a variável apiUrl do .env
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
        httpsAgent: httpsAgent // Desativando a verificação SSL
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

// Rota para criar OS
app.post('/api/proxy/criar-oss', async (req, res) => {
  console.log('Recebendo requisição para criar OSS...'); // Log de entrada

  const { id_cliente, tipo, id_assunto, id_filial, id_atendente, origem_endereco, prioridade, setor, mensagem, status } = req.body;

  // Log dos dados recebidos
  console.log('Dados recebidos:', req.body);

  // Verifica se os dados obrigatórios estão presentes
  if (!id_cliente || !tipo || !id_assunto || !id_filial || !id_atendente || !origem_endereco || !prioridade || !setor || !mensagem || !status) {
    return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' });
  }

  try {
    const response = await axios.post(
      `${apiUrl}/su_oss_chamado`, // Usando a variável apiUrl do .env
      {
        tipo: tipo,
        id_cliente: id_cliente,
        id_assunto: id_assunto,
        id_filial: id_filial,
        id_atendente: id_atendente,
        origem_endereco: origem_endereco,
        prioridade: prioridade,
        setor: setor,
        mensagem: mensagem,
        status: status,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'ixcsoft': 'inserir',
          Authorization: `Basic ${Buffer.from(token).toString('base64')}`,
        },
        httpsAgent: httpsAgent // Desativando a verificação SSL
      }
    );

    console.log('Resposta da API:', response.data); // Loga a resposta da API
    res.json(response.data); // Retorna a resposta para o frontend
  } catch (error) {
    console.error("Erro ao criar OSS:", error.message);
    
    if (error.response) {
      console.error("Detalhes do erro:", error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: "Erro ao conectar com a API de criação de OSS" });
    }
  }
});

// Rota para buscar dados de contrato do cliente
app.get('/api/proxy/cliente-contrato', async (req, res) => {
  try {
    const clienteId = req.query.clienteId; // Obtendo clienteId da query string

    if (!clienteId) {
      return res.status(400).json({ error: 'Cliente ID não fornecido' });
    }

    // Faz a requisição para a API da Feitosa Telecom usando o clienteId
    const response = await axios.get(`${apiUrl}/cliente_contrato/${clienteId}`, { // Usando a variável apiUrl do .env
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
      `${apiUrl}/desbloqueio_confianca`, // Usando a variável apiUrl do .env
      { id },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(token).toString('base64')}`,
          ixcsoft: "inserir",
        },
        httpsAgent: httpsAgent // Desativando a verificação SSL
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Erro ao desbloquear confiança:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Erro ao conectar com a API de Desbloqueio de Confiança" });
  }
});

// Rota para reiniciar a conexão do cliente
app.post('/api/proxy/reiniciar-conexao', async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID do contrato não fornecido' });
  }

  try {
    console.log('Reiniciando conexão para o contrato...');

    const response = await axios.post(
      `${apiUrl}/desconectar_clientes`, // Usando a variável apiUrl do .env
      { id },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(token).toString('base64')}`,
          ixcsoft: "inserir",
        },
        httpsAgent: httpsAgent // Desativando a verificação SSL, se necessário
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Erro ao reiniciar a conexão:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Erro ao conectar com a API de reinício de conexão" });
  }
});

// Rota para buscar usuários relacionados ao cliente
app.post('/api/proxy/usuarios', async (req, res) => {
  const { clienteId } = req.body;

  if (!clienteId) {
    return res.status(400).json({ error: 'ClienteId não fornecido' });
  }

  try {
    console.log('Buscando usuários do Cliente...');

    const response = await axios.post(
      `${apiUrl}/radusuarios`, // Usando a variável apiUrl do .env
      {
        qtype: "id_cliente",
        query: clienteId,
        oper: "=",
        page: "1",
        rp: "20",
        sortname: "radusuarios.id",
        sortorder: "desc",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(token).toString('base64')}`,
          ixcsoft: "listar",
        },
        httpsAgent: httpsAgent // Desativando a verificação SSL, se necessário
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Erro ao conectar com a API de Usuários" });
  }
});

// Rota para informar pagamento
app.post('/api/proxy/informar-pagamento', async (req, res) => {
  const { id } = req.body;

  console.log('Dados recebidos no backend:', req.body);

  if (!id) {
    console.error('ID do contrato não fornecido.');
    return res.status(400).json({ error: 'Contrato ID não fornecido' });
  }

  try {
    console.log('Informando Pagamento para o Contrato...');

    const response = await axios.post(
      `${apiUrl}/cliente_contrato_btn_lib_temp_24722`, // Usando a variável apiUrl do .env
      { id },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(token).toString('base64')}`,
          ixcsoft: "inserir",
        },
        httpsAgent: httpsAgent // Desativando a verificação SSL, se necessário
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Erro ao informar pagamento:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Erro ao conectar com a API de Informar Pagamento" });
  }
});
// Rota para buscar dados de radusuarios com base no clienteId
app.post('/api/proxy/radusuarios', async (req, res) => {
  const { clienteId } = req.body;

  if (!clienteId) {
    return res.status(400).json({ error: 'ClienteId não fornecido' });
  }

  try {
    console.log('Buscando dados de radusuarios do Cliente...');

    // Configura a requisição para a API de radusuarios
    const response = await axios.post(
      `${apiUrl}/radusuarios`, // Usando a variável apiUrl do .env
      {
        qtype: "id_cliente", // Alterado para "id_cliente" para corresponder ao que você está buscando
        query: clienteId,
        oper: "=",
        page: "1",
        rp: "20",
        sortname: "radusuarios.id",
        sortorder: "desc"
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(token).toString('base64')}`,
          ixcsoft: "listar",
        },
        httpsAgent: httpsAgent // Desativando a verificação SSL, se necessário
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Erro ao buscar radusuarios:', error.response ? error.response.data : error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Erro ao conectar com a API de radusuarios" });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

module.exports = app;