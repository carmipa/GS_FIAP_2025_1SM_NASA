// File: gsApi/dto/response/NasaEonetGeometryDto.cs
using System;
namespace gsApi.dto.response
{
    public class NasaEonetGeometryDto
    {
        public double? MagnitudeValue { get; set; }
        public string? MagnitudeUnit { get; set; }
        public DateTimeOffset Date { get; set; } // Se a API sempre fornece, ok. Se não, DateTimeOffset?
        public required string Type { get; set; }
        public required object Coordinates { get; set; } // object já é anulável por natureza
    }
}