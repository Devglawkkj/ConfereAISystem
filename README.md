# ConfereAI - Sistema Inteligente de Presença de Alunos

ConfereAI é uma aplicação web inovadora que revoluciona a gestão de presença e o acompanhamento de alunos em ambientes educacionais. Utilizando tecnologias de ponta como biometria facial, inteligência artificial e análise de dados em tempo real, o sistema oferece uma solução completa para um ambiente de aprendizado mais seguro, engajado e perspicaz.

## ✨ Funcionalidades Principais

O sistema é dividido em módulos que atendem a diferentes necessidades da comunidade escolar:

-   **👤 Cadastro com Biometria Facial:**
    -   Administradores podem cadastrar alunos de forma rápida e segura.
    -   O sistema captura uma foto e extrai um mapa de pontos de referência faciais (biometria) usando MediaPipe, garantindo um identificador único e à prova de fraudes.

-   **📹 Registro de Ponto Inteligente:**
    -   Alunos registram sua entrada e saída simplesmente olhando para uma câmera.
    -   O reconhecimento facial ocorre em tempo real, comparando o rosto detectado com os dados biométricos armazenados no banco de dados.

-   **😊 Análise de Emoção com IA (Gemini):**
    -   No momento do registro de ponto, a IA do Google Gemini analisa as microexpressões faciais do aluno para inferir seu estado emocional (ex: Afeto Positivo, Tensão, Fadiga).
    -   Com base na emoção detectada, um **Índice de Engajamento** é calculado, fornecendo um dado valioso para os educadores.

-   **📊 Dashboard Interativo:**
    -   Uma visão centralizada com as métricas mais importantes: total de alunos, registros do dia e média de engajamento.
    -   Gráficos dinâmicos mostram o engajamento médio por turma e por disciplina, permitindo a identificação de tendências.
    -   Exibe uma lista com os últimos registros de ponto e os alunos cadastrados.

-   **🧠 Insights Gerados por IA (Gemini):**
    -   Com um clique, o sistema utiliza a IA do Gemini para analisar os dados do dashboard e gerar insights acionáveis sobre o comportamento da turma, como padrões de engajamento e possíveis pontos de atenção.

-   **👩‍🏫 Visão 360° do Aluno:**
    -   Um perfil detalhado para cada aluno, acessível a partir do dashboard.
    -   Combina histórico de presença, registros emocionais, notas e observações de psicopedagogos.
    -   Permite a geração de um **relatório holístico com IA**, que cruza todas as informações disponíveis para fornecer uma análise comportamental completa e recomendações para educadores.

-   **🔐 Controle de Acesso Baseado em Perfis:**
    -   **Administrador:** Acesso total ao sistema, incluindo cadastro de alunos.
    -   **Professor:** Focado no dashboard da turma e no registro de ponto.
    -   **Psicopedagogo:** Acesso aos perfis individuais dos alunos e à funcionalidade de adicionar observações.

-   **🔬 Demonstrações Tecnológicas:**
    -   **Demo Facial:** Isola a tecnologia de análise facial, mostrando em tempo real métricas como abertura da boca, elevação das sobrancelhas e dezenas de microexpressões (blendshapes).
    -   **Demo de Pose Corporal:** Utiliza o MediaPipe Pose para detectar e desenhar o esqueleto corporal de uma pessoa em tempo real, demonstrando o potencial de expansão da tecnologia.

## 🚀 Como Funciona?

O fluxo de dados e interação do sistema segue uma lógica integrada:

1.  **Cadastro (Admin):** O administrador utiliza a interface para preencher os dados do aluno. A câmera é ativada, uma foto é tirada e o MediaPipe processa a imagem para extrair os pontos de referência faciais. Esses dados são salvos no Firebase (informações no Cloud Firestore, foto no Firebase Storage).

2.  **Reconhecimento (Ponto):** Um aluno se posiciona em frente à câmera. O MediaPipe detecta o rosto e extrai a biometria em tempo real. O sistema compara essa biometria com as armazenadas no banco de dados usando um algoritmo de similaridade de cosseno.

3.  **Análise (IA):** Ao encontrar uma correspondência acima do limiar de confiança, os dados biométricos e de microexpressões são enviados para a API do Google Gemini. A IA retorna uma classificação da emoção predominante.

4.  **Registro (Banco de Dados):** O sistema cria um novo registro de presença no Cloud Firestore, contendo o ID do aluno, nome, tipo de registro (entrada/saída), a emoção detectada e o índice de engajamento calculado.

5.  **Visualização (Dashboard):** A interface do dashboard escuta as atualizações do Firestore em tempo real. Qualquer novo registro de ponto atualiza instantaneamente os gráficos, as listas e as métricas exibidas para os usuários autorizados.

## 🛠️ Tecnologias Utilizadas

-   **Frontend:** React com TypeScript
-   **Inteligência Artificial:** Google Gemini AI
-   **Visão Computacional:** Google MediaPipe (FaceLandmarker e PoseLandmarker)
-   **Backend & Banco de Dados:** Firebase (Cloud Firestore e Storage)
-   **Estilização:** TailwindCSS
-   **Gráficos:** Recharts
