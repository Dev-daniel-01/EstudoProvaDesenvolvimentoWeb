// =====================================================================
// CONTROLE DE NOTAS — JavaScript puro
// Conteúdos praticados: seleção de elementos, eventos (submit, click,
// input, change), preventDefault, variáveis, if/else, switch, for,
// arrays de objetos, funções com parâmetros e retorno, validação,
// criação/remoção/atualização de elementos, classList, localStorage
// e JSON.stringify / JSON.parse.
// =====================================================================


// ---------------------------------------------------------------------
// 1. SELEÇÃO DE ELEMENTOS DO DOM
//    const: a REFERÊNCIA ao elemento não muda (mas o conteúdo dele pode mudar)
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

// querySelector usa seletor CSS: # para id
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
const CHAVE_ALUNOS = 'alunos';
const CHAVE_TEMA = 'tema';


// ---------------------------------------------------------------------
// 2. ESTADO DA APLICAÇÃO (variáveis com let: o valor muda)
// ---------------------------------------------------------------------
let alunos = carregarAlunos(); // array de objetos: { id, nome, nota1, nota2, nota3 }
let idEmEdicao = null;         // null = cadastrando; número = editando aquele aluno


// ---------------------------------------------------------------------
// 3. PERSISTÊNCIA (localStorage + JSON)
// ---------------------------------------------------------------------

// Lê o texto salvo e converte de volta para array (JSON.parse)
function carregarAlunos() {
  const texto = localStorage.getItem(CHAVE_ALUNOS); // string ou null
  if (texto === null) {
    return []; // primeira visita: nada salvo ainda
  }
  return JSON.parse(texto);
}

// Converte o array para texto (JSON.stringify) e salva
function salvarAlunos() {
  localStorage.setItem(CHAVE_ALUNOS, JSON.stringify(alunos));
}


// ---------------------------------------------------------------------
// 4. REGRAS DE NEGÓCIO (funções com parâmetros e retorno)
// ---------------------------------------------------------------------

function calcularMedia(n1, n2, n3) {
  return (n1 + n2 + n3) / 3;
}

// Mesma regra da Atividade 1 da aula 09
function definirSituacao(media) {
  if (media >= 6) {
    return 'Aprovado';
  } else if (media < 4) {
    return 'Reprovado';
  } else {
    return 'Recuperação';
  }
}

// switch: compara UMA variável com valores fixos
function classeDaSituacao(situacao) {
  switch (situacao) {
    case 'Aprovado':
      return 'aprovado';
    case 'Reprovado':
      return 'reprovado';
    default:
      return 'recuperacao';
  }
}

// Procura o índice de um aluno pelo id (for). Retorna -1 se não achar,
// igual ao indexOf.
function buscarIndice(id) {
  for (let i = 0; i < alunos.length; i++) {
    if (alunos[i].id === id) {
      return i;
    }
  }
  return -1;
}

// Retorna uma mensagem de erro ou '' (string vazia) se estiver tudo certo
function validar(nome, notas) {
  if (nome === '') {
    return 'Informe o nome do aluno.';
  }
  if (nome.length < 3) {
    return 'O nome precisa ter pelo menos 3 letras.';
  }

  // for percorrendo o array de notas
  for (let i = 0; i < notas.length; i++) {
    if (isNaN(notas[i])) {
      return `Preencha a nota ${i + 1} com um número.`;
    }
    if (notas[i] < 0 || notas[i] > 10) {
      return `A nota ${i + 1} deve estar entre 0 e 10.`;
    }
  }

  // Não permite nomes repetidos (ignorando maiúsculas/minúsculas)
  for (let i = 0; i < alunos.length; i++) {
    const mesmoNome = alunos[i].nome.toLowerCase() === nome.toLowerCase();
    const outroAluno = alunos[i].id !== idEmEdicao;
    if (mesmoNome && outroAluno) {
      return 'Já existe um aluno com esse nome.';
    }
  }

  return '';
}


// ---------------------------------------------------------------------
// 5. EXIBIÇÃO NA PÁGINA (criação de elementos no DOM)
// ---------------------------------------------------------------------

function criarCelula(texto) {
  const td = document.createElement('td');
  td.textContent = texto; // textContent: seguro, não interpreta HTML
  return td;
}

function criarLinha(aluno, media, situacao) {
  const tr = document.createElement('tr');

  tr.appendChild(criarCelula(aluno.nome));
  tr.appendChild(criarCelula(aluno.nota1.toFixed(1)));
  tr.appendChild(criarCelula(aluno.nota2.toFixed(1)));
  tr.appendChild(criarCelula(aluno.nota3.toFixed(1)));
  tr.appendChild(criarCelula(media.toFixed(1)));

  // Etiqueta de situação com classe CSS escolhida pelo JS
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
function renderizar() {
  corpoTabela.innerHTML = ''; // remove todas as linhas antigas

  const termo = busca.value.trim().toLowerCase();
  const situacaoEscolhida = filtro.value;
  let exibidos = 0;

  for (let i = 0; i < alunos.length; i++) {
    const aluno = alunos[i];
    const media = calcularMedia(aluno.nota1, aluno.nota2, aluno.nota3);
    const situacao = definirSituacao(media);

    // Filtros: se não passar, "continue" pula para o próximo aluno
    if (situacaoEscolhida !== 'todos' && situacao !== situacaoEscolhida) {
      continue;
    }
    if (termo !== '' && !aluno.nome.toLowerCase().includes(termo)) {
      continue;
    }

    corpoTabela.appendChild(criarLinha(aluno, media, situacao));
    exibidos++;
  }

  if (exibidos === 0) {
    const tr = document.createElement('tr');
    const td = criarCelula('Nenhum aluno para exibir.');
    td.colSpan = 7;
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
    return;
  }

  let soma = 0;
  let melhor = alunos[0];
  let maiorMedia = calcularMedia(melhor.nota1, melhor.nota2, melhor.nota3);

  for (let i = 0; i < alunos.length; i++) {
    const media = calcularMedia(alunos[i].nota1, alunos[i].nota2, alunos[i].nota3);
    soma += media;
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
  mensagem.classList.remove('erro', 'sucesso');
  if (tipo) {
    mensagem.classList.add(tipo);
  }
}

function atualizarContador() {
  contador.textContent = `${inputNome.value.length}/40 caracteres`;
}


// ---------------------------------------------------------------------
// 6. AÇÕES: criar, atualizar, excluir
// ---------------------------------------------------------------------

function adicionarAluno(nome, notas) {
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
    return;
  }
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

  const confirmou = confirm(`Excluir ${alunos[i].nome}?`); // true ou false
  if (!confirmou) {
    return;
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

  inputNome.value = alunos[i].nome;
  inputNota1.value = alunos[i].nota1;
  inputNota2.value = alunos[i].nota2;
  inputNota3.value = alunos[i].nota3;

  idEmEdicao = id;
  tituloForm.textContent = 'Editar aluno';
  btnSalvar.textContent = 'Salvar alterações';
  btnCancelar.classList.remove('oculto');
  form.classList.add('editando');

  atualizarContador();
  mostrarMensagem('', null);
  renderizar();
  inputNome.focus();
}

function sairModoEdicao() {
  idEmEdicao = null;
  form.reset(); // limpa todos os campos do formulário
  tituloForm.textContent = 'Cadastrar aluno';
  btnSalvar.textContent = 'Cadastrar';
  btnCancelar.classList.add('oculto');
  form.classList.remove('editando');
  atualizarContador();
}

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
// ---------------------------------------------------------------------

// submit: disparado pelo botão type="submit" ou pela tecla Enter
form.addEventListener('submit', function (event) {
  event.preventDefault(); // impede o recarregamento da página

  // Captura dos valores digitados (.value é sempre string)
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

  if (idEmEdicao === null) {
    adicionarAluno(nome, notas);
    mostrarMensagem(`${nome} cadastrado(a) com sucesso!`, 'sucesso');
  } else {
    atualizarAluno(idEmEdicao, nome, notas);
    mostrarMensagem(`Dados de ${nome} atualizados!`, 'sucesso');
  }

  salvarAlunos();
  sairModoEdicao();
  renderizar();
  inputNome.focus();
});

btnCancelar.addEventListener('click', function () {
  sairModoEdicao();
  mostrarMensagem('', null);
  renderizar();
});

// input: dispara a cada tecla digitada
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
    localStorage.removeItem(CHAVE_ALUNOS);
    sairModoEdicao();
    renderizar();
    mostrarMensagem('Todos os alunos foram apagados.', 'sucesso');
  }
});

// Tema escuro persistente (Atividade 3 da aula 11)
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
  const novoTema = document.body.classList.contains('escuro') ? 'claro' : 'escuro';
  localStorage.setItem(CHAVE_TEMA, novoTema); // string simples: não precisa de JSON
  aplicarTema(novoTema);
});


// ---------------------------------------------------------------------
// 8. INICIALIZAÇÃO: recupera o que foi salvo e desenha a tela
// ---------------------------------------------------------------------
aplicarTema(localStorage.getItem(CHAVE_TEMA));
renderizar();
