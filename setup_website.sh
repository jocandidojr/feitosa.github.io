#!/bin/bash

# Variáveis
IP_LOCAL="172.30.121.211"  # Defina o IP local aqui ou peça como entrada
PASTA_ROOT="/root/website"
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

# Clonando o repositório privado via SSH (necessário configurar a chave SSH no GitHub)
git clone git@github.com:jocandidojr/feitosa.github.io.git $PASTA_ROOT

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
sudo cp $PUBLIC_DIR/index.html $HTML_DIR/
sudo cp $PUBLIC_DIR/login.html $HTML_DIR/
sudo mkdir -p $HTML_DIR/assets
sudo cp -r $PUBLIC_DIR/assets/* $HTML_DIR/assets/

# Reiniciando o NGINX para aplicar as mudanças
sudo systemctl restart nginx

# Iniciando a aplicação Node.js com PM2
cd $API_DIR
pm2 start proxyServer.js --name "website-api"
pm2 startup systemd
pm2 save

# Finalização
echo "Configuração concluída. O site está disponível no IP: $IP_LOCAL"
