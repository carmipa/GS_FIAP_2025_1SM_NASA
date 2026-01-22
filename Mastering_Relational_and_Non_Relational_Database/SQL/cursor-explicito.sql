   SET SERVEROUTPUT ON;

declare
    -- 1. Declaração das variáveis que receberão os dados de cada linha
   v_nome_completo varchar2(201);
   v_documento     tb_cliente3.documento%type;

    -- 2. Declaração do CURSOR EXPLÍCITO
    -- O cursor é como um ponteiro para a área de resultado da sua consulta.
   cursor c_lista_clientes is
   select nome
          || ' '
          || sobrenome,
          documento
     from tb_cliente3
    order by nome;

begin
   dbms_output.put_line('--- RELATÓRIO DE CLIENTES (CURSOR EXPLÍCITO) ---');
   dbms_output.put_line(rpad(
      'NOME COMPLETO',
      40
   )
                        || 'DOCUMENTO');
   dbms_output.put_line(rpad(
      '-',
      39,
      '-'
   )
                        || ' '
                        || rpad(
      '-',
      20,
      '-'
   ));

    -- 3. OPEN: Abre o cursor, executando a consulta e preparando os resultados.
   open c_lista_clientes;

    -- 4. LOOP: Inicia um laço para percorrer os resultados.
   loop
        -- 5. FETCH: Busca a próxima linha do resultado e a carrega nas variáveis.
      fetch c_lista_clientes into
         v_nome_completo,
         v_documento;

        -- 6. EXIT WHEN: Condição de saída do loop.
        -- A variável %NOTFOUND do cursor se torna TRUE quando o FETCH não encontra mais linhas.
      exit when c_lista_clientes%notfound;

        -- Processa os dados da linha atual
      dbms_output.put_line(rpad(
         v_nome_completo,
         40
      )
                           || v_documento);
   end loop;

    -- 7. CLOSE: Fecha o cursor, liberando os recursos utilizados por ele.
    -- É uma etapa crucial para a boa gestão de memória.
   close c_lista_clientes;
   dbms_output.put_line('--- FIM DO RELATÓRIO ---');
end;
/