// File: SeuProjetoNET/Exceptions/ServicoIndisponivelException.cs
using System;

namespace gsApi.Exceptions
{
    public class ServicoIndisponivelException : Exception
    {
        public ServicoIndisponivelException() : base() { }

        public ServicoIndisponivelException(string message) : base(message) { }

        public ServicoIndisponivelException(string message, Exception innerException) : base(message, innerException) { }
    }
}