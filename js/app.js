// ==========================================================================
// 1. DADOS INICIAIS (SEED)
// ==========================================================================
const carrosIniciais = [
  {
    id: Date.now() + 1,
    nomeCliente: "Bruno Silva",
    cpf: "123.456.789-00",
    telefone: "(11) 98765-4321",
    endereco: "Rua das Flores, 123",
    email: "bruno.silva@example.com",
    comprador: "Bruno Silva",
    modelo: "Corolla",
    placa: "ABC-1234",
    valor: "110000.00",
    cor: "Prata",
    ano: "2022",
    condicaoPagamento: ["financiamento"]
  },
  {
    id: Date.now() + 2,
    nomeCliente: "Maria Oliveira",
    cpf: "987.654.321-00",
    telefone: "(21) 91234-5678",
    endereco: "Avenida Principal, 456",
    email: "maria.oliveira@example.com",
    comprador: "Empresa X",
    modelo: "Onix",
    placa: "DEF-5678",
    valor: "78000.00",
    cor: "Branco",
    ano: "2023",
    condicaoPagamento: ["pix", "cartao"]
  }
];

const usuariosIniciais = [
  { nome: "Professor Avaliador", email: "professor@uninter.com", senha: "123" }
];

// ==========================================================================
// 2. FUNÇÕES AUXILIARES
// ==========================================================================
function getDados(chave) {
  return JSON.parse(localStorage.getItem(chave)) || [];
}

function setDados(chave, dados) {
  localStorage.setItem(chave, JSON.stringify(dados));
}

function inicializarDados() {
  if (!localStorage.getItem("veiculos")) setDados("veiculos", carrosIniciais);
  if (!localStorage.getItem("usuarios")) setDados("usuarios", usuariosIniciais);
}

// ==========================================================================
// 3. LÓGICA DAS PÁGINAS
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  inicializarDados();

  const paginaLogin = document.getElementById("login-form");
  const paginaCadastroUsuario = document.getElementById("cadastro-usuario-form");
  const paginaCadastroVeiculo = document.getElementById("cadastro-veiculo-form");
  const tabelaVeiculos = document.getElementById("tabela-veiculos-corpo");

  // ================= LOGIN =================
  if (paginaLogin) {
    paginaLogin.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const senha = document.getElementById("password").value;

      const usuarios = getDados("usuarios");
      const usuario = usuarios.find(u => u.email === email && u.senha === senha);

      if (usuario) {
        alert("Login realizado com sucesso!");
        sessionStorage.setItem("usuarioLogado", "true");
        window.location.href = "listagemVeiculos.html";
      } else {
        alert("Email ou senha inválidos.");
      }
    });
  }

  // ================= CADASTRO DE USUÁRIO =================
  if (paginaCadastroUsuario) {
    paginaCadastroUsuario.addEventListener("submit", (e) => {
      e.preventDefault();

      const nome = document.getElementById("nome").value.trim();
      const email = document.getElementById("email").value.trim();
      const senha = document.getElementById("senha").value;
      const confirmarSenha = document.getElementById("confirmar-senha").value;

      if (senha !== confirmarSenha) return alert("As senhas não coincidem!");

      const usuarios = getDados("usuarios");
      if (usuarios.some(u => u.email === email))
        return alert("Este e-mail já está em uso!");

      usuarios.push({ nome, email, senha });
      setDados("usuarios", usuarios);

      alert("Usuário cadastrado com sucesso!");
      window.location.href = "index.html";
    });
  }

  // ================= CADASTRO DE VEÍCULO =================
  if (paginaCadastroVeiculo) {
    paginaCadastroVeiculo.addEventListener("submit", (e) => {
      e.preventDefault();

      const condicoes = [...document.querySelectorAll('input[name="condicao-pagamento"]:checked')].map(c => c.value);

      const novoVeiculo = {
        id: Date.now(),
        nomeCliente: document.getElementById("nome").value,
        cpf: document.getElementById("cpf").value,
        telefone: document.getElementById("telefone").value,
        endereco: document.getElementById("endereco").value,
        email: document.getElementById("email").value,
        comprador: document.getElementById("comprador").value,
        modelo: document.getElementById("modelo").value,
        placa: document.getElementById("placa").value,
        valor: document.getElementById("valor").value,
        cor: document.getElementById("cor").value,
        ano: document.getElementById("ano").value,
        condicaoPagamento: condicoes
      };

      const veiculos = getDados("veiculos");
      veiculos.push(novoVeiculo);
      setDados("veiculos", veiculos);

      alert("Veículo cadastrado com sucesso!");
      e.target.reset();
    });
  }

  // ================= LISTAGEM DE VEÍCULOS =================
  if (tabelaVeiculos) {
    // 🔒 Verificação de login (nova funcionalidade)
    const usuarioLogado = sessionStorage.getItem("usuarioLogado");
    if (!usuarioLogado) {
      alert("Você precisa estar logado para acessar esta página.");
      window.location.href = "index.html";
      return;
    }

    const campoBusca = document.getElementById("campo-busca");

    function renderizarVeiculos(filtro = "") {
      const veiculos = getDados("veiculos");
      tabelaVeiculos.innerHTML = "";

      const filtrados = veiculos.filter(v =>
        [v.placa, v.modelo, v.nomeCliente].some(campo =>
          campo.toLowerCase().includes(filtro.toLowerCase())
        )
      );

      if (filtrados.length === 0) {
        tabelaVeiculos.innerHTML = <tr><td colspan="7">Nenhum veículo encontrado.</td></tr>;
        return;
      }

      filtrados.forEach(v => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${v.placa}</td>
          <td>${v.modelo}</td>
          <td>${v.nomeCliente}</td>
          <td>R$ ${parseFloat(v.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
          <td>${v.ano}</td>
          <td>${v.cor}</td>
          <td>
            <button class="btn-editar" data-id="${v.id}">Editar</button>
            <button class="btn-excluir" data-id="${v.id}">Excluir</button>
          </td>
        `;
        tabelaVeiculos.appendChild(tr);
      });
    }

    // Busca dinâmica
    campoBusca.addEventListener("input", () => renderizarVeiculos(campoBusca.value));

    // Eventos dos botões
    tabelaVeiculos.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      const veiculos = getDados("veiculos");

      if (e.target.classList.contains("btn-excluir")) {
        if (confirm("Deseja realmente excluir este veículo?")) {
          const novos = veiculos.filter(v => v.id != id);
          setDados("veiculos", novos);
          renderizarVeiculos();
        }
      }

      if (e.target.classList.contains("btn-editar")) {
        const veiculo = veiculos.find(v => v.id == id);
        abrirPopup(veiculo.modelo, veiculo.comprador, veiculo.cor, veiculo.ano, veiculo.valor, veiculo.comprador, veiculo.condicaoPagamento.join(", "));
      }
    });

    renderizarVeiculos();
  }
});

// ==========================================================================
// 4. POPUP DE DETALHES
// ==========================================================================
function abrirPopup(modelo, comprador, cor, ano, valor, comprador2, condicao) {
  document.getElementById("popup-modelo").textContent = modelo;
  document.getElementById("popup-cor").textContent = cor;
  document.getElementById("popup-ano").textContent = ano;
  document.getElementById("popup-valor").textContent = valor;
  document.getElementById("popup-comprador").textContent = comprador2;
  document.getElementById("popup-condicao").textContent = condicao;
  document.getElementById("popup-veiculo").style.display = "flex";
}

function fecharPopup() {
  document.getElementById("popup-veiculo").style.display = "none";
}
