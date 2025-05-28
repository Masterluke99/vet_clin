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
  AlertTitle,
  AlertIcon,
  useToast,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react';

const CadastroTutor: React.FC = () => {
  const [nome, setNome] = useState('');
  
  const [celular, setCelular] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState(''); 
  const [cep, setCep] = useState('');
  const [cidade, setCidade] = useState('');
  

  const [mensagem, setMensagem] = useState('');
  const [salvando, setSalvando] = useState(false);
  const toast = useToast();
  
  // Cores do tema verde
  const bgColor = 'green.50';
  const containerShadow = '0 5px 20px rgba(0,0,0,0.1)';
  const headerColor = 'green.700';
  const formBgColor = 'white';
  const buttonColorScheme = 'green';
  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setMensagem('');
    try {
      await addDoc(collection(db, 'tutores'), {
        nome,
        email,
        endereco,
        cep,
        cidade,       
        celular,
        criadoEm: new Date()
      });
      setNome('');
      
      setMensagem('Tutor cadastrado com sucesso!');
      
      toast({
        title: 'Tutor cadastrado',
        description: 'O tutor foi cadastrado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
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
    <Container 
      maxW="500px" 
      mx="auto" 
      mt="40px" 
      p="6" 
      bg={bgColor} 
      borderRadius="lg" 
      shadow="xl" 
      boxShadow={containerShadow}
    >
      <Heading size="lg" mb="6" color={headerColor}>Cadastro de Tutor/Cliente</Heading>
      
      <Box bg={formBgColor} p={6} borderRadius="md" shadow="md">
        <form onSubmit={handleSalvar}>
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Nome</FormLabel>
              <Input 
                value={nome} 
                onChange={e => setNome(e.target.value)} 
                focusBorderColor="green.400"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Celular</FormLabel>
              <Input
                value={celular}   
                onChange={e => setCelular(e.target.value)}
                focusBorderColor="green.400"
                placeholder="(00) 00000-0000"
                type="tel"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                value={email}
                onChange={e => setEmail(e.target.value)}
                focusBorderColor="green.400"
                type="email"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Endereço</FormLabel>
              <Input
                value={endereco}
                onChange={e => setEndereco(e.target.value)}
                focusBorderColor="green.400"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>CEP</FormLabel>
              <Input
                value={cep}
                onChange={e => setCep(e.target.value)}
                focusBorderColor="green.400"
                placeholder="00000-000"
                type="text"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Cidade</FormLabel>
              <Input
                value={cidade}
                onChange={e => setCidade(e.target.value)}
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
          </Stack>
        </form>
      </Box>
    </Container>
  );
};

export default CadastroTutor;
