# 💾 **Mastering Relational and Non-Relational Database**

## Nosso projeto online em VPS Hostimger: http://31.97.64.208/

<p align="center">
  <a href="https://www.youtube.com/watch?v=j_qpO5N5fVY" target="_blank">
    <img src="https://img.shields.io/badge/Nossa%20Apresenta%C3%A7%C3%A3o-%20%E2%96%B6%EF%B8%8F-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="Vídeo de Apresentação">
  </a>
</p>

**Bem-vindo ao GS Alerta Desastres!**
Uma aplicação full-stack robusta e interativa, projetada para monitorar eventos de desastres naturais em tempo real, fornecer informações cruciais e permitir o disparo de alertas para usuários cadastrados. Este projeto foi desenvolvido com dedicação pela equipe **MetaMind** para a Global Solution 2025 (1º Semestre) da FIAP.

## 📜 Índice

- [💾 **Mastering Relational and Non-Relational Database**](#-mastering-relational-and-non-relational-database)
  - [📜 Índice](#-índice)
  - [1. Visão Geral 🌍](#1-visão-geral-)
  - [2. Estrutura do Banco de Dados 🏗️](#2-estrutura-do-banco-de-dados-️)
    - [2.1. Tabelas Principais](#21-tabelas-principais)
    - [2.2. Tabelas de Junção (Relacionamento)](#22-tabelas-de-junção-relacionamento)
    - [2.3. Sequences](#23-sequences)
    - [2.4. Triggers](#24-triggers)
    - [2.5. Constraints e Chaves](#25-constraints-e-chaves)
  - [3. Funcionalidades Implementadas (PL/SQL) ⚙️](#3-funcionalidades-implementadas-plsql-️)
    - [3.1. Procedures de Inserção, Atualização e Exclusão](#31-procedures-de-inserção-atualização-e-exclusão)
    - [3.2. Funções de Processamento de Dados](#32-funções-de-processamento-de-dados)
  - [4. Consultas Complexas (Relatórios SQL) 📊](#4-consultas-complexas-relatórios-sql-)
  - [5. Blocos Anônimos e Cursores 👨‍💻](#5-blocos-anônimos-e-cursores-)
    - [5.1. Lógica de Negócio com Blocos Anônimos](#51-lógica-de-negócio-com-blocos-anônimos)
    - [5.2. Demonstração de Cursor Explícito](#52-demonstração-de-cursor-explícito)
  - [6. 📂 **Link do Repositório:**](#6--link-do-repositório)
  - [7. 🎨 **Tecnologias Utilizadas:**](#7--tecnologias-utilizadas)

---

## 1. Visão Geral 🌍

O banco de dados foi desenvolvido para centralizar e gerenciar informações cruciais sobre clientes, incluindo seus dados pessoais, múltiplos contatos e endereços. O sistema integra dados de eventos naturais provenientes do **EONET (Earth Observatory Natural Event Tracker)**, permitindo associar esses eventos a localizações geográficas e analisar o impacto em relação aos clientes. A arquitetura é normalizada, garantindo consistência e minimizando a redundância de dados.

---

## 2. Estrutura do Banco de Dados 🏗️

O esquema é composto por tabelas principais para armazenar entidades distintas, tabelas de junção para gerenciar relacionamentos muitos-para-muitos, sequences para geração automática de IDs e triggers para automatizar a inserção de chaves primárias.

### 2.1. Tabelas Principais

- 📄 **`TB_CLIENTE3`**: Armazena os dados cadastrais dos clientes.
    - **Colunas:** `ID_CLIENTE` (PK), `NOME`, `SOBRENOME`, `DOCUMENTO`, `DATA_NASCIMENTO`.

- 📞 **`TB_CONTATO3`**: Mantém os diversos tipos de contato associados aos clientes.
    - **Colunas:** `ID_CONTATO` (PK), `DDD`, `TELEFONE`, `CELULAR`, `WHATSAPP`, `EMAIL`, `TIPO_CONTATO`.

- 🏠 **`TB_ENDERECO3`**: Contém as informações detalhadas dos endereços.
    - **Colunas:** `ID_ENDERECO` (PK), `CEP`, `LOGRADOURO`, `NUMERO`, `BAIRRO`, `LOCALIDADE`, `UF`, `COMPLEMENTO`, `LATITUDE`, `LONGITUDE`.

- ☄️ **`TB_EONET3`**: Armazena dados sobre eventos naturais obtidos do EONET.
    - **Colunas:** `ID_EONET` (PK), `EONET_ID` (ID externo), `DATA`, `JSON` (detalhes do evento).

### 2.2. Tabelas de Junção (Relacionamento)

- 🔗 **`TB_CLIENTECONTATO3`**: Associa clientes a seus múltiplos contatos (N:M).
- 🔗 **`TB_CLIENTEENDERECO3`**: Associa clientes a seus múltiplos endereços (N:M).
- 🔗 **`TB_ENDERECOEVENTOS3`**: Associa endereços a eventos EONET (N:M).

### 2.3. Sequences

🔢 Quatro sequences são utilizadas para gerar automaticamente os valores das chaves primárias, garantindo IDs únicos:
- `TB_CLIENTE3_ID_CLIENTE_SEQ`
- `TB_CONTATO3_ID_CONTATO_SEQ`
- `TB_ENDERECO3_ID_ENDERECO_SEQ`
- `TB_EONET3_ID_EONET_SEQ`

### 2.4. Triggers

⚡ Para cada tabela principal, um trigger `BEFORE INSERT` utiliza a sequence correspondente para popular a coluna de ID automaticamente.
- `TB_CLIENTE3_ID_CLIENTE_TRG`
- `TB_CONTATO3_ID_CONTATO_TRG`
- `TB_ENDERECO3_ID_ENDERECO_TRG`
- `TB_EONET3_ID_EONET_TRG`

### 2.5. Constraints e Chaves

- 🔑 **Chaves Primárias (PK):** Cada tabela possui uma chave primária para garantir a unicidade.
- ⛓️ **Chaves Estrangeiras (FK):** Definem e mantêm a integridade referencial entre as tabelas.
- ⚠️ **`NOT NULL`:** Colunas essenciais são definidas como `NOT NULL` para garantir que sempre contenham dados.

---

## 3. Funcionalidades Implementadas (PL/SQL) ⚙️

Para cada tabela, foram criadas procedures e funções para encapsular as operações de DML, promovendo reusabilidade e segurança.

### 3.1. Procedures de Inserção, Atualização e Exclusão

Uma API completa de procedures foi criada para gerenciar o ciclo de vida dos dados:

- **`P_..._INSERT`**: Adicionam novos registros. Ex: `P_CLIENTE3_INSERT`.
- **`P_..._UPDATE`**: Modificam dados de registros existentes. Ex: `P_CLIENTE3_UPDATE`.
- **`P_..._DELETE`**: Removem registros e suas associações para manter a integridade. Ex: `P_CLIENTE3_DELETE`.

<details>
<summary>📋 Exemplo de Procedure de Inserção</summary>

```sql
-- Insere um novo cliente e retorna o ID gerado.
CREATE OR REPLACE PROCEDURE P_CLIENTE3_INSERT (
    p_nome              IN TB_CLIENTE3.NOME%TYPE,
    p_sobrenome         IN TB_CLIENTE3.SOBRENOME%TYPE,
    p_documento         IN TB_CLIENTE3.DOCUMENTO%TYPE,
    p_data_nascimento   IN TB_CLIENTE3.DATA_NASCIMENTO%TYPE,
    p_new_id            OUT TB_CLIENTE3.ID_CLIENTE%TYPE
) IS
BEGIN
    INSERT INTO TB_CLIENTE3 (NOME, SOBRENOME, DOCUMENTO, DATA_NASCIMENTO)
    VALUES (p_nome, p_sobrenome, p_documento, p_data_nascimento)
    RETURNING ID_CLIENTE INTO p_new_id;
END P_CLIENTE3_INSERT;
/
```
</details>

### 3.2. Funções de Processamento de Dados

🧠 Funções foram desenvolvidas para encapsular cálculos e lógicas de negócio.

- `F_TOTAL_CLIENTES_POR_UF(p_uf VARCHAR2) RETURN NUMBER`  
  Conta o número de clientes únicos que possuem endereço em um determinado estado (UF).
- `F_CALCULAR_IDADE_CLIENTE(p_id_cliente NUMBER) RETURN NUMBER`  
  Calcula a idade de um cliente com base em sua data de nascimento (armazenada como VARCHAR2).

<details>
<summary>💻 Exemplo de Função</summary>

```sql
-- Calcula a idade de um cliente.
CREATE OR REPLACE FUNCTION F_CALCULAR_IDADE_CLIENTE (
    p_id_cliente IN NUMBER
) RETURN NUMBER IS
    v_data_nasc_varchar VARCHAR2(10);
    v_data_nasc_date    DATE;
    v_idade             NUMBER;
BEGIN
    SELECT DATA_NASCIMENTO INTO v_data_nasc_varchar
    FROM TB_CLIENTE3 WHERE ID_CLIENTE = p_id_cliente;

    v_data_nasc_date := TO_DATE(v_data_nasc_varchar, 'DD/MM/YYYY');
    v_idade := TRUNC(MONTHS_BETWEEN(SYSDATE, v_data_nasc_date) / 12);

    RETURN v_idade;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END F_CALCULAR_IDADE_CLIENTE;
/
```
</details>

---

## 4. Consultas Complexas (Relatórios SQL) 📊

Foram desenvolvidas 5 consultas complexas para extrair informações gerenciais, utilizando JOIN, GROUP BY, HAVING, subqueries e funções de agregação:

- 🗺️ **Relatório de Clientes por Estado (UF):** Ranking de estados por número de clientes.
- 📇 **Relatório de Contatos por Cliente:** Quantidade de contatos registrados para cada cliente.
- 💥 **Relatório de Eventos de Alto Impacto:** Identifica eventos EONET que afetaram múltiplos endereços.
- 👤 **Relatório de Perfil Detalhado do Cliente:** Usa subqueries para exibir um perfil consolidado.
- 🏙️ **Análise de Média de Clientes por Cidade em SP:** Calcula a média de clientes por cidade em um estado específico.

<details>
<summary>📈 Exemplo de Relatório (Eventos de Alto Impacto)</summary>

```sql
-- Identifica eventos que afetaram um ou mais endereços cadastrados.
SELECT
    evt.EONET_ID,
    -- Aplicamos MAX() ao título. Como só há um título por evento, o resultado é o mesmo.
    MAX(JSON_VALUE(evt.JSON, '$.title')) AS titulo_do_evento,
    COUNT(ee.TB_ENDERECO3_ID_ENDERECO) AS enderecos_afetados
FROM
    TB_EONET3 evt
JOIN
    TB_ENDERECOEVENTOS3 ee ON evt.ID_EONET = ee.TB_EONET3_ID_EONET
GROUP BY
    -- Agrupamos pelo identificador único do evento para corrigir o erro ORA-00979.
    evt.ID_EONET,
    evt.EONET_ID
HAVING
    COUNT(ee.TB_ENDERECO3_ID_ENDERECO) > 0
ORDER BY
    enderecos_afetados DESC;
```
</details>

---

## 5. Blocos Anônimos e Cursores 👨‍💻

Blocos PL/SQL foram criados para demonstrar lógicas de negócio e o uso de cursores.

### 5.1. Lógica de Negócio com Blocos Anônimos

- **Análise Regional:** Um bloco que gera um relatório de clientes por estado, usando LOOP e IF/ELSE para destacar regiões com alta concentração.
- **Análise de Risco:** Um bloco que percorre clientes e verifica a associação com eventos naturais, emitindo alertas.

### 5.2. Demonstração de Cursor Explícito

Foi criado um bloco anônimo para demonstrar o controle manual de um cursor com OPEN, FETCH e CLOSE para processar dados linha a linha, gerando um relatório de clientes.

<details>
<summary>🖱️ Exemplo de Cursor Explícito</summary>

```sql
DECLARE
    -- Declaração das variáveis que receberão os dados
    v_nome_completo VARCHAR2(201);
    v_documento     TB_CLIENTE3.DOCUMENTO%TYPE;

    -- Declaração do CURSOR EXPLÍCITO
    CURSOR c_lista_clientes IS
        SELECT NOME || ' ' || SOBRENOME, DOCUMENTO
        FROM TB_CLIENTE3 ORDER BY NOME;
BEGIN
    -- 1. OPEN: Abre o cursor
    OPEN c_lista_clientes;
    -- 2. LOOP e FETCH: Busca os dados
    LOOP
        FETCH c_lista_clientes INTO v_nome_completo, v_documento;
        EXIT WHEN c_lista_clientes%NOTFOUND;
        -- Processa os dados
        DBMS_OUTPUT.PUT_LINE(RPAD(v_nome_completo, 40) || v_documento);
    END LOOP;
    -- 3. CLOSE: Fecha o cursor
    CLOSE c_lista_clientes;
END;
/
```
</details>

---

## 6. 📂 **Link do Repositório:**

[![GitHub](https://img.shields.io/badge/GitHub-Reposit%C3%B3rio-blue?style=flat-square&logo=github)](https://github.com/carmipa/GS_FIAP_2025_1SM/tree/main/Mastering_Relational_and_Non_Relational_Database)

---

## 7. 🎨 **Tecnologias Utilizadas:**

![Oracle Database](https://img.shields.io/badge/Oracle-Database-red?style=flat-square&logo=oracle)

![PL/SQL](https://img.shields.io/badge/PL%2FSQL-F80000?style=flat-square&logo=oracle)
