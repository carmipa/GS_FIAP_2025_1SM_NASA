// src/app/page.tsx
'use client';

import Link from 'next/link';
import React from 'react'; // Certifique-se de que React está importado

export default function HomePage() {
  // Estilos podem ser movidos para globals.css para melhor organização
  const heroStyle: React.CSSProperties = {
    padding: '50px 20px',
    backgroundColor: '#00579D', // Um azul similar ao da FIAP ou da sua navbar
    color: 'white',
    textAlign: 'center',
    marginBottom: '40px',
    borderRadius: '8px',
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '40px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
  };

  const cardContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '25px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: '40px',
  };

  const cardStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '25px',
    backgroundColor: '#ffffff', // Cards brancos
    color: '#333',
    textDecoration: 'none',
    borderRadius: '8px',
    textAlign: 'center',
    width: '280px', // Largura fixa para os cards
    minHeight: '180px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    border: '1px solid #e0e0e0',
  };

  const cardIconStyle: React.CSSProperties = {
    fontSize: '3em', // Ícones maiores
    marginBottom: '15px',
    color: '#007bff', // Cor de destaque para os ícones
  };

  const cardTitleStyle: React.CSSProperties = {
    fontSize: '1.25em',
    fontWeight: 'bold',
    marginBottom: '8px',
  };

  const cardDescriptionStyle: React.CSSProperties = {
    fontSize: '0.9em',
    color: '#555',
    lineHeight: '1.5',
  };

  const githubLinkStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#28a745', // Um verde para o botão GitHub
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    fontWeight: '500',
    transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease', // Adicionado transform e boxShadow à transição
    // marginBottom: '15px', // Adicionado para espaçar os botões se estiverem em coluna
  };

  // NOVO ESTILO PARA O LINK DA FIAP
  const fiapLinkStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#007bff', // Um azul para o botão FIAP
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    fontWeight: '500',
    transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease', // Adicionado transform e boxShadow à transição
  };


  const handleMouseOver = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    // Lógica de hover atual, o transform e boxShadow deve aplicar-se genericamente
    // A mudança de cor de fundo específica do GitHub acontecerá se a condição for atendida
    // Para o link da FIAP (com cor de fundo azul), a primeira parte do if deve ser verdadeira
    if (target.style.backgroundColor !== 'rgb(40, 167, 69)' && target.style.backgroundColor !== 'rgb(33, 136, 56)') {
      target.style.transform = 'translateY(-5px)';
      target.style.boxShadow = '0 8px 15px rgba(0,0,0,0.2)';
    }
    // Lógica específica para o botão do GitHub (se a cor base for #28a745)
    if (target.style.backgroundColor === 'rgb(40, 167, 69)') { // rgb(40, 167, 69) é #28a745 (verde)
      target.style.backgroundColor = '#218838'; // Verde mais escuro para hover
    }
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    // Lógica de hover atual, o transform e boxShadow deve reverter genericamente
    // A mudança de cor de fundo específica do GitHub acontecerá se a condição for atendida
    if (target.style.backgroundColor !== 'rgb(33, 136, 56)') { // rgb(33, 136, 56) é #218838 (verde escuro)
      target.style.transform = 'translateY(0)';
      target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; // Ou o boxShadow original do estilo base do link
    }
    // Lógica específica para o botão do GitHub (se a cor no hover for #218838)
    if (target.style.backgroundColor === 'rgb(33, 136, 56)') { // rgb(33, 136, 56) é #218838 (verde escuro)
      target.style.backgroundColor = '#28a745'; // Verde original
    }
  };


  return (
      <div className="container" style={{ paddingTop: '20px', paddingBottom: '40px' }}>
        <section style={heroStyle}>
          <h1 style={{ fontSize: '2.8em', marginBottom: '15px' }}>
            <span className="material-icons-outlined" style={{ fontSize: '1.2em', verticalAlign: 'middle', marginRight: '10px' }}>emergency_shield</span>
            GS Alerta Desastres
          </h1>
          <p style={{ fontSize: '1.2em', lineHeight: '1.6', maxWidth: '700px', margin: '0 auto' }}>
            Uma solução inovadora para monitoramento de desastres naturais e envio de alertas em tempo real,
            utilizando dados da NASA EONET e geolocalização para proteger comunidades.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ textAlign: 'center', fontSize: '2em', marginBottom: '25px', color: '#333' }}>Sobre o Projeto</h2>
          <p style={{ textAlign: 'center', fontSize: '1.1em', lineHeight: '1.7', color: '#555', maxWidth: '800px', margin: '0 auto' }}>
            O <strong>GS Alerta Desastres</strong> é um projeto desenvolvido para a Global Solution da FIAP.
            Ele integra um backend robusto em Java com Spring Boot e um frontend moderno em TypeScript com Next.js.
            O sistema permite o cadastro de clientes, consulta a eventos de desastres naturais fornecidos pela API EONET da NASA,
            e (futuramente) o envio de alertas personalizados baseados na proximidade dos clientes aos eventos.
            Nosso objetivo é fornecer uma ferramenta eficaz para prevenção e mitigação dos impactos de desastres naturais.
          </p>
        </section>

        <section>
          <h2 style={{ textAlign: 'center', fontSize: '2em', marginBottom: '30px', color: '#333' }}>Funcionalidades Principais</h2>
          <div style={cardContainerStyle}>
            <Link href="/clientes/listar" style={cardStyle} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
              <span className="material-icons-outlined" style={cardIconStyle}>group</span>
              <span style={cardTitleStyle}>Gerenciar Usuários</span>
              <span style={cardDescriptionStyle}>Cadastre, visualize, edite e delete informações de clientes.</span>
            </Link>
            <Link href="/desastres" style={cardStyle} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
              <span className="material-icons-outlined" style={cardIconStyle}>volcano</span>
              <span style={cardTitleStyle}>Painel de Desastres</span>
              <span style={cardDescriptionStyle}>Acesse dados da EONET, sincronize eventos e visualize mapas e estatísticas.</span>
            </Link>
            <Link href="/contato" style={cardStyle} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
              <span className="material-icons-outlined" style={cardIconStyle}>contact_mail</span>
              <span style={cardTitleStyle}>Fale Conosco</span>
              <span style={cardDescriptionStyle}>Conheça a equipe MetaMind e entre em contato.</span>
            </Link>
          </div>
        </section>

        {/* SEÇÃO ATUALIZADA PARA INCLUIR AMBOS OS LINKS */}
        <section style={{ ...sectionStyle, textAlign: 'center', backgroundColor: 'transparent', border: 'none', boxShadow: 'none', marginTop: '30px' }}>
          <h2 style={{ fontSize: '2em', marginBottom: '25px', color: '#333' }}>Recursos Adicionais</h2> {/* Título ajustado */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}> {/* Div para agrupar e espaçar os botões */}
            <a
                href="https://github.com/carmipa/GS_FIAP_2025_1SM" // Link do seu projeto GitHub
                target="_blank"
                rel="noopener noreferrer"
                style={githubLinkStyle}
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
            >
              <span className="material-icons-outlined">code</span>
              Ver Projeto no GitHub
            </a>

            {/* NOVO LINK ADICIONADO AQUI */}
            <a
                href="https://www.fiap.com.br/graduacao/global-solution/"
                target="_blank"
                rel="noopener noreferrer"
                style={fiapLinkStyle} // Aplicando o novo estilo
                onMouseOver={handleMouseOver} // Reutilizando a função de hover (efeito de subida)
                onMouseOut={handleMouseOut}  // Reutilizando a função de hover (efeito de descida)
            >
              <span className="material-icons-outlined">school</span>
              Saiba mais sobre a Global Solution FIAP
            </a>
          </div>
        </section>
      </div>
  );
}