<?php
declare(strict_types=1);
// Preencha com os dados MySQL fornecidos pela sua hospedagem.
// Não publique senhas reais neste repositório.
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'NOME_DO_BANCO');
define('DB_USER', getenv('DB_USER') ?: 'USUARIO_DO_BANCO');
define('DB_PASS', getenv('DB_PASS') ?: 'SENHA_DO_BANCO');
define('BASE_URL', getenv('BASE_URL') ?: '');
