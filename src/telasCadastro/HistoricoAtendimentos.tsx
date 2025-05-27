import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
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
  Stack
} from '@chakra-ui/react';

interface Animal {
  id: string;
  nome: string;
}


interface Atendimento {
  id: string;
  animal_id: string;
  servico_id: string;
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

  // Cores do tema verde
  const bgColor = 'green.50';
  const containerShadow = '0 5px 20px rgba(0,0,0,0.1)';
  const headerColor = 'green.700';
  const formBgColor = 'white';
  const tableHeaderBgColor = 'green.500';

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

  useEffect(() => {
    if (!animalId) {
      setAtendimentos([]);
      return;
    }
    const fetchAtendimentos = async () => {
      setCarregando(true);
      const q = query(collection(db, 'atendimentos'), where('animal_id', '==', animalId));
      const querySnapshot = await getDocs(q);
      setAtendimentos(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Atendimento)));
      setCarregando(false);
    };
    fetchAtendimentos();
  }, [animalId]);  return (
    <Container maxW="800px" mx="auto" mt="40px" p="6" bg={bgColor} borderRadius="lg" shadow="xl" boxShadow={containerShadow}>
      <Heading size="lg" mb="6" color={headerColor}>Histórico de Atendimentos</Heading>
      
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
                  </Tr>
                </Thead>
                <Tbody>
                  {atendimentos.map((at, index) => (
                    <Tr key={at.id} bg={index % 2 === 0 ? 'gray.50' : 'white'}>
                      <Td>{at.data}</Td>
                      <Td>{servicos[at.servico_id] || at.servico_id}</Td>
                      <Td>{at.observacoes}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          ) : null}
        </Stack>
      </Box>
    </Container>
  );
};

export default HistoricoAtendimentos;
