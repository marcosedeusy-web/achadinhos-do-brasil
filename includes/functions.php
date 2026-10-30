<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/database.php';
function db(): PDO {
 static $pdo = null;
 if ($pdo instanceof PDO) return $pdo;
 try { $pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false]); }
 catch (PDOException $e) { http_response_code(500); exit('Não foi possível conectar ao banco de dados. Confira config/database.php e os dados da hospedagem.'); }
 return $pdo;
}
function e(?string $value): string { return htmlspecialchars((string)$value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function url(string $path = ''): string { return rtrim(BASE_URL, '/') . '/' . ltrim($path, '/'); }
function redirect(string $path): never { header('Location: ' . url($path)); exit; }
function csrf_token(): string { if (session_status() !== PHP_SESSION_ACTIVE) session_start(); if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32)); return $_SESSION['csrf']; }
function verify_csrf(): void { if (session_status() !== PHP_SESSION_ACTIVE) session_start(); $token = (string)($_POST['csrf'] ?? ''); if (!hash_equals($_SESSION['csrf'] ?? '', $token)) { http_response_code(419); exit('Sessão expirada. Volte e tente novamente.'); } }
function money_input(string $value): ?float { $value = trim(str_replace(',', '.', $value)); if ($value === '') return null; return is_numeric($value) && (float)$value >= 0 ? (float)$value : null; }
function upload_image(array $file): ?string {
 if (($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) return null;
 if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK || ($file['size'] ?? 0) > 4 * 1024 * 1024) throw new RuntimeException('A imagem deve ter até 4 MB.');
 $finfo = new finfo(FILEINFO_MIME_TYPE); $mime = $finfo->file($file['tmp_name']);
 $allowed = ['image/jpeg'=>'jpg', 'image/png'=>'png', 'image/webp'=>'webp'];
 if (!isset($allowed[$mime])) throw new RuntimeException('Envie uma imagem JPG, PNG ou WEBP.');
 $dir = __DIR__ . '/../uploads'; if (!is_dir($dir) && !mkdir($dir, 0755, true)) throw new RuntimeException('Não foi possível criar a pasta de imagens.');
 $name = bin2hex(random_bytes(16)) . '.' . $allowed[$mime];
 if (!move_uploaded_file($file['tmp_name'], $dir . '/' . $name)) throw new RuntimeException('Não foi possível salvar a imagem.');
 return 'uploads/' . $name;
}
