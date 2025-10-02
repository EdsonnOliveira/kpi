# Novo KPI

O Novo KPI é um sistema ERP especializado para o setor automotivo, desenvolvido para atender as necessidades de concessionárias, oficinas, revendas e locadoras de veículos. Ele integra diferentes áreas operacionais em uma única plataforma, permitindo controle centralizado e otimizado dos processos de gestão.

## 📌 Funcionalidades Principais

### 🚗 Gestão de Veículos
- Cadastro completo de veículos (novos, seminovos, usados)
- Controle de estoque e rastreabilidade de movimentações
- Histórico de revisões, manutenções e negociações

### 🔧 Oficina e Serviços
- Abertura e acompanhamento de Ordens de Serviço (OS)
- Controle de peças e insumos
- Gestão de mão de obra e tempo de execução

### 💰 Financeiro
- Controle de contas a pagar e receber
- Integração com bancos e meios de pagamento
- Emissão de notas fiscais eletrônicas (NF-e, NFS-e)

### 📊 Vendas e CRM
- Gestão de leads e oportunidades
- Simulações de financiamento e consórcio
- Registro de propostas, orçamentos e contratos

### 📈 Relatórios e BI
- Dashboards em tempo real para análise de desempenho
- Relatórios financeiros, operacionais e de vendas
- Indicadores de produtividade e rentabilidade

## 🎯 Objetivo

O Novo KPI foi criado para automatizar e integrar processos do setor automotivo, reduzindo falhas manuais, aumentando a eficiência operacional e melhorando a experiência do cliente.

## 🔧 Público-Alvo

- **Concessionárias**
- **Oficinas mecânicas**
- **Revendas de veículos novos e usados**
- **Locadoras de veículos**
- **Empresas de frotas corporativas**

## 📦 Benefícios

- ✅ Redução de custos operacionais
- ✅ Visibilidade completa da operação em um só sistema
- ✅ Conformidade fiscal e tributária
- ✅ Melhoria no relacionamento com clientes

## 🚀 Tecnologias Utilizadas

- **Frontend**: Next.js 15.5.4, React 19.1.0, TypeScript
- **Styling**: Tailwind CSS 4
- **Linting**: ESLint
- **Build Tool**: Next.js

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd kpi
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o projeto em modo de desenvolvimento:
```bash
npm run dev
```

4. Acesse a aplicação em [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
src/
├── pages/
│   ├── index.tsx          # Página de login
│   ├── dashboard.tsx      # Dashboard principal
│   ├── _app.tsx          # Configuração global da aplicação
│   └── _document.tsx     # Configuração do documento HTML
├── styles/
│   └── globals.css       # Estilos globais e variáveis CSS
public/
├── bg.jpg               # Imagem de background do login
└── ...                  # Outros assets
```

## 🎨 Design System

O projeto utiliza um design system consistente com as seguintes cores:

- **Cor Primária**: `#5CBEF5` (azul claro)
- **Cor Secundária**: `#0C1F2B` (azul escuro)

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera a build de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter

## 🔐 Autenticação

O sistema possui uma página de login integrada que redireciona para o dashboard após a autenticação. A validação atual é básica e pode ser expandida conforme necessário.

## 📱 Responsividade

A aplicação é totalmente responsiva e se adapta a diferentes tamanhos de tela, garantindo uma experiência otimizada em dispositivos móveis, tablets e desktops.

## 🤝 Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o sistema, entre em contato através dos canais oficiais.

---

**Desenvolvido com ❤️ para o setor automotivo brasileiro**# kpi
