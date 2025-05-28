import React, { useEffect, useState, useCallback } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Input,
  Text,
  useToast,
  Flex,
  Container,
  Badge,
} from '@chakra-ui/react';

interface Animal {
  id: string;
  nome: string;
  especie: string;
  raca: string;
  tutor?: string;   // Nome do tutor (exibição)
  tutorId?: string; // ID do tutor (referência)
  criadoEm?: any;
}

const ListaAnimais: React.FC = () => {  // Obter o parâmetro animalId da URL
  const { animalId } = useParams<{ animalId?: string }>();
  const navigate = useNavigate();
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [carregando, setCarregando] = useState(true);  
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Animal>>({});
  const [mensagem, setMensagem] = useState('');
    // Usando a mesma paleta de verdes do Dashboard
  const bgColor = 'green.100';       // Verde mais forte para o fundo
  const headerBgColor = 'green.200'; // Verde claro para o cabeçalho da tabela
  const borderColor = 'green.400';   // Verde para as bordas
  const successColor = 'green.500';  // Verde para mensagens de sucesso
  const errorColor = 'red.500';      // Vermelho para mensagens de erro
    const toast = useToast();
  
  const fetchAnimais = useCallback(async () => {
    setCarregando(true);
    
    // Primeiro, buscar todos os tutores para ter um mapa de IDs para nomes
    const tutoresQuerySnapshot = await getDocs(collection(db, 'tutores'));
    const tutoresMap = new Map<string, string>();
    tutoresQuerySnapshot.forEach((doc) => {
      tutoresMap.set(doc.id, doc.data().nome);
    });
    
    // Agora buscar os animais
    const querySnapshot = await getDocs(collection(db, 'animais'));
    const lista: Animal[] = [];
    querySnapshot.forEach((doc) => {
      const animalData = doc.data();
      // Para cada animal, adicionar o nome do tutor baseado no tutorId
      const tutorNome = animalData.tutorId ? tutoresMap.get(animalData.tutorId) || 'Tutor não encontrado' : 'Sem tutor';
      lista.push({ 
        id: doc.id, 
        ...animalData, 
        tutor: tutorNome 
      } as Animal);
    });    
    setAnimais(lista);
    setCarregando(false);
    
    // Informar ao usuário que os dados foram carregados com sucesso
    if (lista.length > 0) {
      toast({
        title: 'Dados carregados',
        description: `${lista.length} animais encontrados`,
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top',
      });
    }
  }, [toast]);
  
  useEffect(() => {
    fetchAnimais();
    
    // Se temos um animalId como parâmetro, vamos procurar esse animal e iniciar a edição
    if (animalId) {
      const getAnimalById = async () => {
        try {          const docRef = doc(db, 'animais', animalId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const animalData = docSnap.data();
            
            // Se tem um tutorId, vamos buscar o nome do tutor
            let tutorNome = 'Sem tutor';
            if (animalData.tutorId) {
              const tutorDocRef = doc(db, 'tutores', animalData.tutorId);
              const tutorDocSnap = await getDoc(tutorDocRef);
              if (tutorDocSnap.exists()) {
                tutorNome = tutorDocSnap.data().nome;
              } else {
                tutorNome = 'Tutor não encontrado';
              }
            }
            
            const animalCompleto = { 
              id: docSnap.id, 
              ...animalData, 
              tutor: tutorNome 
            } as Animal;
            
            handleEditar(animalCompleto);
          } else {
            toast({
              title: 'Animal não encontrado',
              description: 'O animal solicitado não foi encontrado',
              status: 'error',
              duration: 3000,
              isClosable: true,
              position: 'top',
            });
          }
        } catch (error) {
          toast({
            title: 'Erro ao carregar',
            description: 'Não foi possível carregar os dados do animal',
            status: 'error',
            duration: 3000,
            isClosable: true,
            position: 'top',
          });
        }
      };
      
      getAnimalById();
    }
  }, [animalId, toast, fetchAnimais]);
  const handleExcluir = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este animal?')) {
      try {
        await deleteDoc(doc(db, 'animais', id));
        setMensagem('Animal excluído com sucesso!');
        toast({
          title: 'Animal excluído',
          description: 'O animal foi removido com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
        fetchAnimais();
      } catch (error) {
        toast({
          title: 'Erro ao excluir',
          description: 'Ocorreu um erro ao excluir o animal',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
      }
    }
  };

  const handleEditar = (animal: Animal) => {
    setEditandoId(animal.id);
    setEditData({ ...animal });
    setMensagem('');
  };  const handleSalvarEdicao = async () => {
    if (!editandoId) return;
    try {
      await updateDoc(doc(db, 'animais', editandoId), {
        nome: editData.nome,
        especie: editData.especie,
        raca: editData.raca,
        // Não atualizamos o campo tutor aqui, pois a relação não deve ser alterada nesta tela
      });
      setEditandoId(null);
      setEditData({});
      setMensagem('Animal editado com sucesso!');
      toast({
        title: 'Animal atualizado',
        description: 'As informações do animal foram atualizadas com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      fetchAnimais();
    } catch (error) {
      toast({
        title: 'Erro ao editar',
        description: 'Ocorreu um erro ao atualizar o animal',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  const handleCancelarEdicao = () => {
    setEditandoId(null);
    setEditData({});
  };  const handleDetalhes = (animal: Animal) => {
    toast({
      title: `Detalhes de ${animal.nome}`,
      description: (
        <Box>
          <Text><strong>Espécie:</strong> {animal.especie}</Text>
          <Text><strong>Raça:</strong> {animal.raca}</Text>
          <Text><strong>Tutor:</strong> {animal.tutor || 'Não especificado'}</Text>
          <Text><strong>ID do Tutor:</strong> {animal.tutorId || 'Não especificado'}</Text>
          {animal.criadoEm && (
            <Text>
              <strong>Cadastrado em:</strong> {new Date(animal.criadoEm.toDate()).toLocaleDateString('pt-BR')}
            </Text>
          )}
        </Box>
      ),
      status: 'info',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });
  };  return (
    <Container maxW="800px" mx="auto" mt="40px" p="6" bg={bgColor} borderRadius="lg" shadow="xl" boxShadow="0 5px 20px rgba(0,0,0,0.1)">
      <Flex justifyContent="space-between" alignItems="center" mb="4">
        <Heading size="lg" color="green.700">Animais Cadastrados</Heading>
        <Button
          onClick={() => navigate('/animais')}
          variant="outline"
          colorScheme="green"
          size="sm"
        >
          Voltar para Busca
        </Button>
      </Flex>
      
      {mensagem && (
        <Text 
          color={mensagem.includes('sucesso') ? successColor : errorColor} 
          mb="4" 
          fontWeight="medium"
        >
          {mensagem}
        </Text>
      )}
        {carregando ? (
        <Text p={4} textAlign="center" fontStyle="italic">Carregando lista de animais e tutores...</Text>
      ) : animais.length === 0 ? (
        <Text p={4} textAlign="center">Nenhum animal cadastrado no sistema.</Text>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple" width="100%">
            <Thead>
              <Tr bg={headerBgColor}>
                <Th borderColor={borderColor}>Nome</Th>
                <Th borderColor={borderColor}>Espécie</Th>
                <Th borderColor={borderColor}>Raça</Th>
                <Th borderColor={borderColor}>Tutor</Th>
                <Th borderColor={borderColor}>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {animais.map(animal => (
                <Tr key={animal.id}>
                  {editandoId === animal.id ? (
                    <>
                      <Td borderColor={borderColor}>
                        <Input 
                          value={editData.nome || ''} 
                          onChange={e => setEditData({ ...editData, nome: e.target.value })}
                          size="sm"
                        />
                      </Td>
                      <Td borderColor={borderColor}>
                        <Input 
                          value={editData.especie || ''} 
                          onChange={e => setEditData({ ...editData, especie: e.target.value })}
                          size="sm"
                        />
                      </Td>
                      <Td borderColor={borderColor}>
                        <Input 
                          value={editData.raca || ''} 
                          onChange={e => setEditData({ ...editData, raca: e.target.value })}
                          size="sm"
                        />
                      </Td>                      <Td borderColor={borderColor}>
                        {/* Campo tutor não é editável, apenas exibe o valor atual */}
                        <Text>{editData.tutor || ''}</Text>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Button 
                          onClick={handleSalvarEdicao} 
                          colorScheme="green" 
                          size="sm" 
                          mr="2"
                        >
                          Salvar
                        </Button>
                        <Button 
                          onClick={handleCancelarEdicao}
                          variant="outline"
                          colorScheme="red"
                          size="sm"
                        >
                          Cancelar
                        </Button>
                      </Td>
                    </>
                  ) : (
                    <>                      <Td borderColor={borderColor}>
                        <Text fontWeight="bold">{animal.nome}</Text>
                      </Td>
                      <Td borderColor={borderColor}>{animal.especie || 'Não informada'}</Td>
                      <Td borderColor={borderColor}>{animal.raca || 'Não informada'}</Td>
                      <Td borderColor={borderColor}>
                        <Text fontWeight="medium" color={animal.tutor ? 'green.600' : 'gray.500'}>
                          {animal.tutor || 'Sem tutor'}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Flex>
                          <Button 
                            onClick={() => handleEditar(animal)} 
                            colorScheme="green" 
                            size="sm" 
                            mr="2"
                          >
                            Editar
                          </Button>
                          <Button 
                            onClick={() => handleExcluir(animal.id)} 
                            colorScheme="red" 
                            size="sm" 
                            mr="2"
                          >
                            Excluir
                          </Button>
                          <Button 
                            onClick={() => handleDetalhes(animal)}
                            colorScheme="blue"
                            size="sm"
                          >
                            Detalhes
                          </Button>
                        </Flex>
                      </Td>
                    </>
                  )}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Container>
  );
};

export default ListaAnimais;
