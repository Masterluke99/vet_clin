import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
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
  AlertIcon,
  AlertTitle,
  useToast
} from '@chakra-ui/react';

const CadastroFuncionario: React.FC = () => {
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [cargo, setCargo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [salvando, setSalvando] = useState(false);
  const toast = useToast();
  
  // Cores do tema verde
  const bgColor = 'green.50';
  const containerShadow = '0 5px 20px rgba(0,0,0,0.1)';
  const headerColor = 'green.700';
  const formBgColor = 'white';
  const buttonColorScheme = 'green';  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setMensagem('');
    try {
      await addDoc(collection(db, 'funcionarios'), {
        nome,
        idade: idade ? Number(idade) : null,
        cargo,
        criadoEm: new Date()
      });
      setNome('');
      setIdade('');
      setCargo('');
      setMensagem('Funcionário cadastrado com sucesso!');
      
      toast({
        title: 'Funcionário cadastrado',
        description: 'O funcionário foi cadastrado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } catch (error) {
      setMensagem('Erro ao cadastrar funcionário.');
      
      toast({
        title: 'Erro ao cadastrar',
        description: 'Ocorreu um erro ao cadastrar o funcionário',
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
      <Heading size="lg" mb="6" color={headerColor}>Cadastro de Funcionário</Heading>
      
      <Box bg={formBgColor} p={6} borderRadius="md" shadow="md">
        <form onSubmit={handleSalvar}>
          <Stack spacing={4}>
            <FormControl id="nome" isRequired>
              <FormLabel>Nome</FormLabel>
              <Input 
                value={nome} 
                onChange={e => setNome(e.target.value)} 
                placeholder="Nome do funcionário"
                focusBorderColor="green.400"
              />
            </FormControl>
            
            <FormControl id="idade">
              <FormLabel>Idade</FormLabel>
              <Input 
                type="number" 
                value={idade} 
                onChange={e => setIdade(e.target.value)}
                placeholder="Idade do funcionário" 
                focusBorderColor="green.400"
              />
            </FormControl>
            
            <FormControl id="cargo">
              <FormLabel>Cargo</FormLabel>
              <Input 
                value={cargo} 
                onChange={e => setCargo(e.target.value)}
                placeholder="Cargo do funcionário" 
                focusBorderColor="green.400"
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
            </Button>
          </Stack>
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

export default CadastroFuncionario;
