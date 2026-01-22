# 🛰️ GS Alerta Desastres - Projeto MetaMind

## Nosso projeto online em VPS Hostimger: http://31.97.64.208/

<p align="center">
  <a href="https://youtu.be/j_qpO5N5fVY" target="_blank">
    <img src="https://img.shields.io/badge/Nossa%20Apresentação-%20%E2%96%B6%EF%B8%8F-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="Vídeo de Apresentação">
  </a>
</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Global Solution FIAP](https://img.shields.io/badge/Global%20Solution-FIAP%202025-blue)](https://www.fiap.com.br/graduacao/global-solution/)

**Bem-vindo ao GS Alerta Desastres!** Uma aplicação full-stack robusta e interativa, projetada para monitorar eventos de desastres naturais em tempo real, fornecer informações cruciais e permitir o disparo de alertas para usuários cadastrados. Este projeto foi desenvolvido com dedicação pela equipe **MetaMind** para a Global Solution 2025 (1º Semestre) da FIAP.

---

## 🧭 Sumário (Navegação Interna)

- [🛰️ GS Alerta Desastres - Projeto MetaMind](#️-gs-alerta-desastres---projeto-metamind)
  - [🧭 Sumário (Navegação Interna)](#-sumário-navegação-interna)
  - [1. Sobre o Projeto](#1-sobre-o-projeto)
    - [1.1. O Problema](#11-o-problema)
    - [1.2. Nossa Solução](#12-nossa-solução)
    - [1.3. Objetivos](#13-objetivos)
  - [2. ✨ Funcionalidades Implementadas](#2--funcionalidades-implementadas)
  - [3. 🛠️ Tecnologias Utilizadas](#3-️-tecnologias-utilizadas)
    - [3.1. Backend (Java \& Spring Ecosystem)](#31-backend-java--spring-ecosystem)
    - [3.2. Frontend (Next.js \& React Ecosystem)](#32-frontend-nextjs--react-ecosystem)
    - [3.3. Banco de Dados](#33-banco-de-dados)
  - [4. 🏗️ Arquitetura da Solução](#4-️-arquitetura-da-solução)
  - [5. 🚀 Como Executar o Projeto](#5--como-executar-o-projeto)
    - [5.1. Pré-requisitos](#51-pré-requisitos)
    - [5.2. Configuração do Backend](#52-configuração-do-backend)
    - [5.3. Configuração do Frontend](#53-configuração-do-frontend)
  - [6. 🔗 Endpoints da API](#6--endpoints-da-api)
  - [7. 🗺️ Manual de Funcionamento e Navegação no Frontend](#7-️-manual-de-funcionamento-e-navegação-no-frontend)
    - [7.1. Visão Geral da Interface](#71-visão-geral-da-interface)
    - [7.2. Página Inicial (`/`)](#72-página-inicial-)
    - [7.3. Seção de Usuários (`/clientes/...`)](#73-seção-de-usuários-clientes)
    - [7.4. Seção de Desastres EONET (`/desastres/...`)](#74-seção-de-desastres-eonet-desastres)
      - [7.4.1. Aba: Sincronizar NASA (Dentro do Painel EONET em `/desastres`)](#741-aba-sincronizar-nasa-dentro-do-painel-eonet-em-desastres)
      - [7.4.2. Aba: Eventos Locais (Dentro do Painel EONET em `/desastres`)](#742-aba-eventos-locais-dentro-do-painel-eonet-em-desastres)
      - [7.4.3. Aba: Buscar Próximos (Eventos NASA) (Dentro do Painel EONET em `/desastres`)](#743-aba-buscar-próximos-eventos-nasa-dentro-do-painel-eonet-em-desastres)
      - [7.4.4. Aba: Alertar Usuário (Dentro do Painel EONET em `/desastres`)](#744-aba-alertar-usuário-dentro-do-painel-eonet-em-desastres)
      - [7.4.5. Página: Mapa por Usuário (`/desastres/mapa`)](#745-página-mapa-por-usuário-desastresmapa)
      - [7.4.6. Página: Mapa Atuais/Por Data (NASA) (`/desastres/mapa-atuais`)](#746-página-mapa-atuaispor-data-nasa-desastresmapa-atuais)
      - [7.4.7. Página: Mapa Histórico (`/desastres/mapa-historico`)](#747-página-mapa-histórico-desastresmapa-historico)
      - [7.4.8. Página: Estatísticas de Desastres (`/desastres/estatisticas`)](#748-página-estatísticas-de-desastres-desastresestatisticas)
    - [7.5. Página Fale Conosco (`/contato`)](#75-página-fale-conosco-contato)
  - [8. 📂 Estrutura Simplificada do Projeto](#8--estrutura-simplificada-do-projeto)
    - [8.1. Backend (`gsapi/` - Java Spring)](#81-backend-gsapi---java-spring)


---

## 1. Sobre o Projeto

### 1.1. O Problema
Desastres naturais representam uma ameaça crescente e constante para comunidades em todo o mundo. A falta de informação centralizada, alertas ágeis e ferramentas de fácil acesso para o público geral e para gestores de crise pode agravar os impactos desses eventos, resultando em perdas de vidas e danos materiais significativos.

### 1.2. Nossa Solução
O **GS Alerta Desastres** surge como uma resposta tecnológica a este desafio. Nossa plataforma visa:
* **Centralizar informações:** Agregando dados de eventos de desastres naturais da API EONET (Earth Observatory Natural Event Tracker) da NASA.
* **Facilitar o acesso:** Através de uma interface web intuitiva, os usuários podem se cadastrar, visualizar eventos em mapas e consultar estatísticas.
* **Alertas Direcionados:** Implementa um sistema para o disparo de notificações (configurado para e-mail via Spring Mail, com infraestrutura para expansão) para usuários específicos sobre eventos relevantes próximos à sua localização ou de interesse.
* **Promover a prevenção:** Ao disponibilizar dados históricos e atuais, buscamos auxiliar na conscientização e no planejamento para mitigação de riscos.
* **Informação Contínua:** Exibe um feed de notícias recentes sobre desastres na página inicial para manter os usuários atualizados.

### 1.3. Objetivos
* Desenvolver uma aplicação full-stack funcional e escalável com backend Java Spring e frontend Next.js.
* Integrar com sucesso a API EONET da NASA para obtenção de dados sobre desastres e a API ReliefWeb (ou similar) para notícias.
* Permitir o cadastro e gerenciamento de **Usuários**.
* Apresentar os dados de forma clara e útil, utilizando mapas interativos (Leaflet) com **opção de visualização de ruas ou satélite**, e múltiplos formatos de gráficos estatísticos (Chart.js).
* Implementar um sistema de alerta por e-mail.
* Fornecer uma seção de **notícias dinâmicas sobre desastres** na página principal.

---

## 2. ✨ Funcionalidades Implementadas

O sistema evoluiu e agora conta com:

* 👥 **Gerenciamento de Usuários:**
    * CRUD completo para usuários, incluindo dados pessoais, de contato e múltiplos endereços.
    * Busca de usuários por ID ou Documento (CPF/CNPJ) com feedback visual aprimorado e funcional.
    * Interface administrativa para listar, visualizar detalhes, atualizar, pesquisar e remover usuários do sistema.
    * Validações de dados para garantir a integridade das informações.

* 🌋 **Painel de Desastres EONET (Aba Principal `/desastres`):**
    * **Sincronizar NASA:** Formulário para buscar e salvar/atualizar eventos da API EONET da NASA no banco local, com filtros por limite, dias, status e fonte.
    * **Eventos Locais:**
        * Listagem paginada de eventos EONET sincronizados no banco de dados local.
        * Cada evento listado exibe um **mini-mapa interativo** ao lado de suas informações, mostrando a localização do evento.
        * Os mini-mapas, assim como os mapas principais, possuem um **seletor para alternar entre visualização de ruas e imagens de satélite**.
        * Efeito visual de "levantar" ao passar o mouse sobre os itens da lista para melhor interatividade.
    * **Buscar Próximos (Eventos NASA):**
        * Formulário para buscar eventos diretamente da API EONET da NASA com base em coordenadas geográficas (obtidas por ID de usuário ou inseridas manualmente) ou por período.
        * Exibição do nome do usuário para confirmação.
        * Disparo de alerta contextual por e-mail se um ID de usuário foi utilizado.
        * Resultados exibidos em cards, cada um com informações do evento e um **mini-mapa interativo** com opção de ruas/satélite.
        * Efeito visual de "levantar" ao passar o mouse sobre os cards.
    * **Alertar Usuário:**
        * Interface para administradores dispararem manualmente um alerta para um usuário sobre um evento específico (previamente sincronizado).
        * Funcionalidade de verificação de dados do usuário e do evento antes do envio.

* 🗺️ **Visualização em Mapas Interativos (Leaflet):**
    * **Seletor de Camada Base:** Todos os mapas principais e mini-mapas agora incluem um controle que permite ao usuário alternar entre a visualização de mapa de ruas (OpenStreetMap) e imagens de satélite (ESRI World Imagery).
    * **Mapa por Usuário (`/desastres/mapa`):** Permite buscar por ID de usuário e exibe no mapa principal eventos da NASA EONET próximos à localização daquele usuário, com opção de camada de ruas/satélite.
    * **Mapa Atuais/Por Data (NASA) (`/desastres/mapa-atuais`):** Exibe no mapa principal o evento global mais recente da NASA ou eventos filtrados por data, com detalhes do evento e opção de camada de ruas/satélite.
    * **Mapa Histórico (`/desastres/mapa-historico`):** Nova página que permite filtrar eventos históricos da API da NASA por período e tipo de desastre (em português), exibindo-os no mapa principal com opção de camada de ruas/satélite.

* 📊 **Estatísticas de Desastres (Chart.js) (`/desastres/estatisticas`):**
    * Apresentação de dados consolidados sobre os eventos EONET locais.
    * Variedade de Gráficos e filtro de período expansivo.

* 📰 **Página Inicial (`/`):**
    * **Feed de Notícias de Desastres:** Um carrossel horizontal exibe as últimas notícias e alertas sobre desastres globais (obtidas da ReliefWeb API), com imagens, títulos, fontes, datas e links para os artigos completos.

* 📞 **Página de Contato (`/contato`):**
    * Apresentação da equipe MetaMind, formulário de contato simulado e mapa da FIAP.

* 🏠 **Navegação e Interface:**
    * Navegação principal e sub-navegação claras.
    * Uso de Material Icons para melhor identificação visual.

---

## 3. 🛠️ Tecnologias Utilizadas

### 3.1. Backend (Java & Spring Ecosystem)
<p>
  <img src="https://img.shields.io/badge/Java-17+-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 17+" />
  <img src="https://img.shields.io/badge/Spring%20Boot-3.X-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot 3+" />
  <img src="https://img.shields.io/badge/Spring%20Web%20(MVC)-6DB33F?style=for-the-badge&logo=spring&logoColor=white" alt="Spring MVC" />
  <img src="https://img.shields.io/badge/Spring%20Data%20JPA-6DB33F?style=for-the-badge&logo=spring&logoColor=white" alt="Spring Data JPA" />
  <img src="https://img.shields.io/badge/Hibernate-59666C?style=for-the-badge&logo=hibernate&logoColor=white" alt="Hibernate" />
  <img src="https://img.shields.io/badge/MapStruct-FF5A00?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCIgd2lkdGg9IjQ4cHgiIGhlaWdodD0iNDhweCI+PHBhdGggZmlsbD0iI2ZmNWEwMCIgZD0iTTM2LjgzLDkuMTdMMjQuMDUsMi40MWMtMC40My0wLjI0LTAuOTUtMC4yNC0xLjM4LDBMMTAuMTcsOS4xN2MtMC40MywwLjI0LTAuNjksMC43MS0wLjY5LDEuMjF2MjUuMjNjMCwwLjUsMC4yNiwuOTcsMC42OSwxLjIxbDEyLjU4LDYuNzVjMC4yMSwwLjExLDAuNDUsMC4xNywwLjY5LDAuMTZjMC4yNCwwLDAuNDgtMC4wNSwwLjY5LTAuMTZsMTIuNTgtNi43NWMwLjQzLTAuMjMsMC42OS0wLjcxLDAuNjktMS4yMVYxMC4zOEMzNy41Miw5Ljg4LDM3LjI2LDkuNDEsMzYuODMsOS4xN3oiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMjMuMzMsMTkuMDVsLTUuNjQtMy4xOGwtMi4xMywxLjM0bDcuNzcsNC41MnYxMS4xMWwxMS4zLTUuNjVWMTYuMTFsLTExLjMsNS42NFYxOS4wNXogTTI4LjM2LDExLjY5djMuMTFsNS42My0zLjE0TDMyLjg4LDExLjVsLTQuNTIsMi41M1YxMS42OXogTTIwLjkyLDExLjY5djIuNTJsLTQuNTItMi41MkwxNS4yNywxMS41bDQuNTIsMy4xNFYxMS42OXoiLz48L3N2Zz4=" alt="MapStruct" />
  <img src="https://img.shields.io/badge/Jackson-E64A19?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0cHgiIGhlaWdodD0iMjRweCI+PHBhdGggZmlsbD0iI0U2NEEwMCIgZD0iTTEyIDJDNi40OCA1IDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTBzMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4eiIvPjxwYXRoIGZpbGw9IiNGRkYiIGQ9Ik0xMiA2Yy0zLjMyIDAtNiAyLjY4LTYgNnMxLjc5IDQuNTcgNC4yNiA1LjQ5bDEuNDItMS40MmMtMS41MS0uNjYtMi42OC0yLjA3LTIuNjgtMy45N2MwLTIuNzYgMi4yNC01IDUtNWMxLjM4IDAgMi42My41NiAzLjUyIDEuNDZsMS40MS0xLjQxQzE2LjU4IDYuNzkgMTQuMzggNiAxMiA2eiIvPjwvc3ZnPg==" alt="Jackson" />
  <img src="https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" alt="Swagger (OpenAPI)" />
  <img src="https://img.shields.io/badge/RestTemplate-6DB33F?style=for-the-badge&logo=spring&logoColor=white" alt="RestTemplate" />
  <img src="https://img.shields.io/badge/SLF4J%20(Logback)-007ACC?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0cHgiIGhlaWdodD0iMjRweCI+PHBhdGggZmlsbD0iIzAwN0FDQyIgZD0iTTEyIDBDNS4zNzMgMCAwIDUuMzczIDAgMTJzNS4zNzMgMTIgMTIgMTIgMTItNS4zNzMgMTItMTJTMTguNjI3IDAgMTIgMHptMCAyMWMtNC45NjIgMC05LTQuMDM4LTktOXM0LjAzOC05IDktOSA5IDQuMDM4IDkgOS00LjAzOCA5LTkgOXoiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJtMTIgNy40Yy0uODYgMC0xLjU4LjQ3LTEuOTcgMS4xOWwtLjAyLjA0Yy0uMDkuMjEtLjE1LjgxLS4xNSAxLjAydjAuMDljMCAuMy4wMy41Ny4wOC44MWgwYy4wNC4yMS4xMi40LjIxLjU3bC4wMi4wM2MuNTcuNzUgMS4zIDEuMiAyLjExIDEuMmgwYzEuMSAwIDEuOTktLjgyIDIuMTYtMS44OWwtLjAyLS4wM2MuMDQtLjE5LjA2LS40LjA2LS42MXYtLjA3YzAtLjQ0LS4xMS0uODItLjMxLTEuMTNsLS4wMi0uMDNjLS40Mi0uNTktMS4wMi0uOTYtMS42Ni0uOTZ6bS4xMyAzLjk3aDBjLS4zMiAwLS41OS0uMTYtLjc3LS40MWwtLjAxLS4wMWMtLjA0LS4wNy0uMDctLjE1LS4wOS0uMjN2LS4wMWMtLjAyLS4wNi0uMDMtLjE0LS4wMy0uMjF2LS4wMWMwLS4wOSAwLS4xOC4wMS0uMjZsLjAxLS4wNGMwLS4wMi4wMS0uMDMuMDEtLjA0di0uMDJjLjE5LS40Ny41My0uNzguOTMtLjc4aDBjLjU0IDAgLjk4LjM2IDEuMDkuODVsLjAxLjAzYy4wNC4xLjA3LjIxLjA4LjMybDAgLjA0YzAgLjExLS4wMS4yMi0uMDMuMzNsMCAuMDJjLS4xNi42LS42MS45Ny0xLjEyLjk3eiIvPjwvc3ZnPg==" alt="SLF4J (Logback)" />
  <img src="https://img.shields.io/badge/Jakarta%20Validation-6DB33F?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgZm9jdXNhYmxlPSJmYWxzZSIgZGF0YS1wcmVmaXg9ImZhciIgZGF0YS1pY29uPSJjaGVjay1jaXJjbGUiIHJvbGU9ImltZyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgY2xhc3M9InN2Zy1pbmxpbmUtLWZhIGZhLWNoZWNrLWNpcmNsZSBmYS13LTE2IGZhLWxnIj48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0yNTYgOEMxMTkuMCA4IDggMTE5LjAgOCAyNTZzMTExLjAgMjQ4IDI0OCAyNDggMjQ4LTExMSAyNDgtMjQ4UzM5My4wIDggMjU2IDh6bTAgNDQ4Yy0xMTAuNSAwLTIwMC04OS41LTIwMC0yMDJzODkuNS0yMDAgMjAwLTIwMCAyMDAgODkuNSAyMDAgMjAwLTg5LjIgMjAwLTIwMCAyMDB6bTE1NC44LTEyNC44bC0uMS4xYy00LjctNC43LTEyLjMtNC43LTE3IDBsLTg4LjggODguOC0zMi4zLTMyLjNjLTQuNy00LjctMTIuMy00LjctMTcgMC00LjcgNC43LTQuNyAxMi4zIDAgMTdsNDkuMyA0OS4zYy0uMS4xLjEgLjEuMi4yLjEtLjMuMy0uMy4zLS40YzQuNy00LjcgMTIuMy00LjcgMTcgMGwxMDMuOC0xMDMuOGM0LjctNC43IDQuNy0xMi4zLS4xLTE3eiIvPjwvcGF0aD48L3N2Zz4=" alt="Jakarta Validation" />
  <img src="https://img.shields.io/badge/Lombok-E0263B?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4Ij48cGF0aCBmaWxsPSIjRTAyNjNCIiBkPSJNMTUuNSA5LjVsLTQuMiAyLjUgMS40IDQgNC4yLTIuNS0xLjQtNHptMTcgMGwtMS40IDQgNC4yIDIuNSAxLjQtNC00LjItMi41ek05LjIgMTguMWwxLjQgNC4xIDIuOS0xLjcgMS40LTQuMS01LjctMi41em0yOC4xIDBsMi45IDEuNyAxLjQtNC4xLTUuNyAyLjUgMS40IDQuMXpNMjQgMzBsMy41LTIuMS0xLjQtMy45LTMuNSAyLjF6TTIxLjUgMjRsMS40LTMuOSAzLjUgMi4xLTEuNCAzLjl6Ii8+PHBhdGggZmlsbD0iI0ZGRiIgZD0iTTI0IDRMMTEuMiAxMS41djI1TDQgMjAuOHY2LjRsNy4yIDYuOCAxMy4xIDcuNyA2LjYtMy44IDMuNC0xLjktMy4xLTYuMkwzOC44IDI0bC0xLjgtMy4xLTguMy00LjgtNS43LTkuMXpNMTQgMTMuNWw1LjMgMy4xIDQuNy0yLjgtMTAuMi01Ljl6bTIwIDBsNC43IDIuOC0xMC4yIDUuOS0xLjgtMS4xIDcuMy00LjV6TTE2LjUgMjFsNy41IDQuMyAwLjUgNS44LTcuNS00LjQtMC41LTUuN3ptMTUgMGwwLjUgNS43LTcuNSA0LjQtMC41LTUuOCAyLjgtMS42em0tNy41IDExLjVsNC44LTIuOC0xLjQtMy45LTQuOCAyLjh6Ii8+PC9zdmc+" alt="Lombok" />
  <img src="https://img.shields.io/badge/Spring%20Mail-6DB33F?style=for-the-badge&logo=spring&logoColor=white" alt="Spring Mail" />
</p>

### 3.2. Frontend (Next.js & React Ecosystem)
<p>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18+" />
  <img src="https://img.shields.io/badge/Next.js-14+-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 14+" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3 Global" />
  <img src="https://img.shields.io/badge/Leaflet-1EB300?style=for-the-badge&logo=leaflet&logoColor=white" alt="Leaflet.js" />
  <img src="https://img.shields.io/badge/React%20Leaflet-1EB300?style=for-the-badge&logo=leaflet&logoColor=white" alt="React-Leaflet" />
  <img src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chart.js&logoColor=white" alt="Chart.js" />
  <img src="https://img.shields.io/badge/React%20Chartjs%202-FF6384?style=for-the-badge&logo=chart.js&logoColor=white" alt="React-Chartjs-2" />
  <img src="https://img.shields.io/badge/React%20Slick-007ACC?style=for-the-badge&logo=react&logoColor=white" alt="React Slick" />
  <img src="https://img.shields.io/badge/Lucide%20React-007ACC?style=for-the-badge&logo=lucide&logoColor=white" alt="Lucide React Icons" />
  <img src="https://img.shields.io/badge/React%20Icons-E91E63?style=for-the-badge&logo=react-icons&logoColor=white" alt="React Icons" />
</p>

### 3.3. Banco de Dados
<p>
  <img src="https://img.shields.io/badge/Oracle-F80000?style=for-the-badge&logo=oracle&logoColor=white" alt="Oracle Database" />
</p>

---

## 4. 🏗️ Arquitetura da Solução
O projeto segue uma arquitetura cliente-servidor:
* **Servidor (Backend):** A API RESTful desenvolvida com Java Spring Boot atua como o servidor. Ele é responsável por toda a lógica de negócios, processamento de dados, interações com o banco de dados Oracle e comunicação com as APIs externas (NASA EONET, ViaCEP, Google Geocoding). Ele expõe endpoints seguros e bem definidos para o frontend consumir.
* **Cliente (Frontend):** A aplicação desenvolvida com Next.js e React atua como o cliente. Ela consome os dados da API backend para renderizar as interfaces de usuário e, para a seção de notícias, consome diretamente a API ReliefWeb. A navegação é gerenciada pelo App Router do Next.js.

---

## 5. 🚀 Como Executar o Projeto
### 5.1. Pré-requisitos
* ☕ Java JDK 17 ou superior
* 📦 Apache Maven 3.8+
* <img src="https://img.shields.io/badge/Node.js-18.17+-339933?style=flat&logo=nodedotjs" alt="Node.js" /> Node.js v18.17+ (ou a LTS mais recente)
* 🗃️ Instância do Oracle Database configurada e acessível.
* 🐙 Git

### 5.2. Configuração do Backend
1.  Clone o repositório: `git clone https://github.com/carmipa/GS_FIAP_2025_1SM.git`
2.  Navegue para a pasta do backend Java: `cd GS_FIAP_2025_1SM/Java_Advanced` (ou o caminho correto).
3.  **Banco de Dados:**
    * Garanta que o Oracle esteja rodando.
    * Crie o usuário/schema e execute o script DDL fornecido.
    * Configure `src/main/resources/application.properties` com suas credenciais do Oracle.
    * **Para envio de e-mail:** Configure as propriedades `spring.mail.*` (use senhas de aplicativo para Gmail com 2FA).
4.  Compile e execute: `mvn spring-boot:run`
    * API: `http://localhost:8080`
    * Swagger UI: `http://localhost:8080/swagger-ui.html`

### 5.3. Configuração do Frontend
1.  Navegue para a pasta do frontend.
2.  Instale dependências: `npm install` (ou `yarn install`). **Certifique-se de ter instalado `react-slick` e `slick-carousel`**:
    ```bash
    npm install react-slick slick-carousel
    # ou
    yarn add react-slick slick-carousel
    ```
3.  **Variável de Ambiente:** Crie `.env.local` na raiz do frontend:
    ```
    NEXT_PUBLIC_API_URL=http://localhost:8080/api
    ```
4.  **Imagens da Equipe:** Em `public/fotos-equipe/`.
5.  Execute: `npm run dev`
    * Aplicação: `http://localhost:3000`

---

## 6. 🔗 Endpoints da API
Acesse a documentação interativa completa via **Swagger UI** quando o backend estiver rodando:
[`http://localhost:8080/swagger-ui.html`](http://localhost:8080/swagger-ui.html)

Principais grupos de endpoints:
* `/api/clientes`, `/api/contatos`, `/api/enderecos`: Gerenciamento de dados de usuários.
* `/api/eonet`: Operações com eventos EONET (sincronização, busca local, busca na API da NASA por proximidade, categoria ou data).
* `/api/stats`: Estatísticas de eventos EONET.
* `/api/alerts`: Disparo de alertas para usuários.

---

## 7. 🗺️ Manual de Funcionamento e Navegação no Frontend

### 7.1. Visão Geral da Interface
Navegação superior persistente e sub-navegação interna nas seções principais.

### 7.2. Página Inicial (`/`)
* **Acesso:** `http://localhost:3000`.
* **Conteúdo:**
    * Introdução ao projeto.
    * **Feed de Notícias de Desastres:** Carrossel horizontal com as últimas notícias e alertas globais sobre desastres (da ReliefWeb API), incluindo imagens, títulos, fontes, datas e links.
    * Cards de acesso rápido às funcionalidades.
    * Links para GitHub e Global Solution.

### 7.3. Seção de Usuários (`/clientes/...`)
* **Acesso:** Link "Usuários".
* **Sub-Navegação:** Listar, Cadastrar, Buscar, Detalhes, Alterar, Deletar.

### 7.4. Seção de Desastres EONET (`/desastres/...`)
* **Acesso:** Link "Desastres EONET".
* **Sub-Navegação (Layout):** "Painel EONET", "Mapa por Usuário", "Mapa Atuais (NASA)", "Mapa Histórico", "Estatísticas".

#### 7.4.1. Aba: Sincronizar NASA (Dentro do Painel EONET em `/desastres`)
* **Funcionalidade:** Busca e salva eventos da API EONET da NASA no banco local.
* **Uso:** Filtros para limite, dias, status, fonte.

#### 7.4.2. Aba: Eventos Locais (Dentro do Painel EONET em `/desastres`)
* **Funcionalidade:** Lista eventos EONET do banco local.
* **Uso:**
    * Visualização paginada de eventos.
    * Cada evento é exibido com suas informações e um **mini-mapa interativo** ao lado, mostrando a localização.
    * Os mini-mapas possuem **seletor para alternar entre visualização de ruas e satélite**.
    * Efeito visual de "levantar" ao passar o mouse sobre os itens.

#### 7.4.3. Aba: Buscar Próximos (Eventos NASA) (Dentro do Painel EONET em `/desastres`)
* **Funcionalidade:** Busca eventos na API da NASA por proximidade ou período e pode disparar alerta contextual.
* **Uso:**
    * Busca por ID de usuário ou coordenadas manuais/raio.
    * Exibe nome do usuário.
    * Dispara alerta por e-mail.
    * Resultados em cards com informações e **mini-mapa interativo** (com seletor ruas/satélite).
    * Efeito de "levantar" ao passar o mouse.

#### 7.4.4. Aba: Alertar Usuário (Dentro do Painel EONET em `/desastres`)
* **Funcionalidade:** Permite a um administrador disparar manualmente um alerta.
* **Uso:** Inserir IDs, verificar dados, enviar alerta.

#### 7.4.5. Página: Mapa por Usuário (`/desastres/mapa`)
* **Acesso:** Pela sub-navegação.
* **Funcionalidade:** Busca por ID de usuário e exibe no mapa principal eventos da NASA EONET próximos à localização do usuário.
* O mapa principal possui **seletor para alternar entre camadas de ruas e satélite**.

#### 7.4.6. Página: Mapa Atuais/Por Data (NASA) (`/desastres/mapa-atuais`)
* **Acesso:** Pela sub-navegação.
* **Funcionalidade:** Exibe no mapa principal o evento global mais recente ou eventos filtrados por data da API da NASA.
* O mapa principal possui **seletor para alternar entre camadas de ruas e satélite**.

#### 7.4.7. Página: Mapa Histórico (`/desastres/mapa-historico`)
* **Acesso:** Nova página pela sub-navegação.
* **Funcionalidade:** Filtra eventos históricos da API da NASA por período e tipo de desastre (em português).
* Eventos filtrados exibidos no mapa principal, com **seletor de camada ruas/satélite**.

#### 7.4.8. Página: Estatísticas de Desastres (`/desastres/estatisticas`)
* **Acesso:** Pela sub-navegação.
* **Funcionalidade:** Gráficos variados sobre eventos locais, com filtro de período.

### 7.5. Página Fale Conosco (`/contato`)
* **Acesso:** Link "Fale Conosco".
* **Conteúdo:** Informações da equipe, formulário, mapa da FIAP.

---

## 8. 📂 Estrutura Simplificada do Projeto
### 8.1. Backend (`gsapi/` - Java Spring)
