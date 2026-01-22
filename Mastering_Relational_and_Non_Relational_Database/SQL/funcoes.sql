create or replace function f_total_clientes_por_uf (
   p_uf in varchar2
) return number is
   v_total_clientes number;
begin
    -- Conta os IDs de clientes distintos que possuem endereço no UF especificado
   select count(distinct cli.id_cliente)
     into v_total_clientes
     from tb_cliente3 cli
     join tb_clienteendereco3 ce
   on cli.id_cliente = ce.tb_cliente3_id_cliente
     join tb_endereco3 ender
   on ce.tb_endereco3_id_endereco = ender.id_endereco
    where ender.uf = upper(p_uf); -- Garante que a comparação não seja sensível a maiúsculas/minúsculas

   return v_total_clientes;
exception
   when no_data_found then
      return 0;
   when others then
      return -1; -- Retorna -1 em caso de outro erro
end f_total_clientes_por_uf;
/



create or replace function f_calcular_idade_cliente (
   p_id_cliente in number
) return number is
   v_data_nasc_varchar varchar2(10);
   v_data_nasc_date    date;
   v_idade             number;
begin
    -- Busca a data de nascimento (texto) do cliente
   select data_nascimento
     into v_data_nasc_varchar
     from tb_cliente3
    where id_cliente = p_id_cliente;

    -- Converte o texto para data e calcula a idade em anos
   v_data_nasc_date := to_date ( v_data_nasc_varchar,'DD/MM/YYYY' );
   v_idade := trunc(months_between(
      sysdate,
      v_data_nasc_date
   ) / 12);
   return v_idade;
exception
   when others then
        -- Retorna nulo se o cliente não for encontrado ou se a data for inválida
      return null;
end f_calcular_idade_cliente;
/