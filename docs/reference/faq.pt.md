# FAQ

## Geral

??? question "Meus dados são armazenados em algum servidor externo?"
    Não. Tudo roda localmente no seu servidor. Os dados do seu CV são armazenados em um arquivo de banco de dados SQLite no diretório `/data`.

??? question "Posso rodar o CV Manager sem Docker?"
    Sim. Instale o Node.js 18+, execute `npm install` no diretório do projeto e depois `node src/server.js`. O admin roda na porta 3000 e o site público na porta 3001.

??? question "Várias pessoas podem usar a mesma instância?"
    O CV Manager é projetado como uma aplicação para um único usuário. Cada instância gerencia o CV de uma pessoa. Para várias pessoas, execute containers separados.

## Edição

??? question "Como marco uma posição como 'atual'?"
    Deixe o campo **Data de Término** vazio. Ele será exibido como "Presente" no CV.

??? question "Posso reordenar itens dentro de uma seção?"
    Sim. A maioria dos itens suporta reordenação por arrastar e soltar. A ordem é salva automaticamente.

??? question "Como adiciono marcadores a uma experiência?"
    Edite a experiência e insira os destaques no campo **Destaques** — um marcador por linha.

??? question "Como adiciono um logotipo da empresa?"
    Edite a experiência, role até a seção **Logotipo da Empresa** e clique em **Escolher imagem** para fazer upload. Você também pode clicar em **Usar existente** para reutilizar um logotipo já enviado. Ative o toggle **"Sincronizar logotipo em todas as experiências da [Empresa]"** para aplicar o mesmo logotipo a todas as experiências naquela empresa.

??? question "Excluí algo acidentalmente. Posso desfazer?"
    Não há recurso de desfazer. Como as edições são salvas automaticamente no conjunto de dados ativo, a alteração é persistida imediatamente. Se você tem uma exportação anterior ou um conjunto de dados salvo separado, pode restaurar a partir deles. É uma boa prática exportar seu CV regularmente como backup.

## Seções Personalizadas

??? question "Quantas seções personalizadas posso criar?"
    Não há limite rígido. Crie quantas precisar.

??? question "Posso alterar o tipo de layout de uma seção personalizada após criá-la?"
    Sim. Edite a seção e selecione um layout diferente. Note que alguns campos podem não ser transferidos entre tipos de layout (ex.: mudar de cartões para links sociais).

??? question "Qual a diferença entre os layouts 'Marcadores' e 'Texto Livre'?"
    **Marcadores** renderiza cada linha como um item de lista com marcador e um título de grupo. **Texto Livre** renderiza texto simples com quebras de linha preservadas e sem título — semelhante à seção Sobre/Bio.

## Impressão e PDF

??? question "Por que meu PDF parece diferente da tela?"
    A saída de impressão usa estilos de impressão dedicados, otimizados para papel. Alguns efeitos visuais (estados de hover, animações, gradientes) são simplificados. Itens ocultos e controles de admin são removidos automaticamente.

??? question "Como faço para encaixar meu CV em menos páginas?"
    Tente ativar **Permitir Divisão de Seções** e **Permitir Divisão de Itens** nas configurações de Impressão e Exportação. Você também pode ocultar itens ou seções menos importantes, ou usar layouts de seções personalizadas mais compactos. Também ajuste a escala de impressão pela caixa de diálogo de impressão de qualquer navegador (às vezes fica um pouco escondida).

??? question "Por que alguns itens estão faltando no meu CV impresso?"
    Verifique se esses itens foram alternados para oculto (ícone de olho). Itens ocultos são excluídos da saída de impressão e da visualização pública.

??? question "Os números de página não estão aparecendo?"
    Certifique-se de que **Números de Página** está ativado em Configurações → Impressão e Exportação. Alguns visualizadores de PDF do navegador podem não exibir números de página gerados por CSS — tente baixar o PDF e abri-lo em um leitor dedicado.

## Linha do Tempo

??? question "A linha do tempo mostra as datas erradas / apenas anos / datas completas?"
    A linha do tempo tem sua própria configuração de data. Vá em **Configurações → Avançado → Linha do Tempo: Apenas Anos** para alternar entre exibição apenas de anos e o formato completo de data.

??? question "Posso adicionar entradas diretamente na linha do tempo?"
    Não. A linha do tempo é gerada automaticamente a partir das suas experiências profissionais. Adicione ou edite experiências e a linha do tempo é atualizada automaticamente.

??? question "A bandeira do país não está aparecendo na linha do tempo?"
    Certifique-se de que o campo **Código do País** na experiência está definido com um código de país ISO de 2 letras válido (ex.: `us`, `gb`, `ch`, `de`, `fr`). As bandeiras são carregadas de um CDN externo.

??? question "O que acontece quando tenho dois empregos ao mesmo tempo?"
    A linha do tempo detecta automaticamente posições sobrepostas e as renderiza como **trilhas paralelas**. O emprego concorrente aparece em uma linha de ramificação elevada com conectores em curva S mostrando os pontos de bifurcação e junção. Nenhuma configuração necessária — é baseado inteiramente nas suas datas de início/fim. Sobreposições menores que 1 mês são ignoradas (comum durante transições de emprego).

??? question "Por que a linha do tempo mostra um logotipo em vez do nome da empresa?"
    Se você enviou um logotipo da empresa para essa experiência, a linha do tempo exibe a imagem do logotipo em vez do texto. Se o arquivo do logotipo estiver ausente, ele volta a exibir o nome da empresa. Para remover um logotipo da linha do tempo, edite a experiência e clique em **Remover** na seção Logotipo da Empresa.

## Idioma e Atualizações

??? question "Como mudo o idioma do admin?"
    Clique no **ícone de globo** na barra de ferramentas e selecione um idioma na grade suspensa. A alteração é aplicada imediatamente e salva entre sessões.

??? question "Como verifico qual versão estou usando?"
    Abra **Configurações** — o número da versão é mostrado no canto inferior esquerdo do modal (ex.: `v1.11.0`).

??? question "Não vejo o banner de atualização mesmo havendo uma nova versão disponível?"
    A verificação de versão é armazenada em cache por 24 horas. Reinicie seu servidor (ou container Docker) para limpar o cache e forçar uma nova verificação. Seu servidor também precisa de acesso de saída à internet para alcançar `raw.githubusercontent.com`.

## Conjuntos de Dados / Múltiplos CVs

??? question "O que é o conjunto de dados 'Default'?"
    O conjunto de dados padrão é a versão do seu CV que os visitantes veem na sua URL raiz (`/`). Na primeira instalação, o CV Manager cria automaticamente um conjunto de dados "Default" a partir dos dados do seu CV. Você pode alterar qual conjunto de dados é o padrão a qualquer momento usando o botão de rádio no modal Abrir.

??? question "Minhas edições são salvas automaticamente?"
    Sim. Toda alteração que você faz no admin (adicionar, editar, excluir, reordenar, alternar visibilidade) é automaticamente salva no conjunto de dados ativo após um curto intervalo. O banner mostra "Salvando…" e depois "Salvo" para confirmar.

??? question "O que acontece quando eu 'Carrego' um conjunto de dados?"
    Carregar um conjunto de dados alterna sua cópia de trabalho para esse conjunto de dados. Suas edições anteriores já foram salvas automaticamente, então nada é perdido.

??? question "Os visitantes podem ver minhas edições em tempo real?"
    Não. O site público serve o conjunto de dados padrão congelado, não suas edições ao vivo. Os visitantes só veem as alterações depois que o salvamento automático as grava no conjunto de dados padrão. Se você estiver editando um conjunto de dados que não é o padrão, os visitantes não verão essas alterações até que você o defina como padrão.

??? question "Os visitantes podem ver meus conjuntos de dados salvos?"
    Somente se você torná-los públicos. Cada conjunto de dados tem um toggle no modal Abrir. Quando definido como público, essa versão se torna acessível em `/v/slug` no site público (porta 3001). Conjuntos de dados privados são visualizáveis apenas pela interface de admin.

??? question "Como compartilho uma versão específica do CV com alguém?"
    Abra o modal **Abrir...**, ative o toggle do conjunto de dados para público e clique no ícone de cópia ao lado da URL do slug. Compartilhe esse link — ele funciona no site público sem expor sua interface de admin.

??? question "Posso ter várias versões públicas ao mesmo tempo?"
    Sim. Você pode tornar quantos conjuntos de dados quiser públicos. Cada um recebe sua própria URL (ex.: `/v/technical-cv-1`, `/v/marketing-cv-2`). A página principal `/` mostra o conjunto de dados padrão.

??? question "Posso excluir o conjunto de dados padrão?"
    Não. O conjunto de dados atualmente selecionado como padrão (via botão de rádio) não pode ser excluído. Defina um conjunto de dados diferente como padrão primeiro e depois exclua o antigo.

??? question "Os mecanismos de busca vão indexar minhas URLs versionadas?"
    Por padrão, não — páginas versionadas recebem `noindex, nofollow`. Para permitir a indexação, ative **Indexar URLs Versionadas** em Configurações → Avançado.

## Site Público e SEO

??? question "Como compartilho meu CV?"
    Compartilhe a URL do seu servidor público (porta 3001). Se você configurou um domínio com Cloudflare Tunnel ou proxy reverso, compartilhe esse domínio. A URL raiz sempre mostra seu conjunto de dados padrão. Você também pode compartilhar versões específicas usando URLs públicas versionadas (veja [Conjuntos de Dados](../guide/datasets.pt.md)).

??? question "Os mecanismos de busca vão indexar meu CV?"
    Por padrão, sim — a página pública principal inclui meta tags adequadas, um sitemap e robots.txt. Para impedir a indexação, altere a configuração **Indexação por Mecanismos de Busca** para "No Index" em Configurações → Avançado. URLs públicas versionadas (`/v/slug`) **não são indexadas** por padrão; ative **Indexar URLs Versionadas** se quiser que elas sejam rastreadas.

??? question "Posso adicionar o Google Analytics ao meu CV?"
    Sim. Cole seu código de rastreamento em **Configurações → Avançado → Código de Rastreamento**. Ele é injetado apenas nas páginas públicas.

## Docker e Infraestrutura

??? question "Minhas alterações não estão aparecendo no site público?"
    O site público serve o **conjunto de dados padrão**, que é atualizado automaticamente quando você edita no admin. Tente um hard refresh (`Ctrl+Shift+R`) no site público. Se estiver rodando containers separados, certifique-se de que eles compartilham o mesmo volume de dados.

??? question "Estou recebendo um erro de 'port already in use'?"
    Altere o mapeamento de porta do host na sua configuração Docker. Por exemplo, mapeie para `3010:3000` e `3011:3001`. **Não** altere a variável de ambiente `PUBLIC_PORT` — essa é a porta interna do container.

??? question "Como faço backup dos meus dados?"
    Duas opções: use o botão **Exportar** na barra de ferramentas do admin (exporta JSON) ou faça backup do diretório `data/` que contém o banco de dados SQLite e as imagens enviadas.

??? question "A foto de perfil não está aparecendo?"
    Certifique-se de que a imagem foi enviada pela interface de admin. O arquivo é armazenado em `data/uploads/picture.jpeg`. Verifique as permissões do arquivo se estiver rodando no Linux.
