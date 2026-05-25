import styles from '../styles/AttendancesEachMonthChart.module.css';

import Chart from 'chart.js/auto';
import { useEffect, useRef } from 'react';
import useAppContext from '~hooks/useAppContext';
import themeUtils from '~utils/themeUtils';

type AttendancesEachMonthChartProps = {
    data: number[]; 
    label?: string;
};

export default function AttendancesEachMonthChart({
    data,
    label
}: AttendancesEachMonthChartProps) {
    const { appLanguage } = useAppContext();
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (!chartRef.current) return;

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        const completeData = Array.from({ length: 12 }, (_, index) => data[index] || 0);

        const total = completeData.reduce((sum, value) => sum + value, 0);
        let cumulativeSum = 0;
        const cumulativePercentage = completeData.map((value, index) => {
            cumulativeSum += value;
            return index >= 3 ? (cumulativeSum / total) * 100 : 0; 
        });

        const labels = Array.from({ length: 12 }, (_, index) =>
            new Date(0, index).toLocaleString(appLanguage.language, { month: 'long' })
        );

        const hexToRgb = (hex: string) => {
            const sanitizedHex = hex.replace('#', '');
            const bigint = parseInt(sanitizedHex, 16);
            const r = (bigint >> 16) & 255;
            const g = (bigint >> 8) & 255;
            const b = bigint & 255;
            return `rgb(${r}, ${g}, ${b})`;
        };

        const rgbToRgba = (rgb: string, alpha: number) => {
            return rgb.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
        };

        const color = themeUtils.getVariable('color-primary');
        const opacityColor = color.startsWith('#')
            ? rgbToRgba(hexToRgb(color), 0.2)
            : rgbToRgba(color, 0.2);

        // Create Pareto chart
        chartInstanceRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: label || 'Attendance',
                        data: completeData,
                        backgroundColor: opacityColor,
                        borderColor: color,
                        borderWidth: 1
                    },
                    {
                        label: 'Cumulative %',
                        data: cumulativePercentage,
                        type: 'line',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'percentage'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Attendance Count'
                        }
                    },
                    percentage: {
                        type: 'linear',
                        position: 'right',
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Cumulative Percentage'
                        },
                        grid: {
                            drawOnChartArea: false 
                        }
                    }
                },
                plugins: {
                    legend: { display: true }
                }
            }
        });

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [appLanguage.language, data, label]);

    return (
        <section className={styles.chartContainer}>
            <canvas ref={chartRef}></canvas>
        </section>
    );
}
