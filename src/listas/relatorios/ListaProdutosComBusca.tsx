import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import {
  Box,
  Container,
  Heading,
  Input,
  Button,
  Text,
  List,
  ListItem,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useToast,
  useDisclosure,
  NumberInput,
  NumberInputField,
  InputGroup,
  InputLeftElement,
  Textarea
} from '@chakra-ui/react';

interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  preco?: number;
  quantidade?: number;
}

interface Props {
  onSelect?: (produto: Produto) => void;
  onAddNew?: () => void;
}

const ListaProdutosComBusca: React.FC<Props> = ({ onSelect, onAddNew }) => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState('');
  const [foco, setFoco] = useState(false);
  const [selecionado, setSelecionado] = useState<Produto | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [novoNome, setNovoNome] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [novoPreco, setNovoPreco] = useState('');
  const [novaQuantidade, setNovaQuantidade] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const toast = useToast();
  
  // Usando a mesma paleta de verdes do Dashboard
  const bgColor = 'green.50';        // Verde muito claro para o fundo
  const headerBgColor = 'green.100'; // Verde claro para o cabeçalho
  const buttonColorScheme = 'green'; // Verde para botões
  const borderColor = 'green.500';   // Verde para as bordas
  const successColor = 'green.500';  // Verde para mensagens de sucesso
  const errorColor = 'red.500';      // Vermelho para mensagens de erro

  useEffect(() => {
    const fetchProdutos = async () => {
      const querySnapshot = await getDocs(collection(db, 'produtos'));
      setProdutos(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Produto)));
    };
    fetchProdutos();
  }, [mensagem]);

  const produtosFiltrados = busca
    ? produtos.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()))
    : produtos;

  const handleSelect = (produto: Produto) => {
    setSelecionado(produto);
    setBusca(produto.nome);
    setFoco(false);
    if (onSelect) onSelect(produto);
  };

  const handleSalvarNovo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setMensagem('');
    try {
      await addDoc(collection(db, 'produtos'), {
        nome: novoNome,
        descricao: novaDescricao,
        preco: novoPreco ? Number(novoPreco) : null,
        quantidade: novaQuantidade ? Number(novaQuantidade) : null,
        criadoEm: new Date()
      });
      setNovoNome('');
      setNovaDescricao('');
      setNovoPreco('');
      setNovaQuantidade('');
      setMensagem('Produto cadastrado com sucesso!');
      toast({
        title: 'Produto cadastrado',
        description: 'O produto foi cadastrado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      onClose();
    } catch (error) {
      setMensagem('Erro ao cadastrar produto.');
      toast({
        title: 'Erro ao cadastrar',
        description: 'Ocorreu um erro ao cadastrar o produto',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    }
    setSalvando(false);
  };
  
  return (
    <Container maxW="600px" mx="auto" mt="40px" p="6" bg={bgColor} borderRadius="lg" shadow="xl" boxShadow="0 5px 20px rgba(0,0,0,0.1)" position="relative">
      <Flex mb={4} align="center">
        <Input
          placeholder="Buscar produto pelo nome..."
          value={busca}
          onChange={e => { setBusca(e.target.value); setSelecionado(null); }}
          onFocus={() => setFoco(true)}
          mr={3}
          bg="white"
          borderColor={borderColor}
        />        <Button
          onClick={onAddNew || onOpen}
          colorScheme={buttonColorScheme}
          leftIcon={<Text fontSize="xl">+</Text>}
        >
          Novo
        </Button>
      </Flex>
      
      {foco && busca && produtosFiltrados.length > 0 && (
        <Box 
          position="absolute" 
          left={6} 
          right={6} 
          top="70px" 
          bg="white" 
          borderWidth="1px" 
          borderColor={borderColor}
          borderRadius="md"
          zIndex={10} 
          maxH="200px" 
          overflowY="auto"
          shadow="lg"
          boxShadow="0 4px 12px rgba(0,0,0,0.15)"
        >
          <List styleType="none" m={0} p={0}>
            {produtosFiltrados.map(produto => (
              <ListItem
                key={produto.id}
                onClick={() => handleSelect(produto)}
                cursor="pointer"
                bg={selecionado?.id === produto.id ? headerBgColor : 'white'}
                p={2}
                _hover={{ bg: 'green.50' }}
              >
                <Text>{produto.nome} {produto.preco ? `(R$ ${produto.preco.toFixed(2)})` : ''}</Text>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      
      <Box mt={6}>
        <Heading size="md" color="green.700" mb={2}>Produtos cadastrados</Heading>
        <List styleType="none" p={0}>
          {produtos.map(produto => (
            <ListItem 
              key={produto.id} 
              p={2} 
              borderBottomWidth="1px" 
              borderColor={borderColor}
            >
              <Text>
                <strong>{produto.nome}</strong> 
                {produto.descricao && ` - ${produto.descricao.substring(0, 50)}${produto.descricao.length > 50 ? '...' : ''}`} 
                {produto.preco !== undefined && produto.preco !== null && ` - R$ ${produto.preco.toFixed(2)}`} 
                {produto.quantidade !== undefined && produto.quantidade !== null && ` - Estoque: ${produto.quantidade}`}
              </Text>
            </ListItem>
          ))}
        </List>
      </Box>
      
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="white" p={4}>
          <ModalHeader color="green.700">Novo Produto</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSalvarNovo}>
              <FormControl mb={3}>
                <FormLabel>Nome:</FormLabel>
                <Input 
                  value={novoNome} 
                  onChange={e => setNovoNome(e.target.value)} 
                  required 
                />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Descrição:</FormLabel>
                <Textarea 
                  value={novaDescricao} 
                  onChange={e => setNovaDescricao(e.target.value)} 
                />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Preço (R$):</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" color="gray.300" children="R$" />
                  <NumberInput min={0} width="100%">
                    <NumberInputField
                      value={novoPreco}
                      onChange={e => setNovoPreco(e.target.value)}
                      pl="8"
                    />
                  </NumberInput>
                </InputGroup>
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Quantidade em estoque:</FormLabel>
                <NumberInput min={0}>
                  <NumberInputField
                    value={novaQuantidade}
                    onChange={e => setNovaQuantidade(e.target.value)}
                  />
                </NumberInput>
              </FormControl>
              
              <ModalFooter px={0}>
                <Button 
                  variant="outline" 
                  mr={3} 
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  isLoading={salvando}
                  loadingText="Salvando" 
                  colorScheme={buttonColorScheme}
                >
                  Salvar
                </Button>
              </ModalFooter>
              
              {mensagem && (
                <Text 
                  mt={4} 
                  color={mensagem.includes('sucesso') ? successColor : errorColor}
                >
                  {mensagem}
                </Text>
              )}
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default ListaProdutosComBusca;
