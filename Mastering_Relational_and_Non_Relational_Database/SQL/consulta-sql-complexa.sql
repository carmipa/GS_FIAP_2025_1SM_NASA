-- 1. Relatório de Clientes por Estado (UF) Esta consulta gera um ranking dos estados, mostrando quantos clientes únicos possuem endereços em cada um, ordenado do maior para o menor.

select ender.uf,
       count(distinct cli.id_cliente) as total_de_clientes
  from tb_cliente3 cli
  join tb_clienteendereco3 ce
on cli.id_cliente = ce.tb_cliente3_id_cliente
  join tb_endereco3 ender
on ce.tb_endereco3_id_endereco = ender.id_endereco
 group by ender.uf
 order by total_de_clientes desc;

-- 2. Relatório de Contatos por Cliente Este relatório lista cada cliente e informa a quantidade total de contatos (e-mails, telefones, etc.) registrados para ele, sendo útil para avaliar o quão "completo" é o cadastro de cada um.

 select c.nome
       || ' '
       || c.sobrenome as nome_cliente,
       c.documento,
       count(cc.tb_contato3_id_contato) as quantidade_de_contatos
  from tb_cliente3 c
  left join -- Usamos LEFT JOIN para listar até mesmo clientes sem contatos
   tb_clientecontato3 cc
on c.id_cliente = cc.tb_cliente3_id_cliente
 group by c.id_cliente,
          c.nome,
          c.sobrenome,
          c.documento
 order by quantidade_de_contatos desc,
          nome_cliente;


-- 3. Relatório de Eventos de Alto Impacto Esta consulta identifica eventos naturais (EONET) que estão associados a mais de um endereço no banco de dados, sinalizando eventos de maior abrangência ou impacto para sua base de clientes.

select evt.eonet_id,
    -- Aplicamos MAX() ao título. Como só há um título por evento, o resultado é o mesmo.
       max(json_value(evt.json,
                  '$.title')) as titulo_do_evento,
       count(ee.tb_endereco3_id_endereco) as enderecos_afetados
  from tb_eonet3 evt
  join tb_enderecoeventos3 ee
on evt.id_eonet = ee.tb_eonet3_id_eonet
 group by
    -- Agrupamos apenas pelo identificador único do evento.
  evt.id_eonet,
          evt.eonet_id
having count(ee.tb_endereco3_id_endereco) > 0
 order by enderecos_afetados desc;

-- 4. Relatório de Perfil Detalhado do Cliente (com Subqueries) Este relatório cria um perfil para cada cliente, buscando informações de diferentes tabelas através de subconsultas (subqueries) na lista de SELECT, o que evita a necessidade de múltiplos JOINs complexos.

select c.nome,
       c.sobrenome,
    -- Subquery para contar o número de endereços
       (
          select count(*)
            from tb_clienteendereco3 ce
           where ce.tb_cliente3_id_cliente = c.id_cliente
       ) as total_enderecos,
    -- Subquery para buscar o e-mail principal (o primeiro encontrado)
       (
          select ct.email
            from tb_contato3 ct
            join tb_clientecontato3 cc
          on ct.id_contato = cc.tb_contato3_id_contato
           where cc.tb_cliente3_id_cliente = c.id_cliente
             and rownum = 1
       ) as email_principal
  from tb_cliente3 c
 order by c.nome;

-- 5. Análise de Média de Clientes por Cidade em SP Esta consulta analítica e mais complexa calcula a média de clientes por cidade dentro de um estado específico (neste caso, São Paulo), usando uma subquery no FROM. Isso ajuda a entender se a base de clientes está concentrada em poucas cidades ou bem distribuída.

select avg(total_clientes_por_cidade) as media_de_clientes_por_cidade_em_sp
  from
    -- Subquery (ou Visão Inline) que primeiro calcula o total de clientes para cada cidade em SP
   (
   select ender.localidade,
          count(distinct ce.tb_cliente3_id_cliente) as total_clientes_por_cidade
     from tb_clienteendereco3 ce
     join tb_endereco3 ender
   on ce.tb_endereco3_id_endereco = ender.id_endereco
    where ender.uf = 'SP'
    group by ender.localidade
) relatorio_cidades;
