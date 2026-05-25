import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import styles from '../styles/AttendancesStatusPieChart.module.css';

type AttendanceStatusPieChartProps = {
    data: number[]; 
    labels: string[]; 
    title?: string; 
};

export default function AttendanceStatusPieChart({
    data,
    labels,
    title = 'Attendance Status'
}: AttendanceStatusPieChartProps) {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (!chartRef.current) return;

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        const backgroundColors = ['#4caf50', '#f44336', '#ffc107']; // Green, Red, Yellow

        chartInstanceRef.current = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: title,
                        data: data,
                        backgroundColor: backgroundColors,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: title,
                    },
                },
            },
        });

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [data, labels, title]);

    return (
        <section className={styles.chartContainer}>
            <canvas ref={chartRef}></canvas>
        </section>
    );
}
