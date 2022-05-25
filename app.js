const vm = new Vue({
	el: '#app',
	data: {
		produtos: [],
		produto: false,
		carrinhoItems: [],
		alertaMsg: 'Item adicionado',
		isAlertaShow: false,
		isCarrinhoShow: false,
	},
	methods: {
		async fetchProdutos() {
			const data = await (await fetch('./api/produtos.json')).json();
			this.produtos = data;
		},
		async fetchProduto(id) {
			const data = await (
				await fetch(`./api/produtos/${id}/dados.json`)
			).json();

			this.produto = data;
		},
		abrirModal(id) {
			this.fetchProduto(id);
			window.scrollTo({
				top: 0,
				behavior: 'smooth',
			});
		},
		fecharModal({ target, currentTarget }) {
			if (target === currentTarget) {
				this.produto = false;
			}
		},
		fecharCarrinho({ target, currentTarget }) {
			if (target === currentTarget) {
				this.isCarrinhoShow = false;
			}
		},
		adicionarItem() {
			this.produto.estoque--;

			const { nome, id, preco } = this.produto;

			this.carrinhoItems.push({ nome, id, preco });

			this.alerta(`${nome} adicionado ao carrinho`);
		},
		removerItem(index) {
			this.carrinhoItems.splice(index, 1);
		},
		checarLocalstorage() {
			if (window.localStorage.carrinho)
				this.carrinhoItems = JSON.parse(window.localStorage.carrinho);
		},
		compararEstoque() {
			const items = this.carrinhoItems.filter(
				({ id }) => id === this.produto.id
			);
			this.produto.estoque -= items.length;
		},
		alerta(mensagem) {
			this.alertaMsg = mensagem;
			this.isAlertaShow = true;
			setTimeout(() => {
				this.isAlertaShow = false;
			}, 1500);
		},
		router() {
			const hash = document.location.hash;

			if (hash) this.fetchProduto(hash.replace('#', ''));
		},
	},
	computed: {
		carrinhoTotal() {
			let total = 0;

			if (this.carrinhoItems.length) {
				this.carrinhoItems.forEach((item) => {
					total += item.preco;
				});
			}

			return total;
		},
	},
	filters: {
		currencyAdapter: (val) =>
			val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
	},
	watch: {
		produto() {
			document.title = this.produto.nome || 'Techno';
			const hash = this.produto.id || '';
			history.pushState(null, null, `#${hash}`);
			this.compararEstoque();
		},
		carrinhoItems() {
			window.localStorage.carrinho = JSON.stringify(this.carrinhoItems);
		},
	},
	created() {
		this.fetchProdutos();
		this.router();
		this.checarLocalstorage();
	},
});
