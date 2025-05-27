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
  Select,
  useToast,
  useDisclosure
} from '@chakra-ui/react';

interface Animal {
  id: string;
  nome: string;
  especie?: string;
  raca?: string;
  tutor?: string;
}

interface Props {
  onSelect?: (animal: Animal) => void;
  onAddNew?: () => void;
}

const ListaAnimaisComBusca: React.FC<Props> = ({ onSelect }) => {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [tutores, setTutores] = useState<{ id: string; nome: string }[]>([]);
  const [busca, setBusca] = useState('');
  const [foco, setFoco] = useState(false);
  const [selecionado, setSelecionado] = useState<Animal | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [novoNome, setNovoNome] = useState('');
  const [novaEspecie, setNovaEspecie] = useState('');
  const [novaRaca, setNovaRaca] = useState('');
  const [novoTutorId, setNovoTutorId] = useState('');
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
    const fetchAnimais = async () => {
      const querySnapshot = await getDocs(collection(db, 'animais'));
      setAnimais(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Animal)));
    };
    fetchAnimais();

    const fetchTutores = async () => {
      const querySnapshot = await getDocs(collection(db, 'tutores'));
      setTutores(querySnapshot.docs.map(doc => ({ id: doc.id, nome: doc.data().nome })));
    };
    fetchTutores();
  }, [mensagem]);

  const animaisFiltrados = busca
    ? animais.filter(a => a.nome.toLowerCase().includes(busca.toLowerCase()))
    : animais;

  const handleSelect = (animal: Animal) => {
    setSelecionado(animal);
    setBusca(animal.nome);
    setFoco(false);
    if (onSelect) onSelect(animal);
  };
  const handleSalvarNovo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setMensagem('');
    try {
      await addDoc(collection(db, 'animais'), {
        nome: novoNome,
        especie: novaEspecie,
        raca: novaRaca,
        tutorId: novoTutorId,
        criadoEm: new Date()
      });
      setNovoNome('');
      setNovaEspecie('');
      setNovaRaca('');
      setNovoTutorId('');
      setMensagem('Animal cadastrado com sucesso!');
      toast({
        title: 'Animal cadastrado',
        description: 'O animal foi cadastrado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      onClose();
    } catch (error) {
      setMensagem('Erro ao cadastrar animal.');
      toast({
        title: 'Erro ao cadastrar',
        description: 'Ocorreu um erro ao cadastrar o animal',
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
          placeholder="Buscar animal pelo nome..."
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
      
      {foco && busca && animaisFiltrados.length > 0 && (
        <Box 
          position="absolute" 
          left={6} 
          right={6} 
          top="70px" 
          bg="white" 
          borderWidth="1px" 
          borderColor={borderColor}
          borderRadius="md"          zIndex={10} 
          maxH="200px" 
          overflowY="auto"
          shadow="lg"
          boxShadow="0 4px 12px rgba(0,0,0,0.15)"
        >
          <List styleType="none" m={0} p={0}>
            {animaisFiltrados.map(animal => (
              <ListItem
                key={animal.id}
                onClick={() => handleSelect(animal)}
                cursor="pointer"
                bg={selecionado?.id === animal.id ? headerBgColor : 'white'}
                p={2}
                _hover={{ bg: 'green.50' }}
              >
                <Text>{animal.nome} {animal.especie ? `(${animal.especie})` : ''}</Text>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      
      <Box mt={6}>
        <Heading size="md" color="green.700" mb={2}>Animais cadastrados</Heading>
        <List styleType="none" p={0}>
          {animais.map(animal => (
            <ListItem 
              key={animal.id} 
              p={2} 
              borderBottomWidth="1px" 
              borderColor={borderColor}
            >
              <Text>
                <strong>{animal.nome}</strong> 
                {animal.especie && ` - ${animal.especie}`} 
                {animal.raca && ` - ${animal.raca}`} 
                {animal.tutor && ` - Tutor: ${animal.tutor}`}
              </Text>
            </ListItem>
          ))}
        </List>
      </Box>
      
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="white" p={4}>
          <ModalHeader color="green.700">Novo Animal</ModalHeader>
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
                <FormLabel>Espécie:</FormLabel>
                <Input 
                  value={novaEspecie} 
                  onChange={e => setNovaEspecie(e.target.value)} 
                />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Raça:</FormLabel>
                <Input 
                  value={novaRaca} 
                  onChange={e => setNovaRaca(e.target.value)} 
                />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Tutor:</FormLabel>
                <Select 
                  value={novoTutorId} 
                  onChange={e => setNovoTutorId(e.target.value)} 
                  required
                >
                  <option value="">Selecione o tutor</option>
                  {tutores.map(t => (
                    <option key={t.id} value={t.id}>{t.nome}</option>
                  ))}
                </Select>
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

export default ListaAnimaisComBusca;
