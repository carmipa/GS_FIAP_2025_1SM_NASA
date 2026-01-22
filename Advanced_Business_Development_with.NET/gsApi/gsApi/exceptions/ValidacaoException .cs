// File: SeuProjetoNET/Exceptions/ValidacaoException.cs
using System;
using System.Collections.Generic;

namespace gsApi.Exceptions
{
    public class ValidacaoException : Exception
    {
        public List<string>? Erros { get; }

        public ValidacaoException() : base() { }

        public ValidacaoException(string message) : base(message) { }

        public ValidacaoException(string message, Exception innerException) : base(message, innerException) { }

        public ValidacaoException(string message, List<string> erros) : base(message)
        {
            Erros = erros;
        }
        public ValidacaoException(List<string> erros) : base(erros != null && erros.Count > 0 ? erros[0] : "Erro de validação.")
        {
            Erros = erros;
        }
    }
}