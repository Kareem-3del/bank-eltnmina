const years = ['2025', '2024', '2023', '2022', '2021'];
const target = [80, 88, 88, 92, 89];
const actual = [68, 85, 67, 87, 87];

new Chart(document.getElementById('csiChart'), {
    type: 'bar',
    data: {
        labels: years,
        datasets: [
            {
                label: 'المستهدف السنوي',
                data: target,
                backgroundColor: '#0d9e7a',
                barPercentage: 0.45,
                categoryPercentage: 0.75,
                order: 1
            },
            {
                label: 'الفعلي بالسنوات',
                data: actual,
                backgroundColor: '#b7e4d8',
                barPercentage: 0.45,
                categoryPercentage: 0.75,
                order: 2
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                rtl: true,
                callbacks: {
                    label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}%`
                }
            },
            datalabels: false
        },
        scales: {
            x: {
                grid: { display: false },
                border: { display: false },
                ticks: {
                    font: { size: 13 },
                    color: '#555',
                    autoSkip: false
                }
            },
            y: {
                min: 0,
                max: 100,
                grid: { color: '#f0f0f0' },
                border: { display: false },
                ticks: {
                    stepSize: 25,
                    font: { size: 12 },
                    color: '#999'
                }
            }
        },
        animation: {
            onComplete: function () {
                const chart = this;
                const ctx = chart.ctx;
                ctx.font = 'bold 11px Segoe UI, Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                chart.data.datasets.forEach((dataset, i) => {
                    const meta = chart.getDatasetMeta(i);
                    meta.data.forEach((bar, j) => {
                        const value = dataset.data[j];
                        ctx.fillStyle = '#333';
                        ctx.fillText(value + '%', bar.x, bar.y - 3);
                    });
                });
            }
        }
    }
});