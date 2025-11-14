/* script.js - Pizza César (preto futurista) */
(() => {
  const PHONE = '5561995568833'; // +55 61 99556-8833
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));
  const formatBRL = v => `R$ ${v.toFixed(2).replace('.', ',')}`;

  // Theme toggle
  function toggleTheme() {
    document.body.classList.toggle('theme-dark');
    document.body.classList.toggle('theme-light');
    localStorage.setItem('pizzac_theme', document.body.classList.contains('theme-light') ? 'light' : 'dark');
  }
  const stored = localStorage.getItem('pizzac_theme');
  if (stored === 'light') document.body.classList.add('theme-light'); else document.body.classList.add('theme-dark');

  const t1 = $('#modeToggle') || $('#modeToggleTop');
  if (t1) t1.addEventListener('click', toggleTheme);

  // Set whatsapp floats
  const waFloat = $('#whatsappFloat') || $('#whatsappFloatTop') || $('#whatsappFloatBottom') || $('#waFloat') || $('#waFloatBottom');
  if (waFloat) waFloat.href = `https://wa.me/${PHONE}`;

  // Cart & UI logic
  function readMenuItems() {
    const items = [];
    $$('.menu-item').forEach(mi => {
      const name = mi.dataset.name;
      const price = Number(mi.dataset.price) || 0;
      const qty = Number(mi.querySelector('.mi-qty').value) || 0;
      if (qty > 0) items.push({ name, price, qty });
    });
    $$('.drink-checkbox').forEach(cb => {
      if (cb.checked) items.push({ name: cb.dataset.name, price: Number(cb.dataset.price)||0, qty: 1 });
    });
    return items;
  }

  function calcTax() {
    const tipo = $('#tipoEntrega') ? $('#tipoEntrega').value : 'retirada';
    if (tipo !== 'entrega') return 0;
    const opt = $('#regiao') ? $('#regiao').selectedOptions[0] : null;
    return opt ? Number(opt.dataset.taxa || 0) : 0;
  }

  function calculateTotals() {
    const items = readMenuItems();
    const subtotal = items.reduce((s,i)=> s + i.price * i.qty, 0);
    const taxa = calcTax();
    const total = subtotal + taxa;
    return { items, subtotal, taxa, total };
  }

  function updateSummaryUI() {
    const { items, subtotal, taxa, total } = calculateTotals();
    $('#itensResumo') && ($('#itensResumo').textContent = items.length ? items.map(it => `${it.qty}x ${it.name} (${formatBRL(it.price)})`).join(' • ') : 'Nenhum item selecionado');
    $('#taxaResumo') && ($('#taxaResumo').textContent = `Taxa: ${formatBRL(taxa)}`);
    $('#totalResumo') && ($('#totalResumo').innerHTML = `<strong>Total: ${formatBRL(total)}</strong>`);
  }

  // events
  $('#btnAddCart') && $('#btnAddCart').addEventListener('click', (e) => { e.preventDefault(); updateSummaryUI(); alert('Carrinho atualizado.'); });

  $('#btnFinalizar') && $('#btnFinalizar').addEventListener('click', (e) => {
    e.preventDefault();
    const nome = $('#nome') ? $('#nome').value.trim() : '';
    const tel = $('#telefone') ? $('#telefone').value.trim() : '';
    const pagamento = $('#pagamento') ? $('#pagamento').value : '';
    const tipo = $('#tipoEntrega') ? $('#tipoEntrega').value : 'retirada';
    if (!nome || !tel) { alert('Preencha nome e telefone.'); return; }
    if (!pagamento) { alert('Escolha forma de pagamento.'); return; }
    const { items, subtotal, taxa, total } = calculateTotals();
    if (items.length === 0) { alert('Adicione pelo menos 1 item ao pedido.'); return; }

    const lines = [];
    lines.push(`Nome: ${nome}`);
    lines.push(`Telefone: ${tel}`);
    lines.push(`Tipo: ${tipo}`);
    if (tipo === 'entrega') {
      const reg = $('#regiao') && $('#regiao').selectedOptions[0] ? $('#regiao').selectedOptions[0].textContent : '';
      const end = $('#endereco') ? $('#endereco').value : '';
      lines.push(`Região: ${reg}`);
      lines.push(`Endereço: ${end}`);
    }
    lines.push('');
    lines.push('Pedido:');
    items.forEach(it => lines.push(`- ${it.qty} x ${it.name} (${formatBRL(it.price)})`));
    lines.push('');
    lines.push(`Subtotal: ${formatBRL(subtotal)}`);
    lines.push(`Taxa: ${formatBRL(taxa)}`);
    lines.push(`Total: ${formatBRL(total)}`);
    lines.push(`Pagamento: ${pagamento}`);

    $('#confirmText').innerHTML = lines.join('<br>');
    $('#confirmBox').classList.remove('hidden');
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  });

  function gerarMensagemWhats() {
    const nome = $('#nome') ? $('#nome').value.trim() : '';
    const tel = $('#telefone') ? $('#telefone').value.trim() : '';
    const pagamento = $('#pagamento') ? $('#pagamento').value : '';
    const tipo = $('#tipoEntrega') ? $('#tipoEntrega').value : '';
    const reg = $('#regiao') && $('#regiao').selectedOptions[0] ? $('#regiao').selectedOptions[0].textContent : '';
    const end = $('#endereco') ? $('#endereco').value : '';
    const { items, subtotal, taxa, total } = calculateTotals();

    const lines = [];
    lines.push('*Novo pedido - Pizza César*');
    lines.push(`Nome: ${nome}`);
    lines.push(`Telefone: ${tel}`);
    lines.push(`Tipo: ${tipo}`);
    if (tipo === 'entrega') { lines.push(`Região: ${reg}`); lines.push(`Endereço: ${end}`); }
    lines.push('');
    lines.push('Itens:');
    items.forEach(it => lines.push(`${it.qty} x ${it.name} — ${formatBRL(it.price)}`));
    lines.push('');
    lines.push(`Subtotal: ${formatBRL(subtotal)}`);
    lines.push(`Taxa: ${formatBRL(taxa)}`);
    lines.push(`Total: ${formatBRL(total)}`);
    lines.push(`Pagamento: ${pagamento}`);
    lines.push('');
    lines.push('Por favor confirmar previsão de entrega/retirada.');

    return encodeURIComponent(lines.join('\n'));
  }

  $('#btnWhats') && $('#btnWhats').addEventListener('click', (e) => {
    e.preventDefault();
    const nome = $('#nome') ? $('#nome').value.trim() : '';
    const tel = $('#telefone') ? $('#telefone').value.trim() : '';
    if (!nome || !tel) { alert('Preencha nome e telefone antes de enviar pelo WhatsApp.'); return; }
    const { items } = calculateTotals();
    if (!items.length) { alert('Adicione itens ao pedido antes de enviar.'); return; }
    const msg = gerarMensagemWhats();
    window.open(`https://wa.me/${PHONE}?text=${msg}`, '_blank');
  });

  $('#confirmWhats') && $('#confirmWhats').addEventListener('click', () => {
    const msg = gerarMensagemWhats();
    window.open(`https://wa.me/${PHONE}?text=${msg}`, '_blank');
  });

  $('#novoPedido') && $('#novoPedido').addEventListener('click', () => {
    $$('.mi-qty').forEach(q => q.value = 0);
    $$('.drink-checkbox').forEach(d => d.checked = false);
    ['#nome','#telefone','#endereco'].forEach(sel => { if ($(sel)) $(sel).value = ''; });
    $('#regiao') && ($('#regiao').value = '');
    $('#pagamento') && ($('#pagamento').value = '');
    $('#confirmBox') && $('#confirmBox').classList.add('hidden');
    updateSummaryUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  $('#tipoEntrega') && $('#tipoEntrega').addEventListener('change', () => {
    const box = $('#enderecoBox');
    if (!box) return;
    if ($('#tipoEntrega').value === 'entrega') box.classList.remove('hidden'); else box.classList.add('hidden');
    updateSummaryUI();
  });

  ['change','input'].forEach(evt => {
    document.addEventListener(evt, (ev) => {
      if (ev.target.matches('.mi-qty') || ev.target.matches('.drink-checkbox') || ev.target.matches('#regiao') || ev.target.matches('#tipoEntrega')) {
        updateSummaryUI();
      }
    }, {capture:true});
  });

  // init
  updateSummaryUI();

})();
function finalizarPedido() {


let nome = document.getElementById("nome").value;
let tel = document.getElementById("telefone").value;
let end = document.getElementById("endereco").value;
let tipo = document.getElementById("tipo").value;
let pizza = document.getElementById("pizza").value;
let bebida = document.getElementById("bebida").value;
let pagamento = document.getElementById("pagamento").value;


let precoPizza = parseFloat(pizza.split(" - ")[1]);
let precoBebida = parseFloat(bebida.split(" - ")[1]);


let total = precoPizza + precoBebida;


let resumo = `
<h2>Resumo do Pedido</h2>
<p><strong>Nome:</strong> ${nome}</p>
<p><strong>Telefone:</strong> ${tel}</p>
<p><strong>Entrega/Retirada:</strong> ${tipo}</p>
<p><strong>Endereço:</strong> ${end}</p>
<p><strong>Pizza:</strong> ${pizza.split(" - ")[0]}</p>
<p><strong>Bebida:</strong> ${bebida.split(" - ")[0]}</p>
<p><strong>Pagamento:</strong> ${pagamento}</p>
<h3>Total: R$ ${total.toFixed(2)}</h3>
<a class="menu-principal" href="https://wa.me/5561995568833?text=Olá%20Pizza%20César!%20Quero%20fazer%20um%20pedido:%0A%0ACliente:%20${nome}%0ATelefone:%20${tel}%0A${tipo}%0AEndereço:%20${end}%0APizza:%20${pizza.split(" - ")[0]}%0ABebida:%20${bebida.split(" - ")[0]}%0APagamento:%20${pagamento}%0ATotal:%20R$${total.toFixed(2)}" target="_blank">📩 Enviar Pedido</a>
`;


document.getElementById("resumo").innerHTML = resumo;
}