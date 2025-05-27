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
  NumberInput,
  NumberInputField,
  useToast,
  useDisclosure
} from '@chakra-ui/react';

interface Tutor {
  id: string;
  nome: string;
  idade?: number;
}

const ListaTutoresComBusca: React.FC = () => {
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [busca, setBusca] = useState('');
  const [foco, setFoco] = useState(false);
  const [selecionado, setSelecionado] = useState<Tutor | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [novoNome, setNovoNome] = useState('');
  const [novaIdade, setNovaIdade] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const toast = useToast();
  
  // Usando a mesma paleta de verdes do Dashboard
  const bgColor = 'green.50';        // Verde muito claro para o fundo
  const headerBgColor = 'green.100'; // Verde claro para o cabeçalho
  const buttonColorScheme = 'green'; // Verde para botões
  const borderColor = 'green.200';   // Verde para as bordas
  const successColor = 'green.500';  // Verde para mensagens de sucesso
  const errorColor = 'red.500';      // Vermelho para mensagens de erro
  useEffect(() => {
    const fetchTutores = async () => {
      const querySnapshot = await getDocs(collection(db, 'tutores'));
      setTutores(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tutor)));
    };
    fetchTutores();
  }, [mensagem]);

  const tutoresFiltrados = busca
    ? tutores.filter(t => t.nome.toLowerCase().includes(busca.toLowerCase()))
    : tutores;

  const handleSelect = (tutor: Tutor) => {
    setSelecionado(tutor);
    setBusca(tutor.nome);
    setFoco(false);
  };
  const handleSalvarNovo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setMensagem('');
    try {
      await addDoc(collection(db, 'tutores'), {
        nome: novoNome,
        idade: novaIdade ? Number(novaIdade) : null,
        criadoEm: new Date()
      });
      setNovoNome('');
      setNovaIdade('');
      setMensagem('Tutor cadastrado com sucesso!');
      toast({
        title: 'Tutor cadastrado',
        description: 'O tutor foi cadastrado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      onClose();
    } catch (error) {
      setMensagem('Erro ao cadastrar tutor.');
      toast({
        title: 'Erro ao cadastrar',
        description: 'Ocorreu um erro ao cadastrar o tutor',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    }
    setSalvando(false);
  };  return (
    <Container maxW="600px" mx="auto" mt="40px" p="6" bg={bgColor} borderRadius="lg" shadow="xl" boxShadow="0 5px 20px rgba(0,0,0,0.1)" position="relative">
      <Flex mb={4} align="center">
        <Input
          placeholder="Buscar tutor pelo nome..."
          value={busca}
          onChange={e => { setBusca(e.target.value); setSelecionado(null); }}
          onFocus={() => setFoco(true)}
          mr={3}
          bg="white"
          borderColor={borderColor}
        />
        <Button
          onClick={onOpen}
          colorScheme={buttonColorScheme}
          leftIcon={<Text fontSize="xl">+</Text>}
        >
          Novo
        </Button>
      </Flex>
      
      {foco && busca && tutoresFiltrados.length > 0 && (
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
          shadow="md"
        >
          <List styleType="none" m={0} p={0}>
            {tutoresFiltrados.map(tutor => (
              <ListItem
                key={tutor.id}
                onClick={() => handleSelect(tutor)}
                cursor="pointer"
                bg={selecionado?.id === tutor.id ? headerBgColor : 'white'}
                p={2}
                _hover={{ bg: 'green.50' }}
              >
                <Text>{tutor.nome} {tutor.idade ? `(${tutor.idade} anos)` : ''}</Text>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      
      <Box mt={6}>
        <Heading size="md" color="green.700" mb={2}>Tutores cadastrados</Heading>
        <List styleType="none" p={0}>
          {tutores.map(tutor => (
            <ListItem 
              key={tutor.id} 
              p={2} 
              borderBottomWidth="1px" 
              borderColor={borderColor}
            >
              <Text>
                <strong>{tutor.nome}</strong> 
                {tutor.idade && ` - ${tutor.idade} anos`}
              </Text>
            </ListItem>
          ))}
        </List>
      </Box>
      
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="white" p={4}>
          <ModalHeader color="green.700">Novo Tutor</ModalHeader>
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
                <FormLabel>Idade:</FormLabel>
                <NumberInput min={0} max={120}>
                  <NumberInputField
                    value={novaIdade}
                    onChange={e => setNovaIdade(e.target.value)}
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

export default ListaTutoresComBusca;
