import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { Link as RouterLink } from 'react-router-dom';
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
  Textarea,
  Flex
} from '@chakra-ui/react';

const CadastroProduto: React.FC = () => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [quantidade, setQuantidade] = useState('');
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
      await addDoc(collection(db, 'produtos'), {
        nome,
        descricao,
        preco: preco ? Number(preco) : null,
        quantidade: quantidade ? Number(quantidade) : null,
        criadoEm: new Date()
      });
      setNome('');
      setDescricao('');
      setPreco('');
      setQuantidade('');
      setMensagem('Produto cadastrado com sucesso!');
      
      toast({
        title: 'Produto cadastrado',
        description: 'O produto foi cadastrado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } catch (error) {
      setMensagem('Erro ao cadastrar produto.');
      
      toast({
        title: 'Erro ao cadastrar',
        description: 'Ocorreu um erro ao cadastrar o produto',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    }
    setSalvando(false);
  };  return (
    <Container maxW="500px" mx="auto" mt="40px" p="6" bg={bgColor} borderRadius="lg" shadow="xl" boxShadow={containerShadow}>      <Flex justifyContent="space-between" alignItems="center" mb="6">
        <Heading size="lg" color={headerColor}>Cadastro de Produto</Heading>
        <RouterLink to="/produtos">
          <Button variant="outline" colorScheme={buttonColorScheme} size="sm">
            ← Voltar para lista
          </Button>
        </RouterLink>
      </Flex>
      
      <Box bg={formBgColor} p={6} borderRadius="md" shadow="md">
        <form onSubmit={handleSalvar}>
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Nome do Produto</FormLabel>
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
              <FormLabel>Preço (R$)</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" color="gray.300" children="R$" />
                <NumberInput min={0} width="100%">
                  <NumberInputField
                    value={preco}
                    onChange={e => setPreco(e.target.value)}
                    pl="8"
                    _focus={{ borderColor: "green.400" }}
                  />
                </NumberInput>
              </InputGroup>
            </FormControl>
            
            <FormControl>
              <FormLabel>Quantidade</FormLabel>
              <NumberInput min={0} width="100%">
                <NumberInputField
                  value={quantidade}
                  onChange={e => setQuantidade(e.target.value)}
                />
              </NumberInput>
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

export default CadastroProduto;
