#!/bin/bash

# Função para buscar o IP local automaticamente
obter_ip_local() {
    hostname -I | awk '{print $1}'  # Obtém o primeiro IP da interface de rede
}

# Pergunta ao usuário se deseja inserir o IP manualmente
echo "Deseja inserir o IP manualmente? (s/n)"
read resposta

if [ "$resposta" == "s" ] || [ "$resposta" == "S" ]; then
    echo "Por favor, insira o IP do servidor:"
    read IP_LOCAL
else
    # Se não, busca o IP local automaticamente
    IP_LOCAL=$(obter_ip_local)
    echo "IP local detectado: $IP_LOCAL"
fi

# Pergunta ao usuário pelo domínio
echo "Por favor, insira o domínio (ex: seu_dominio.com):"
read DOMINIO

# Variáveis
PASTA_ROOT="/home/suporte/site/feitosa.github.io"  # Atualizado para o caminho correto
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

# Remover a linha de clonagem, pois os arquivos já foram clonados

# Instalando as dependências do Node.js no diretório API
cd $API_DIR
npm install

# Configurando o NGINX
sudo rm -f $NGINX_CONF

sudo tee $NGINX_CONF > /dev/null <<EOL
server {
    listen 80;
    server_name $DOMINIO;

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

    # Redirecionamento HTTP para HTTPS
    error_page 497 https://\$host$request_uri;
}
EOL

# Reiniciando o NGINX para aplicar as mudanças
sudo systemctl restart nginx

# Obtendo um certificado SSL com Certbot
echo "Configurando HTTPS com Certbot..."
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d $DOMINIO --non-interactive --agree-tos --email seu-email@dominio.com

# Excluindo arquivos HTML de /var/www/html
sudo rm -rf /var/www/html/assets
sudo rm -rf /var/www/html/index.html
sudo rm -rf /var/www/html/login.html
sudo rm -rf /var/www/html/scripts.js
sudo rm -rf /var/www/html/scriptIndex.js
sudo rm -rf /var/www/html/styleLogin.css
sudo rm -rf /var/www/html/styleIndex.css

# Copiando arquivos HTML para /var/www/html
sudo cp $PUBLIC_DIR/index.html $HTML_DIR/
sudo cp $PUBLIC_DIR/login.html $HTML_DIR/
sudo cp $PUBLIC_DIR/scriptIndex.js $HTML_DIR/
sudo cp $PUBLIC_DIR/scripts.js $HTML_DIR/
sudo cp $PUBLIC_DIR/styleIndex.css $HTML_DIR/
sudo cp $PUBLIC_DIR/styleLogin.css $HTML_DIR/
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
echo "Configuração concluída. O site está disponível em https://$DOMINIO"
