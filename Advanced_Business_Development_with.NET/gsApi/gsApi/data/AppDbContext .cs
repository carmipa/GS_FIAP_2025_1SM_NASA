// File: gsApi/data/AppDbContext.cs
using Microsoft.EntityFrameworkCore;
using gsApi.model;
using System.Collections.Generic;

namespace gsApi.data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Cliente> Clientes { get; set; }
        public DbSet<Contato> Contatos { get; set; }
        public DbSet<Endereco> Enderecos { get; set; }
        public DbSet<EonetEvent> EonetEvents { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Nomes de sequences e colunas em MAIÚSCULAS
            modelBuilder.Entity<Cliente>(entity =>
            {
                entity.Property(c => c.IdCliente)
                      .HasColumnName("ID_CLIENTE") // Garantir que o nome da coluna PK está explícito
                      .HasDefaultValueSql("TB_CLIENTE3_ID_CLIENTE_SEQ.NEXTVAL");
            });

            modelBuilder.Entity<Contato>(entity =>
            {
                entity.Property(c => c.IdContato)
                      .HasColumnName("ID_CONTATO")
                      .HasDefaultValueSql("TB_CONTATO3_ID_CONTATO_SEQ.NEXTVAL");
            });

            modelBuilder.Entity<Endereco>(entity =>
            {
                entity.Property(e => e.IdEndereco)
                      .HasColumnName("ID_ENDERECO")
                      .HasDefaultValueSql("TB_ENDERECO3_ID_ENDERECO_SEQ.NEXTVAL");
            });

            modelBuilder.Entity<EonetEvent>(entity =>
            {
                entity.Property(e => e.IdEonet)
                      .HasColumnName("ID_EONET")
                      .HasDefaultValueSql("TB_EONET3_ID_EONET_SEQ.NEXTVAL");

                entity.Property(e => e.Data)
                      .HasColumnName("DATA")
                      .HasColumnType("TIMESTAMP"); // DDL: TIMESTAMP (6) WITH LOCAL TIME ZONE. "TIMESTAMP" é um bom mapeamento para DateTime.
            });

            // Relações Many-to-Many com nomes de tabelas e colunas em MAIÚSCULAS
            modelBuilder.Entity<Cliente>()
                .HasMany(c => c.Contatos)
                .WithMany(t => t.Clientes)
                .UsingEntity<Dictionary<string, object>>(
                    "TB_CLIENTECONTATO3", // Nome da tabela de junção
                    r => r.HasOne<Contato>().WithMany().HasForeignKey("TB_CONTATO3_ID_CONTATO").HasConstraintName("TB_CLIENTECONTATO3_TB_CONTATO3_FK"),
                    l => l.HasOne<Cliente>().WithMany().HasForeignKey("TB_CLIENTE3_ID_CLIENTE").HasConstraintName("TB_CLIENTECONTATO3_TB_CLIENTE3_FK"),
                    j =>
                    {
                        j.ToTable("TB_CLIENTECONTATO3");
                        j.HasKey("TB_CLIENTE3_ID_CLIENTE", "TB_CONTATO3_ID_CONTATO");
                    });

            modelBuilder.Entity<Cliente>()
                .HasMany(c => c.Enderecos)
                .WithMany(e => e.Clientes)
                .UsingEntity<Dictionary<string, object>>(
                    "TB_CLIENTEENDERECO3",
                    r => r.HasOne<Endereco>().WithMany().HasForeignKey("TB_ENDERECO3_ID_ENDERECO").HasConstraintName("TB_CLIENTEENDERECO3_TB_ENDERECO3_FK"),
                    l => l.HasOne<Cliente>().WithMany().HasForeignKey("TB_CLIENTE3_ID_CLIENTE").HasConstraintName("TB_CLIENTEENDERECO3_TB_CLIENTE3_FK"),
                    j =>
                    {
                        j.ToTable("TB_CLIENTEENDERECO3");
                        j.HasKey("TB_CLIENTE3_ID_CLIENTE", "TB_ENDERECO3_ID_ENDERECO");
                    });

            modelBuilder.Entity<Endereco>()
                .HasMany(e => e.EventosEonet)
                .WithMany(ev => ev.Enderecos)
                .UsingEntity<Dictionary<string, object>>(
                    "TB_ENDERECOEVENTOS3",
                    r => r.HasOne<EonetEvent>().WithMany().HasForeignKey("TB_EONET3_ID_EONET").HasConstraintName("TB_ENDERECOEVENTOS3_TB_EONET3_FK"),
                    l => l.HasOne<Endereco>().WithMany().HasForeignKey("TB_ENDERECO3_ID_ENDERECO").HasConstraintName("TB_ENDERECOEVENTOS3_TB_ENDERECO3_FK"),
                    j =>
                    {
                        j.ToTable("TB_ENDERECOEVENTOS3");
                        j.HasKey("TB_ENDERECO3_ID_ENDERECO", "TB_EONET3_ID_EONET");
                    });
        }
    }
}