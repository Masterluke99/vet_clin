import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useToast,
  Badge,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useDisclosure
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

interface Tutor {
  id: string;
  nome: string;
  celular?: string;
  email?: string;
  endereco?: string;
  cep?: string;
  cidade?: string;
  criadoEm?: any;
}

interface Animal {
  id: string;
  nome: string;
  especie?: string;
  raca?: string;
  tutorId?: string;
  criadoEm?: any;
}

interface Props {
  onSelect?: (tutor: Tutor) => void;
  onAddNew?: () => void;
}

const ListaTutoresComBusca: React.FC<Props> = ({ onSelect }) => {
  const navigate = useNavigate();
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [animaisPorTutor, setAnimaisPorTutor] = useState<{ [tutorId: string]: Animal[] }>({});
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [foco, setFoco] = useState(false);
  const [tutorSelecionado, setTutorSelecionado] = useState<string | null>(null);
  const [selecionado, setSelecionado] = useState<Tutor | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novoCelular, setNovoCelular] = useState('');
  const [novoEndereco, setNovoEndereco] = useState('');
  const [novoCep, setNovoCep] = useState('');
  const [novaCidade, setNovaCidade] = useState('');
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

  // Buscar tutores e seus animais
  useEffect(() => {
    const fetchTutores = async () => {
      setCarregando(true);
      try {
        // Buscar todos os tutores
        const tutoresSnapshot = await getDocs(collection(db, 'tutores'));
        const tutoresLista = tutoresSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as Tutor));
        
        setTutores(tutoresLista);
        
        // Para cada tutor, buscar seus animais
        const animaisMap: { [tutorId: string]: Animal[] } = {};
        
        for (const tutor of tutoresLista) {
          const animaisSnapshot = await getDocs(
            query(collection(db, 'animais'), where('tutorId', '==', tutor.id))
          );
          
          animaisMap[tutor.id] = animaisSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Animal));
        }
        
        setAnimaisPorTutor(animaisMap);
        setCarregando(false);
      } catch (error) {
        console.error("Erro ao buscar tutores e animais:", error);
        toast({
          title: 'Erro ao carregar dados',
          description: 'Não foi possível carregar os tutores e seus animais',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
        setCarregando(false);
      }
    };
    
    fetchTutores();
  }, [toast, mensagem]);

  const tutoresFiltrados = busca
    ? tutores.filter(t => t.nome.toLowerCase().includes(busca.toLowerCase()))
    : tutores;

  const handleTutorClick = (tutorId: string) => {
    if (tutorSelecionado === tutorId) {
      setTutorSelecionado(null);  // Fechando se clicar no mesmo tutor novamente
    } else {
      setTutorSelecionado(tutorId);
    }
  };

  const handleVerDetalhes = (animalId: string) => {
    navigate(`/gerenciar-animais/${animalId}`);
  };

  const handleSelect = (tutor: Tutor) => {
    setSelecionado(tutor);
    setBusca(tutor.nome);
    setFoco(false);
    if (onSelect) onSelect(tutor);
  };

  const handleSalvarNovo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setMensagem('');
    try {
      await addDoc(collection(db, 'tutores'), {
        nome: novoNome,
        email: novoEmail,
        celular: novoCelular,
        endereco: novoEndereco,
        cep: novoCep,
        cidade: novaCidade,
        criadoEm: new Date()
      });
      setNovoNome('');
      setNovoEmail('');
      setNovoCelular('');
      setNovoEndereco('');
      setNovoCep('');
      setNovaCidade('');
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
  };

  return (
    <Container maxW="800px" mx="auto" mt="40px" p="6" bg={bgColor} borderRadius="lg" shadow="xl" boxShadow="0 5px 20px rgba(0,0,0,0.1)" position="relative">
      <Heading size="lg" mb="4" color="green.700">Tutores e Seus Animais</Heading>
      
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
          top="110px" 
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
            {tutoresFiltrados.map(tutor => (
              <ListItem
                key={tutor.id}
                onClick={() => handleSelect(tutor)}
                cursor="pointer"
                bg={selecionado?.id === tutor.id ? headerBgColor : 'white'}
                p={2}
                _hover={{ bg: 'green.50' }}
              >
                <Text>{tutor.nome} {tutor.email ? `(${tutor.email})` : ''}</Text>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      
      {carregando ? (
        <Text>Carregando tutores e animais...</Text>
      ) : tutoresFiltrados.length === 0 ? (
        <Text>Nenhum tutor encontrado.</Text>
      ) : (
        <Accordion allowToggle>
          {tutoresFiltrados.map(tutor => (
            <AccordionItem key={tutor.id} border="1px" borderColor={borderColor} borderRadius="md" mb={3}>
              <h2>
                <AccordionButton 
                  py={3}
                  _expanded={{ bg: 'green.100', color: 'green.700' }}
                  onClick={() => handleTutorClick(tutor.id)}
                >
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="bold">{tutor.nome}</Text>
                    <Text fontSize="sm" color="gray.600">{tutor.email} | {tutor.celular}</Text>
                  </Box>
                  <Badge colorScheme="green" mr={2}>
                    {animaisPorTutor[tutor.id]?.length || 0} Animais
                  </Badge>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} bg="white">
                <Box mb={3}>
                  <Text fontWeight="bold">Informações de Contato:</Text>
                  <Text>Email: {tutor.email || 'Não informado'}</Text>
                  <Text>Telefone: {tutor.celular || 'Não informado'}</Text>
                  <Text>Endereço: {tutor.endereco || 'Não informado'}</Text>
                  <Text>Cidade: {tutor.cidade || 'Não informada'} - CEP: {tutor.cep || 'Não informado'}</Text>
                </Box>
                
                <Divider my={3} />
                
                <Box>
                  <Text fontWeight="bold" mb={2}>Animais deste Tutor:</Text>
                  {!animaisPorTutor[tutor.id] || animaisPorTutor[tutor.id].length === 0 ? (
                    <Text color="gray.500">Este tutor não possui animais cadastrados.</Text>
                  ) : (
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Nome</Th>
                          <Th>Espécie</Th>
                          <Th>Raça</Th>
                          <Th>Ações</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {animaisPorTutor[tutor.id].map(animal => (
                          <Tr key={animal.id}>
                            <Td>{animal.nome}</Td>
                            <Td>{animal.especie || 'Não informada'}</Td>
                            <Td>{animal.raca || 'Não informada'}</Td>
                            <Td>
                              <Button
                                size="xs"
                                colorScheme="blue"
                                onClick={() => handleVerDetalhes(animal.id)}
                              >
                                Ver Detalhes
                              </Button>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  )}
                </Box>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      )}
      
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
                <FormLabel>Email:</FormLabel>
                <Input 
                  value={novoEmail} 
                  onChange={e => setNovoEmail(e.target.value)} 
                  type="email"
                />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Celular:</FormLabel>
                <Input 
                  value={novoCelular} 
                  onChange={e => setNovoCelular(e.target.value)} 
                />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Endereço:</FormLabel>
                <Input 
                  value={novoEndereco} 
                  onChange={e => setNovoEndereco(e.target.value)} 
                />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>CEP:</FormLabel>
                <Input 
                  value={novoCep} 
                  onChange={e => setNovoCep(e.target.value)} 
                />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Cidade:</FormLabel>
                <Input 
                  value={novaCidade} 
                  onChange={e => setNovaCidade(e.target.value)} 
                />
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
