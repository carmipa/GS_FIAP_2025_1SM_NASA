// File: SeuProjetoNET/DTOs/Response/TimeCountDto.cs
namespace gsApi.DTOs.Response
{
    public class TimeCountDto
    {
        public string TimeLabel { get; set; }
        public long Count { get; set; }

        public TimeCountDto(string timeLabel, long count)
        {
            TimeLabel = timeLabel;
            Count = count;
        }
    }
}