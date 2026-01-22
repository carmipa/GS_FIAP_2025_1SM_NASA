// src/app/desastres/estatisticas/page.tsx
// Este componente deve ser compatível com as definições de apiService.ts e types.ts
// que foram alinhadas com o backend C#.
'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { Bar, Pie, Doughnut, PolarArea } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LogarithmicScale, // Importado no original, mantido
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    RadialLinearScale // Necessário para PolarArea
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
    backgroundColor: string | string[];
    borderColor: string | string[];
    borderWidth: number;
    offset?: number[]; // Usado no original para Pie/Doughnut
}

interface ChartDataState {
    labels: string[];
    datasets: ChartDataset[];
}

const periodOptions = [
    { label: 'Últimos 30 dias', value: 30 }, { label: 'Últimos 60 dias', value: 60 },
    { label: 'Últimos 90 dias', value: 90 }, { label: 'Últimos 120 dias', value: 120 },
    { label: 'Últimos 180 dias (6 meses)', value: 180 }, { label: 'Últimos 240 dias (8 meses)', value: 240 },
    { label: 'Últimos 360 dias (aprox. 1 ano)', value: 360 }, { label: 'Último Ano (365 dias)', value: 365 },
    { label: 'Últimos 2 Anos', value: 365 * 2 }, { label: 'Últimos 5 Anos', value: 365 * 5 },
    { label: 'Últimos 10 Anos', value: 365 * 10 }, { label: 'Últimos 15 Anos', value: 365 * 15 },
    { label: 'Últimos 20 Anos', value: 365 * 20 }, { label: 'Últimos 25 Anos', value: 365 * 25 },
    { label: 'Últimos 30 Anos', value: 365 * 30 }, { label: 'Últimos 35 Anos', value: 365 * 35 },
    { label: 'Últimos 40 Anos', value: 365 * 40 }, { label: 'Máximo Histórico (ex: 50 Anos)', value: 365 * 50 }
];

// Cores fixas para os gráficos
const ثابتColors = [ // 'ثابت' significa 'fixo/constante' em árabe, nome original mantido
    'rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)',
    'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)',
    'rgba(199, 199, 199, 0.7)', 'rgba(83, 102, 89, 0.7)', 'rgba(140, 160, 175, 0.7)',
    'rgba(220, 130, 80, 0.7)'
];

const generateChartColors = (numColors: number): string[] => {
    const colors: string[] = [];
    for (let i = 0; i < numColors; i++) {
        colors.push(ثابتColors[i % ثابتColors.length]);
    }
    return colors;
};

type ActiveGraphTab = 'barrasVerticais' | 'pizza' | 'barrasHorizontais' | 'doughnut' | 'polarArea';

export default function EstatisticasDesastresPage() {
    const [rawStatsData, setRawStatsData] = useState<CategoryCountDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPeriodDays, setSelectedPeriodDays] = useState<number>(365); // Padrão para Último Ano
    const [activeGraphTab, setActiveGraphTab] = useState<ActiveGraphTab>('barrasVerticais');

    useEffect(() => {
        const fetchStats = async () => {
            if (!selectedPeriodDays) return;
            setLoading(true);
            setError(null);
            setRawStatsData([]); // Limpa dados antigos antes de nova busca
            try {
                const data: CategoryCountDTO[] = await getEonetCategoryStats(selectedPeriodDays);
                if (data && data.length > 0) {
                    setRawStatsData(data);
                } else {
                    const selectedLabel = periodOptions.find(p => p.value === selectedPeriodDays)?.label || `${selectedPeriodDays} dias`;
                    setError(`Nenhuma estatística de categoria encontrada para o período: ${selectedLabel}. Verifique se há eventos locais sincronizados nesse período.`);
                }
            } catch (err: any) {
                console.error("Erro ao buscar estatísticas:", err);
                setError(`Falha ao carregar estatísticas: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [selectedPeriodDays]);

    const chartData = useMemo((): ChartDataState | null => {
        if (!rawStatsData || rawStatsData.length === 0) return null;

        const labels = rawStatsData.map(item => item.categoryTitle);
        const counts = rawStatsData.map(item => item.count);
        const backgroundColors = generateChartColors(labels.length);
        const borderColors = backgroundColors.map(color => color.replace('0.7', '1')); // Para bordas mais sólidas

        // Lógica de offset para destacar fatias pequenas em Pizza/Doughnut (do original)
        const totalCountForOffset = counts.reduce((sum, current) => sum + current, 0);
        const chartOffsets = counts.map(count => (count > 0 && totalCountForOffset > 0 && count < (totalCountForOffset * 0.05)) ? 20 : 0);

        return {
            labels,
            datasets: [{
                label: `Nº de Eventos por Categoria`,
                data: counts,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1,
                offset: chartOffsets, // Aplicável a Pie/Doughnut
            }],
        };
    }, [rawStatsData]);

    const commonChartTitle = `Eventos por Categoria (${periodOptions.find(p => p.value === selectedPeriodDays)?.label || selectedPeriodDays + ' dias'})`;

    const tooltipCallback = (context: any) => {
        const label = context.label || '';
        // Para PolarArea, o valor está em context.parsed.r
        // Para Pie/Doughnut, context.parsed direto
        // Para Bar, context.parsed.y (vertical) ou context.parsed.x (horizontal)
        let value = context.parsed;
        if (typeof context.parsed === 'object' && context.parsed !== null) {
            value = context.parsed.r ?? context.parsed.y ?? context.parsed.x ?? context.parsed;
        }

        let sum = 0;
        const data = context.chart.data.datasets[0].data;
        if (data && Array.isArray(data)) {
            sum = data.reduce((a: number, b: number) => a + b, 0);
        }
        const percentage = sum > 0 ? ((Number(value) / sum) * 100).toFixed(1) + '%' : '0.0%';
        return `${label}: ${Number(value).toLocaleString()} (${percentage})`;
    };

    const barChartOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { display: true, position: 'top' as const },
            title: { display: true, text: `${commonChartTitle} - Escala Logarítmica`, font: { size: 16 } },
            tooltip: { callbacks: { label: (context: any) => `${context.dataset.label || ''}: ${context.parsed.y.toLocaleString()}` }}
        },
        scales: {
            y: { type: 'logarithmic' as const, position: 'left' as const, min: 0.1, title: { display: true, text: 'Número de Eventos (Escala Logarítmica)' } },
            x: { title: { display: true, text: 'Categorias de Eventos' } }
        }
    };

    const horizontalBarChartOptions = {
        indexAxis: 'y' as const, responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { display: true, position: 'top' as const },
            title: { display: true, text: `${commonChartTitle} - Barras Horizontais (Escala Log)`, font: { size: 16 } },
            tooltip: { callbacks: { label: (context: any) => `${context.dataset.label || ''}: ${context.parsed.x.toLocaleString()}` }}
        },
        scales: {
            x: { type: 'logarithmic' as const, position: 'bottom' as const, min: 0.1, title: { display: true, text: 'Número de Eventos (Escala Logarítmica)' } },
            y: { title: { display: true, text: 'Categorias de Eventos' } }
        }
    };

    const pieChartOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { display: true, position: 'top' as const },
            title: { display: true, text: `Distribuição ${commonChartTitle}`, font: { size: 16 } },
            tooltip: { callbacks: { label: tooltipCallback } }
        }
    };

    const doughnutChartOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { display: true, position: 'top' as const },
            title: { display: true, text: `Distribuição ${commonChartTitle} (Rosca)`, font: { size: 16 } },
            tooltip: { callbacks: { label: tooltipCallback } }
        }
    };

    const polarAreaChartOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { display: true, position: 'top' as const },
            title: { display: true, text: `Comparativo ${commonChartTitle} (Área Polar)`, font: { size: 16 } },
            tooltip: { callbacks: { label: tooltipCallback } }
        },
        scales: {
            r: {
                beginAtZero: true,
                // ticks: { z: 1 } // Para evitar sobreposição de ticks se necessário (do original)
            }
        }
    };

    const tabButtonStyle = (tabKey: ActiveGraphTab): React.CSSProperties => ({
        padding: '10px 15px',
        cursor: 'pointer',
        border: '1px solid #ccc',
        borderBottom: activeGraphTab === tabKey ? '1px solid transparent' : '1px solid #ccc',
        backgroundColor: activeGraphTab === tabKey ? 'white' : '#f0f0f0',
        fontWeight: activeGraphTab === tabKey ? 'bold' : 'normal',
        marginRight: '-1px', // Para sobrepor bordas
        borderTopLeftRadius: '5px',
        borderTopRightRadius: '5px',
        position: 'relative',
        bottom: activeGraphTab === tabKey ? '-1px' : '0', // Eleva a aba ativa
        zIndex: activeGraphTab === tabKey ? 2 : 1,
        display: 'inline-flex', alignItems: 'center', gap: '5px'
    });


    return (
        <div className="container estatisticas-page" style={{ paddingBottom: '20px' }}>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                <span className="material-icons-outlined" style={{ fontSize: '1.8em' }}>leaderboard</span>
                Estatísticas de Desastres EONET (Locais)
            </h1>

            <div className="form-container" style={{ maxWidth: '400px', margin: '0 auto 30px auto' }}>
                <div className="form-group">
                    <label htmlFor="periodSelect" style={{ fontWeight: '500', display: 'block', marginBottom: '5px' }}>Selecione o Período:</label>
                    <select
                        id="periodSelect"
                        value={selectedPeriodDays}
                        onChange={(e) => setSelectedPeriodDays(Number(e.target.value))}
                        disabled={loading}
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                    >
                        {periodOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                    </select>
                </div>
            </div>

            <div style={{ marginBottom: '0px', borderBottom: '1px solid #ccc' }}>
                <button style={tabButtonStyle('barrasVerticais')} onClick={() => setActiveGraphTab('barrasVerticais')}>
                    <span className="material-icons-outlined" style={{fontSize: '1.2em'}}>bar_chart</span>Barras Verticais
                </button>
                <button style={tabButtonStyle('barrasHorizontais')} onClick={() => setActiveGraphTab('barrasHorizontais')}>
                    <span className="material-icons-outlined" style={{fontSize: '1.2em', transform: 'rotate(90deg)'}}>bar_chart</span>Barras Horizontais
                </button>
                <button style={tabButtonStyle('pizza')} onClick={() => setActiveGraphTab('pizza')}>
                    <span className="material-icons-outlined" style={{fontSize: '1.2em'}}>pie_chart</span>Pizza
                </button>
                <button style={tabButtonStyle('doughnut')} onClick={() => setActiveGraphTab('doughnut')}>
                    <span className="material-icons-outlined" style={{fontSize: '1.2em'}}>donut_small</span>Rosca
                </button>
                <button style={tabButtonStyle('polarArea')} onClick={() => setActiveGraphTab('polarArea')}>
                    <span className="material-icons-outlined" style={{fontSize: '1.2em'}}>flare</span>Área Polar
                </button>
            </div>

            <div style={{ border: '1px solid #ccc', borderTop: 'none', padding: '20px', borderRadius: '0 0 6px 6px', backgroundColor: '#fff', minHeight: '450px' }}>
                {loading && (<div className="flex items-center justify-center" style={{minHeight: '400px'}}><p className="text-lg text-slate-600">Carregando estatísticas...</p></div>)}
                {error && !loading && (<div className="message error" style={{textAlign: 'center', padding: '20px'}}><p>{error}</p></div>)}
                {!loading && !error && chartData && (
                    <div style={{ height: '60vh', minHeight: '400px' }}>
                        {activeGraphTab === 'barrasVerticais' && <Bar options={barChartOptions} data={chartData} />}
                        {activeGraphTab === 'barrasHorizontais' && <Bar options={horizontalBarChartOptions} data={chartData} />}
                        {activeGraphTab === 'pizza' && <Pie options={pieChartOptions} data={chartData} />}
                        {activeGraphTab === 'doughnut' && <Doughnut options={doughnutChartOptions} data={chartData} />}
                        {activeGraphTab === 'polarArea' && <PolarArea options={polarAreaChartOptions} data={chartData} />}
                    </div>
                )}
                {!loading && !error && !chartData && (<div className="message info" style={{textAlign: 'center', padding: '20px'}}><p>Selecione um período para visualizar as estatísticas ou nenhum dado foi encontrado.</p></div>)}
            </div>
        </div>
    );
}