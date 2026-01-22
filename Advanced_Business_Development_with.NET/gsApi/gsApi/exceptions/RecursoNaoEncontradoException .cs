// File: gsApi/exceptions/RecursoNaoEncontradoException.cs
using System;

namespace gsApi.exceptions // Namespace correto
{
    public class RecursoNaoEncontradoException : Exception
    {
        public RecursoNaoEncontradoException() : base() { }
        public RecursoNaoEncontradoException(string message) : base(message) { }
        public RecursoNaoEncontradoException(string message, Exception innerException) : base(message, innerException) { }
    }
}