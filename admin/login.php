<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/auth.php';
if (!empty($_SESSION['admin_id'])) redirect('admin/index.php');
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') { verify_csrf(); $stmt = db()->prepare('SELECT id, name, password_hash FROM admins WHERE email = ? LIMIT 1'); $stmt->execute([trim((string)($_POST['email'] ?? ''))]); $admin = $stmt->fetch(); if ($admin && password_verify((string)($_POST['password'] ?? ''), $admin['password_hash'])) { session_regenerate_id(true); $_SESSION['admin_id'] = (int)$admin['id']; $_SESSION['admin_name'] = $admin['name']; redirect('admin/index.php'); } $error = 'E-mail ou senha incorretos.'; }
$pageTitle = 'Entrar · Administração'; require __DIR__ . '/../includes/header.php';
?><main class="container narrow"><section class="panel"><span class="eyebrow">ÁREA RESTRITA</span><h1>Entrar no painel</h1><?php if ($error): ?><p class="alert"><?= e($error) ?></p><?php endif; ?><form method="post" class="form"><input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>"><label>E-mail<input type="email" name="email" required autocomplete="username"></label><label>Senha<input type="password" name="password" required autocomplete="current-password"></label><button class="button" type="submit">Entrar</button></form></section></main><?php require __DIR__ . '/../includes/footer.php'; ?>
