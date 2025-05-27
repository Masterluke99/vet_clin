import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
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
} from '@chakra-ui/react';

interface Animal {
  id: string;
  nome: string;
  especie: string;
  raca: string;
  tutor: string;
  criadoEm?: any;
}

const ListaAnimais: React.FC = () => {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [carregando, setCarregando] = useState(true);  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Animal>>({});
  const [mensagem, setMensagem] = useState('');
    // Usando a mesma paleta de verdes do Dashboard
  const bgColor = 'green.100';       // Verde mais forte para o fundo
  const headerBgColor = 'green.200'; // Verde claro para o cabeçalho da tabela
  const borderColor = 'green.400';   // Verde para as bordas
  const successColor = 'green.500';  // Verde para mensagens de sucesso
  const errorColor = 'red.500';      // Vermelho para mensagens de erro
  
  const toast = useToast();

  const fetchAnimais = async () => {
    setCarregando(true);
    const querySnapshot = await getDocs(collection(db, 'animais'));
    const lista: Animal[] = [];
    querySnapshot.forEach((doc) => {
      lista.push({ id: doc.id, ...doc.data() } as Animal);
    });
    setAnimais(lista);
    setCarregando(false);
  };

  useEffect(() => {
    fetchAnimais();
  }, []);
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
  };
  const handleSalvarEdicao = async () => {
    if (!editandoId) return;
    try {
      await updateDoc(doc(db, 'animais', editandoId), {
        nome: editData.nome,
        especie: editData.especie,
        raca: editData.raca,
        tutor: editData.tutor,
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
  };
  const handleDetalhes = (animal: Animal) => {
    toast({
      title: `Detalhes de ${animal.nome}`,
      description: (
        <Box>
          <Text><strong>Espécie:</strong> {animal.especie}</Text>
          <Text><strong>Raça:</strong> {animal.raca}</Text>
          <Text><strong>Tutor:</strong> {animal.tutor}</Text>
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
      <Heading size="lg" mb="4" color="green.700">Animais Cadastrados</Heading>
      
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
        <Text>Carregando...</Text>
      ) : animais.length === 0 ? (
        <Text>Nenhum animal cadastrado.</Text>
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
                      </Td>
                      <Td borderColor={borderColor}>
                        <Input 
                          value={editData.tutor || ''} 
                          onChange={e => setEditData({ ...editData, tutor: e.target.value })}
                          size="sm"
                        />
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
                    <>
                      <Td borderColor={borderColor}>{animal.nome}</Td>
                      <Td borderColor={borderColor}>{animal.especie}</Td>
                      <Td borderColor={borderColor}>{animal.raca}</Td>
                      <Td borderColor={borderColor}>{animal.tutor}</Td>
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
