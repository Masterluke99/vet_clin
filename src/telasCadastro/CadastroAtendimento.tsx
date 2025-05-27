import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Alert,
  AlertTitle,
  AlertIcon,
  useToast,
  Textarea,
  Select
} from '@chakra-ui/react';

interface Animal {
  id: string;
  nome: string;
}

interface Servico {
  id: string;
  nome: string;
}

const CadastroAtendimento: React.FC = () => {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [animalId, setAnimalId] = useState('');
  const [servicoId, setServicoId] = useState('');
  const [data, setData] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [salvando, setSalvando] = useState(false);
  const toast = useToast();
  
  // Cores do tema verde
  const bgColor = 'green.50';
  const containerShadow = '0 5px 20px rgba(0,0,0,0.1)';
  const headerColor = 'green.700';
  const formBgColor = 'white';
  const buttonColorScheme = 'green';

  useEffect(() => {
    const fetchAnimais = async () => {
      const querySnapshot = await getDocs(collection(db, 'animais'));
      setAnimais(querySnapshot.docs.map(doc => ({ id: doc.id, nome: doc.data().nome })));
    };
    const fetchServicos = async () => {
      const querySnapshot = await getDocs(collection(db, 'servicos'));
      setServicos(querySnapshot.docs.map(doc => ({ id: doc.id, nome: doc.data().nome })));
    };
    fetchAnimais();
    fetchServicos();
  }, []);
  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setMensagem('');
    try {
      await addDoc(collection(db, 'atendimentos'), {
        animal_id: animalId,
        servico_id: servicoId,
        data,
        observacoes,
        criadoEm: new Date()
      });
      setAnimalId('');
      setServicoId('');
      setData('');
      setObservacoes('');
      setMensagem('Atendimento registrado com sucesso!');
      
      toast({
        title: 'Atendimento registrado',
        description: 'O atendimento foi registrado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } catch (error) {
      setMensagem('Erro ao registrar atendimento.');
      
      toast({
        title: 'Erro ao registrar',
        description: 'Ocorreu um erro ao registrar o atendimento',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    }
    setSalvando(false);
  };
  return (
    <Container maxW="500px" mx="auto" mt="40px" p="6" bg={bgColor} borderRadius="lg" shadow="xl" boxShadow={containerShadow}>
      <Heading size="lg" mb="6" color={headerColor}>Registrar Serviço Realizado</Heading>
      
      <Box bg={formBgColor} p={6} borderRadius="md" shadow="md">
        <form onSubmit={handleSalvar}>
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Animal</FormLabel>
              <Select 
                value={animalId} 
                onChange={e => setAnimalId(e.target.value)}
                placeholder="Selecione o animal"
                focusBorderColor="green.400"
              >
                {animais.map(a => (
                  <option key={a.id} value={a.id}>{a.nome}</option>
                ))}
              </Select>
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Serviço</FormLabel>
              <Select 
                value={servicoId} 
                onChange={e => setServicoId(e.target.value)}
                placeholder="Selecione o serviço"
                focusBorderColor="green.400"
              >
                {servicos.map(s => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </Select>
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Data</FormLabel>
              <Input 
                type="date" 
                value={data} 
                onChange={e => setData(e.target.value)}
                focusBorderColor="green.400" 
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Observações</FormLabel>
              <Textarea 
                value={observacoes} 
                onChange={e => setObservacoes(e.target.value)}
                focusBorderColor="green.400"
                rows={4}
              />
            </FormControl>
            
            <Button 
              mt={4}
              type="submit"
              isLoading={salvando}
              loadingText="Salvando"
              colorScheme={buttonColorScheme}
              size="lg"
              width="full"
              _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
              transition="all 0.2s"
            >
              Salvar
            </Button>          </Stack>
        </form>
        
        {mensagem && (
          <Alert 
            status={mensagem.includes('sucesso') ? 'success' : 'error'}
            mt={4}
            borderRadius="md"
            variant="left-accent"
            borderLeftColor={mensagem.includes('sucesso') ? 'green.400' : 'red.400'}
          >
            <AlertIcon />
            <AlertTitle>{mensagem}</AlertTitle>
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default CadastroAtendimento;
