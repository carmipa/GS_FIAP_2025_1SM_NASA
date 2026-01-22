// File: gsApi/model/EonetEvent.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace gsApi.model
{
    [Table("TB_EONET3")]
    public class EonetEvent
    {
        [Key]
        [Column("ID_EONET")]
        public long IdEonet { get; set; }

        [Column("JSON", TypeName = "CLOB")]
        public string? Json { get; set; }

        [Column("DATA")] // O tipo de coluna será configurado no AppDbContext
        public DateTime? Data { get; set; } // Alterado para DateTime?

        [Required(ErrorMessage = "O ID da API EONET é obrigatório.")]
        [StringLength(50)]
        [Column("EONET_ID")]
        public required string EonetIdApi { get; set; }

        [JsonIgnore]
        public virtual ICollection<Endereco> Enderecos { get; set; } = new List<Endereco>();
    }
}