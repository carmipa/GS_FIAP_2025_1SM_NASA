// File: gsApi/model/Endereco.cs
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace gsApi.model
{
    [Table("TB_ENDERECO3")]
    public class Endereco
    {
        [Key]
        [Column("ID_ENDERECO")]
        public long IdEndereco { get; set; }

        [Required(ErrorMessage = "O CEP não pode estar em branco.")]
        [StringLength(9)]
        [Column("CEP")]
        public required string Cep { get; set; }

        [Required(ErrorMessage = "O número do endereço é obrigatório.")]
        [Column("NUMERO")]
        public int Numero { get; set; }

        [Required(ErrorMessage = "O logradouro não pode estar em branco.")]
        [StringLength(255)]
        [Column("LOGRADOURO")]
        public required string Logradouro { get; set; }

        [Required(ErrorMessage = "O bairro não pode estar em branco.")]
        [StringLength(255)]
        [Column("BAIRRO")]
        public required string Bairro { get; set; }

        [Required(ErrorMessage = "A localidade (cidade) não pode estar em branco.")]
        [StringLength(100)]
        [Column("LOCALIDADE")]
        public required string Localidade { get; set; }

        [Required(ErrorMessage = "A UF não pode estar em branco.")]
        [StringLength(2)]
        [Column("UF")]
        public required string Uf { get; set; }

        [Required(ErrorMessage = "O complemento é obrigatório.")] // Mantido como required conforme modelo original
        [StringLength(255)]
        [Column("COMPLEMENTO")]
        public required string Complemento { get; set; }

        [Required(ErrorMessage = "Latitude é obrigatória.")]
        [Column("LATITUDE", TypeName = "NUMBER(10,7)")]
        public double Latitude { get; set; }

        [Required(ErrorMessage = "Longitude é obrigatória.")]
        [Column("LONGITUDE", TypeName = "NUMBER(10,7)")]
        public double Longitude { get; set; }

        [JsonIgnore]
        public virtual ICollection<Cliente> Clientes { get; set; } = new List<Cliente>();
        public virtual ICollection<EonetEvent> EventosEonet { get; set; } = new List<EonetEvent>();
    }
}