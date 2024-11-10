<!-- Etapas do processo -->

1. Preparação
   - Baixar csv e pdf do banco cora no email para a pasta /cora dentro de note-to-text/notas/_ano_/_MES_/cora
   - Exportar o extrato em pdf do app da Caixa Econômica para o Google Drive na pasta Extratos, com o formato 08 CAIXA: AGOSTO.pdf e para adicionar na pasta note-to-text/notas/_ano_/_MES_
   - Executar o Tesouraria CMD e parsear os dados do csv cora com a opção 10 do menu e parse da caixa com a opção 13 (necessário o Node 14.18.1)
   - Inserir dados do caixa Carteira manualmente no arquivo de import em note-to-text/notas/_ano_/_MES_/imports
2. Preenchimento
   - Preparar CSVs de import dos caixas usando o Edit csv no vscode
   - Receitas: Ajustar nomes, juntar casais e ajustar categorias e subcategorias
   - Despesas: Remover as despesas fixas e registrar no app descrição, observações, categorias e tags
   - Usar a IA para adicionar as categorias nas despesas com o prompt em anexo
   - Fazer Trim na tabela toda ao concluir o processo
3. Importação
   - Subir os arquivos csv de /imports para o drive na pasta Tesouraria/Arquivos/_ano_/imports/_MES_
   - Importar dados no app my finances usando a opção Side Menu > Ferramentas > Importar CSV
   - Conferir se o valor do caixa bateu (adicionar juros e corrigir transações entre contas)
   - Exportar as receitas e despesas do app como csv usando a opção Relatórios e salvar no drive na pasta /Tesouraria/Arquivos/_ano_/Relatórios/<00 MES>
4. Publicação
   - Baixar os arquivos receitas e despesas .csv e colocar na pasta /note-to-text/notas/_ano_/_MES_/
   - Converter os arquivos receitas e despesas .csv para JSON usando a opção (8 CSV to JSON) no Tesouraria CMD e adicionar o \_2024
   - Importar o arquivo JSON do mês para o database do relatorio usando o script `npm run append dd_MMM_yyyy` no `/finance-report`
   - Testar o relatorio localmente `npm start`, publicar no github pages usando `npm run deploy`.
5. Backup
   - Printar usando a extensão do chrome GoFullPage com zoom da página em 150%
   - baixar o PDF e adicionar na pasta D:/Pessoal/Projects/Tesouraria/archive
   - enviar no whatsapp no grupo IBR | Relatório Financeiro

## Prompt para categorias

Prompt para adicionar categorias nas despesas

Estou trabalhando em um relatório financeiro e preciso categorizar uma lista de itens em categoria e subcategoria com base nas informações de um JSON.

Considere o objeto JSON abaixo como um guia para as categorias e subcategorias. Cada chave no objeto abaixo é uma categoria e os itens no array são as subcategorias. Obs: Ignore os caracteres de interrogação na sua análise, eles servem apenas para controle e não fazem parte da descrição'em si.

{
'Ajuda Social': ['Alimentação', 'Outros', 'Saúde', 'Transporte'],
Alimentação: ['Adultos', 'Comunhão', 'Crianças', 'Eventos', 'Jovens', 'Outros', 'Trabalhadores'],
Eventos: ['Batismo', 'Dia das Mães', 'Dia do Pastor', 'Dia dos Pais', 'Outros'],
Manutenção: ['Descartáveis', 'Limpeza', 'Outros', 'Papelaria', 'Utilidades'],
Missões: ['Igreja', 'Outros', 'Pessoal', 'Projeto', 'Sustento'],
Obras: ['Construção', 'Ferramentas', 'Material', 'Outros', 'Reforma', 'Reparos', 'Serviço', 'Outros'],
Outros: ['Outros'],
Pagamentos: ['Aluguel', 'Impostos', 'Outros', 'Salário', 'Taxas'],
Serviços: ['Contabilidade', 'Energia', 'Gás', 'Impressão', 'Outros', 'Água', 'Água Mineral'],
Transporte: ['Combustível', 'Manutenção', 'Outros', 'Taxi', 'Passagem'],
}

Classifique as entradas no texto abaixo analisando as colunas Descrição e Observações e me devolva com as colunas Categoria e Subcategoria de cada entrada devidamente preenchidas. Me forneça apenas a saída, em formato csv, sem a necessidade de explicações adicionais.

Descrição,Valor,Vencimento,Categoria,Subcategoria,Conta,Cartão,Observações
Combustível para missões na comunidade Esperança,40,31/07/2024,Outros,Outros,Cora,,"** @import ?? #reembolso @EdsonCarlos ** "
Bolo para crianças em Ibaretama,28,31/07/2024,Outros,Outros,Cora,,"** @import ?? #reembolso @GleisianeMuniz ** "
Combustível para missões em Ibaretama,35,31/07/2024,Outros,Outros,Cora,,"** @import ?? #reembolso @MatheusLima** "
Garrafão de água mineral,40,31/07/2024,Outros,Outros,Cora,,** @import ?? ** 5 uni.
Combustível para missões na Serra,70,30/07/2024,Outros,Outros,Cora,,** @import ?? #reembolso @FatimaLima ** 2 viagens
Presente de aniverário do pastor,289.9,30/07/2024,Outros,Outros,Cora,,"** @import ?? #reembolso @GleisianeMuniz ** "

<!-- ATUALIZAR -->

<!-- 1 - Baixar o extrato da caixa atualizado, (upload para o drive) colocar na pasta referente ao mês e conferir o resumo (06 CAIXA: JUNHO.pdf)
2 - Baixar os comprovantes e extrair detalhes ou recuperar do site da caixa > imports/<ano>/<MES>\_<DESP|RECE>\_IMPORT.csv
3 - Baixar csv e pdf do banco cora no email para a pasta /cora dentro de note-to-text/notas/<ano>/<MES>/cora
4 - Parsear os dados do csv cora com a opção 10 no script de import (necessário o Node 14.18.1)
5 - Preparar CSVs de import dos caixas usando o Edit csv (*Remover as despesas fixas e registrar no app categorias e tags)
6 - Inserir dados do caixa Carteira manualmente
7 - Verificar notas e recibos pendentes e marcar com #FNF (*tentar o uso de IA nessa etapa)
8 - Validar dados e ir removendo o @import
9 - Validar informações faltando (*Despesas ou receitas caixa que não sejam Pix)
10 - Subir os arquivos csv para o drive na pasta imports referente ao mês
11 - importar dados no app my finances, adicionar juros e corrigir transações entre contas
12 - Validar novamente e preencher dados faltantes manualmente (*atualizar as transações entre contas)
13 - Conferir se o valor do caixa bateu
14 - Exportar as receitas e despesas como csv para o drive na pasta relatórios baixar os arquivos .csv e colocar na pasta notas no mes apropriado
15 - Salvar o CSV como UTF-8 (aparentemente não é mais necessário). Adicionar na pasta notas
16 - Converter o CSV to JSON (_ Usando a opção 8 no script de import) adicionar o \_2024
17 - Importar JSON no relatorio (_ Usando o script npm run merge)
18 - Alterar o saldo anterior manualmente (aparentemente não é mais necessário)
19 - Testar o relatorio localmente
20 - Publicar e baixar o PDF (adicionar na pasta arquivo e enviar no whatsapp) -->

<!-- ** Icluir banco cora
** Substituir efetivacao por pagamento durante a criação do json (done)
** Mudar encargos para valor numerico e negativo (done)
** Colocar a estrutura de diretorios direto dentro do drive para auto sync dos meses
** Automatizar atualizações em tempo real entre o app e o relatório
** Atualizar o script generate para lidar com varios anos com pastas por anos ou o ano no nome do arquivo
** Criar a possibilidade de realizar append e não fazer merge de tudo novamente
** Resolver o problema das barras cortando lá no "\ quando adiciona virgula no csv
** Usar um remote para passar o slide
** No parse dos dados do Cora pegar o identificador com base em, se for receita pega o DE e se for despesa o PARA

TODOs BACKEND

ok - Integrar o código do script da Caixa no cmd

- Fazer a opção 10 escrever o arquivo em um path e não apenas copiar
- Script para recuperar dados de mensagens pix no Cora
- Copiar o prompt de adicionar categorias por meio de um script no cli
- manter dados da pasta notas no repositório
- ajustar o cli para não quebrar quando não tiver relatório da Caixa (criar um fluxo de erro handle no extrair dos dados ou apenas validar o arquivo antes de extrair, incluir os outros processos na extração inicial como o banco cora e criar os imports).
- Adicionar o step by step no Tesouraria CMD
- Fazer o número 8 no script copiar o comando de append com nome do arquivo
- Adicionar uma função de higienizar para fazer trim nas obserações e remover ?? da descrição
- Juntar os dois repos com cli e front abrim no mesmo workspace integrando as funcionalidades do cli no front
- verificar se o arquivo SET_RECE_IMPORT.csv existe antes de fazer o append, do contrário avisar
- Remover cabecalho das colunas na opcao 13 do cmd
- Exibir o mes no cmd
- ajustar a regex que pega os dados no PDF da caixa

Subpassos para automatizar no passo 5

Despesas
ok - Adicionar descrição apropriada e observações
ok - Adicionar categoria e subcategoria
ok - Remover informação desnecessária das observações
ok - Checar se é reembolso e para quem
ok - Verificar se tem nota ou recibo e se é necessário
ok - Verificar se o caixa está certo
ok - verificar se deve receber alguma tag especial ex: #banabuiu
ok - Adicionar ?? em caso de pendencias ou esclarecimentos

Receitas
ok - Formatar nomes das pessoas e checar os casais
ok - Verificar se é oferta ou dízimo
ok - Verificar se o caixa está certo
ok - Remover informação desnecessária das observações
ok - verificar se deve receber alguma tag especial ex: #banabuiu
ok - Adicionar ?? em caso de pendencias ou esclarecimentos

INFOS

// /\((.\*?)\)/g // pega qualque coisa dentro de parenteses

TODOs

ok - Bug for key prop on entries list containers render (maybe has duplicate id)
ok - Improve the style for button group
ok - Add Chakra UI components to replace bootstrap components
ok - Add groups for sub categories
ok - Implement button for show and hide values
ok - Add pizza graphic view
ok - Sort graphs by asc
ok - Add a total value on center of graphic
ok - Mudar cor do tooltip para contrast color
ok - Bug on navbar year select
ok - Bug with total balance after change year on navbar
ok - When change to transaction and come back to dashboard the page brokes
ok - Keep navbar fixed on top
ok - Add number of tithes on header
ok - Add some function to set position for the element from center of screen
ok - Add focus visible when click
ok - Make navbar hide when scroll down and appear when scroll up
ok - Implement the side menu to navigate between sections
ok - Implement the search bar for entries
ok - Add a deep search to seach on sensitve data
ok - Add the deficit and superavit by month
ok - Preview future balance based on fixed expenses
ok - Adjust graphs max width
ok - Change text color on tasg to light
ok - Hide side menu when screen width is small // May still need some adjusts
ok - Sort itens on detailed list by category
ok - Add search by catgegories on advanced search :(category:subcategory) // \* all
ok - Make advanced search be deep and advanced
ok - Search by category on advanced search
ok - Advanced search by logic operators && || !
ok - Remove side nav menu when is hiden to not click
ok - Show itens by category when click on category
ok - Filter categories by enter key down on badges too // we can use useEventListener before elements load
ok - Add a back button that clear search and back to unfiltered list
ok - Make the click to filter on item instead of badges

- Work on responsivity general
  - Cards header
  - Navigation bar
  - Side nav menu // make fab button
- Add tooltips to show subcategories on list
- Integrate all steps on backend
- Implement a print simplified mode
- Chage to start on last month with data
- Add a list of users on application
- Add total tithes percentage on summary result
- Bug when i set the resume view and click on subcategory the app has not a correct filter applied

---

- Show people info like church locale
- Make the hook useData a context
- Add a hover effect on custom badge button
- Add missing operators on advanced search
- Search by regex on advanced search
- Highlight operators on advanced search
- Make the component PieChart more generic // create another to expenses
- Add a feat to increase font size
- Remove bootstrap to use only chakra
- Add some relevant infos to reports
- Add a sorting mode to reordenate list
- Update the graph on dashboard to get only the current year
- Add a button to show a single entry temporarily
- Refine style and add darkmode
- Add tooltips for all actions
- Save configs on localstorage
- Add a previous and next month buttons to navigate
- Add a simple filter by category and subcategory or other props
- Add a toggle to show and hide sensitive informations
- Add a filter from (not | and | or)
- Add a feat to click on category and show expenses on modal
- Add a filter by range interval no just a month
- Make the hook useEventListener receive the function or selector that use to
  get element on useEffect moment

# Ideias

Tornar esse apenas um relatorio para igrejas de modo que as pessoas possam usar fácil e seja generico o suficiente
como importar os dados via file e gravar no db online, adiconar adds para monetizar, permitir que as igrejas possam
criar um tema para cutomizar logo titulo, cores e seçoes a seu gosto, versão paga com direito a nuvem e sem propagandas
tudo configurável via toggle config, sem conta de usuário num primeiro momento, incluindo lista de membros.
Criar uma tela de autenticação só com senha que muda todo mês
automatizar os fluxos de upload para o drive
usar o Finance CDM (note-to-text) dentro de uma pasta tools na raiz do finance-report para automatizar mais alguns passos
deixar a estrutura da caixa na pasta caixa assim como a do cora é na pasta corae deixar o progrma rodar a primeira vez generico sem fazer extraçao de dados apenas mostrar o menu e criar as pastas
criar a pasta de ano e mes caso nao exista quando redar a primeira vez
subir as pastas do meses do note-to-text e mudar o nome do repositorio para Finance CMD

// const backup = /(!)|(&&)|(\|\|)|#([\w]+)|\(([\*|\w]+?)\)|\(([\*|\w]+?:[\*|\w]+?)\)|"(.+?)"/g
// resolver os casos de oprador negação
// resolver casos com prioridades -->
