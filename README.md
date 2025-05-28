# Vet_Clin - Sistema de Gestão para Clínicas Veterinárias
# Acesse a versão atual do projeto em: https://github.com/Masterluke99/vet_clin

**Versão atual: 1.0.0**

Um sistema completo de gestão para clínicas veterinárias desenvolvido em React com TypeScript e integração com Firebase.

## Sobre o Projeto

Vet_Clin é uma aplicação web que permite gerenciar todos os aspectos de uma clínica veterinária, incluindo:

- Cadastro de animais e seus tutores
- Agendamento e registro de atendimentos
- Histórico médico dos pacientes
- Controle de produtos e estoque
- Registro de vendas
- Cadastro de serviços
- Gestão de funcionários

Este projeto foi criado com [Create React App](https://github.com/facebook/create-react-app).

## Configuração do Banco de Dados (Firebase)

O gerenciamento dos dados é feito pelo Firebase. Para configurar o projeto, siga os passos abaixo:

1. Crie uma conta no [Firebase](https://firebase.google.com/) se ainda não tiver
2. Acesse o [Console do Firebase](https://console.firebase.google.com/) e crie um novo projeto
3. No projeto criado, ative o serviço Firestore Database em "Build > Firestore Database"
4. Ative também o serviço Authentication em "Build > Authentication" se necessário
5. Vá para "Project Settings" (configurações do projeto) clicando na engrenagem
6. Em "Your apps", adicione um aplicativo da web (</> Web)
7. Registre seu aplicativo com um nome e copie as credenciais fornecidas
8. No projeto Vet_Clin, atualize o arquivo `src/firebaseConfig.ts` com as credenciais copiadas:

```typescript
// Substitua pelos dados do seu projeto Firebase
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX" // opcional
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const db = getFirestore(app);

export { db, database };
```

Após a configuração, o aplicativo criará e gerenciará os dados automaticamente, sem necessidade de criar tabelas manualmente.

Certifique-se de que as dependências do Firebase estão instaladas executando:

```bash
npm install firebase
```

## Tecnologias Utilizadas

- React
- TypeScript
- Firebase (Firestore)
- Chakra UI

## Comandos Disponíveis

Na pasta do projeto execute o comando:

### `npm start`

O app será executado no modo desenvolvedor.  
Abra [http://localhost:3000](http://localhost:3000) no navegador.

A página será recarregada automaticamente quando você fizer alterações no código.

### `npm test`

Inicia o executor de testes no modo interativo de observação.  
Veja mais sobre [execução de testes](https://facebook.github.io/create-react-app/docs/running-tests) para mais informações.

### `npm run build`

Compila o aplicativo para produção na pasta `build`.  
Empacota corretamente o React no modo de produção e otimiza a compilação para o melhor desempenho.

A compilação é minificada e os nomes dos arquivos incluem hashes.  
Seu aplicativo está pronto para ser implantado!

## Saiba Mais

Você pode aprender mais na [documentação do Create React App](https://facebook.github.io/create-react-app/docs/getting-started).

Para aprender React, consulte a [documentação do React](https://reactjs.org/).
