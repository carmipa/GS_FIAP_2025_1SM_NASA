// File: gsApi/Swagger/ExternalDocsDocumentFilter.cs
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System;

namespace gsApi.Swagger // Namespace padronizado
{
    /// <summary>
    /// DocumentFilter que adiciona o bloco "externalDocs" de nível raiz 
    /// ao JSON final do OpenAPI.
    /// </summary>
    public class ExternalDocsDocumentFilter : IDocumentFilter
    {
        public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
        {
            swaggerDoc.ExternalDocs = new OpenApiExternalDocs
            {
                Description = "Saiba mais sobre a Global Solution FIAP",
                Url = new Uri("https://www.fiap.com.br/graduacao/global-solution/")
            };
        }
    }
}