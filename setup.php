<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/functions.php';
if (file_exists(__DIR__ . '/storage/installed.lock')) { http_response_code(403); exit('Instalação já concluída. Por segurança, remova setup.php do servidor.'); }
$error='';
if ($_SERVER['REQUEST_METHOD']==='POST') {
 $name=trim((string)($_POST['name']??'')); $email=trim((string)($_POST['email']??'')); $password=(string)($_POST['password']??'');
 if ($name==='' || !filter_var($email,FILTER_VALIDATE_EMAIL) || strlen($password)<10) $error='Informe nome, e-mail válido e senha com pelo menos 10 caracteres.';
 else {
  try {
   $pdo=db();
   $pdo->exec("CREATE TABLE IF NOT EXISTS admins (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120) NOT NULL, email VARCHAR(190) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
   $pdo->exec("CREATE TABLE IF NOT EXISTS products (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(180) NOT NULL, description TEXT NOT NULL, store ENUM('Shopee','Mercado Livre') NOT NULL, category VARCHAR(100) NOT NULL DEFAULT 'Geral', price DECIMAL(10,2) NULL, price_label VARCHAR(100) NULL, affiliate_url VARCHAR(2048) NOT NULL, image VARCHAR(255) NULL, featured TINYINT(1) NOT NULL DEFAULT 0, active TINYINT(1) NOT NULL DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX idx_active_featured (active,featured), INDEX idx_category (category)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
   $count=(int)$pdo->query('SELECT COUNT(*) FROM admins')->fetchColumn();
   if ($count===0) { $stmt=$pdo->prepare('INSERT INTO admins(name,email,password_hash) VALUES(?,?,?)'); $stmt->execute([$name,$email,password_hash($password,PASSWORD_DEFAULT)]); }
   $pdo->exec("INSERT INTO products (name,description,store,category,price,price_label,affiliate_url,image,featured,active) SELECT 'Mini Power Bank Portátil','Carregador portátil compacto. Confira as capacidades, cores e conexões disponíveis no anúncio.','Shopee','Eletrônicos',31.99,NULL,'https://s.shopee.com.br/30p7lRG6Ku','foto1.jpg',1,1 WHERE NOT EXISTS (SELECT 1 FROM products)");
   $pdo->exec("INSERT INTO products (name,description,store,category,price,price_label,affiliate_url,image,featured,active) VALUES ('Kit Body Splash Árabe Shakan','Fragrâncias variadas em frascos de 60 ml. Confira as opções individuais e os kits disponíveis.','Shopee','Beleza',NULL,'A partir de R$ 14,89','https://s.shopee.com.br/40hexzGWHO','foto2.webp',0,1),('Fone de Ouvido Bluetooth 760BT','Fone sem fio com microfone, formato over-ear e diferentes opções de cores.','Shopee','Eletrônicos',38.55,NULL,'https://s.shopee.com.br/2gCHMwwXTq','foto3.webp',0,1),('Árvore de Natal 1,50 m — 400 Galhos','Árvore verde desmontável para decorar casas, lojas e escritórios. Opções com pé de ferro ou plástico.','Shopee','Casa e decoração',NULL,'R$ 79,99 a R$ 118,99','https://s.shopee.com.br/30p7lbUPuf','foto4.jpg',0,1) ON DUPLICATE KEY UPDATE id=id");
   if (!is_dir(__DIR__.'/storage')) mkdir(__DIR__.'/storage',0755,true);
   file_put_contents(__DIR__.'/storage/installed.lock',date('c'));
   $error='INSTALADO'; 
  } catch (Throwable $e) { $error='Falha na instalação. Confira os dados do banco em config/database.php e as permissões da pasta storage.'; }
 }
}
?><!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Instalar Achadinhos</title><link rel="stylesheet" href="assets/style.css"></head><body><main class="container narrow"><section class="panel"><span class="eyebrow">CONFIGURAÇÃO INICIAL</span><h1>Instalar painel administrativo</h1><?php if($error==='INSTALADO'): ?><p class="success">Instalação concluída! Agora entre em <a href="admin/login.php">Área administrativa</a>. Remova setup.php do servidor por segurança.</p><?php elseif($error): ?><p class="alert"><?= e($error) ?></p><?php endif; ?><p>Antes de continuar, preencha os dados MySQL em <code>config/database.php</code>.</p><form method="post" class="form"><label>Nome do administrador<input name="name" required></label><label>E-mail<input type="email" name="email" required></label><label>Senha (mínimo 10 caracteres)<input type="password" name="password" minlength="10" required></label><button class="button" type="submit">Criar painel e banco de dados</button></form></section></main></body></html>
