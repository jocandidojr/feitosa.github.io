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

# Variáveis
PASTA_ROOT="/root/website"  # Atualizado para o caminho correto
NGINX_CONF="/etc/nginx/sites-available/default"
HTML_DIR="/var/www/html"
API_DIR="$PASTA_ROOT/api"
PUBLIC_DIR="$PASTA_ROOT/public"
IMAGEM_DIR="$HTML_DIR/imagem"  # Caminho para a pasta imagem

# Atualizando o sistema
sudo apt update && sudo apt upgrade -y

# Instalando dependências do sistema
sudo apt install -y nginx nodejs npm git python3-certbot-nginx

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
    server_name feitosatelecom.com.br $IP_LOCAL;

    # Redireciona todo o tráfego HTTP para HTTPS
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name feitosatelecom.com.br $IP_LOCAL;

    ssl_certificate /etc/letsencrypt/live/feitosatelecom.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/feitosatelecom.com.br/privkey.pem;

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

# Criando a pasta imagem e definindo permissões
sudo mkdir -p $IMAGEM_DIR  # Cria a pasta imagem, se não existir
sudo chown -R www-data:www-data $IMAGEM_DIR  # Define www-data como proprietário
sudo chmod -R 755 $IMAGEM_DIR  # Define permissões de leitura e execução

# Ajustando permissões e propriedade
sudo chown -R www-data:www-data $HTML_DIR  # Define www-data como proprietário
sudo chmod -R 755 $HTML_DIR  # Define permissões de leitura e execução
sudo chown -R www-data:www-data $HTML_DIR/assets  # Garantindo permissões para assets
sudo chmod -R 755 $HTML_DIR/assets  # Permissões de leitura e execução para assets

# Reiniciando o NGINX para aplicar as mudanças
sudo systemctl restart nginx

# Obter o Certificado SSL
sudo certbot --nginx -d feitosatelecom.com.br

# Iniciando a aplicação Node.js com PM2
cd $API_DIR
pm2 start proxyServer.js --name "website-api"
pm2 startup systemd
pm2 save

# Finalização
echo "Configuração concluída. O site está disponível em: https://feitosatelecom.com.br ou no IP: $IP_LOCAL"
