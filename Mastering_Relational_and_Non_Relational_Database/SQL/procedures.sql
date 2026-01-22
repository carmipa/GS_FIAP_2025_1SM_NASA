   SET SERVEROUTPUT ON;
SET DEFINE OFF;

--==============================================================================
-- Tabela: TB_CLIENTE3
--==============================================================================
PROMPT 'Criando procedures para TB_CLIENTE3...';

-- Procedure de INSERÇÃO para TB_CLIENTE3
create or replace procedure p_cliente3_insert (
   p_nome            in tb_cliente3.nome%type,
   p_sobrenome       in tb_cliente3.sobrenome%type,
   p_documento       in tb_cliente3.documento%type,
   p_data_nascimento in tb_cliente3.data_nascimento%type,
   p_new_id          out tb_cliente3.id_cliente%type
) is
begin
   insert into tb_cliente3 (
      nome,
      sobrenome,
      documento,
      data_nascimento
   ) values ( p_nome,
              p_sobrenome,
              p_documento,
              p_data_nascimento ) returning id_cliente into p_new_id;

   dbms_output.put_line('Cliente "'
                        || p_nome
                        || '" inserido com sucesso. Novo ID: '
                        || p_new_id);
end p_cliente3_insert;
/

-- Procedure de ATUALIZAÇÃO para TB_CLIENTE3
create or replace procedure p_cliente3_update (
   p_id_cliente      in tb_cliente3.id_cliente%type,
   p_nome            in tb_cliente3.nome%type,
   p_sobrenome       in tb_cliente3.sobrenome%type,
   p_documento       in tb_cliente3.documento%type,
   p_data_nascimento in tb_cliente3.data_nascimento%type
) is
begin
   update tb_cliente3
      set nome = p_nome,
          sobrenome = p_sobrenome,
          documento = p_documento,
          data_nascimento = p_data_nascimento
    where id_cliente = p_id_cliente;

   if sql%rowcount > 0 then
      dbms_output.put_line('Cliente ID '
                           || p_id_cliente
                           || ' atualizado com sucesso.');
   else
      dbms_output.put_line('Nenhum cliente encontrado com o ID '
                           || p_id_cliente
                           || '.');
   end if;
end p_cliente3_update;
/

-- Procedure de EXCLUSÃO para TB_CLIENTE3
create or replace procedure p_cliente3_delete (
   p_id_cliente in tb_cliente3.id_cliente%type
) is
begin
    -- CUIDADO: Antes de deletar o cliente, é preciso remover as referências em tabelas filhas.
   delete from tb_clientecontato3
    where tb_cliente3_id_cliente = p_id_cliente;
   delete from tb_clienteendereco3
    where tb_cliente3_id_cliente = p_id_cliente;
    
    -- Agora deleta o cliente
   delete from tb_cliente3
    where id_cliente = p_id_cliente;

   if sql%rowcount > 0 then
      dbms_output.put_line('Cliente ID '
                           || p_id_cliente
                           || ' e suas associações foram excluídos.');
   else
      dbms_output.put_line('Nenhum cliente encontrado com o ID '
                           || p_id_cliente
                           || '.');
   end if;
end p_cliente3_delete;
/

--==============================================================================
-- Tabela: TB_CONTATO3
--==============================================================================
PROMPT 'Criando procedures para TB_CONTATO3...';

create or replace procedure p_contato3_insert (
   p_ddd          in tb_contato3.ddd%type,
   p_telefone     in tb_contato3.telefone%type,
   p_celular      in tb_contato3.celular%type,
   p_whatsapp     in tb_contato3.whatsapp%type,
   p_email        in tb_contato3.email%type,
   p_tipo_contato in tb_contato3.tipo_contato%type,
   p_new_id       out tb_contato3.id_contato%type
) is
begin
   insert into tb_contato3 (
      ddd,
      telefone,
      celular,
      whatsapp,
      email,
      tipo_contato
   ) values ( p_ddd,
              p_telefone,
              p_celular,
              p_whatsapp,
              p_email,
              p_tipo_contato ) returning id_contato into p_new_id;

   dbms_output.put_line('Contato para "'
                        || p_email
                        || '" inserido. Novo ID: '
                        || p_new_id);
end p_contato3_insert;
/

create or replace procedure p_contato3_update (
   p_id_contato   in tb_contato3.id_contato%type,
   p_ddd          in tb_contato3.ddd%type,
   p_telefone     in tb_contato3.telefone%type,
   p_celular      in tb_contato3.celular%type,
   p_whatsapp     in tb_contato3.whatsapp%type,
   p_email        in tb_contato3.email%type,
   p_tipo_contato in tb_contato3.tipo_contato%type
) is
begin
   update tb_contato3
      set ddd = p_ddd,
          telefone = p_telefone,
          celular = p_celular,
          whatsapp = p_whatsapp,
          email = p_email,
          tipo_contato = p_tipo_contato
    where id_contato = p_id_contato;

   if sql%rowcount > 0 then
      dbms_output.put_line('Contato ID '
                           || p_id_contato
                           || ' atualizado com sucesso.');
   else
      dbms_output.put_line('Nenhum contato encontrado com o ID '
                           || p_id_contato
                           || '.');
   end if;
end p_contato3_update;
/

create or replace procedure p_contato3_delete (
   p_id_contato in tb_contato3.id_contato%type
) is
begin
   delete from tb_clientecontato3
    where tb_contato3_id_contato = p_id_contato;
   delete from tb_contato3
    where id_contato = p_id_contato;

   if sql%rowcount > 0 then
      dbms_output.put_line('Contato ID '
                           || p_id_contato
                           || ' e suas associações foram excluídos.');
   else
      dbms_output.put_line('Nenhum contato encontrado com o ID '
                           || p_id_contato
                           || '.');
   end if;
end p_contato3_delete;
/

--==============================================================================
-- Tabela: TB_ENDERECO3
--==============================================================================
PROMPT 'Criando procedures para TB_ENDERECO3...';

create or replace procedure p_endereco3_insert (
   p_cep         in tb_endereco3.cep%type,
   p_numero      in tb_endereco3.numero%type,
   p_logradouro  in tb_endereco3.logradouro%type,
   p_bairro      in tb_endereco3.bairro%type,
   p_localidade  in tb_endereco3.localidade%type,
   p_uf          in tb_endereco3.uf%type,
   p_complemento in tb_endereco3.complemento%type,
   p_latitude    in tb_endereco3.latitude%type,
   p_longitude   in tb_endereco3.longitude%type,
   p_new_id      out tb_endereco3.id_endereco%type
) is
begin
   insert into tb_endereco3 (
      cep,
      numero,
      logradouro,
      bairro,
      localidade,
      uf,
      complemento,
      latitude,
      longitude
   ) values ( p_cep,
              p_numero,
              p_logradouro,
              p_bairro,
              p_localidade,
              p_uf,
              p_complemento,
              p_latitude,
              p_longitude ) returning id_endereco into p_new_id;

   dbms_output.put_line('Endereço "'
                        || p_logradouro
                        || '" inserido. Novo ID: '
                        || p_new_id);
end p_endereco3_insert;
/

create or replace procedure p_endereco3_update (
   p_id_endereco in tb_endereco3.id_endereco%type,
   p_cep         in tb_endereco3.cep%type,
   p_numero      in tb_endereco3.numero%type,
   p_logradouro  in tb_endereco3.logradouro%type,
   p_bairro      in tb_endereco3.bairro%type,
   p_localidade  in tb_endereco3.localidade%type,
   p_uf          in tb_endereco3.uf%type,
   p_complemento in tb_endereco3.complemento%type,
   p_latitude    in tb_endereco3.latitude%type,
   p_longitude   in tb_endereco3.longitude%type
) is
begin
   update tb_endereco3
      set cep = p_cep,
          numero = p_numero,
          logradouro = p_logradouro,
          bairro = p_bairro,
          localidade = p_localidade,
          uf = p_uf,
          complemento = p_complemento,
          latitude = p_latitude,
          longitude = p_longitude
    where id_endereco = p_id_endereco;

   if sql%rowcount > 0 then
      dbms_output.put_line('Endereço ID '
                           || p_id_endereco
                           || ' atualizado com sucesso.');
   else
      dbms_output.put_line('Nenhum endereço encontrado com o ID '
                           || p_id_endereco
                           || '.');
   end if;
end p_endereco3_update;
/

create or replace procedure p_endereco3_delete (
   p_id_endereco in tb_endereco3.id_endereco%type
) is
begin
   delete from tb_clienteendereco3
    where tb_endereco3_id_endereco = p_id_endereco;
   delete from tb_enderecoeventos3
    where tb_endereco3_id_endereco = p_id_endereco;
   delete from tb_endereco3
    where id_endereco = p_id_endereco;

   if sql%rowcount > 0 then
      dbms_output.put_line('Endereço ID '
                           || p_id_endereco
                           || ' e suas associações foram excluídos.');
   else
      dbms_output.put_line('Nenhum endereço encontrado com o ID '
                           || p_id_endereco
                           || '.');
   end if;
end p_endereco3_delete;
/

--==============================================================================
-- Tabela: TB_EONET3
--==============================================================================
PROMPT 'Criando procedures para TB_EONET3...';

create or replace procedure p_eonet3_insert (
   p_json     in tb_eonet3.json%type,
   p_data     in tb_eonet3.data%type,
   p_eonet_id in tb_eonet3.eonet_id%type,
   p_new_id   out tb_eonet3.id_eonet%type
) is
begin
   insert into tb_eonet3 (
      json,
      data,
      eonet_id
   ) values ( p_json,
              p_data,
              p_eonet_id ) returning id_eonet into p_new_id;

   dbms_output.put_line('Evento EONET "'
                        || p_eonet_id
                        || '" inserido. Novo ID: '
                        || p_new_id);
end p_eonet3_insert;
/

-- Demais procedures para EONET (UPDATE, DELETE) seriam similares e foram omitidas por brevidade,
-- pois o foco é a inserção. Elas seguiriam o mesmo padrão das anteriores.

--==============================================================================
-- Tabelas de JUNÇÃO
--==============================================================================
PROMPT 'Criando procedures para as tabelas de junção...';

-- Associação Cliente <-> Contato
create or replace procedure p_clientecontato3_insert (
   p_id_cliente in tb_clientecontato3.tb_cliente3_id_cliente%type,
   p_id_contato in tb_clientecontato3.tb_contato3_id_contato%type
) is
begin
   insert into tb_clientecontato3 (
      tb_cliente3_id_cliente,
      tb_contato3_id_contato
   ) values ( p_id_cliente,
              p_id_contato );
   dbms_output.put_line('Associado cliente '
                        || p_id_cliente
                        || ' com contato '
                        || p_id_contato);
end p_clientecontato3_insert;
/

-- Associação Cliente <-> Endereco
create or replace procedure p_clienteendereco3_insert (
   p_id_cliente  in tb_clienteendereco3.tb_cliente3_id_cliente%type,
   p_id_endereco in tb_clienteendereco3.tb_endereco3_id_endereco%type
) is
begin
   insert into tb_clienteendereco3 (
      tb_cliente3_id_cliente,
      tb_endereco3_id_endereco
   ) values ( p_id_cliente,
              p_id_endereco );
   dbms_output.put_line('Associado cliente '
                        || p_id_cliente
                        || ' com endereço '
                        || p_id_endereco);
end p_clienteendereco3_insert;
/

-- Associação Endereco <-> Evento
create or replace procedure p_enderecoeventos3_insert (
   p_id_endereco in tb_enderecoeventos3.tb_endereco3_id_endereco%type,
   p_id_eonet    in tb_enderecoeventos3.tb_eonet3_id_eonet%type
) is
begin
   insert into tb_enderecoeventos3 (
      tb_endereco3_id_endereco,
      tb_eonet3_id_eonet
   ) values ( p_id_endereco,
              p_id_eonet );
   dbms_output.put_line('Associado endereço '
                        || p_id_endereco
                        || ' com evento '
                        || p_id_eonet);
end p_enderecoeventos3_insert;
/

PROMPT 'Todas as procedures foram criadas com sucesso!';

--==============================================================================
-- BLOCO DE EXECUÇÃO
-- Utiliza as procedures para popular o banco de dados.
--==============================================================================

PROMPT 'Iniciando bloco de execução para popular o banco de dados...';
declare
    -- Variáveis para armazenar os IDs gerados
   v_id_cliente1  number;
   v_id_cliente2  number;
   v_id_cliente3  number;
   v_id_cliente4  number;
   v_id_cliente5  number;
   v_id_contato1  number;
   v_id_contato2  number;
   v_id_contato3  number;
   v_id_contato4  number;
   v_id_contato5  number;
   v_id_endereco1 number;
   v_id_endereco2 number;
   v_id_endereco3 number;
   v_id_endereco4 number;
   v_id_endereco5 number;
begin
    -- == INSERINDO 5 CLIENTES ==
   p_cliente3_insert(
      'Mariana',
      'Costa',
      '123.456.789-10',
      '10/05/1990',
      v_id_cliente1
   );
   p_cliente3_insert(
      'Fernando',
      'Almeida',
      '234.567.890-11',
      '22/11/1982',
      v_id_cliente2
   );
   p_cliente3_insert(
      'Beatriz',
      'Lima',
      '345.678.901-12',
      '15/02/2001',
      v_id_cliente3
   );
   p_cliente3_insert(
      'GlobalTech',
      'S.A.',
      '01.234.567/0001-88',
      '01/01/2015',
      v_id_cliente4
   );
   p_cliente3_insert(
      'Ricardo',
      'Gomes',
      '456.789.012-13',
      '30/07/1975',
      v_id_cliente5
   );
    
    -- == INSERINDO 5 CONTATOS ==
    -- Lembre-se que o BD original exige todos os campos NOT NULL
   p_contato3_insert(
      '11',
      '5555-1010',
      '98888-1010',
      'S',
      'mariana.costa@email.com',
      'Pessoal',
      v_id_contato1
   );
   p_contato3_insert(
      '21',
      '2222-2020',
      '97777-2020',
      'S',
      'fernando.a@email.com',
      'Comercial',
      v_id_contato2
   );
   p_contato3_insert(
      '31',
      '3333-3030',
      '96666-3030',
      'N',
      'beatriz.lima@email.com',
      'Pessoal',
      v_id_contato3
   );
   p_contato3_insert(
      '11',
      '4444-4040',
      '95555-4040',
      'S',
      'contato@globaltech.com',
      'Geral',
      v_id_contato4
   );
   p_contato3_insert(
      '41',
      '7777-5050',
      '94444-5050',
      'S',
      'ricardo.gomes@email.com',
      'Pessoal',
      v_id_contato5
   );

    -- == INSERINDO 5 ENDEREÇOS ==
    -- Lembre-se que o BD original exige complemento NOT NULL
   p_endereco3_insert(
      '01311-000',
      100,
      'Avenida Paulista',
      'Bela Vista',
      'São Paulo',
      'SP',
      'Apto 101',
      -23.5613,
      -46.6565,
      v_id_endereco1
   );
   p_endereco3_insert(
      '22071-000',
      200,
      'Avenida Atlântica',
      'Copacabana',
      'Rio de Janeiro',
      'RJ',
      'Casa',
      -22.9714,
      -43.1823,
      v_id_endereco2
   );
   p_endereco3_insert(
      '30112-010',
      300,
      'Avenida do Contorno',
      'Floresta',
      'Belo Horizonte',
      'MG',
      'Bloco B',
      -19.9142,
      -43.929,
      v_id_endereco3
   );
   p_endereco3_insert(
      '04538-132',
      400,
      'Avenida Brigadeiro Faria Lima',
      'Itaim Bibi',
      'São Paulo',
      'SP',
      '15º Andar',
      -23.586,
      -46.6803,
      v_id_endereco4
   );
   p_endereco3_insert(
      '80420-210',
      500,
      'Rua 24 Horas',
      'Centro',
      'Curitiba',
      'PR',
      'Loja 5',
      -25.4323,
      -49.2745,
      v_id_endereco5
   );

    -- == ASSOCIANDO OS DADOS NAS TABELAS DE JUNÇÃO ==
   dbms_output.put_line('-- Associando Clientes com Contatos e Endereços --');
   p_clientecontato3_insert(
      v_id_cliente1,
      v_id_contato1
   );
   p_clienteendereco3_insert(
      v_id_cliente1,
      v_id_endereco1
   );
   p_clientecontato3_insert(
      v_id_cliente2,
      v_id_contato2
   );
   p_clienteendereco3_insert(
      v_id_cliente2,
      v_id_endereco2
   );
   p_clientecontato3_insert(
      v_id_cliente3,
      v_id_contato3
   );
   p_clienteendereco3_insert(
      v_id_cliente3,
      v_id_endereco3
   );
   p_clientecontato3_insert(
      v_id_cliente4,
      v_id_contato4
   );
   p_clienteendereco3_insert(
      v_id_cliente4,
      v_id_endereco4
   );
   p_clientecontato3_insert(
      v_id_cliente5,
      v_id_contato5
   );
   p_clienteendereco3_insert(
      v_id_cliente5,
      v_id_endereco5
   );

    -- == DEMONSTRANDO UPDATE E DELETE ==
   dbms_output.put_line('-- Demonstrando UPDATE e DELETE --');
    
    -- Atualizando o sobrenome do cliente 5
   p_cliente3_update(
      v_id_cliente5,
      'Ricardo',
      'Gomes da Silva',
      '456.789.012-13',
      '30/07/1975'
   );
    
    -- Deletando o cliente 3 (Beatriz) e todas as suas associações
   p_cliente3_delete(v_id_cliente3);

    -- Salva permanentemente todas as operações bem-sucedidas.
   commit;
   dbms_output.put_line('---> SUCESSO! Dados inseridos e COMMIT realizado. <---');
exception
   when others then
        -- Em caso de qualquer erro, desfaz todas as operações do bloco.
      rollback;
      dbms_output.put_line('---> ERRO! Ocorreu um problema: ' || sqlerrm);
      dbms_output.put_line('---> ROLLBACK realizado. Nenhuma alteração foi salva. <---');
end;
/