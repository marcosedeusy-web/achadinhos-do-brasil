<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/functions.php';
$pdo = db();
$categories = $pdo->query("SELECT DISTINCT category FROM products WHERE active = 1 AND category <> '' ORDER BY category")->fetchAll(PDO::FETCH_COLUMN);
$search = trim((string)($_GET['q'] ?? ''));
$category = trim((string)($_GET['categoria'] ?? ''));
$sql = "SELECT * FROM products WHERE active = 1";
$params = [];
if ($search !== '') { $sql .= " AND (name LIKE :q OR description LIKE :q)"; $params['q'] = '%' . $search . '%'; }
if ($category !== '') { $sql .= " AND category = :category"; $params['category'] = $category; }
$sql .= " ORDER BY featured DESC, created_at DESC";
$stmt = $pdo->prepare($sql); $stmt->execute($params); $products = $stmt->fetchAll();
$pageTitle = 'Achadinhos do Brasil';
require __DIR__ . '/includes/header.php';
?>
<section class="hero"><div class="container"><span class="eyebrow">OFERTAS SELECIONADAS</span><h1>Boas escolhas.<br><span>Ofertas que valem a pena.</span></h1><p>Encontre achadinhos da Shopee e do Mercado Livre em um só lugar.</p><form class="search" method="get"><input type="search" name="q" placeholder="O que você está procurando?" value="<?= e($search) ?>"><button type="submit">Buscar</button></form></div></section>
<main class="container">
  <div class="section-heading"><div><span class="eyebrow">VITRINE</span><h2>🔥 Nossos achadinhos</h2></div><span class="muted"><?= count($products) ?> oferta(s)</span></div>
  <nav class="chips"><a class="<?= $category === '' ? 'selected' : '' ?>" href="<?= e(url('index.php')) ?>">Todos</a><?php foreach ($categories as $item): ?><a class="<?= $category === $item ? 'selected' : '' ?>" href="<?= e(url('index.php?categoria=' . urlencode($item))) ?>"><?= e($item) ?></a><?php endforeach; ?></nav>
  <?php if (!$products): ?><div class="empty"><h3>Nenhuma oferta encontrada</h3><p>Tente outra busca ou escolha uma categoria diferente.</p><a class="button" href="<?= e(url('index.php')) ?>">Ver todas as ofertas</a></div><?php else: ?>
  <section class="products"><?php foreach ($products as $product): ?><article class="product-card"><a class="product-image" href="<?= e($product['affiliate_url']) ?>" target="_blank" rel="nofollow sponsored noopener"><?php if ($product['image']): ?><img src="<?= e(url($product['image'])) ?>" alt="<?= e($product['name']) ?>" loading="lazy"><?php else: ?><span>📦</span><?php endif; ?></a><div class="product-info"><div class="product-meta"><span class="store"><?= e($product['store']) ?></span><?php if ((int)$product['featured'] === 1): ?><span class="featured">DESTAQUE</span><?php endif; ?></div><h3><?= e($product['name']) ?></h3><p class="description"><?= e($product['description']) ?></p><div class="price"><?= $product['price_label'] ? e($product['price_label']) : 'R$ ' . number_format((float)$product['price'], 2, ',', '.') ?></div><a class="button button-buy" href="<?= e($product['affiliate_url']) ?>" target="_blank" rel="nofollow sponsored noopener">🛒 Comprar agora</a></div></article><?php endforeach; ?></section><?php endif; ?>
  <section class="disclosure"><strong>Transparência:</strong> este site participa de programas de afiliados e pode receber comissão por compras feitas pelos nossos links, sem custo adicional para você. Preços, cupons, estoque e entrega podem mudar e são definidos pelas lojas e vendedores.</section>
</main>
<?php require __DIR__ . '/includes/footer.php'; ?>
