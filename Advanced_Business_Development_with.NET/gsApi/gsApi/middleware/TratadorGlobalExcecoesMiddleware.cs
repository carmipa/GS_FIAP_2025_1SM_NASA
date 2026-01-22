// File: gsApi/middleware/TratadorGlobalExcecoesMiddleware.cs
using gsApi.exceptions; // Namespace corrigido para suas exceções
using gsApi.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;

namespace gsApi.middleware // Namespace correto
{
    public class TratadorGlobalExcecoesMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<TratadorGlobalExcecoesMiddleware> _logger;

        public TratadorGlobalExcecoesMiddleware(RequestDelegate next, ILogger<TratadorGlobalExcecoesMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ocorreu uma exceção não tratada: {Message}", ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            HttpStatusCode statusCode;
            object responsePayload;

            switch (exception)
            {
                case RecursoNaoEncontradoException ex:
                    statusCode = HttpStatusCode.NotFound;
                    responsePayload = new { timestamp = DateTime.UtcNow, status = (int)statusCode, error = "Not Found", message = ex.Message, path = context.Request.Path.Value };
                    break;
                case ServicoIndisponivelException ex:
                    statusCode = HttpStatusCode.ServiceUnavailable;
                    responsePayload = new { timestamp = DateTime.UtcNow, status = (int)statusCode, error = "Service Unavailable", message = ex.Message, path = context.Request.Path.Value };
                    break;
                case ValidacaoException ex:
                    statusCode = HttpStatusCode.BadRequest;
                    responsePayload = new { timestamp = DateTime.UtcNow, status = (int)statusCode, error = "Bad Request - Validation Error", messages = ex.Erros ?? new List<string> { ex.Message }, path = context.Request.Path.Value };
                    break;
                case ArgumentException ex:
                    statusCode = HttpStatusCode.BadRequest;
                    responsePayload = new { timestamp = DateTime.UtcNow, status = (int)statusCode, error = "Bad Request", message = ex.Message, path = context.Request.Path.Value };
                    break;
                default:
                    statusCode = HttpStatusCode.InternalServerError;
                    responsePayload = new { timestamp = DateTime.UtcNow, status = (int)statusCode, error = "Internal Server Error", message = "Ocorreu um erro inesperado no servidor.", path = context.Request.Path.Value };
                    break;
            }

            context.Response.StatusCode = (int)statusCode;
            return context.Response.WriteAsync(JsonSerializer.Serialize(responsePayload, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
        }
    }
}