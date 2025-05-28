import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import CadastroAnimal from './telasCadastro/CadastroAnimal';
import ListaAnimaisComBusca from './listas/ListaAnimaisComBusca';
import ListaAnimais from './listas/ListaAnimais';

import CadastroServico from './telasCadastro/CadastroServico';
import CadastroAtendimento from './telasCadastro/CadastroAtendimento';
import HistoricoAtendimentos from './relatorios/HistoricoAtendimentos';
import CadastroFuncionario from './telasCadastro/CadastroFuncionario';
import CadastroProduto from './telasCadastro/CadastroProduto';
import CadastroVenda from './telasCadastro/CadastroVenda';
import ListaTutoresComBusca from './listas/ListaTutoresComBusca';
import ListaProdutosComBusca from './listas/ListaProdutosComBusca';
import ListaServicosComBusca from './listas/ListaServicosComBusca';
import Dashboard from './components/dashboard/Dashboard';
import DashboardHome from './components/dashboard/DashboardHome';
import './App.css';

// Tema personalizado para o Chakra UI inspirado no Horizon UI
const theme = extendTheme({
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#3f51b5',
      600: '#2c387e',
      700: '#1a237e',
      800: '#0d1b4e',
      900: '#0d1b2a',
    },
    blue: {
      50: '#eff4fb',
      500: '#3965ff',
      700: '#2152ff',
    },
    navy: {
      50: '#d0dcfb',
      100: '#aac0fe',
      200: '#a3b9f8',
      300: '#728fea',
      400: '#3652ba',
      500: '#1b3bbb',
      600: '#24388a',
      700: '#1B254B',
      800: '#111c44',
      900: '#0b1437',
    },
  },
  fonts: {
    heading: "'Roboto', sans-serif",
    body: "'Roboto', sans-serif",
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'navy.700',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'lg',
      },
      defaultProps: {
        colorScheme: 'brand',
      },
    },
    Card: {
      baseStyle: {
        p: '22px',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        position: 'relative',
        borderRadius: '20px',
        minWidth: '0px',
        wordWrap: 'break-word',
        bg: 'white',
        backgroundClip: 'border-box',
      },
    },
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard title="Gestão do Negocio"><DashboardHome /></Dashboard>} />
          <Route path="/animais" element={<Dashboard title="Lista de Animais"><ListaAnimaisComBusca onAddNew={() => window.location.href = '/cadastro-animal'} /></Dashboard>} />
          <Route path="/gerenciar-animais/:animalId?" element={<Dashboard title="Gerenciar Animais"><ListaAnimais /></Dashboard>} />
          <Route path="/cadastro-animal" element={<Dashboard title="Cadastro de Animal"><CadastroAnimal /></Dashboard>} />
          <Route path="/servicos" element={<Dashboard title="Lista de Serviços"><ListaServicosComBusca /></Dashboard>} />
          <Route path="/cadastro-servico" element={<Dashboard title="Cadastro de Serviço"><CadastroServico /></Dashboard>} />
          <Route path="/atendimentos" element={<Dashboard title="Atendimentos"><CadastroAtendimento /></Dashboard>} />
          <Route path="/historico-atendimentos" element={<Dashboard title="Histórico de Atendimentos"><HistoricoAtendimentos /></Dashboard>} />
          <Route path="/funcionarios" element={<Dashboard title="Funcionários"><CadastroFuncionario /></Dashboard>} />
          <Route path="/produtos" element={<Dashboard title="Lista de Produtos"><ListaProdutosComBusca onAddNew={() => window.location.href = '/cadastro-produto'} /></Dashboard>} />
          <Route path="/cadastro-produto" element={<Dashboard title="Cadastro de Produto"><CadastroProduto /></Dashboard>} />
          <Route path="/vendas" element={<Dashboard title="Vendas"><CadastroVenda /></Dashboard>} />
          <Route path="/tutores" element={<Dashboard title="Tutores"><ListaTutoresComBusca /></Dashboard>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
