<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/auth.php'; require_admin();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') redirect('admin/index.php');
verify_csrf(); $id=(int)($_POST['id']??0); if ($id>0) { $stmt=db()->prepare('DELETE FROM products WHERE id=?'); $stmt->execute([$id]); } redirect('admin/index.php');
