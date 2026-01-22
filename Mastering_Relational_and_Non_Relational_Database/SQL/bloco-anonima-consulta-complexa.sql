   SET SERVEROUTPUT ON;

declare
    -- Cursor para buscar o total de clientes por estado, focando apenas em estados com mais de um cliente.
   cursor c_clientes_por_uf is
   select ender.uf,
          count(distinct cli.id_cliente) as total_clientes,
            -- Subquery para buscar o nome de um cliente daquele estado como exemplo
          (
             select c.nome
                    || ' '
                    || c.sobrenome
               from tb_cliente3 c
               join tb_clienteendereco3 ce
             on c.id_cliente = ce.tb_cliente3_id_cliente
               join tb_endereco3 e
             on ce.tb_endereco3_id_endereco = e.id_endereco
              where e.uf = ender.uf
                and rownum = 1
          ) as exemplo_cliente
     from tb_cliente3 cli
     join tb_clienteendereco3 ce
   on cli.id_cliente = ce.tb_cliente3_id_cliente
     join tb_endereco3 ender
   on ce.tb_endereco3_id_endereco = ender.id_endereco
    group by ender.uf
   having count(distinct cli.id_cliente) >= 1 -- Cláusula HAVING para filtrar o grupo
    order by total_clientes desc; -- Ordena do maior para o menor

   v_limite_alerta constant number := 2; -- Define um limite para considerar "alta concentração"

begin
   dbms_output.put_line('--- RELATÓRIO DE CONCENTRAÇÃO DE CLIENTES POR ESTADO ---');
   dbms_output.put_line(rpad(
      'UF',
      5
   )
                        || rpad(
      'TOTAL CLIENTES',
      20
   )
                        || 'EXEMPLO DE CLIENTE');
   dbms_output.put_line(rpad(
      '-',
      4,
      '-'
   )
                        || ' '
                        || rpad(
      '-',
      19,
      '-'
   )
                        || ' '
                        || rpad(
      '-',
      30,
      '-'
   ));

    -- LOOP para percorrer cada registro retornado pelo cursor
   for reg in c_clientes_por_uf loop
      dbms_output.put(rpad(
         reg.uf,
         5
      ));
      dbms_output.put(rpad(
         reg.total_clientes,
         20
      ));
      dbms_output.put_line(reg.exemplo_cliente);

        -- Estrutura IF/ELSE para adicionar uma observação
      if reg.total_clientes >= v_limite_alerta then
         dbms_output.put_line('     -> OBS: Alta concentração de clientes neste estado!');
      else
         dbms_output.put_line('     -> OBS: Concentração normal.');
      end if;

   end loop;

   dbms_output.put_line('--- FIM DO RELATÓRIO ---');
end;
/



   SET SERVEROUTPUT ON;

declare
   v_total_eventos number;
begin
   dbms_output.put_line('--- RELATÓRIO DE RISCO DE CLIENTES (EVENTOS EONET) ---');

    -- LOOP principal para percorrer cada cliente da tabela
   for cliente in (
      select id_cliente,
             nome,
             sobrenome
        from tb_cliente3
       order by nome
   ) loop

        -- Para cada cliente, executa uma consulta para contar os eventos associados
      select count(evt.id_eonet)
        into v_total_eventos
        from tb_clienteendereco3 ce
        join tb_enderecoeventos3 ee
      on ce.tb_endereco3_id_endereco = ee.tb_endereco3_id_endereco
        join tb_eonet3 evt
      on ee.tb_eonet3_id_eonet = evt.id_eonet
       where ce.tb_cliente3_id_cliente = cliente.id_cliente;

        -- Estrutura IF/ELSE para decidir qual mensagem exibir
      if v_total_eventos > 0 then
         dbms_output.put_line('ALERTA DE RISCO: O cliente '
                              || cliente.nome
                              || ' '
                              || cliente.sobrenome
                              || ' (ID: '
                              || cliente.id_cliente
                              || ') está associado a '
                              || v_total_eventos
                              || ' evento(s).');
      else
         dbms_output.put_line('OK: O cliente '
                              || cliente.nome
                              || ' '
                              || cliente.sobrenome
                              || ' (ID: '
                              || cliente.id_cliente
                              || ') não possui riscos associados.');
      end if;

   end loop;

   dbms_output.put_line('--- FIM DA VERIFICAÇÃO ---');
end;
/