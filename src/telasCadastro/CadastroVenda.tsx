import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Stack,
  Alert,
  AlertIcon,
  AlertTitle,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  InputGroup,
  InputLeftElement,
  useToast
} from '@chakra-ui/react';

const CadastroVenda: React.FC = () => {
  const [produto, setProduto] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [data, setData] = useState('');
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
      await addDoc(collection(db, 'vendas'), {
        produto,
        quantidade: quantidade ? Number(quantidade) : null,
        valorTotal: valorTotal ? Number(valorTotal) : null,
        data,
        criadoEm: new Date()
      });
      setProduto('');
      setQuantidade('');
      setValorTotal('');
      setData('');
      setMensagem('Venda registrada com sucesso!');
      
      toast({
        title: 'Venda registrada',
        description: 'A venda foi registrada com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } catch (error) {
      setMensagem('Erro ao registrar venda.');
      
      toast({
        title: 'Erro ao registrar',
        description: 'Ocorreu um erro ao registrar a venda',
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
      <Heading size="lg" mb="6" color={headerColor} textAlign="center">Cadastro de Venda</Heading>
      
      <Box bg={formBgColor} p={6} borderRadius="md" shadow="md">
        <form onSubmit={handleSalvar}>
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Produto</FormLabel>
              <Input 
                value={produto} 
                onChange={e => setProduto(e.target.value)} 
                placeholder="Nome do produto"
                focusBorderColor="green.400"
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Quantidade</FormLabel>
              <NumberInput min={0} width="100%">
                <NumberInputField
                  value={quantidade}
                  onChange={e => setQuantidade(e.target.value)}
                  placeholder="Quantidade vendida"
                  _focus={{ borderColor: "green.400" }}
                />
              </NumberInput>
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Valor Total (R$)</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" color="gray.300" children="R$" />
                <NumberInput min={0} width="100%">
                  <NumberInputField
                    value={valorTotal}
                    onChange={e => setValorTotal(e.target.value)}
                    _focus={{ borderColor: "green.400" }}
                    pl="8"
                    placeholder="0,00"
                  />
                </NumberInput>
              </InputGroup>
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

export default CadastroVenda;
