const express = require('express');
const axios = require('axios');
const cors = require('cors');
const serverless = require('serverless-http');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/cliente', (req, res) => {

const token = '8:6ab19d7128d35b06a4db7768d24e72d458d61e6f5f90dab67aca8bedb8e15323';

// Rota para buscar clientes
app.post('/api/cliente', async (req, res) => {
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
app.post('/api/boletos', async (req, res) => {
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
app.post('/api/contratos', async (req, res) => {
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
app.post('/api/oss', async (req, res) => {
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

app.use(cors({
  origin: 'https://feitosa-github-5gnz5h9r5-jocandidojrs-projects.vercel.app'
}));

// Exporta a aplicação para o Vercel
module.exports = app;
module.exports.handler = serverless(app);
