const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const multer = require('multer');
const cors = require('cors');

dotenv.config();

const app = express();
const upload = multer();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

    // Rota para pré-cadastro
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

    // Rota para desbloqueio de confiança
    app.post('/api/proxy/desbloqueio', async (req, res) => {
        const { cpfcnpj, senha, contrato } = req.body;

        // Verifica se os campos estão presentes
        if (!cpfcnpj || !senha || !contrato) {
            return res.status(400).json({ error: 'Campos obrigatórios não fornecidos.' });
        }

        try {
            const data = new FormData();
            data.append('cpfcnpj', cpfcnpj);
            data.append('senha', senha);
            data.append('contrato', contrato);

            const response = await axios.post('https://demo.sgp.net.br/api/central/promessapagamento/', data, {
                headers: {
                    ...data.getHeaders()
                }
            });

            res.json(response.data);
        } catch (error) {
            console.error('Erro ao realizar a requisição:', error);
            res.status(500).json({ error: 'Erro ao realizar a requisição ao serviço externo.' });
        }
    });

    // Rota para extrato de conexão
    app.post('/api/proxy/extrato', async (req, res) => {
        console.log('Recebendo requisição para /api/proxy/extrato');
        console.log('Corpo da requisição:', req.body);

        try {
            const data = req.body;

            // Configura a requisição para a API externa
            const config = {
                method: 'post',
                url: 'https://demo.sgp.net.br/api/central/extratouso/',
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

    // Adiciona uma rota POST para enviar o formulário preenchido
    app.post('/proxy/enviar-chamado', async (req, res) => {
        try {
            // Cria uma nova instância do FormData
            const data = new FormData();
            data.append('cpfcnpj', req.body.cpfcnpj);
            data.append('senha', req.body.senha);
            data.append('contrato', req.body.contrato);
            data.append('conteudo', req.body.conteudo);
            data.append('contato', req.body.contato);
            data.append('contato_numero', req.body.contato_numero);
            data.append('motivoos', req.body.motivoos);
            data.append('sem_os', req.body.sem_os);
            data.append('ocorrenciatipo', req.body.ocorrenciatipo);
            data.append('setor', req.body.setor);
            data.append('os_tecnico_responsavel', req.body.os_tecnico_responsavel);
            data.append('os_servico_prestado', req.body.os_servico_prestado);
            data.append('os_prioridade', req.body.os_prioridade);

            // Configura os headers para a requisição
            const headers = {
                ...data.getHeaders(),
                'Authorization': `Bearer ${process.env.TOKEN}` // Adiciona o token de autenticação
            };

            // Envia a requisição para o endpoint externo
            const response = await axios.post('https://demo.sgp.net.br/api/central/chamado/', data, { headers });

            // Retorna a resposta do endpoint externo para o cliente
            res.status(response.status).json(response.data);
        } catch (error) {
            // Trata erros e retorna uma resposta de erro
            console.error('Erro ao enviar chamado:', error);
            res.status(error.response?.status || 500).json({ error: error.message });
        }
    });

    // Rota para enviar dados ao endpoint /chamado/list
    app.post('/api/proxy/buscar-chamado', async (req, res) => {
        try {
            // Configura o corpo da requisição com JSON
            const requestBody = {
                cpfcnpj: req.body.cpfFormatado,
                senha: req.body.cpfSemFormatacao,
                contrato: req.body.contratoid
            };

            const headers = {
                'Authorization': `Bearer ${process.env.TOKEN}`,
                'Content-Type': 'application/json' // Adiciona o header Content-Type
            };

            // Faz a requisição para o endpoint externo
            const response = await axios.post('https://demo.sgp.net.br/api/central/chamado/list/', requestBody, { headers });
            res.status(response.status).json(response.data);
        } catch (error) {
            console.error('Erro ao buscar chamado:', error);
            res.status(error.response?.status || 500).json({ error: error.message });
        }
    });

    // Rota para criar OSS
    app.post('/api/proxy/abrir-chamado', upload.none(), async (req, res) => {
        try {
            const formData = new FormData();
            
            // Adicionando os dados ao FormData
            formData.append('cpfcnpj', req.body.cpfcnpj);
            formData.append('senha', req.body.senha);
            formData.append('contrato', req.body.contrato);
            formData.append('conteudo', req.body.conteudo);
            formData.append('contato', req.body.contato);
            formData.append('contato_numero', req.body.contato_numero);
            formData.append('motivoos', req.body.motivoos);
            formData.append('sem_os', req.body.sem_os);
            formData.append('ocorrenciatipo', req.body.ocorrenciatipo);
            formData.append('setor', req.body.setor);
            formData.append('os_tecnico_responsavel', req.body.os_tecnico_responsavel);
            formData.append('os_servico_prestado', req.body.os_servico_prestado);
            formData.append('os_prioridade', req.body.os_prioridade);

            const config = {
                method: 'post',
                url: 'https://demo.sgp.net.br/api/central/chamado/',
                headers: {
                    ...formData.getHeaders(),
                },
                data: formData
            };

            const response = await axios(config);

            res.json(response.data);
        } catch (error) {
            console.error('Erro ao criar chamado:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });

    // Inicializa o servidor
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Servidor rodando na porta ${port}`);
    });

    module.exports = app;