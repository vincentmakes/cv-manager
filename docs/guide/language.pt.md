# Idioma

## Idioma da interface de administração

Clique no **ícone de globo** na barra de ferramentas para alterar o idioma da interface de administração. Uma grelha mostra todos os idiomas disponíveis — clique num para aplicá-lo imediatamente.

**Idiomas suportados:** Inglês, Alemão (Deutsch), Francês (Français), Holandês (Nederlands), Espanhol (Español), Italiano (Italiano), Português (Português), Chinês (中文).

A configuração de idioma afeta apenas as etiquetas, botões e menus da interface de administração. A sua preferência é guardada e persiste entre sessões.

## Idioma do conteúdo do CV

Separadamente do idioma da interface, cada conjunto de dados guardado tem o seu próprio **idioma de conteúdo** — este é o idioma em que o conteúdo do CV está escrito. O idioma do conteúdo é mostrado como um badge (EN, DE, FR, etc.) em cada linha de conjunto de dados no Gestor de CV.

Quando carrega um conjunto de dados, a interface de administração muda automaticamente para corresponder ao idioma do seu conteúdo. Isto significa que, se carregar um CV em alemão, a interface muda para alemão também, de modo que os títulos das secções e as etiquetas dos formulários estejam no mesmo idioma do conteúdo que está a editar.

### Alterar o idioma de um conjunto de dados

Para alterar o idioma atribuído a um conjunto de dados existente:

1. Abra o **Gestor de CV**
2. Clique no **badge de idioma** (por exemplo, EN) na linha do conjunto de dados
3. Selecione o novo idioma a partir do seletor

Isto reatribui o código de idioma sem alterar o conteúdo em si — útil para conjuntos de dados que ficaram com inglês como predefinido durante a configuração inicial.

## Variantes linguísticas

Pode criar **múltiplas variantes linguísticas** do mesmo CV. Por exemplo, manter uma versão em inglês e uma em alemão que partilham a mesma estrutura mas têm conteúdo independente.

Consulte [Conjuntos de dados e variantes linguísticas](datasets.md#variantes-linguisticas) para detalhes sobre a criação e gestão de variantes linguísticas.

## Alternância de idioma no site público

Quando o conjunto de dados predefinido tem irmãos linguísticos, os visitantes podem alternar idiomas no site público:

- O **idioma predefinido** é servido em `/`
- Outros idiomas estão disponíveis em `/{lang}` (por exemplo, `/de`, `/fr`)
- Um botão de alternância de idioma aparece no site público para os visitantes alternarem entre os idiomas disponíveis

Para conjuntos de dados partilhados não predefinidos, as variantes linguísticas são servidas em `/v/slug/{lang}`.
