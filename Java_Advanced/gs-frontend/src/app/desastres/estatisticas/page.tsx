'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Bar, Pie, Doughnut, PolarArea } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  TooltipItem,
  ChartTypeRegistry,
  Chart
} from 'chart.js';
import { getEonetCategoryStats } from '@/lib/apiService';
import type { CategoryCountDTO } from '@/lib/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string[];
  borderColor: string[];
  borderWidth: number;
  offset?: number[];
}

interface ChartDataState {
  labels: string[];
  datasets: ChartDataset[];
}

const periodOptions = [
  { label: 'Últimos 30 dias', value: 30 },
  { label: 'Últimos 90 dias', value: 90 },
  { label: 'Último Ano (365 dias)', value: 365 },
  { label: 'Últimos 5 Anos', value: 365 * 5 },
  { label: 'Últimos 10 Anos', value: 365 * 10 },
  { label: 'Máximo Histórico (50 Anos)', value: 365 * 50 }
];

const fixedColors = [
  'rgba(255, 99, 132, 0.7)',
  'rgba(54, 162, 235, 0.7)',
  'rgba(255, 206, 86, 0.7)',
  'rgba(75, 192, 192, 0.7)',
  'rgba(153, 102, 255, 0.7)',
  'rgba(255, 159, 64, 0.7)',
  'rgba(199, 199, 199, 0.7)',
  'rgba(83, 102, 89, 0.7)',
  'rgba(140, 160, 175, 0.7)',
  'rgba(220, 130, 80, 0.7)'
];

const generateChartColors = (numColors: number): string[] => {
  const colors: string[] = [];
  for (let i = 0; i < numColors; i++) {
    colors.push(fixedColors[i % fixedColors.length]);
  }
  return colors;
};

type ActiveGraphTab = 'barrasVerticais' | 'barrasHorizontais' | 'pizza' | 'doughnut' | 'polarArea';

export default function EstatisticasDesastresPage() {
  const [rawStatsData, setRawStatsData] = useState<CategoryCountDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriodDays, setSelectedPeriodDays] = useState<number>(365);
  const [activeGraphTab, setActiveGraphTab] = useState<ActiveGraphTab>('barrasVerticais');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      setRawStatsData([]);
      try {
        const data = await getEonetCategoryStats(selectedPeriodDays);
        if (data && data.length > 0) {
          setRawStatsData(data);
        } else {
          const chosenLabel = periodOptions.find((p) => p.value === selectedPeriodDays)?.label || `${selectedPeriodDays} dias`;
          setError(`Nenhuma estatística encontrada para o período: ${chosenLabel}.`);
        }
      } catch (err: unknown) {
        console.error('Erro ao buscar estatísticas:', err);
        const msg = err instanceof Error ? err.message : 'Falha ao carregar estatísticas.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedPeriodDays]);

  const chartData = useMemo<ChartDataState | null>(() => {
    if (!rawStatsData.length) return null;
    const labels = rawStatsData.map((item) => item.categoryTitle);
    const counts = rawStatsData.map((item) => item.count);
    const backgroundColors = generateChartColors(labels.length);
    const borderColors = backgroundColors.map((color) => color.replace(/0\.7\)$/, '1)'));
    const totalCount = counts.reduce((acc, val) => acc + val, 0);
    const offsets = counts.map((c) => (c > 0 && totalCount > 0 && c < totalCount * 0.05 ? 20 : 0));

    return {
      labels,
      datasets: [
        {
          label: 'Nº de Eventos',
          data: counts,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
          offset: offsets,
        },
      ],
    };
  }, [rawStatsData]);

  const baseTitle = `Eventos por Categoria (${periodOptions.find((p) => p.value === selectedPeriodDays)?.label || selectedPeriodDays + ' dias'})`;

  const generalTooltipCallback = (context: TooltipItem<keyof ChartTypeRegistry>): string => {
    const label = context.label || context.dataset.label || '';
    let value = 0;
    const parsed = context.parsed;

    if (typeof parsed === 'number') {
      value = parsed;
    } else if (typeof parsed === 'object' && parsed !== null) {
      const parsedObj = parsed as Record<string, unknown>;
      if ('r' in parsedObj && typeof parsedObj.r === 'number') {
        value = parsedObj.r;
      } else if ('y' in parsedObj && typeof parsedObj.y === 'number') {
        value = parsedObj.y;
      } else if ('x' in parsedObj && typeof parsedObj.x === 'number') {
        value = parsedObj.x;
      }
    }

    const chartTyped = context.chart as Chart<keyof ChartTypeRegistry>;
    const chartType = (chartTyped.config as { type: string }).type;
    
    if (chartType === 'pie' || chartType === 'doughnut') {
      let sum = 0;
      const ds = context.chart.data.datasets[context.datasetIndex].data as number[];
      if (Array.isArray(ds)) {
        sum = ds.reduce((a, b) => a + (b || 0), 0);
      }
      const pct = sum > 0 ? ((value / sum) * 100).toFixed(1) + '%' : '0%';
      return `${label}: ${value.toLocaleString()} (${pct})`;
    }
    
    return `${label}: ${value.toLocaleString()}`;
    
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' as const },
      tooltip: { callbacks: { label: generalTooltipCallback } },
    },
  };

  const barChartOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: `${baseTitle} - Escala Logarítmica`,
        font: { size: 16 },
      },
    },
    scales: {
      y: { type: 'logarithmic' as const, min: 0.1, title: { display: true, text: 'Nº de Eventos (Log)' } },
      x: { title: { display: true, text: 'Categorias' } },
    },
  };

  const horizontalBarChartOptions = {
    ...commonOptions,
    indexAxis: 'y' as const,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: `${baseTitle} - Barras Horizontais (Log)`,
        font: { size: 16 },
      },
    },
    scales: {
      x: { type: 'logarithmic' as const, min: 0.1, title: { display: true, text: 'Nº de Eventos (Log)' } },
      y: { title: { display: true, text: 'Categorias' } },
    },
  };

  const pieChartOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: { display: true, text: `Distribuição ${baseTitle}`, font: { size: 16 } },
    },
  };

  const doughnutChartOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: { display: true, text: `Distribuição ${baseTitle} (Rosca)`, font: { size: 16 } },
    },
  };

  const polarAreaChartOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: { display: true, text: `Comparativo ${baseTitle} (Área Polar)`, font: { size: 16 } },
    },
    scales: {
      r: { beginAtZero: true },
    },
  };

  const tabButtonStyle = (tabKey: ActiveGraphTab): React.CSSProperties => ({
    padding: '8px 16px',
    cursor: 'pointer',
    border: '1px solid #ccc',
    borderBottomColor: activeGraphTab === tabKey ? '#fff' : '#ccc',
    backgroundColor: activeGraphTab === tabKey ? '#fff' : '#f3f3f3',
    fontWeight: activeGraphTab === tabKey ? 600 : 500,
    marginRight: '4px',
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px',
    color: activeGraphTab === tabKey ? '#000' : '#333',
    position: 'relative',
    bottom: '-1px',
    zIndex: activeGraphTab === tabKey ? 2 : 1,
  });

  return (
    <div className="container estatisticas-page">
      <h1 className="page-title">
        <span className="material-icons-outlined">leaderboard</span>
        Estatísticas de Desastres EONET
      </h1>

      <div className="form-container" style={{ maxWidth: '380px', margin: '0 auto 28px auto' }}>
        <div className="form-group">
          <label htmlFor="periodSelect" style={{ fontWeight: 500, display: 'block', marginBottom: '5px' }}>
            Selecione o Período:
          </label>
          <select
            id="periodSelect"
            value={selectedPeriodDays}
            onChange={(e) => setSelectedPeriodDays(Number(e.target.value))}
            disabled={loading}
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '0', borderBottom: '1px solid #ccc' }}>
        <button style={tabButtonStyle('barrasVerticais')} onClick={() => setActiveGraphTab('barrasVerticais')}>
          Barras Verticais
        </button>
        <button style={tabButtonStyle('barrasHorizontais')} onClick={() => setActiveGraphTab('barrasHorizontais')}>
          Barras Horizontais
        </button>
        <button style={tabButtonStyle('pizza')} onClick={() => setActiveGraphTab('pizza')}>
          Pizza
        </button>
        <button style={tabButtonStyle('doughnut')} onClick={() => setActiveGraphTab('doughnut')}>
          Rosca
        </button>
        <button style={tabButtonStyle('polarArea')} onClick={() => setActiveGraphTab('polarArea')}>
          Área Polar
        </button>
      </div>

      <div
        style={{
          border: '1px solid #ccc',
          borderTop: 'none',
          padding: '16px',
          borderRadius: '0 0 6px 6px',
          backgroundColor: '#fff',
          minHeight: '480px',
        }}
      >
        {loading && <p className="message info">Carregando estatísticas...</p>}
        {!loading && error && <p className="message error">{error}</p>}
        {!loading && !error && chartData && (
          <div style={{ height: '65vh', minHeight: '420px', position: 'relative' }}>
            {activeGraphTab === 'barrasVerticais' && <Bar options={barChartOptions} data={chartData} />}
            {activeGraphTab === 'barrasHorizontais' && <Bar options={horizontalBarChartOptions} data={chartData} />}
            {activeGraphTab === 'pizza' && <Pie options={pieChartOptions} data={chartData} />}
            {activeGraphTab === 'doughnut' && <Doughnut options={doughnutChartOptions} data={chartData} />}
            {activeGraphTab === 'polarArea' && <PolarArea options={polarAreaChartOptions} data={chartData} />}
          </div>
        )}
      </div>
    </div>
  );
}
