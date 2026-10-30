<?php
declare(strict_types=1);
if (session_status() !== PHP_SESSION_ACTIVE) session_start();
require_once __DIR__ . '/functions.php';
function require_admin(): void { if (empty($_SESSION['admin_id'])) redirect('admin/login.php'); }
