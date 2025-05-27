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
  InputGroup,
  InputLeftElement,
  Textarea
} from '@chakra-ui/react';

const CadastroServico: React.FC = () => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState('');
  const [valor, setValor] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
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
      await addDoc(collection(db, 'servicos'), {
        nome,
        descricao,
        tipo,
        valor: valor ? Number(valor) : null,
        criadoEm: new Date()
      });
      setNome('');
      setDescricao('');
      setTipo('');
      setValor('');
      setMensagem('Serviço cadastrado com sucesso!');
      
      toast({
        title: 'Serviço cadastrado',
        description: 'O serviço foi cadastrado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } catch (error) {
      setMensagem('Erro ao cadastrar serviço.');
      
      toast({
        title: 'Erro ao cadastrar',
        description: 'Ocorreu um erro ao cadastrar o serviço',
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
      <Heading size="lg" mb="6" color={headerColor}>Cadastro de Serviço</Heading>
      
      <Box bg={formBgColor} p={6} borderRadius="md" shadow="md">
        <form onSubmit={handleSalvar}>
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Nome do Serviço</FormLabel>
              <Input 
                value={nome} 
                onChange={e => setNome(e.target.value)}
                focusBorderColor="green.400" 
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Descrição</FormLabel>
              <Textarea 
                value={descricao} 
                onChange={e => setDescricao(e.target.value)}
                focusBorderColor="green.400"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Tipo</FormLabel>
              <Input 
                value={tipo} 
                onChange={e => setTipo(e.target.value)}
                placeholder="Ex: Consulta, Exame, Cirurgia"
                focusBorderColor="green.400"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Valor (R$)</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" color="gray.300" children="R$" />
                <NumberInput min={0} width="100%">
                  <NumberInputField
                    value={valor}
                    onChange={e => setValor(e.target.value)}
                    pl="8"
                  />
                </NumberInput>
              </InputGroup>
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

export default CadastroServico;
