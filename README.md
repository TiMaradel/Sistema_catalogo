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

Use o botão `Acessar sem login (Modo Teste)` para abrir o painel da loja **Ateliê Aurora**. O sistema prepara automaticamente quatro produtos de roupas, três categorias e imagens locais otimizadas para WebP. No painel, o link do catálogo fica disponível para abrir em uma nova aba.

O endereço do exemplo é `http://localhost:3000/loja-teste` depois que o modo de teste for iniciado.

## Armazenamento nesta fase

O projeto está funcionando sem Firebase. Os dados ficam no `localStorage`, que é o armazenamento local do navegador. Isso é útil para desenvolver e testar a interface, mas não é uma publicação real:

- a conta e os produtos só aparecem no mesmo navegador e endereço;
- outro computador não enxerga esses dados;
- pedidos só entram no histórico do navegador em que o pedido foi feito;
- apagar os dados do site apaga a base local;
- as imagens são convertidas para texto e também ficam no navegador.

## Link público

Cada loja recebe uma rota como `http://localhost:3000/loja-teste`. Ela funciona no mesmo navegador depois que a loja foi criada e os produtos foram cadastrados. O catálogo busca a loja pelo slug (a parte amigável do endereço) e exibe apenas produtos ativos.

Para compartilhar com clientes em produção, ainda será necessário um banco de dados/servidor e uma hospedagem configurada para devolver `index.html` em rotas como `/loja-teste`. Essa etapa será feita quando o Firebase ou outra API for ativado.

## Comandos de validação

```bash
npm run lint
npm run build
```
