FROM php:8.2-apache

WORKDIR /var/www/html

# Dependências do Laravel
RUN apt-get update && apt-get install -y \
    zip unzip git curl libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Ativar mod_rewrite do Apache
RUN a2enmod rewrite

# Copiar app
COPY . .

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
RUN composer install --no-interaction --optimize-autoloader

# Permissões
RUN chown -R www-data:www-data storage bootstrap/cache

# Apache vai ouvir na porta 8000
RUN sed -i 's/80/8000/g' /etc/apache2/ports.conf /etc/apache2/sites-available/000-default.conf
RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/html/public|' /etc/apache2/sites-available/000-default.conf

EXPOSE 8000

# Rodar Apache em foreground
CMD ["apache2-foreground"]

