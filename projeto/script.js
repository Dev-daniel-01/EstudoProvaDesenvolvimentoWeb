// =====================================================================
// CONTROLE DE NOTAS — JavaScript puro
// Conteúdos praticados: seleção de elementos, eventos (submit, click,
// input, change), preventDefault, variáveis, if/else, switch, for,
// arrays de objetos, funções com parâmetros e retorno, validação,
// criação/remoção/atualização de elementos, classList, localStorage
// e JSON.stringify / JSON.parse.
//
// AS 4 ESTRUTURAS BÁSICAS DE PROGRAMAÇÃO aparecem neste arquivo:
//   - SEQUENCIAL  -> instruções executadas uma após a outra, de cima
//                    para baixo (ex.: a inicialização no fim do arquivo)
//   - CONDICIONAL -> if / else if / else e switch (decidem o caminho)
//   - REPETIÇÃO   -> for (repete um bloco várias vezes)
//   - DADOS       -> o array de objetos "alunos" (organiza vários dados)
//
// COMO O PROGRAMA FUNCIONA (resumo):
//   1. Pega os elementos do HTML (DOM).
//   2. Lê os alunos salvos no localStorage.
//   3. Desenha a tabela.
//   4. Fica "ouvindo" eventos (cliques, digitação, envio do formulário)
//      e, a cada evento, altera o array, salva e redesenha a tabela.
// =====================================================================


// ---------------------------------------------------------------------
// 1. SELEÇÃO DE ELEMENTOS DO DOM
//    DOM = a página HTML transformada em objetos que o JS consegue
//    acessar e modificar. Aqui guardamos cada elemento numa variável
//    para não precisar procurar de novo toda vez.
//
//    const: a REFERÊNCIA ao elemento não muda (mas o conteúdo dele pode mudar)
//    getElementById('x') -> procura o elemento com id="x"
// ---------------------------------------------------------------------
const form = document.getElementById('formAluno');
const inputNome = document.getElementById('nome');
const inputNota1 = document.getElementById('nota1');
const inputNota2 = document.getElementById('nota2');
const inputNota3 = document.getElementById('nota3');
const btnSalvar = document.getElementById('btnSalvar');
const btnCancelar = document.getElementById('btnCancelar');
const tituloForm = document.getElementById('tituloForm');
const contador = document.getElementById('contador');

// querySelector usa seletor CSS: # para id (e . para classe)
// Faz o mesmo que getElementById, mas aceita qualquer seletor CSS
const mensagem = document.querySelector('#mensagem');
const corpoTabela = document.querySelector('#corpoTabela');
const busca = document.querySelector('#busca');
const filtro = document.querySelector('#filtro');
const btnLimparTudo = document.querySelector('#btnLimparTudo');
const btnTema = document.querySelector('#btnTema');

const totalAlunos = document.querySelector('#totalAlunos');
const mediaTurma = document.querySelector('#mediaTurma');
const melhorAluno = document.querySelector('#melhorAluno');

// Chaves usadas no localStorage
// (o localStorage funciona como "chave -> valor", igual a um dicionário)
const CHAVE_ALUNOS = 'alunos';
const CHAVE_TEMA = 'tema';


// ---------------------------------------------------------------------
// 2. ESTADO DA APLICAÇÃO (variáveis com let: o valor muda)
//    "Estado" = os dados que o programa tem neste momento.
// ---------------------------------------------------------------------

// ESTRUTURA DE DADOS: array de objetos. Cada posição do array é um aluno:
// [ { id: 1, nome: "Ana", nota1: 8, nota2: 7, nota3: 9 }, {...}, ... ]
// Começa com o que estava salvo no navegador (ou vazio na 1ª visita).
let alunos = carregarAlunos(); // array de objetos: { id, nome, nota1, nota2, nota3 }
let idEmEdicao = null;         // null = cadastrando; número = editando aquele aluno


// ---------------------------------------------------------------------
// 3. PERSISTÊNCIA (localStorage + JSON)
//    Sem isso, os alunos sumiriam ao apertar F5, porque variáveis
//    ficam na memória volátil (RAM).
//    O localStorage SÓ GUARDA TEXTO (string). Por isso:
//      - para SALVAR o array  -> JSON.stringify (array vira texto)
//      - para LER o array     -> JSON.parse     (texto vira array)
// ---------------------------------------------------------------------

// Lê o texto salvo e converte de volta para array (JSON.parse)
function carregarAlunos() {
  const texto = localStorage.getItem(CHAVE_ALUNOS); // string ou null
  // CONDICIONAL: se não existe nada salvo, getItem devolve null
  if (texto === null) {
    return []; // primeira visita: nada salvo ainda
  }
  return JSON.parse(texto);
}

// Converte o array para texto (JSON.stringify) e salva
// setItem(chave, valor): se a chave já existir, o valor é substituído
function salvarAlunos() {
  localStorage.setItem(CHAVE_ALUNOS, JSON.stringify(alunos));
}


// ---------------------------------------------------------------------
// 4. REGRAS DE NEGÓCIO (funções com parâmetros e retorno)
//    Função = bloco de código com nome, que só executa quando é chamado.
//    Parâmetros = valores que a função recebe (entre parênteses).
//    return = devolve um resultado e ENCERRA a função naquele ponto.
// ---------------------------------------------------------------------

// Recebe 3 notas e devolve a média aritmética
function calcularMedia(n1, n2, n3) {
  return (n1 + n2 + n3) / 3;
}

// Mesma regra da Atividade 1 da aula 09
// CONDICIONAL encadeada: testa na ordem e para no primeiro verdadeiro
function definirSituacao(media) {
  if (media >= 6) {
    return 'Aprovado';
  } else if (media < 4) {
    return 'Reprovado';
  } else {
    return 'Recuperação'; // sobra: média entre 4 e 6
  }
}

// switch: compara UMA variável com valores fixos
// (aqui não precisa de break porque o return já sai da função)
function classeDaSituacao(situacao) {
  switch (situacao) {
    case 'Aprovado':
      return 'aprovado';
    case 'Reprovado':
      return 'reprovado';
    default: // nenhum case bateu
      return 'recuperacao';
  }
}

// Procura o índice de um aluno pelo id (for). Retorna -1 se não achar,
// igual ao indexOf.
// REPETIÇÃO: o for tem 3 partes -> início (i = 0); condição (i < tamanho);
// incremento (i++). Lembre: o índice do array começa em 0.
function buscarIndice(id) {
  for (let i = 0; i < alunos.length; i++) {
    // === compara valor E tipo (igualdade estrita)
    if (alunos[i].id === id) {
      return i; // achou: devolve a posição e para o for
    }
  }
  return -1;
}

// Retorna uma mensagem de erro ou '' (string vazia) se estiver tudo certo
// Cada "return" com mensagem para a validação no primeiro erro encontrado
function validar(nome, notas) {
  if (nome === '') {
    return 'Informe o nome do aluno.';
  }
  if (nome.length < 3) { // .length = quantidade de caracteres
    return 'O nome precisa ter pelo menos 3 letras.';
  }

  // for percorrendo o array de notas
  for (let i = 0; i < notas.length; i++) {
    // isNaN = "is Not a Number": true se o valor não for número
    if (isNaN(notas[i])) {
      // Template string (crase): ${ } coloca o valor da variável no texto
      return `Preencha a nota ${i + 1} com um número.`;
    }
    // || (OU): basta UMA das condições ser verdadeira
    if (notas[i] < 0 || notas[i] > 10) {
      return `A nota ${i + 1} deve estar entre 0 e 10.`;
    }
  }

  // Não permite nomes repetidos (ignorando maiúsculas/minúsculas)
  for (let i = 0; i < alunos.length; i++) {
    const mesmoNome = alunos[i].nome.toLowerCase() === nome.toLowerCase();
    const outroAluno = alunos[i].id !== idEmEdicao; // não comparar o aluno com ele mesmo
    // && (E): as DUAS condições precisam ser verdadeiras
    if (mesmoNome && outroAluno) {
      return 'Já existe um aluno com esse nome.';
    }
  }

  return '';
}


// ---------------------------------------------------------------------
// 5. EXIBIÇÃO NA PÁGINA (criação de elementos no DOM)
//    createElement('td') -> cria uma tag nova (ainda fora da página)
//    appendChild(filho)  -> coloca a tag criada DENTRO de outra
// ---------------------------------------------------------------------

function criarCelula(texto) {
  const td = document.createElement('td');
  td.textContent = texto; // textContent: seguro, não interpreta HTML
  return td;
}

// Monta uma linha <tr> completa da tabela para um aluno
function criarLinha(aluno, media, situacao) {
  const tr = document.createElement('tr');

  // toFixed(1) -> número com 1 casa decimal (devolve string)
  tr.appendChild(criarCelula(aluno.nome));
  tr.appendChild(criarCelula(aluno.nota1.toFixed(1)));
  tr.appendChild(criarCelula(aluno.nota2.toFixed(1)));
  tr.appendChild(criarCelula(aluno.nota3.toFixed(1)));
  tr.appendChild(criarCelula(media.toFixed(1)));

  // Etiqueta de situação com classe CSS escolhida pelo JS
  // classList.add -> adiciona classes CSS ao elemento (aula 10)
  const tdSituacao = document.createElement('td');
  const etiqueta = document.createElement('span');
  etiqueta.textContent = situacao;
  etiqueta.classList.add('etiqueta', classeDaSituacao(situacao));
  tdSituacao.appendChild(etiqueta);
  tr.appendChild(tdSituacao);

  // Botões de ação: cada um ganha seu próprio ouvinte de evento
  const tdAcoes = document.createElement('td');

  const btnEditar = document.createElement('button');
  btnEditar.type = 'button';
  btnEditar.textContent = 'Editar';
  // addEventListener(evento, função): "quando clicar, execute isto"
  // A função anônima (sem nome) serve para passar o id do aluno
  btnEditar.addEventListener('click', function () {
    editarAluno(aluno.id);
  });

  const btnExcluir = document.createElement('button');
  btnExcluir.type = 'button';
  btnExcluir.textContent = 'Excluir';
  btnExcluir.classList.add('perigo');
  btnExcluir.addEventListener('click', function () {
    excluirAluno(aluno.id);
  });

  tdAcoes.appendChild(btnEditar);
  tdAcoes.appendChild(btnExcluir);
  tr.appendChild(tdAcoes);

  // Destaca a linha que está sendo editada
  if (aluno.id === idEmEdicao) {
    tr.classList.add('em-edicao');
  }

  return tr;
}

// Redesenha a tabela inteira a partir do array (o array é a "fonte da verdade")
// Ou seja: nunca mexemos na tabela "na mão"; mudamos o array e redesenhamos.
function renderizar() {
  corpoTabela.innerHTML = ''; // remove todas as linhas antigas

  // trim() tira espaços do começo/fim; toLowerCase() deixa tudo minúsculo
  const termo = busca.value.trim().toLowerCase();
  const situacaoEscolhida = filtro.value;
  let exibidos = 0;

  // REPETIÇÃO: passa por todos os alunos do array
  for (let i = 0; i < alunos.length; i++) {
    const aluno = alunos[i];
    const media = calcularMedia(aluno.nota1, aluno.nota2, aluno.nota3);
    const situacao = definirSituacao(media);

    // Filtros: se não passar, "continue" pula para o próximo aluno
    if (situacaoEscolhida !== 'todos' && situacao !== situacaoEscolhida) {
      continue;
    }
    // includes(termo) -> true se o nome contém o texto buscado
    // ! (negação) inverte: entra no if se NÃO contém
    if (termo !== '' && !aluno.nome.toLowerCase().includes(termo)) {
      continue;
    }

    corpoTabela.appendChild(criarLinha(aluno, media, situacao));
    exibidos++; // ++ soma 1
  }

  // Nenhuma linha passou nos filtros: mostra uma linha de aviso
  if (exibidos === 0) {
    const tr = document.createElement('tr');
    const td = criarCelula('Nenhum aluno para exibir.');
    td.colSpan = 7; // a célula ocupa as 7 colunas
    td.classList.add('vazio');
    tr.appendChild(td);
    corpoTabela.appendChild(tr);
  }

  atualizarResumo();
}

// Estatísticas com for: soma das médias e maior média
function atualizarResumo() {
  totalAlunos.textContent = alunos.length;

  if (alunos.length === 0) {
    mediaTurma.textContent = '-';
    melhorAluno.textContent = '-';
    return; // return sem valor: só encerra a função aqui
  }

  // Técnica do "maior valor": começa supondo que o 1º é o melhor
  // e troca sempre que encontrar alguém com média maior
  let soma = 0;
  let melhor = alunos[0];
  let maiorMedia = calcularMedia(melhor.nota1, melhor.nota2, melhor.nota3);

  for (let i = 0; i < alunos.length; i++) {
    const media = calcularMedia(alunos[i].nota1, alunos[i].nota2, alunos[i].nota3);
    soma += media; // += é o mesmo que soma = soma + media
    if (media > maiorMedia) {
      maiorMedia = media;
      melhor = alunos[i];
    }
  }

  mediaTurma.textContent = (soma / alunos.length).toFixed(1);
  melhorAluno.textContent = `${melhor.nome} (${maiorMedia.toFixed(1)})`;
}

// Mostra mensagem de erro ou sucesso trocando classes CSS
function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.classList.remove('erro', 'sucesso'); // limpa a cor anterior
  if (tipo) { // tipo null ou '' conta como falso
    mensagem.classList.add(tipo);
  }
}

// Mostra quantos caracteres já foram digitados no nome
function atualizarContador() {
  contador.textContent = `${inputNome.value.length}/40 caracteres`;
}


// ---------------------------------------------------------------------
// 6. AÇÕES: criar, atualizar, excluir
//    Todas seguem o mesmo padrão: mexem no ARRAY -> salvam no
//    localStorage -> redesenham a tabela.
// ---------------------------------------------------------------------

function adicionarAluno(nome, notas) {
  // Objeto: conjunto de propriedades no formato chave: valor
  const novoAluno = {
    id: Date.now(), // número único baseado no horário
    nome: nome,
    nota1: notas[0],
    nota2: notas[1],
    nota3: notas[2]
  };
  alunos.push(novoAluno); // adiciona no fim do array
}

function atualizarAluno(id, nome, notas) {
  const i = buscarIndice(id);
  if (i === -1) {
    return; // não achou: não faz nada
  }
  // Acessa o objeto pela posição e troca suas propriedades
  alunos[i].nome = nome;
  alunos[i].nota1 = notas[0];
  alunos[i].nota2 = notas[1];
  alunos[i].nota3 = notas[2];
}

function excluirAluno(id) {
  const i = buscarIndice(id);
  if (i === -1) {
    return;
  }

  // confirm: janela com OK/Cancelar (aula 08)
  const confirmou = confirm(`Excluir ${alunos[i].nome}?`); // true ou false
  if (!confirmou) {
    return; // clicou em Cancelar
  }

  const nomeExcluido = alunos[i].nome;
  alunos.splice(i, 1); // remove 1 elemento na posição i
  salvarAlunos();

  if (idEmEdicao === id) {
    sairModoEdicao();
  }
  renderizar();
  mostrarMensagem(`${nomeExcluido} foi excluído(a).`, 'sucesso');
}

// Preenche o formulário com os dados do aluno para edição
function editarAluno(id) {
  const i = buscarIndice(id);
  if (i === -1) {
    return;
  }

  // .value = o conteúdo de um campo de formulário (ler ou escrever)
  inputNome.value = alunos[i].nome;
  inputNota1.value = alunos[i].nota1;
  inputNota2.value = alunos[i].nota2;
  inputNota3.value = alunos[i].nota3;

  idEmEdicao = id;
  tituloForm.textContent = 'Editar aluno';
  btnSalvar.textContent = 'Salvar alterações';
  btnCancelar.classList.remove('oculto'); // mostra o botão Cancelar
  form.classList.add('editando');

  atualizarContador();
  mostrarMensagem('', null);
  renderizar();
  inputNome.focus(); // coloca o cursor no campo nome
}

// Volta o formulário ao modo "cadastrar"
function sairModoEdicao() {
  idEmEdicao = null;
  form.reset(); // limpa todos os campos do formulário
  tituloForm.textContent = 'Cadastrar aluno';
  btnSalvar.textContent = 'Cadastrar';
  btnCancelar.classList.add('oculto'); // esconde o botão Cancelar
  form.classList.remove('editando');
  atualizarContador();
}

// Pinta de vermelho os campos com erro
function marcarCamposInvalidos(nome, notas) {
  const camposNota = [inputNota1, inputNota2, inputNota3];

  // classList.toggle com 2º argumento: adiciona se true, remove se false
  inputNome.classList.toggle('invalido', nome.length < 3);
  for (let i = 0; i < camposNota.length; i++) {
    const invalida = isNaN(notas[i]) || notas[i] < 0 || notas[i] > 10;
    camposNota[i].classList.toggle('invalido', invalida);
  }
}


// ---------------------------------------------------------------------
// 7. EVENTOS
//    Evento = ação do usuário na página (clicar, digitar, enviar...).
//    addEventListener("evento", função) liga o evento à função
//    (manipulador / ouvinte) que deve rodar quando ele acontecer.
// ---------------------------------------------------------------------

// submit: disparado pelo botão type="submit" ou pela tecla Enter
// "event" é um objeto com informações sobre o evento que aconteceu
form.addEventListener('submit', function (event) {
  event.preventDefault(); // impede o recarregamento da página

  // Captura dos valores digitados (.value é sempre string)
  // parseFloat converte o texto em número real (ex.: "7.5" -> 7.5)
  const nome = inputNome.value.trim();
  const notas = [
    parseFloat(inputNota1.value),
    parseFloat(inputNota2.value),
    parseFloat(inputNota3.value)
  ];

  marcarCamposInvalidos(nome, notas);

  const erro = validar(nome, notas);
  if (erro !== '') {
    mostrarMensagem(erro, 'erro');
    return; // para aqui: não salva nada
  }

  // Mesmo botão serve para cadastrar OU editar, conforme o estado
  if (idEmEdicao === null) {
    adicionarAluno(nome, notas);
    mostrarMensagem(`${nome} cadastrado(a) com sucesso!`, 'sucesso');
  } else {
    atualizarAluno(idEmEdicao, nome, notas);
    mostrarMensagem(`Dados de ${nome} atualizados!`, 'sucesso');
  }

  // SEQUENCIAL: salva -> limpa o formulário -> redesenha -> foca no nome
  salvarAlunos();
  sairModoEdicao();
  renderizar();
  inputNome.focus();
});

// click: disparado quando o botão é clicado
btnCancelar.addEventListener('click', function () {
  sairModoEdicao();
  mostrarMensagem('', null);
  renderizar();
});

// input: dispara a cada tecla digitada
// (aqui a função é passada pelo NOME, sem parênteses: ela será chamada depois)
inputNome.addEventListener('input', atualizarContador);
busca.addEventListener('input', renderizar);

// change: dispara quando a opção do select é trocada
filtro.addEventListener('change', renderizar);

btnLimparTudo.addEventListener('click', function () {
  if (alunos.length === 0) {
    mostrarMensagem('Não há alunos para apagar.', 'erro');
    return;
  }
  if (confirm('Apagar TODOS os alunos? Essa ação não pode ser desfeita.')) {
    alunos = [];
    localStorage.removeItem(CHAVE_ALUNOS); // apaga só esta chave do storage
    sairModoEdicao();
    renderizar();
    mostrarMensagem('Todos os alunos foram apagados.', 'sucesso');
  }
});

// Tema escuro persistente (Atividade 3 da aula 11)
// A classe "escuro" no <body> troca as cores definidas no CSS
function aplicarTema(tema) {
  if (tema === 'escuro') {
    document.body.classList.add('escuro');
    btnTema.textContent = 'Modo claro';
  } else {
    document.body.classList.remove('escuro');
    btnTema.textContent = 'Modo escuro';
  }
}

btnTema.addEventListener('click', function () {
  // Operador ternário: condição ? valorSeVerdadeiro : valorSeFalso
  // classList.contains -> true se o elemento tem a classe
  const novoTema = document.body.classList.contains('escuro') ? 'claro' : 'escuro';
  localStorage.setItem(CHAVE_TEMA, novoTema); // string simples: não precisa de JSON
  aplicarTema(novoTema);
});


// ---------------------------------------------------------------------
// 8. INICIALIZAÇÃO: recupera o que foi salvo e desenha a tela
//    Estrutura SEQUENCIAL: estas linhas rodam uma vez, ao abrir a página.
// ---------------------------------------------------------------------
aplicarTema(localStorage.getItem(CHAVE_TEMA));
renderizar();
