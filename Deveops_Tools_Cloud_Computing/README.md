# ☁️ **DevOps Tools & Cloud Computing**

## Nosso projeto online em VPS Hostimger: http://31.97.64.208/

## 🔶 **Objetivos:**
Sua equipe DevOps deverá conteinerizar a API desenvolvida na disciplina de JAVA ADVANCED ou de ADVANCED BUSINESS DEVELOPMENT WITH .NET, utilizando Dockerfile e seguindo as boas práticas de infraestrutura como código.

## 🔧 **Requisitos:**
- Montar um ambiente com pelo menos dois containers Docker integrados, sendo:
- 1 Container para rodar a Aplicação: projeto em Java ou .NET.
- 2 Container do Banco de Dados: escolha livre entre Oracle, PostgreSQL, MySQL, MongoDB etc. (desde que seja em container para persistência dos dados).

## ATENÇÃO: Não será aceito o Banco H2 na escolha

## 2 Regras para os Containers
- Deve ser construído via Dockerfile! (obrigatório gerar sua imagem personalizada)
- Executar com usuário não root (definir o nome no Dockerfile – escolha livre).
- Definir um diretório de trabalho (definir no Dockerfile – nomeação livre).
- Usar pelo menos uma variável de ambiente.
- Expor uma porta para acesso à aplicação.
- A aplicação deve conter um CRUD completo (Create, Read, Update, Delete) e persistir os dados em uma tabela/coleção no Container de Banco.
- Pode ser uma API ou aplicação Web. 

## Container do Banco de Dados: 
- Pode usar uma imagem pública e ser executado sem Dockerfile, direto via docker run.
- -Deve conter:
- Volume nomeado ou anônimo para persistência.
- Pelo menos uma variável de ambiente
- Porta exposta para acesso externo ao Banco.
- Não será aceito o Banco H2 na entrega

# ATEÇÃO: Utilizar imagens oficiais do Docker Hub ou da Oracle Container Registry (https://container-registry.oracle.com) 

## 2.1 Regras para os Containers (Gerais)
- Ambos os containers devem ser executados em modo background (Segundo Plano).
- Exibir os logs de ambos os containers no terminal após a execução.
- Evidências obrigatórias via terminal (não usar interface gráfica do Docker Desktop).

## 3.1 Repositório no GitHub (obrigatório)
- Repositório com tudo que é necessário para rodar o projeto:
- Código-fonte da aplicação.
- Arquivos Dockerfile.
- Scripts ou JSONs usados nos testes do CRUD (no caso de APIs).
- Sem os arquivos Código Fonte e Dockerfile, o projeto não será avaliado

## 3.2 Vídeo Demonstrativo (obrigatório)
- O funcionamento completo da aplicação, desde o funcionamento do APP e a persistência de dados, mostrando:
- Execução de todas as operações do CRUD
- A persistência no banco de dados após cada operação.
- O vídeo deve conter:
- Explicação em voz ou legenda clara de cada passo.
- Boa qualidade visual e sonora (mínimo 740p).
- o Pode usar ferramentas como OBS, Clipchamp, etc

## Atenção! 
- A pontuação será baseada na completude e qualidade da entrega. Serão considerados: o uso correto do projeto de uma das disciplinas, a execução completa do CRUD, a apresentação das evidências no banco de dados, o cumprimento das regras técnicas solicitadas e a clareza do vídeo 

## 4. PONTUAÇÃO
- demonstrativo — com explicações por voz ou legenda sobre cada etapa apresentada.- Não serão aceitas entregas com código incompleto, sem Dockerfile ou sem vídeo explicativo.- O uso de Interface gráfica (Docker Desktop) para evidências não será aceito.

## 4.1 - Conteinerização de JAVA ADVANCED ou de ADVANCED BUSINESS DEVELOPMENT WITH .NET utilizando um banco de dados conteinerizado. (até 80 pontos) 

## 4.2 - Projeto completo no GitHub. (até 20 pontos)
- Siga todas as etapas e boas práticas. 
- Organização e clareza contam pontos!
- Boa atividade!


### 📂 **Link do Repositório:**  
[![Azure Docs](https://img.shields.io/badge/Azure%20CLI-Dockerfile%20%26%20Scripts-blue?style=flat-square&logo=microsoftazure)](https://docs.microsoft.com/en-us/azure/devops/)

[![GitHub](https://img.shields.io/badge/GitHub-Repositório-blue?style=flat-square&logo=github)](https://github.com/carmipa/GS_FIAP_2025_1SM/tree/main/Deveops_Tools_Cloud_Computing)



## 🎨 **Tecnologias Utilizadas:**
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker)
![Azure](https://img.shields.io/badge/Azure-0089D6?style=flat-square&logo=microsoftazure)
![Azure CLI](https://img.shields.io/badge/Azure%20CLI-0078D4?style=flat-square&logo=powershell)
