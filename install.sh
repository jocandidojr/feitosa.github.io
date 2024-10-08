#!/bin/bash

# Função para buscar o IP local automaticamente
obter_ip_local() {
    hostname -I | awk '{print $1}'  # Obtém o primeiro IP da interface de rede
}

# IP do servidor
IP_SERVIDOR="170.84.150.254"

# Pergunta ao usuário se deseja inserir o IP manualmente
echo "Deseja inserir o IP manualmente? (s/n)"
read resposta

if [ "$resposta" == "s" ] || [ "$resposta" == "S" ]; then
    echo "Por favor, insira o IP do servidor:"
    read IP_LOCAL
else
    # Se não, usa o IP do servidor definido
    IP_LOCAL=$IP_SERVIDOR
    echo "IP local definido: $IP_LOCAL"
fi

# Variáveis
PASTA_ROOT="/var/www/html/website"  # Atualizado para o caminho correto
NGINX_CONF="/etc/nginx/sites-available/default"
HTML_DIR="/var/www/html"
API_DIR="$PASTA_ROOT/api"
PUBLIC_DIR="$PASTA_ROOT/public"

# Atualizando o sistema
sudo apt update && sudo apt upgrade -y

# Instalando dependências do sistema
sudo apt install -y nginx nodejs npm git

# Instalando PM2 para gerenciar o processo Node.js
sudo npm install -g pm2

# Instalando as dependências do Node.js no diretório API
cd $API_DIR
npm install

# Configurando o NGINX
sudo rm -f $NGINX_CONF

sudo tee $NGINX_CONF > /dev/null <<EOL
server {
    listen 80;
    server_name $IP_LOCAL;

    location / {
        root $HTML_DIR;
        index index.html login.html;
        try_files \$uri \$uri/ =404;
    }

    location /assets {
        alias $PUBLIC_DIR/assets;
        try_files \$uri =404;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

# Copiando arquivos HTML para /var/www/html
sudo rm -rf $HTML_DIR/*
sudo cp -r /root/repositorio/* $PASTA_ROOT/

# Ajustando permissões e propriedade
sudo chown -R www-data:www-data $HTML_DIR  # Define www-data como proprietário
sudo chmod -R 755 $HTML_DIR  # Define permissões de leitura e execução

# Reiniciando o NGINX para aplicar as mudanças
sudo systemctl restart nginx

# Iniciando a aplicação Node.js com PM2
cd $API_DIR
pm2 start proxyServer.js --name "website-api"
pm2 startup systemd
pm2 save

# Finalização
echo "Configuração concluída. O site está disponível no IP: $IP_LOCAL"