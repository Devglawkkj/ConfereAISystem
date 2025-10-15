# ConfereAI - Sistema Inteligente de Presença de Alunos

Este é um sistema de controle de entrada e saída de alunos com biometria facial e análise de emoções em tempo real usando Gemini AI, Firebase (Cloud Firestore e Storage) e MediaPipe.

## Guia de Configuração do Projeto (Com um Novo Banco de Dados Firebase)

Siga estes passos para conectar o aplicativo a um novo projeto Firebase que você criou do zero.

### Passo 1: Criar um Projeto no Firebase

1.  Vá para o [Console do Firebase](https://console.firebase.google.com/).
2.  Clique em **"Adicionar projeto"** e siga as instruções para criar um novo projeto (ex: `confereai-novo`).

### Passo 2: Habilitar os Serviços do Firebase

Você precisa habilitar dois serviços principais: o banco de dados e o armazenamento de arquivos.

**A. Habilitar o Cloud Firestore (Banco de Dados):**
1.  No menu do seu novo projeto, vá em **Build > Cloud Firestore**.
2.  Clique em **"Criar banco de dados"**.
3.  Selecione **"Iniciar no modo de teste"**. Isso é crucial, pois define as regras de segurança iniciais para permitir a conexão durante o desenvolvimento.
4.  Escolha uma localização para o servidor (ex: `southamerica-east1` para São Paulo) e clique em **"Ativar"**.

**B. Habilitar o Firebase Storage (Armazenamento de Fotos):**
1.  No menu do projeto, vá em **Build > Storage**.
2.  Clique em **"Primeiros passos"**.
3.  Aceite as regras de segurança padrão (elas também usarão o modo de teste).
4.  Selecione a mesma localização que você escolheu para o Firestore e clique em **"Concluir"**.

### Passo 3: Obter a Configuração do Firebase para seu Aplicativo Web

1.  No menu, clique no ícone de **engrenagem** ⚙️ ao lado de "Visão geral do projeto" e selecione **"Configurações do projeto"**.
2.  Na aba "Geral", role para baixo até a seção **"Seus apps"**.
3.  Clique no ícone **`</>`** para adicionar um aplicativo Web.
4.  Dê um apelido ao seu aplicativo (ex: "ConfereAI Web") e clique em **"Registrar app"**.
5.  O Firebase exibirá um objeto de configuração chamado `firebaseConfig`. **Copie este objeto inteiro.**

### Passo 4: Adicionar a Configuração ao Código do Aplicativo

1.  No código do projeto, abra o arquivo: `hooks/useFirestore.ts`.
2.  Você encontrará um "molde" de configuração no topo do arquivo.
3.  **Cole o seu objeto `firebaseConfig`** que você copiou no passo anterior, substituindo completamente o molde.

### Passo 5: Verificação Final das Regras de Segurança

Embora o modo de teste configure regras abertas, é sempre bom garantir que elas estão corretas.

**A. Regras do Firestore:**
- Vá para **Build > Cloud Firestore > Regras**.
- Garanta que a regra seja: `allow read, write: if true;`.

**B. Regras do Storage:**
- Vá para **Build > Storage > Regras**.
- Garanta que a regra seja: `allow read, write: if true;`.

> **Aviso de Segurança:** Essas regras abertas são **apenas para desenvolvimento**. Antes de lançar o aplicativo em um ambiente de produção, você precisará criar regras mais seguras para proteger os dados.

### Passo 6: Tudo Pronto!

Seu aplicativo agora está totalmente configurado e conectado ao seu novo banco de dados Firebase. Você pode iniciar o aplicativo, cadastrar alunos e ver os dados aparecendo no seu console Firebase.
