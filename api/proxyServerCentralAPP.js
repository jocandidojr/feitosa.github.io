const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();

// Configura o body-parser para processar JSON e URLs codificadas
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Adicionando cabeçalhos CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // Permite solicitações de qualquer origem
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

    if (req.method === "OPTIONS") {
        return res.status(200).json({});
    }

    next();
});

// Rota para buscar contratos
app.post('/api/proxy/contratos', async (req, res) => {
    console.log('Recebendo requisição para /api/proxy/contratos');
    console.log('Corpo da requisição:', req.body);
    
    try {
        const { cpfcnpj } = req.body;

        // Remove qualquer formatação do CPF/CNPJ para usar como senha
        const senha = cpfcnpj.replace(/[^\d]/g, ''); // Remove caracteres não numéricos

        // Cria uma instância de FormData e adiciona os campos
        const form = new FormData();
        form.append('cpfcnpj', cpfcnpj);
        form.append('senha', senha);

        // Configura o request para a API externa com autenticação
        const config = {
            method: 'post',
            url: 'https://demo.sgp.net.br/api/central/contratos',
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${process.env.API_TOKEN}`, // Usa o token do arquivo .env
            },
            data: form,
        };

        // Faz a requisição
        const response = await axios(config);

        console.log('Dados recebidos da API externa:', response.data);

        // Retorna os dados recebidos da API externa
        res.json(response.data);
    } catch (error) {
        console.error('Erro ao realizar a requisição:', error.message);
        console.error('Detalhes do erro:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Erro ao realizar a requisição', details: error.message });
    }
});

// Rota para listar boletos/títulos do cliente
app.post('/api/proxy/titulos', async (req, res) => {
    console.log('Recebendo requisição para /api/proxy/titulos');
    console.log('Corpo da requisição:', req.body);

    try {
        const { cpfcnpj } = req.body; // Não é necessário contratoId se não for utilizado

        if (!cpfcnpj) {
            return res.status(400).json({ error: 'CPF/CNPJ é obrigatório' });
        }

        // Remove qualquer formatação do CPF/CNPJ para usar como senha
        const senha = cpfcnpj.replace(/[^\d]/g, ''); // Remove caracteres não numéricos

        // Cria uma instância de FormData e adiciona os campos
        const form = new FormData();
        form.append('cpfcnpj', cpfcnpj);
        form.append('senha', senha);

        // Configura o request para a API externa com autenticação
        const config = {
            method: 'post',
            url: 'https://demo.sgp.net.br/api/central/titulos/',
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${process.env.API_TOKEN}`, // Usa o token do arquivo .env
            },
            data: form,
        };

        // Faz a requisição
        const response = await axios(config);

        console.log('Dados recebidos da API externa:', response.data);

        // Retorna os dados recebidos da API externa
        res.json(response.data);
    } catch (error) {
        console.error('Erro ao realizar a requisição:', error.message);
        console.error('Detalhes do erro:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Erro ao realizar a requisição', details: error.message });
    }
});


app.post('/api/proxy/precadastro', async (req, res) => {
    console.log('Recebendo requisição para /api/proxy/precadastro');
    console.log('Corpo da requisição:', req.body);

    try {
        const data = req.body;

        // Configura a requisição para a API externa
        const config = {
            method: 'post',
            url: 'https://demo.sgp.net.br/api/precadastro/F',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.API_TOKEN}`, // Token da variável de ambiente
            },
            data: JSON.stringify(data),
        };

        // Faz a requisição
        const response = await axios(config);

        console.log('Dados recebidos da API externa:', response.data);

        // Retorna os dados recebidos da API externa
        res.json(response.data);
    } catch (error) {
        console.error('Erro ao realizar a requisição:', error.message);
        console.error('Detalhes do erro:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Erro ao realizar a requisição', details: error.message });
    }
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
