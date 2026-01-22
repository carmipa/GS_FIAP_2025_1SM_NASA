// File: SeuProjetoNET/DTOs/Response/GeoCoordinatesDto.cs
namespace gsApi.DTOs.Response
{
    public class GeoCoordinatesDto
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string? MatchedAddress { get; set; }
    }
}