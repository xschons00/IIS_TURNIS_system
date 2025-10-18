# https://gist.github.com/System-Glitch/c53ca30a579dc60c7ea6333a40caec2c
FROM php:8.4-fpm

RUN apt-get update && apt-get install -y \
    git \
    zip \
    curl \
    sudo \
    unzip \
    libicu-dev \
    libbz2-dev \
    libpng-dev \
    libonig-dev\
    libjpeg-dev \
    libmcrypt-dev \
    libreadline-dev \
    libzip-dev \
    libfreetype6-dev

RUN docker-php-ext-install \
    bz2 \
    intl \
    iconv \
    bcmath \
    opcache \
    calendar \
    mbstring \
    pdo_mysql \
    mysqli \
    zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN mkdir -p /var/www/html/storage && chown -R www-data:www-data /var/www/html


CMD ["php-fpm"]

EXPOSE 9000