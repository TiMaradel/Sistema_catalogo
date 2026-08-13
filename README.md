# Catálogo Digital

Aplicação React/Vite para criar um catálogo de produtos e receber pedidos pelo WhatsApp.

## Executar no desenvolvimento

No PowerShell, dentro desta pasta:

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. O botão de teste cria uma conta e uma loja de exemplo.

### Catálogo demonstrativo de moda

Use o botão `Ver catálogo de teste` para abrir diretamente a vitrine da loja **Ateliê Aurora** ou `Abrir painel de teste` para entrar no painel administrativo. O sistema prepara automaticamente quatro produtos de roupas, três categorias e imagens locais otimizadas para WebP. No painel, o link do catálogo fica disponível para abrir em uma nova aba.

O endereço do exemplo é `http://localhost:3000/loja-teste` depois que o modo de teste for iniciado.

## Armazenamento nesta fase

O projeto está funcionando sem Firebase. Os dados ficam no `localStorage`, que é o armazenamento local do navegador. Isso é útil para desenvolver e testar a interface, mas não é uma publicação real:

- a conta e os produtos só aparecem no mesmo navegador e endereço;
- outro computador não enxerga esses dados;
- pedidos só entram no histórico do navegador em que o pedido foi feito;
- apagar os dados do site apaga a base local;
- as imagens são convertidas para texto e também ficam no navegador.

## Publicação no GitHub Pages

O projeto possui um workflow em `.github/workflows/deploy-pages.yml`. Depois que ele for enviado para a branch `main`, o GitHub pode publicar a aplicação em:

`https://timaradel.github.io/Sistema_catalogo/`

No repositório, abra **Settings → Pages** e selecione **GitHub Actions** como fonte de publicação. A cada novo envio para `main`, o GitHub fará a build e atualizará o site automaticamente.

O catálogo demonstrativo também pode ser acessado diretamente em:

`https://timaradel.github.io/Sistema_catalogo/loja-teste`

O endereço utiliza uma rota compatível com o GitHub Pages e as imagens usam o caminho correto do repositório.

Esta publicação é adequada para demonstrar a interface. Como os dados ainda ficam no `localStorage`, cada computador terá sua própria conta, produtos e pedidos. Para compartilhar os mesmos dados entre pessoas, será necessário conectar um backend ou banco de dados posteriormente.

### Recursos comerciais disponíveis

- Informações de atendimento, entrega e retirada exibidas na vitrine.
- Dashboard com faturamento estimado, ticket médio, pedidos em andamento e produto em destaque.
- Pedidos organizados por etapas: novo, confirmado, em preparação, pronto, entregue e cancelado.
- Filtro de pedidos por status e atualização operacional diretamente no painel.

## Comandos de validação

```bash
npm run lint
npm run build
```
