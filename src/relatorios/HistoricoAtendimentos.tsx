import React, { useEffect, useState, useCallback } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import {
  Box,
  Container,
  Heading,
  FormControl,
  FormLabel,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Spinner,
  Stack,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Textarea,
  Input,
  useDisclosure,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay
} from '@chakra-ui/react';

interface Animal {
  id: string;
  nome: string;
}

interface Atendimento {
  id: string;
  animal_id: string;
  servico_id?: string; // Mantido para compatibilidade com registros antigos
  servicos_ids?: string[]; // Nova estrutura para múltiplos serviços
  data: string;
  observacoes: string;
  criadoEm?: any;
}

const HistoricoAtendimentos: React.FC = () => {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [animalId, setAnimalId] = useState('');
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [servicos, setServicos] = useState<{[id: string]: string}>({});
  const [carregando, setCarregando] = useState(false);
    // Estados para a edição de atendimento
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [atendimentoEmEdicao, setAtendimentoEmEdicao] = useState<Atendimento | null>(null);
  const [editData, setEditData] = useState('');
  const [editServicosIds, setEditServicosIds] = useState<string[]>([]);
  const [editObservacoes, setEditObservacoes] = useState('');
  const [salvando, setSalvando] = useState(false);
  
  // Estados para confirmação de exclusão
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  
  const toast = useToast();
  // Cores do tema verde
  const bgColor = 'green.50';
  const containerShadow = '0 5px 20px rgba(0,0,0,0.1)';
  const headerColor = 'green.700';
  const formBgColor = 'white';
  const tableHeaderBgColor = 'green.500';
  const buttonColorScheme = 'green'; // Verde para botões
  useEffect(() => {
    const fetchAnimais = async () => {
      const querySnapshot = await getDocs(collection(db, 'animais'));
      setAnimais(querySnapshot.docs.map(doc => ({ id: doc.id, nome: doc.data().nome })));
    };
    const fetchServicos = async () => {
      const querySnapshot = await getDocs(collection(db, 'servicos'));
      const map: {[id: string]: string} = {};
      querySnapshot.forEach(doc => { map[doc.id] = doc.data().nome; });
      setServicos(map);
    };
    fetchAnimais();
    fetchServicos();
  }, []);
  
  const fetchAtendimentos = useCallback(async () => {
    if (!animalId) return;
    
    setCarregando(true);
    const q = query(collection(db, 'atendimentos'), where('animal_id', '==', animalId));
    const querySnapshot = await getDocs(q);
    setAtendimentos(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Atendimento)));
    setCarregando(false);
  }, [animalId]);

  useEffect(() => {
    if (!animalId) {
      setAtendimentos([]);
      return;
    }
    fetchAtendimentos();
  }, [animalId, fetchAtendimentos]);
    const handleEdit = (atendimento: Atendimento) => {
    setAtendimentoEmEdicao(atendimento);
    setEditData(atendimento.data);
    
    // Tratamento para compatibilidade com registros antigos e novos
    if (atendimento.servicos_ids && atendimento.servicos_ids.length > 0) {
      setEditServicosIds(atendimento.servicos_ids);
    } else if (atendimento.servico_id) {
      setEditServicosIds([atendimento.servico_id]);
    } else {
      setEditServicosIds([]);
    }
    
    setEditObservacoes(atendimento.observacoes);
    onOpen();
  };
    const handleSalvarEdicao = async () => {
    if (!atendimentoEmEdicao) return;
    
    setSalvando(true);
    try {
      const atendimentoRef = doc(db, 'atendimentos', atendimentoEmEdicao.id);
      await updateDoc(atendimentoRef, {
        data: editData,
        servicos_ids: editServicosIds,
        observacoes: editObservacoes
      });
      
      toast({
        title: 'Atendimento atualizado',
        description: 'O atendimento foi atualizado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      
      onClose();
      fetchAtendimentos(); // Recarregar a lista de atendimentos
    } catch (error) {
      toast({
        title: 'Erro ao atualizar',
        description: 'Ocorreu um erro ao atualizar o atendimento',
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
  
  const handleDeleteAtendimento = async () => {
    if (!atendimentoEmEdicao) return;
    
    try {
      await deleteDoc(doc(db, 'atendimentos', atendimentoEmEdicao.id));
      
      toast({
        title: 'Atendimento excluído',
        description: 'O atendimento foi excluído com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
        setIsDeleteDialogOpen(false);
      
      // Fechar o modal apenas se estiver aberto
      if (isOpen) {
        onClose();
      }
      
      fetchAtendimentos(); // Recarregar a lista de atendimentos
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Ocorreu um erro ao excluir o atendimento',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  return (
    <Container maxW="800px" mx="auto" mt="40px" p="6" bg={bgColor} borderRadius="lg" shadow="xl" boxShadow={containerShadow}>
      <Heading size="lg" mb="6" color={headerColor}>Atendimentos</Heading>
      
      <Box bg={formBgColor} p={6} borderRadius="md" shadow="md">
        <Stack spacing={6}>
          <FormControl mb={4}>
            <FormLabel fontWeight="500">Selecione o animal:</FormLabel>
            <Select 
              value={animalId} 
              onChange={e => setAnimalId(e.target.value)} 
              placeholder="Selecione"
              focusBorderColor="green.400"
            >
              {animais.map(a => (
                <option key={a.id} value={a.id}>{a.nome}</option>
              ))}
            </Select>
          </FormControl>
          
          {carregando ? (
            <Box textAlign="center" py={6}>
              <Spinner size="lg" color="green.500" thickness="3px" />
              <Text mt={3}>Carregando...</Text>
            </Box>
          ) : animalId && atendimentos.length === 0 ? (
            <Box p={5} textAlign="center" bg="gray.50" borderRadius="md">
              <Text>Nenhum atendimento encontrado para este animal.</Text>
            </Box>
          ) : atendimentos.length > 0 ? (
            <Box overflowX="auto" shadow="sm" borderRadius="md">
              <Table variant="simple" w="100%">
                <Thead>
                  <Tr bg={tableHeaderBgColor}>
                    <Th color="white">Data</Th>
                    <Th color="white">Serviço</Th>
                    <Th color="white">Observações</Th>
                    <Th color="white" textAlign="center">Ações</Th>
                  </Tr>
                </Thead>
                <Tbody>                  {atendimentos.map((at, index) => (
                    <Tr key={at.id} bg={index % 2 === 0 ? 'gray.50' : 'white'}>
                      <Td>{at.data}</Td>
                      <Td>
                        {at.servicos_ids ? (
                          <Stack spacing={1}>
                            {at.servicos_ids.map(sid => (
                              <Text key={sid}>{servicos[sid] || sid}</Text>
                            ))}
                          </Stack>
                        ) : (
                          servicos[at.servico_id || ''] || at.servico_id
                        )}
                      </Td>
                      <Td>{at.observacoes}</Td>                      <Td textAlign="center">
                        <Stack direction="row" spacing={2} justify="center">
                          <Button
                            size="sm"
                            colorScheme="green"
                            onClick={() => handleEdit(at)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="outline"
                            onClick={() => {
                              setAtendimentoEmEdicao(at);
                              openDeleteConfirmation();
                            }}
                          >
                            Excluir
                          </Button>
                        </Stack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          ) : null}
        </Stack>
      </Box>
      
      {/* Modal para editar atendimento */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="white" p={4}>
          <ModalHeader color="green.700">Editar Atendimento</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3} isRequired>
              <FormLabel>Data:</FormLabel>
              <Input 
                type="date"
                value={editData} 
                onChange={e => setEditData(e.target.value)} 
                required 
              />
            </FormControl>
              <FormControl mb={3} isRequired>
              <FormLabel>Serviços:</FormLabel>
              <Stack spacing={2} border="1px solid" borderColor="gray.200" borderRadius="md" p={3} maxH="200px" overflowY="auto">
                {Object.entries(servicos).map(([id, nome]) => (
                  <Box key={id} display="flex" alignItems="center">
                    <input
                      type="checkbox"
                      id={`edit-servico-${id}`}
                      checked={editServicosIds.includes(id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditServicosIds([...editServicosIds, id]);
                        } else {
                          setEditServicosIds(editServicosIds.filter(sid => sid !== id));
                        }
                      }}
                      style={{ marginRight: '8px' }}
                    />
                    <label htmlFor={`edit-servico-${id}`}>{nome}</label>
                  </Box>
                ))}
              </Stack>
              {editServicosIds.length === 0 && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  Selecione pelo menos um serviço
                </Text>
              )}
            </FormControl>
            
            <FormControl mb={3}>
              <FormLabel>Observações:</FormLabel>
              <Textarea 
                value={editObservacoes} 
                onChange={e => setEditObservacoes(e.target.value)} 
              />
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
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSalvarEdicao}
                isLoading={salvando}
                loadingText="Salvando" 
                colorScheme={buttonColorScheme}
              >
                Salvar
              </Button>
            </ModalFooter>
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
              Excluir Atendimento
            </AlertDialogHeader>            <AlertDialogBody>
              {atendimentoEmEdicao && (
                <>
                  <Text mb={2}>
                    Tem certeza que deseja excluir o atendimento de {atendimentoEmEdicao.data}?
                  </Text>
                  <Text fontWeight="bold" mb={2}>
                    Serviços: {
                      atendimentoEmEdicao.servicos_ids 
                      ? atendimentoEmEdicao.servicos_ids.map(sid => servicos[sid]).join(", ")
                      : servicos[atendimentoEmEdicao.servico_id || ""]
                    }
                  </Text>
                  <Text>Esta ação não pode ser desfeita.</Text>
                </>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleDeleteAtendimento} ml={3}>
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};

export default HistoricoAtendimentos;
