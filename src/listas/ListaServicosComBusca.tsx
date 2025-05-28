import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
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
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Textarea,
  NumberInput,
  NumberInputField,
  InputGroup,
  InputLeftElement,
  Divider
} from '@chakra-ui/react';

interface Servico {
  id: string;
  nome: string;
  descricao?: string;
  tipo?: string;
  valor?: number;
  criadoEm?: any;
}

interface Props {
  onSelect?: (servico: Servico) => void;
  onAddNew?: () => void;
}

const ListaServicosComBusca: React.FC<Props> = ({ onSelect }) => {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [busca, setBusca] = useState('');
  const [foco, setFoco] = useState(false);
  const [selecionado, setSelecionado] = useState<Servico | null>(null);
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [novoNome, setNovoNome] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [novoTipo, setNovoTipo] = useState('');
  const [novoValor, setNovoValor] = useState('');
  const [salvando, setSalvando] = useState(false);  
  const [mensagem, setMensagem] = useState('');
  const toast = useToast();
  
  // Estado para serviço em edição
  const [servicoEmEdicao, setServicoEmEdicao] = useState<Servico | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editDescricao, setEditDescricao] = useState('');
  const [editTipo, setEditTipo] = useState('');
  const [editValor, setEditValor] = useState('');
  
  // Estados para o diálogo de confirmação de exclusão
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  
  // Usando a mesma paleta de verdes do Dashboard
  const bgColor = 'green.50';        // Verde muito claro para o fundo
  const headerBgColor = 'green.100'; // Verde claro para o cabeçalho
  const buttonColorScheme = 'green'; // Verde para botões
  const borderColor = 'green.500';   // Verde para as bordas
  const successColor = 'green.500';  // Verde para mensagens de sucesso
  const errorColor = 'red.500';      // Vermelho para mensagens de erro

  useEffect(() => {
    const fetchServicos = async () => {
      try {
        // Buscar serviços
        const servicosSnapshot = await getDocs(collection(db, 'servicos'));
        const servicosLista = servicosSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as Servico));
        
        setServicos(servicosLista);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar dados. Tente novamente.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };
    
    fetchServicos();
  }, [mensagem, toast]);

  const servicosFiltrados = busca
    ? servicos.filter(s => s.nome.toLowerCase().includes(busca.toLowerCase()))
    : servicos;

  const handleSelect = (servico: Servico) => {
    setSelecionado(servico);
    setBusca(servico.nome);
    setFoco(false);
    if (onSelect) onSelect(servico);
  };
  
  const handleSalvarNovo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setMensagem('');
    try {
      await addDoc(collection(db, 'servicos'), {
        nome: novoNome,
        descricao: novaDescricao,
        tipo: novoTipo,
        valor: novoValor ? Number(novoValor) : null,
        criadoEm: new Date()
      });
      setNovoNome('');
      setNovaDescricao('');
      setNovoTipo('');
      setNovoValor('');
      setMensagem('Serviço cadastrado com sucesso!');
      toast({
        title: 'Serviço cadastrado',
        description: 'O serviço foi cadastrado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      onAddClose();
    } catch (error) {
      setMensagem('Erro ao cadastrar serviço.');
      toast({
        title: 'Erro ao cadastrar',
        description: 'Ocorreu um erro ao cadastrar o serviço',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    }
    setSalvando(false);
  };
  
  const formatarValor = (valor: number | undefined) => {
    if (valor === undefined || valor === null) return 'Não informado';
    return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  const handleEdit = (servico: Servico) => {
    setServicoEmEdicao(servico);
    setEditNome(servico.nome);
    setEditDescricao(servico.descricao || '');
    setEditTipo(servico.tipo || '');
    setEditValor(servico.valor ? servico.valor.toString() : '');
    onEditOpen();
  };
  
  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!servicoEmEdicao) return;
    
    setSalvando(true);
    setMensagem('');
    try {
      const servicoRef = doc(db, 'servicos', servicoEmEdicao.id);
      await updateDoc(servicoRef, {
        nome: editNome,
        descricao: editDescricao,
        tipo: editTipo,
        valor: editValor ? Number(editValor) : null
      });
      
      setMensagem('Serviço atualizado com sucesso!');
      toast({
        title: 'Serviço atualizado',
        description: 'O serviço foi atualizado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      onEditClose();
    } catch (error) {
      setMensagem('Erro ao atualizar serviço.');
      toast({
        title: 'Erro ao atualizar',
        description: 'Ocorreu um erro ao atualizar o serviço',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    }
    setSalvando(false);
  };
  
  const openDeleteConfirmation = () => {
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteServico = async () => {
    if (!servicoEmEdicao) return;
    
    try {
      await deleteDoc(doc(db, 'servicos', servicoEmEdicao.id));
      
      setMensagem('Serviço excluído com sucesso!');
      toast({
        title: 'Serviço excluído',
        description: 'O serviço foi excluído com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      setIsDeleteDialogOpen(false);
      onEditClose();
    } catch (error) {
      setMensagem('Erro ao excluir serviço.');
      toast({
        title: 'Erro ao excluir',
        description: 'Ocorreu um erro ao excluir o serviço',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  return (
    <Container maxW="600px" mx="auto" mt="40px" p="6" bg={bgColor} borderRadius="lg" shadow="xl" boxShadow="0 5px 20px rgba(0,0,0,0.1)" position="relative">
      <Flex mb={4} align="center">
        <Input
          placeholder="Buscar serviço pelo nome..."
          value={busca}
          onChange={e => { setBusca(e.target.value); setSelecionado(null); }}
          onFocus={() => setFoco(true)}
          mr={3}
          bg="white"
          borderColor={borderColor}
        />
        <Button
          onClick={onAddOpen}
          colorScheme={buttonColorScheme}
          leftIcon={<Text fontSize="xl">+</Text>}
        >
          Novo
        </Button>
      </Flex>
      
      {foco && busca && servicosFiltrados.length > 0 && (
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
            {servicosFiltrados.map(servico => (
              <ListItem
                key={servico.id}
                onClick={() => handleSelect(servico)}
                cursor="pointer"
                bg={selecionado?.id === servico.id ? headerBgColor : 'white'}
                p={2}
                _hover={{ bg: 'green.50' }}
              >
                <Text>{servico.nome} - {formatarValor(servico.valor)}</Text>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      
      <Box mt={6}>
        <Heading size="md" color="green.700" mb={2}>Serviços cadastrados</Heading>
        <List styleType="none" p={0}>
          {servicos.map(servico => (
            <ListItem 
              key={servico.id} 
              p={2} 
              borderBottomWidth="1px" 
              borderColor={borderColor}
            >
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontWeight="bold">{servico.nome}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {servico.tipo && `Tipo: ${servico.tipo}`}
                    {servico.valor !== undefined && ` | ${formatarValor(servico.valor)}`}
                  </Text>
                </Box>
                <Button
                  size="sm"
                  colorScheme="green"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(servico);
                  }}
                >
                  Editar
                </Button>
              </Flex>
            </ListItem>
          ))}
        </List>
      </Box>
      
      {/* Modal para adicionar novo serviço */}
      <Modal isOpen={isAddOpen} onClose={onAddClose}>
        <ModalOverlay />
        <ModalContent bg="white" p={4}>
          <ModalHeader color="green.700">Novo Serviço</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSalvarNovo}>
              <FormControl mb={3} isRequired>
                <FormLabel>Nome do Serviço:</FormLabel>
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
                <FormLabel>Tipo:</FormLabel>
                <Input 
                  value={novoTipo} 
                  onChange={e => setNovoTipo(e.target.value)} 
                />
              </FormControl>
              
              <FormControl mb={3}>
                <FormLabel>Valor:</FormLabel>
                <InputGroup>
                  <InputLeftElement
                    pointerEvents="none"
                    color="gray.500"
                    children="R$"
                  />
                  <NumberInput w="100%">
                    <NumberInputField
                      pl="8"
                      value={novoValor}
                      onChange={e => setNovoValor(e.target.value)}
                    />
                  </NumberInput>
                </InputGroup>
              </FormControl>
              
              <ModalFooter px={0}>
                <Button 
                  variant="outline" 
                  mr={3} 
                  onClick={onAddClose}
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
      
      {/* Modal para editar serviço existente */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent bg="white" p={4}>
          <ModalHeader color="green.700">Editar Serviço</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSalvarEdicao}>
              <FormControl mb={3} isRequired>
                <FormLabel>Nome do Serviço:</FormLabel>
                <Input 
                  value={editNome} 
                  onChange={e => setEditNome(e.target.value)} 
                  required 
                />
              </FormControl>
              
              <FormControl mb={3}>
                <FormLabel>Descrição:</FormLabel>
                <Textarea 
                  value={editDescricao} 
                  onChange={e => setEditDescricao(e.target.value)} 
                />
              </FormControl>
              
              <FormControl mb={3}>
                <FormLabel>Tipo:</FormLabel>
                <Input 
                  value={editTipo} 
                  onChange={e => setEditTipo(e.target.value)}
                />
              </FormControl>
              
              <FormControl mb={3}>
                <FormLabel>Valor:</FormLabel>
                <InputGroup>
                  <InputLeftElement
                    pointerEvents="none"
                    color="gray.500"
                    children="R$"
                  />
                  <NumberInput w="100%">
                    <NumberInputField
                      pl="8"
                      value={editValor}
                      onChange={e => setEditValor(e.target.value)}
                    />
                  </NumberInput>
                </InputGroup>
              </FormControl>
              
              <ModalFooter px={0}>
                <Button 
                  variant="outline" 
                  colorScheme="red"
                  mr="auto"
                  onClick={openDeleteConfirmation}
                >
                  Excluir
                </Button>
                <Button 
                  variant="outline" 
                  mr={3} 
                  onClick={onEditClose}
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
      
      {/* Diálogo de confirmação para exclusão */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef as React.RefObject<any>}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Excluir Serviço
            </AlertDialogHeader>

            <AlertDialogBody>
              Tem certeza que deseja excluir o serviço "{servicoEmEdicao?.nome}"? Esta ação não pode ser desfeita.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleDeleteServico} ml={3}>
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};

export default ListaServicosComBusca;
