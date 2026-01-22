// File: gsApi/model/Contato.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace gsApi.model
{
    [Table("TB_CONTATO3")]
    public class Contato
    {
        [Key]
        [Column("ID_CONTATO")]
        public long IdContato { get; set; }

        [Required(ErrorMessage = "O DDD não pode estar em branco.")]
        [StringLength(3)]
        [Column("DDD")]
        public required string Ddd { get; set; }

        [Required(ErrorMessage = "O telefone não pode estar em branco.")]
        [StringLength(15)]
        [Column("TELEFONE")]
        public required string Telefone { get; set; }

        [Required(ErrorMessage = "O celular não pode estar em branco.")]
        [StringLength(15)]
        [Column("CELULAR")]
        public required string Celular { get; set; }

        [Required(ErrorMessage = "O WhatsApp não pode estar em branco.")]
        [StringLength(15)]
        [Column("WHATSAPP")]
        public required string Whatsapp { get; set; }

        [Required(ErrorMessage = "O e-mail não pode estar em branco.")]
        [StringLength(255)]
        [EmailAddress(ErrorMessage = "Formato de e-mail inválido.")]
        [Column("EMAIL")]
        public required string Email { get; set; }

        [Required(ErrorMessage = "O tipo de contato não pode estar em branco.")]
        [StringLength(50)]
        [Column("TIPO_CONTATO")]
        public required string TipoContato { get; set; }

        [JsonIgnore]
        public virtual ICollection<Cliente> Clientes { get; set; } = new List<Cliente>();
    }
}