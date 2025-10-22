## POSTUP PRE DUMMIES :D
- Maj Docker compose nainstalovany

v workspace priecinku napis do cmd : <br>
- ```docker compose up```<br>

ked sa dokonci tak v novom terminaly napis : <br>
- ```docker compose exec php bash```<br>

v php terminaly napis :<br>
  ```cp .env.example .env```
- ```composer install```<br>
- ```sudo chown -R www-data:www-data /var/www/html/storage```<br>
- ```sudo chown -R www-data:www-data /var/www/html/bootstrap/cache```<br>
- ```sudo chmod -R 775 /var/www/html/storage```<br>
- ```sudo chmod -R 775 /var/www/html/bootstrap/cache```<br>
- ```php artisan view:clear``` <br>
- ```php artisan migrate --graceful --ansi``` <br>
- ```npm install```



