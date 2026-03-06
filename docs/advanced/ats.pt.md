# Compatibilidade com ATS

## O que é um ATS?

Um **ATS** (Applicant Tracking System, sistema de rastreamento de candidatos) é um software utilizado por recrutadores e empresas para gerir candidaturas. Quando carrega o seu CV num portal de emprego ou site de empresa, um ATS analisa o documento para extrair dados estruturados — o seu nome, cargos, empresas, datas, competências e formação. Estes dados são depois utilizados para correspondência de palavras-chave, classificação e filtragem de candidatos.

Se o ATS não conseguir analisar o seu documento corretamente, a sua candidatura pode ser descartada ou informações importantes podem ser perdidas — mesmo que as suas qualificações sejam perfeitas.

## Otimização ATS integrada

O CV Manager gera automaticamente saída compatível com ATS no site público:

- **Marcação Schema.org** — dados estruturados que sistemas ATS conseguem interpretar (Person, OrganizationRole, EducationalOccupationalCredential, etc.)
- **HTML semântico** — hierarquia adequada de títulos, elementos article e listas
- **Bloco ATS oculto** — uma versão em texto puro do seu CV é incorporada na página para parsers que não processam HTML estilizado
- **Saída de impressão limpa** — sem poluição visual, hierarquia de conteúdo adequada

Nenhuma configuração especial é necessária — estas funcionalidades estão sempre ativas.

## Exportação de documento ATS

Para além da otimização web integrada, o CV Manager pode gerar um **PDF dedicado compatível com ATS**, concebido especificamente para carregamento em portais de emprego e sistemas ATS.

### Como utilizar

1. Clique em **Documento ATS** na barra de ferramentas de administração
2. Ajuste o controlo de **Escala** para controlar a densidade do conteúdo (50%–150%)
3. Escolha o **Tamanho do papel** preferido (A4 ou Letter)
4. Pré-visualize o documento na janela modal
5. Clique em **Baixar PDF** para guardar o ficheiro

### Diferença em relação a Imprimir / PDF

| Funcionalidade | Imprimir / PDF | Documento ATS |
|----------------|----------------|---------------|
| **Objetivo** | Apresentação visual | Análise automática |
| **Layout** | Design completo com cores, ícones, linha do tempo | Texto estruturado e limpo, formatação mínima |
| **Conteúdo** | Todas as secções visíveis incluindo linha do tempo | Todas as secções exceto linha do tempo (não relevante para ATS) |
| **Controlo de escala** | Diálogo de impressão do navegador | Controlo integrado com pré-visualização em tempo real |
| **Geração** | Motor de impressão do navegador | Lado do servidor (pdfmake) |
| **Consistência** | Varia conforme o navegador | Saída idêntica em todo o lado |

### Dicas para o sucesso com ATS

!!! tip "Use o documento ATS para candidaturas"
    Carregue sempre o documento ATS (não a versão Imprimir/PDF) ao candidatar-se através de portais de emprego. O layout estruturado foi concebido para ser analisado corretamente por sistemas automatizados.

!!! tip "Mantenha a secção de competências completa"
    Os sistemas ATS dependem fortemente da correspondência de palavras-chave. Certifique-se de que a secção de Competências contém todas as tecnologias, ferramentas e metodologias relevantes — a exportação ATS inclui-as como uma lista de palavras-chave para melhor correspondência.

!!! tip "Use Imprimir/PDF para leitores humanos"
    Quando enviar o seu CV diretamente por email a um gestor de contratação ou o levar a uma entrevista, use a versão Imprimir/PDF — tem o design visual completo com as cores do seu tema e a linha do tempo.

!!! tip "Escala para densidade"
    Se o seu CV for longo, tente reduzir a escala para 70–80% para encaixar mais conteúdo por página. A pré-visualização atualiza em tempo real para que possa encontrar o equilíbrio certo.
