# Editando Conteúdo

## Perfil / Cabeçalho

Clique no **ícone de edição** na seção do cabeçalho. Você pode definir:

- **Nome** e **Iniciais** (exibidas no círculo do avatar se nenhuma foto for carregada)
- **Título** (seu cargo/posição principal)
- **Subtítulo** (contexto adicional, ex.: departamento ou especialização)
- **Bio** (resumo profissional — quebras de linha são preservadas)
- **Localização**
- **Email**, **Telefone**, **LinkedIn** (exibidos como badges de contato)
- **Idiomas** (idiomas falados, ex.: "Inglês, Francês, Alemão" — exibido como um badge com ícone de globo)

## Texto em negrito

Em qualquer campo de texto longo — **Bio**, **Resumo** e **Destaques** da experiência, **Descrição** da formação, **Descrição** de projetos e descrições de seções personalizadas — você pode destacar palavras envolvendo-as com dois asteriscos.

- Digite `**tempo real**` → renderizado como **tempo real**
- Funciona na mesma linha; um `**` sem `**` de fechamento permanece como texto literal
- Renderizado na pré-visualização do admin, no site público e na exportação PDF ATS (como negrito real, não como asteriscos)
- A exportação **ATS em texto simples** e as meta-descrições de SEO removem os asteriscos para que nunca apareçam em trechos de busca ou analisadores ATS

!!! tip
    Use o negrito com moderação — uma ou duas frases destacadas por item chamam a atenção para o essencial. Negritar demais dilui o sinal.

## Foto de Perfil

No diálogo de edição do perfil, você pode enviar uma foto de perfil (JPEG, PNG ou WebP). A imagem substitui o círculo de iniciais. Para removê-la, use a opção de exclusão no mesmo diálogo.

## Badge "Open to Work"

Exiba um badge verde "Open to Work" no seu CV público para sinalizar sua disponibilidade aos recrutadores:

1. Clique no **ícone de edição** no cabeçalho para abrir o editor de perfil
2. Encontre o botão **Open to Work**
3. Ative-o e salve

O badge aparece como uma sobreposição circular na sua foto de perfil (ou ao lado do seu avatar se não houver foto). É visível no site público mas **oculto na exportação de impressão/PDF**.

## Experiência Profissional

Cada entrada de experiência inclui:

- **Cargo** e **Nome da Empresa**
- **Data de Início** e **Data de Término** (deixe a data de término vazia para posições atuais — exibe "Presente")
- **Localização** e **Código do País** (código de 2 letras como `us`, `ch`, `fr` — usado para ícones de bandeira na linha do tempo)
- **Destaques** — marcadores descrevendo suas conquistas (um por linha)

## Logotipos de Empresas

Cada entrada de experiência pode ter um **logotipo da empresa**. Logotipos aparecem na linha do tempo como imagens em vez de nomes de empresas em texto.

### Enviando um Logotipo

1. Edite uma entrada de experiência
2. Na seção **Logotipo da Empresa**, clique em **Escolher imagem** para enviar um arquivo (JPEG, PNG ou WebP, máx. 5MB)
3. Uma imagem quadrada pequena funciona melhor

### Reutilizando Logotipos

Clique em **Usar existente** para abrir a grade de seleção de logotipos, que mostra todos os logotipos enviados anteriormente. Clique em um para reutilizá-lo — isso evita enviar o mesmo logotipo várias vezes.

### Preenchimento Automático

Quando você digita o nome de uma empresa que já possui um logotipo (de uma experiência atual ou salva), o logotipo é preenchido automaticamente. Isso funciona entre conjuntos de dados.

### Propagação Global

Quando um logotipo é definido, um botão de alternância aparece: **"Sincronizar logotipo em todas as experiências da [Empresa]"**. Quando ativado:

- O logotipo é aplicado a **todas** as experiências com o mesmo nome de empresa — incluindo aquelas em conjuntos de dados salvos
- Experiências futuras para a mesma empresa herdarão automaticamente o logotipo
- Desativar **não** remove logotipos já aplicados — apenas interrompe a propagação automática futura

### Removendo um Logotipo

Clique no botão **Remover** na seção de logotipo para desvincular um logotipo de uma experiência. O arquivo é mantido no disco para reutilização. Para excluir permanentemente um arquivo de logotipo não utilizado, abra o seletor de logotipos e clique no botão de exclusão em qualquer logotipo que não esteja em uso.

## Certificações

Cada certificação possui um **nome**, **emissor**, **data de emissão** e, opcionalmente, **data de expiração** e **ID da credencial**.

## Educação

Cada entrada possui um **diploma/título**, **instituição**, **datas de início/término** e uma **descrição** opcional.

## Logotipos de Instituições

Entradas de educação podem ter um **logotipo da instituição**, assim como logotipos de empresas nas experiências profissionais.

### Enviando um Logotipo

1. Edite uma entrada de educação
2. Na seção **Logotipo da Instituição**, clique em **Escolher imagem** para enviar um arquivo (JPEG, PNG ou WebP, máx. 5MB)
3. Uma imagem quadrada pequena funciona melhor

### Reutilizando Logotipos

Clique em **Usar existente** para abrir a grade de seleção de logotipos, que mostra todos os logotipos enviados anteriormente (incluindo logotipos de empresas). Clique em um para reutilizá-lo.

### Propagação Global

Quando um logotipo é definido, um botão de alternância aparece: **"Sincronizar logotipo em todas as entradas de educação da [Instituição]"**. Quando ativado, o logotipo é aplicado a todas as entradas de educação com o mesmo nome de instituição — incluindo aquelas em conjuntos de dados salvos.

### Removendo um Logotipo

Clique no botão **Remover** na seção de logotipo para desvincular um logotipo de uma entrada de educação.

## Habilidades

As habilidades são organizadas em **categorias** (ex.: "Linguagens de Programação", "Ferramentas e Plataformas"). Cada categoria contém tags de habilidades individuais. As categorias podem ter um **ícone** selecionado de uma lista predefinida: code, server, database, cloud, settings, users, briefcase, cpu, layers ou default. Se nenhum ícone for escolhido, o sistema detecta automaticamente um com base no nome da categoria (ex.: uma categoria chamada "Programming" recebe automaticamente o ícone de code).

## Projetos

Cada projeto possui um **título**, **descrição**, **tecnologias** (exibidas como tags) e um **link externo** opcional.

## Visibilidade de Itens

Cada item individual (experiência, certificação, entrada de educação, etc.) possui um **botão de visibilidade**. Itens ocultos são excluídos da impressão/PDF e da visualização pública, mas permanecem no admin para uso futuro.

## Reordenação por Arrastar e Soltar

Na maioria das seções, os itens podem ser reordenados arrastando-os. A ordem é salva automaticamente.
