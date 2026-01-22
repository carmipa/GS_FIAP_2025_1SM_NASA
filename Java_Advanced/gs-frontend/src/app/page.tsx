'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import Image from 'next/image';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// --- Definição de Tipos ---
interface NoticiaDesastre {
  id: string;
  titulo: string;
  linkUrl: string;
  dataPublicacao: string;
  fonte?: string;
  resumoHtml?: string;
  imagemUrl?: string;
}

interface ReliefWebReportFields {
  title: string;
  'body-html'?: string;
  date: { created: string };
  source?: { name: string }[];
  url?: string;
  image?: { url?: string; 'url-small'?: string; 'url-thumb'?: string };
  file?: { preview?: { 'url-small'?: string; 'url-thumb'?: string } }[];
}

interface ReliefWebReport {
  id: string;
  href: string;
  fields: ReliefWebReportFields;
}

interface ReliefWebApiResponse {
  data: ReliefWebReport[];
}

interface TechShield {
  name: string;
  backgroundColor: string;
  color?: string;
}

const technologies: TechShield[] = [
  { name: 'JAVA', backgroundColor: '#f89820', color: '#000000' },
  { name: 'SPRING BOOT', backgroundColor: '#6DB33F', color: '#FFFFFF' },
  { name: 'ORACLE', backgroundColor: '#F80000', color: '#FFFFFF' },
  { name: 'SWAGGER', backgroundColor: '#85EA2D', color: '#000000' },
  { name: 'OPENAPI', backgroundColor: '#6BA539', color: '#FFFFFF' },
  { name: 'NEXT.JS', backgroundColor: '#000000', color: '#FFFFFF' },
  { name: 'REACT', backgroundColor: '#61DAFB', color: '#000000' },
  { name: 'TYPESCRIPT', backgroundColor: '#3178C6', color: '#FFFFFF' },
  { name: 'LEAFLET', backgroundColor: '#199900', color: '#FFFFFF' },
  { name: 'CHART.JS', backgroundColor: '#FF6384', color: '#FFFFFF' },
  { name: 'REACT SLICK', backgroundColor: '#3498DB', color: '#FFFFFF' },
  { name: 'NASA EONET API', backgroundColor: '#11356F', color: '#FFFFFF' },
  { name: 'GOOGLE GEOCODING API', backgroundColor: '#34A853', color: '#FFFFFF' },
  { name: 'VIACEP API', backgroundColor: '#5CB85C', color: '#FFFFFF' },
  { name: 'RELIEFWEB API', backgroundColor: '#007bff', color: '#FFFFFF' },
  { name: 'OPENSTREETMAP', backgroundColor: '#7FBC6E', color: '#000000' },
];


export default function HomePage() {
  const [noticias, setNoticias] = useState<NoticiaDesastre[]>([]);
  const [loadingNoticias, setLoadingNoticias] = useState<boolean>(true);
  const [erroNoticias, setErroNoticias] = useState<string | null>(null);

  useEffect(() => {
    const fetchNoticiasDeDesastres = async () => {
      setLoadingNoticias(true);
      setErroNoticias(null);

      const reliefWebUrl =
        'https://api.reliefweb.int/v1/reports?appname=gs-alerta-desastres-frontend&preset=latest&limit=12&profile=list&fields[include][]=id&fields[include][]=title&fields[include][]=url&fields[include][]=source.name&fields[include][]=date.created&fields[include][]=body-html&fields[include][]=file.preview.url-small&fields[include][]=image.url';

      try {
        const response = await fetch(reliefWebUrl);
        if (!response.ok) {
          throw new Error(
            `Falha ao buscar notícias da ReliefWeb: ${response.status} ${response.statusText}`
          );
        }
        const apiData: ReliefWebApiResponse = await response.json();

        if (apiData && apiData.data) {
          const noticiasFormatadas: NoticiaDesastre[] = apiData.data.map((item) => {
            let imageUrl: string | undefined = undefined;
            if (item.fields.image?.url) {
              imageUrl = item.fields.image.url;
            } else if (item.fields.image?.['url-small']) {
              imageUrl = item.fields.image['url-small'];
            } else if (
              item.fields.file &&
              item.fields.file.length > 0 &&
              item.fields.file[0]?.preview?.['url-small']
            ) {
              imageUrl = item.fields.file[0].preview['url-small'];
            }

            let linkNoticiaFinal: string;
            if (item.fields.url) {
              linkNoticiaFinal = item.fields.url;
            } else {
              linkNoticiaFinal = `https://reliefweb.int/report/${item.id}`;
            }
            
            return {
              id: item.id,
              titulo: item.fields.title,
              linkUrl: linkNoticiaFinal,
              dataPublicacao: item.fields.date.created,
              fonte:
                item.fields.source && item.fields.source.length > 0
                  ? item.fields.source[0].name
                  : 'ReliefWeb',
              resumoHtml: item.fields['body-html'],
              imagemUrl: imageUrl,
            };
          });
          setNoticias(noticiasFormatadas);
        } else {
          setNoticias([]);
        }
      } catch (err: unknown) {
        console.error('Erro ao buscar notícias:', err);
        let errorMessage = 'Não foi possível carregar as últimas notícias sobre desastres.';
        if (err instanceof Error) {
            errorMessage = err.message || errorMessage;
        } else if (typeof err === 'string') {
            errorMessage = err;
        }
        setErroNoticias(errorMessage);
      } finally {
        setLoadingNoticias(false);
      }
    };

    fetchNoticiasDeDesastres();
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: noticias.length > 4,
    speed: 600,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    pauseOnHover: true,
    arrows: true,
    responsive: [
      {
        breakpoint: 1200,
        settings: { slidesToShow: 3, arrows: true },
      },
      {
        breakpoint: 992,
        settings: { slidesToShow: 2, arrows: false },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1, arrows: false },
      },
    ],
  };

  const heroStyle: React.CSSProperties = {
    padding: '50px 20px',
    backgroundColor: '#00579D',
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

  const newsSectionStyle: React.CSSProperties = {
    margin: '0px auto 40px auto',
    padding: '20px',
    maxWidth: '100%',
    boxSizing: 'border-box',
    backgroundColor: '#f0f3f5',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
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
    backgroundColor: '#ffffff',
    color: '#333',
    textDecoration: 'none',
    borderRadius: '8px',
    textAlign: 'center',
    width: '280px',
    minHeight: '180px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    border: '1px solid #e0e0e0',
  };

  const cardIconStyle: React.CSSProperties = {
    fontSize: '3em',
    marginBottom: '15px',
    color: '#007bff',
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

  const resourcesAndTechSectionStyle: React.CSSProperties = {
    padding: '30px 20px',
    backgroundColor: '#F8F9FA',
    borderRadius: '8px',
    marginTop: '40px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.07)',
  };



  const techShieldsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '20px'
  };

  const shieldStyle: React.CSSProperties = {
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '0.9em',
    fontWeight: 500,
    display: 'inline-block',
  };

  const handleMouseOverCard = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = 'translateY(-5px)';
    e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.2)';
  };
  const handleMouseOutCard = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
  };

  return (
    <div className="container" style={{ paddingTop: '20px', paddingBottom: '40px' }}>
      <section style={heroStyle}>
        <h1 style={{ fontSize: '2.8em', marginBottom: '15px' }}>
          <span
            className="material-icons-outlined"
            style={{ fontSize: '1.2em', verticalAlign: 'middle', marginRight: '10px' }}
          >
            emergency_shield
          </span>
          GS Alerta Desastres
        </h1>
        <p style={{ fontSize: '1.2em', lineHeight: '1.6', maxWidth: '700px', margin: '0 auto' }}>
          Uma solução inovadora para monitoramento de desastres naturais e envio de alertas em tempo real,
          utilizando dados da NASA EONET e geolocalização para proteger comunidades.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: '2em', marginBottom: '25px', color: '#333' }}>
          Sobre o Projeto
        </h2>
        <p style={{ textAlign: 'center', fontSize: '1.1em', lineHeight: '1.7', color: '#555', maxWidth: '800px', margin: '0 auto' }}>
          O <strong>GS Alerta Desastres</strong> é um projeto desenvolvido para a Global Solution da FIAP. Ele
          integra um backend robusto em Java com Spring Boot e um frontend moderno em TypeScript com Next.js. O
          sistema permite o cadastro de clientes, consulta a eventos de desastres naturais fornecidos pela API
          EONET da NASA, e o envio de alertas personalizados baseados na proximidade dos clientes
          aos eventos. Nosso objetivo é fornecer uma ferramenta eficaz para prevenção e mitigação dos impactos de
          desastres naturais.
        </p>
      </section>

      <section>
        <h2 style={{ textAlign: 'center', fontSize: '2em', marginBottom: '30px', color: '#333' }}>
          Funcionalidades Principais
        </h2>
        <div style={cardContainerStyle}>
          <Link href="/clientes/listar" style={cardStyle} onMouseOver={handleMouseOverCard} onMouseOut={handleMouseOutCard}>
            <span className="material-icons-outlined" style={cardIconStyle}>group</span>
            <span style={cardTitleStyle}>Gerenciar Usuários</span>
            <span style={cardDescriptionStyle}>Cadastre, visualize, edite e delete informações de clientes.</span>
          </Link>
          <Link href="/desastres" style={cardStyle} onMouseOver={handleMouseOverCard} onMouseOut={handleMouseOutCard}>
            <span className="material-icons-outlined" style={cardIconStyle}>volcano</span>
            <span style={cardTitleStyle}>Painel de Desastres</span>
            <span style={cardDescriptionStyle}>Acesse dados da EONET, sincronize eventos e visualize mapas e estatísticas.</span>
          </Link>
          <Link href="/contato" style={cardStyle} onMouseOver={handleMouseOverCard} onMouseOut={handleMouseOutCard}>
            <span className="material-icons-outlined" style={cardIconStyle}>contact_mail</span>
            <span style={cardTitleStyle}>Fale Conosco</span>
            <span style={cardDescriptionStyle}>Conheça a equipe MetaMind e entre em contato.</span>
          </Link>
        </div>
      </section>
      
      {loadingNoticias && (
        <div style={{textAlign: 'center', padding: '30px'}}>
          <p className="message info">Carregando últimas notícias sobre desastres...</p>
        </div>
      )}
      {erroNoticias && (
        <div style={{textAlign: 'center', padding: '30px'}}>
          <p className="message error">{erroNoticias}</p>
        </div>
      )}
      {!loadingNoticias && noticias.length > 0 && (
        <section style={newsSectionStyle}>
          <h2 style={{ textAlign: 'center', fontSize: '2em', marginBottom: '25px', color: '#333' }}>
            <span className="material-icons-outlined" style={{ fontSize: '1.1em', verticalAlign: 'bottom', marginRight: '8px' }}>feed</span>
            Últimas Notícias e Alertas de Desastres
          </h2>
          <Slider {...sliderSettings}>
            {noticias.map(noticia => (
              <div key={noticia.id} style={{ padding: '0 8px' }}>
                <a href={noticia.linkUrl} target="_blank" rel="noopener noreferrer" aria-label={`Ler mais sobre ${noticia.titulo}`}
                   style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '380px' }}>
                  <div style={{
                    border: '1px solid #ddd', borderRadius: '8px',
                    overflow: 'hidden', backgroundColor: 'white',
                    display: 'flex', flexDirection: 'column', height: '100%',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                       onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.1)';}}
                       onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';}}
                  >
                    {noticia.imagemUrl ? (
                      <div style={{ position: 'relative', width: '100%', height: '180px' }}>
                        <Image
                            src={noticia.imagemUrl}
                            alt={`Imagem da notícia: ${noticia.titulo}`}
                            fill={true}
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div style={{ width: '100%', height: '180px', backgroundColor: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6c757d' }}>
                        <span className="material-icons-outlined" style={{fontSize: '3em'}}>image_not_supported</span>
                      </div>
                    )}
                    <div style={{ padding: '15px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h3 style={{
                          fontSize: '1rem', fontWeight: 'bold', margin: '0 0 8px 0',
                          color: '#0056b3',
                          height: '60px',
                          overflow: 'hidden',
                          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical'
                        }} title={noticia.titulo}>
                          {noticia.titulo}
                        </h3>
                      </div>
                      <div>
                        <small style={{ color: '#007bff', fontWeight: '500', display: 'block', marginBottom: '3px' }}>
                          {noticia.fonte || 'Fonte não disponível'}
                        </small>
                        <small style={{ color: '#777', display: 'block' }}>
                          {new Date(noticia.dataPublicacao).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short', year: 'numeric'})}
                        </small>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </Slider>
        </section>
      )}
      
      <section style={resourcesAndTechSectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: '1.8em', marginBottom: '25px', color: '#333' }}>Tecnologias Utilizadas</h2>
        <div style={techShieldsContainerStyle}>
          {technologies.map(tech => (
              <span
                  key={tech.name}
                  style={{
                      ...shieldStyle,
                      backgroundColor: tech.backgroundColor,
                      color: tech.color || '#FFFFFF'
                  }}
                  title={tech.name}
              >
              {tech.name}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}