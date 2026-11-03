-- Adiciona categoria própria aos produtos sem alterar os registros existentes.
-- Produtos antigos recebem "outros" até serem revisados no painel.
alter table public.produtos
add column if not exists categoria text not null default 'outros';

-- Categorias permitidas no Achadinhos do Brasil.
alter table public.produtos
drop constraint if exists produtos_categoria_check;

alter table public.produtos
add constraint produtos_categoria_check
check (categoria in (
  'pets',
  'eletronicos',
  'casa',
  'beleza',
  'moda',
  'ferramentas',
  'automotivos',
  'brinquedos',
  'esportes',
  'outros'
));
