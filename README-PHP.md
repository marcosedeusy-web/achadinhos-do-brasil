# Achadinhos do Brasil — versão PHP

Esta versão mantém a página HTML original e adiciona uma aplicação PHP/MySQL em arquivos separados. O trabalho está na branch `versao-php-admin`; a branch `main` e o GitHub Pages não foram alterados.

## Requisitos
- PHP 8.1 ou superior com extensões PDO, pdo_mysql e fileinfo
- MySQL 5.7+ ou MariaDB
- Hospedagem que execute PHP (GitHub Pages não executa PHP nem MySQL)

## Instalação
1. Crie um banco MySQL e um usuário na hospedagem.
2. Edite `config/database.php` com host, nome do banco, usuário e senha. Não envie senhas reais ao GitHub.
3. Envie os arquivos desta branch para a pasta pública da hospedagem, mantendo as pastas.
4. Garanta permissão de escrita nas pastas `uploads/` e `storage/`.
5. Abra `https://SEU-DOMINIO/setup.php`, crie o primeiro administrador e aguarde a confirmação.
6. Apague `setup.php` do servidor após a instalação.
7. Acesse `/admin/login.php`.

O instalador cria as tabelas automaticamente e cadastra os quatro produtos atuais da Shopee com as fotos já existentes na raiz do projeto. Se já houver produtos, não repete a carga inicial.

## Produtos
O painel permite cadastrar, editar, publicar/ocultar, destacar e excluir produtos da Shopee ou do Mercado Livre. As imagens aceitas são JPG, PNG e WEBP até 4 MB.

## Publicação
O GitHub Pages pode continuar servindo o site estático atual, mas não executa a aplicação PHP. Para usar a versão dinâmica, publique esta branch em uma hospedagem PHP/MySQL. Configure `BASE_URL` no ambiente se a aplicação ficar em uma subpasta (ex.: `/achadinhos`); para a raiz do domínio, deixe vazio.
