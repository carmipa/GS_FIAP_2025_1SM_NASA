// File: gsApi/model/Cliente.cs
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace gsApi.model
{
    [Table("TB_CLIENTE3")]
    public class Cliente
    {
        [Key]
        [Column("ID_CLIENTE")]
        public long IdCliente { get; set; }

        [Required(ErrorMessage = "O nome não pode estar em branco.")]
        [StringLength(100)]
        [Column("NOME")]
        public required string Nome { get; set; }

        [Required(ErrorMessage = "O sobrenome não pode estar em branco.")]
        [StringLength(100)]
        [Column("SOBRENOME")]
        public required string Sobrenome { get; set; }

        [Required(ErrorMessage = "A data de nascimento não pode estar em branco.")]
        [StringLength(10)]
        [Column("DATA_NASCIMENTO")]
        public required string DataNascimento { get; set; }

        [Required(ErrorMessage = "O documento não pode estar em branco.")]
        [StringLength(18)]
        [Column("DOCUMENTO")]
        public required string Documento { get; set; }

        public virtual ICollection<Contato> Contatos { get; set; } = new List<Contato>();
        public virtual ICollection<Endereco> Enderecos { get; set; } = new List<Endereco>();
    }
}