# Regras globais do Lucas — cópia versionada

> Este arquivo existe para que as regras de trabalho que valem **em todos os
> projetos** viajem junto com o código, pelo git, e não fiquem presas num
> computador só.

## Para que serve

As regras globais moram em `C:\Users\<usuário>\.claude\CLAUDE.md`, que **não vai
para o GitHub** (é um arquivo pessoal, fora de qualquer projeto). Quando o Lucas
pede uma regra nova trabalhando num computador, ela entra lá — e o outro
computador nunca fica sabendo.

Este arquivo é a ponte: toda regra global pedida durante o trabalho é gravada no
`CLAUDE.md` global **e** acrescentada aqui, e então sobe no commit junto com o
resto. Quem baixar o projeto em outra máquina leva as regras junto.

## O que fazer ao abrir este projeto num computador novo

1. Ler este arquivo inteiro.
2. Abrir o `CLAUDE.md` global daquele computador (`C:\Users\<usuário>\.claude\CLAUDE.md`).
3. Comparar seção por seção: **acrescentar lá só o que ainda não constar**, no
   lugar indicado por cada regra abaixo.
4. **Não apagar e não reescrever** o que já estiver no global — só somar o que
   falta. Se uma regra daqui já existir lá com outras palavras, deixe como está
   e avise numa linha.
5. Dizer, em uma linha, o que foi acrescentado (ou que nada faltava).

## O que fazer quando o Lucas pedir uma regra nova

1. Gravar no `CLAUDE.md` global do computador em uso.
2. Acrescentar aqui embaixo, com a data e o lugar onde ela entra no global.
3. Entrar no commit do trabalho em andamento.

---

# As regras

## Seção 2.1 do global — RECONFERIR O PEDIDO CONTRA O .MD

- **Pedida em:** 16/10/2026
- **Entra no global:** logo depois da seção `## 2. ANÁLISE OBRIGATÓRIA ANTES DE ALTERAR`
- **Título da seção:** `## 2.1 RECONFERIR O PEDIDO CONTRA O .MD — SEMPRE, ANTES DE COMEÇAR`

**Antes de executar qualquer coisa, pare e pergunte: o que eu vou fazer é mesmo o
que precisa ser feito?** Não basta ter lido o documento uma vez, nem confiar no
resumo dele, nem no que ficou combinado antes na conversa. **Releia o `.md` que
manda naquele trabalho** e confira, ponto a ponto, se a tarefa que está na minha
mão é a mesma que o documento descreve.

Vale toda vez — inclusive quando foi o Lucas que acabou de pedir a tarefa, e
inclusive quando o `.md` foi escrito ontem.

O que conferir, nesta ordem:

1. **O alvo ainda é esse?** O item pedido continua sendo o próximo passo do plano,
   ou o plano já andou e aquilo foi feito, cancelado ou substituído?
2. **O escopo bate?** O que vai ser feito é o que o documento descreve — nem menos
   (deixando um pedaço pela metade), nem mais (ampliando por conta própria).
3. **Os nomes e os números batem com a realidade?** Arquivo, função, coluna,
   tabela, quantidade: confirme no projeto, não no texto do `.md`. Documento
   envelhece; código e banco são a prova.
4. **Já foi feito?** Procure antes no histórico — commits, seções marcadas com ✅,
   testes que já existem — em vez de refazer trabalho pronto.
5. **A ordem está certa?** Se o documento diz que uma coisa vem antes, ela vem
   antes, mesmo que o pedido tenha chegado fora de ordem.

**Se alguma coisa não bater, fale antes de executar**, em uma frase, dizendo o que
o documento manda e o que o pedido pede. Perder trinta segundos aqui é melhor do
que perder um dia refazendo.

Quando bater, diga em uma linha que reconferiu e onde (o documento e a seção).

> **Primeiro caso real, no mesmo dia:** o pedido era medir quatro campos do PASSO 2
> do `PLANO-MIGRACAO-PASSO-A-PASSO.md`. A reconferência mostrou que o documento
> estava desatualizado: um dos quatro itens já tinha sido consertado, a competência
> já estava protegida, e os campos realmente em risco eram outros. Sem reconferir,
> o trabalho teria começado no alvo errado.

## Seção 17 do global — reforço: MANDE O LOGIN DIRETO

- **Pedida em:** 19/10/2026
- **Entra no global:** no fim da seção `## 17. LOGIN FALTANDO OU VENCIDO: ABRA O LOGIN E ESPERE`,
  antes da frase "Esta regra complementa a 16"

**Reforço de 19/10/2026 — mande o login direto.** Viu um login vencido ou faltando?
Abra o login **na hora**, mesmo que a tarefa tenha conseguido seguir por outro
caminho. Nunca escreva "quando precisar, eu abro": o login vencido já é o motivo.

> **Caso que originou:** publicando a etapa 5.3, o login do Firebase estava vencido;
> a publicação foi acompanhada pelo `gcloud` e o login ficou só como aviso no fim.
> O Lucas respondeu: "sempre mande login direto".

## Seção 18 do global — ANTES DE TRABALHAR, CONFIRA O GIT

Definido por mim em 20/10/2026, para **todos os projetos**: antes de começar qualquer
trabalho num projeto com repositório git e remoto, e de novo **antes de commitar ou dar
push**, confira se o remoto tem commits que você ainda não tem.

1. Rode `git fetch` e veja o que chegou (`git log --oneline HEAD..origin/<ramo>`).
2. Se chegou algo, **traga antes de editar** (`git pull --rebase`) e diga em **uma linha**
   o que entrou: os commits e os arquivos.
3. Se o que chegou mexe nos mesmos arquivos que você vai alterar, diga isso **antes** de
   começar.

**Por quê:** o mesmo projeto é mexido por mais de uma conversa e por mais de um
computador. Em 20/10/2026 o push foi recusado porque outra conversa tinha subido um
commit; trabalhar sobre uma base velha é o caminho do conflito e do trabalho refeito.

**Os limites:**

* Nunca descarte alteração local para "limpar o caminho": nada de `git reset --hard`,
  `git checkout -- .` nem `push --force`.
* Alteração não commitada que **não é sua** (de outra conversa na mesma pasta) você não
  guarda nem descarta: diga que ela existe e que o `pull` espera por ela.
* Se o `git pull --rebase` der conflito, **pare e me mostre** os arquivos em conflito, em
  vez de resolver sozinho.
* Projeto sem git ou sem remoto: diga isso em uma linha e siga.

Esta regra complementa a 16 (consultar a fonte real: para o código, a fonte é o remoto) e
a 13 (terminar uma tarefa antes de pegar a próxima).

*(Entra no global como seção 18, depois da 17.)*

---

## Seção 19 do global — NO FIM DE CADA CONVERSA: A LISTA DO QUE FAZER

- **Pedida em:** 20/10/2026
- **Entra no global:** no fim, depois da seção `## 18. ANTES DE TRABALHAR, CONFIRA O GIT`
- **Título da seção:** `## 19. NO FIM DE CADA CONVERSA: A LISTA DO QUE FAZER`

Ao terminar cada trabalho, **sempre** feche com uma lista do que fazer a seguir — feita
**relendo os detalhes** (o documento central do projeto, as pendências, o que ficou só no
computador) e **olhando os erros** (o que falhou, o que não foi provado, o que ficou de
fora), e não de memória. A lista separa: (1) o que está pendente deste trabalho; (2) erros
e riscos conhecidos; (3) os próximos passos do plano, na ordem; (4) decisões que só o
usuário toma. Diga qual recomenda primeiro. É lista, não autorização.

> **Caso que originou:** fim da parte 4b do processamento no banco, no projeto Rappi. O
> Lucas pediu: "Sempre liste o que fazer a cada fim de conversa, lendo os detalhes e vendo
> os erros".

## Seção 20 do global — PUBLICAR NO FIREBASE APP HOSTING: CONFIRA A IMAGEM BASE

- **Pedida em:** 22/10/2026
- **Entra no global:** no fim, depois da seção `## 19. NO FIM DE CADA CONVERSA: A LISTA DO QUE FAZER`
- **Título da seção:** `## 20. PUBLICAR NO FIREBASE APP HOSTING: CONFIRA A IMAGEM BASE`

A "imagem base" é o sistema operacional e o Node.js que o Google põe por baixo do nosso
sistema. Com a **atualização automática da imagem base** (ABIU) ligada, o Google troca essa
peça sozinho — e uma peça nova com defeito derruba o site inteiro.

**Antes de publicar** (push que dispara o App Hosting):

1. Veja se a ABIU está ligada: `firebase apphosting:backends:list --project <projeto>`
   (coluna **ABIU**).
2. Se estiver, veja se o Google publicou imagem base nova nos últimos dias:
   `gcloud artifacts docker images list us-central1-docker.pkg.dev/serverless-runtimes/google-24/runtimes/nodejs24 --include-tags --sort-by=~UPDATE_TIME --limit 5`
   (troque `nodejs24` pelo runtime do projeto). Imagem nova marcada `public-image-next`
   = risco: avise em **uma linha** antes de publicar.

**Depois de publicar**, só diga que deu certo quando o registro da revisão nova mostrar
**"Starting new instance"** e o sistema disser que ligou (no Next.js, "Ready"), **e** o
endereço público responder com a **versão nova**.

**Se a publicação falhar com "failed to start" e sem nenhuma linha do sistema**, investigue
nesta ordem, **antes de mexer no código**: (1) a revisão antiga também caiu? (chame a
revisão anterior direto, com `gcloud auth print-identity-token`) — se caiu, o problema não
é o código; (2) a imagem base mudou e a ABIU está ligada?; (3) só então suspeite do código.

Nunca desfaça código por palpite. Desligar a ABIU (`automaticBaseImageUpdatesDisabled: true`
no backend) é mudança de configuração da produção: **só com o pedido do usuário**. Com ela
desligada, as correções do Node não chegam mais sozinhas — anote como pendência religá-la.

> **Caso que originou:** 22/10/2026, Fluxos (Movtek). A imagem base Node 24.22.1 saiu às
> 17:38; com a ABIU ligada, nenhuma máquina nova ligou a partir das 18:22, e o site ficou
> uma hora em erro 500. A culpa caiu primeiro, por engano, na atualização do Next.js, que
> foi desfeita à toa. Desligar a ABIU e montar de novo resolveu.

---

## Seção 21 do global — TODA TABELA NA TELA ROLA POR DENTRO

Pedido em 23/10/2026, para **todos os projetos**: **sempre**, qualquer tabela ou planilha
mostrada numa tela do sistema (lista, painel, aba, janela, gaveta) mora numa caixa de
**altura limitada que rola por dentro** (`overflow: auto`), com o **cabeçalho das colunas
preso no alto** (`position: sticky; top: 0`, com fundo opaco) e o rodapé (contagem, totais,
"ver mais") sempre à vista.

* A página **nunca cresce** para acompanhar as linhas, e a tabela nunca empurra o resto da
  tela para baixo.
* Dentro de um bloco de lista que já ocupa a altura disponível, a área da tabela leva
  `flex: 1 1 auto; min-height: 0; overflow: auto`; fora dele (painel, cartão, janela), a
  caixa da tabela leva uma altura máxima (`max-height` em `vh` ou px) e `overflow: auto`.
* "Ver mais" pode continuar existindo, mas **dentro** da caixa que rola.
* Armadilhas já vistas: item de grade com `overflow` encolhe até sumir quando a linha da
  grade é `auto` (use `minmax(0, 1fr)` ou `grid-auto-rows: max-content`); numa janela
  (`<dialog>`), a rolagem vai no miolo, e não na janela inteira.

*(Entra no global como seção 21, no fim.)*
