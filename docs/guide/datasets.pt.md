# Conjuntos de Dados (Múltiplas Versões de CV)

## Como os Conjuntos de Dados Funcionam

Conjuntos de dados são snapshots salvos do seu CV. Um conjunto de dados é sempre o **padrão** — esta é a versão que os visitantes veem na sua URL raiz (`/`). Você pode criar conjuntos de dados adicionais para diferentes públicos (ex.: um CV técnico, um CV de gestão) e compartilhá-los em suas próprias URLs.

Quando você instala o CV Manager pela primeira vez, um conjunto de dados "Default" é criado automaticamente a partir dos dados do seu CV. Todas as edições que você faz no admin são **salvas automaticamente** no conjunto de dados ativo — não há uma etapa separada de "salvar".

## O Banner do Conjunto de Dados Ativo

Um banner abaixo da barra de ferramentas mostra qual conjunto de dados você está editando no momento. Ele exibe:

- O **nome do conjunto de dados** (ex.: "Default", "CV Técnico")
- Um **selo "Default"** se este conjunto de dados é o que está sendo servido em `/`
- Um **status de salvamento automático** — exibe brevemente "Salvando…" e depois "Salvo" após cada edição

Toda alteração que você faz (adicionar itens, editar conteúdo, reordenar, alternar visibilidade) é automaticamente salva no conjunto de dados ativo após um curto intervalo.

## Salvando um Novo Conjunto de Dados

Clique em **Salvar Como...** na barra de ferramentas, digite um nome (ex.: "CV Técnico", "Vaga de Marketing") e o estado atual do seu CV é salvo como um novo snapshot. O novo conjunto de dados se torna o ativo.

## O Modal Abrir

Clique em **Abrir...** para ver todos os conjuntos de dados salvos. Uma **legenda** no topo explica os três controles:

| Controle | Finalidade |
|----------|------------|
| **Botão de rádio** | Seleciona qual conjunto de dados é servido na sua URL raiz `/` (o padrão) |
| **Toggle** | Compartilha outros conjuntos de dados em sua própria URL `/v/slug` |
| **Botão de olho** | Visualiza um conjunto de dados salvo sem torná-lo público |

Cada linha de conjunto de dados mostra:

- **Nome** e data da última atualização
- **Selo "Default"** — no conjunto de dados selecionado com o botão de rádio
- **Selo "Editando"** — no conjunto de dados atualmente carregado no admin
- Uma **URL versionada** (ex.: `/v/technical-cv-1`) — oculta para o conjunto de dados padrão, pois ele é servido em `/`
- Botão **Carregar** — alterna para este conjunto de dados (mostra "Recarregar" se já estiver ativo)
- Botão **Excluir** — remove permanentemente o conjunto de dados (desabilitado para o padrão atual)

## Definindo o Conjunto de Dados Padrão

O conjunto de dados padrão é a versão que os visitantes veem quando acessam sua URL raiz (`/`). Para alterá-lo:

1. Abra o modal **Abrir...**
2. Clique no **botão de rádio** ao lado do conjunto de dados que você deseja como seu CV público
3. A alteração entra em vigor imediatamente — o site público agora serve esse conjunto de dados

Isso desacopla seu CV público da sua edição. Você pode editar conteúdo livremente no admin sem que os visitantes vejam alterações em andamento até que você esteja pronto.

## URLs Públicas Versionadas

Cada conjunto de dados salvo (exceto o padrão) recebe um caminho de URL único (ex.: `/v/technical-cv-1`). Por padrão, eles são **privados** — acessíveis apenas pela interface de admin para visualização.

Para compartilhar uma versão específica publicamente:

1. Abra o modal **Abrir...**
2. Encontre o conjunto de dados que você deseja compartilhar
3. Ative o **switch** ao lado dele — ele fica azul e um selo verde **Público** aparece
4. A URL `/v/slug` agora está acessível no **site público** (porta 3001)

Isso permite que você compartilhe versões personalizadas do CV com diferentes públicos. Por exemplo, você pode tornar um "CV Técnico" público para vagas de engenharia enquanto mantém um "CV de Gestão" privado até ser necessário.

**Copiando a URL**: Clique no ícone de cópia ao lado do slug para copiar a URL completa para sua área de transferência. A mensagem de toast informará se você copiou uma URL pública ou apenas de visualização.

!!! note
    A página pública principal em `/` sempre mostra o **conjunto de dados padrão** — não suas edições ao vivo. Isso significa que você pode experimentar com segurança no admin sem afetar o que os visitantes veem.
