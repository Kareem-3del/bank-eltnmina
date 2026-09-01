const product_years = ['2025', '2024', '2023', '2022', '2021'];
const product_values = [50783, 68705, 56931, 62138, 86507];

const alwaysShowProductValues = {
    id: 'alwaysShowProductValues',
    afterDatasetsDraw(chart) {
        const { ctx } = chart;
        ctx.save();
        ctx.font = 'bold 11px Segoe UI, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        chart.data.datasets.forEach((dataset, i) => {
            const meta = chart.getDatasetMeta(i);
            meta.data.forEach((bar, j) => {
                const value = animatedBarValue(chart, dataset, bar, j);
                // تنسيق الرقم بفواصل الآلاف (مثال: 50,783)
                const formattedValue = value.toLocaleString();

                // لون النص رمادي داكن أو حسب التصميم
                ctx.fillStyle = "#5E7278";
                ctx.fillText(formattedValue, bar.x, bar.y - 6);
            });
        });
        ctx.restore();
    }
};

function createProductChart(dataValues, id) {
    const ele = document.getElementById(id);
    if (!ele) return;

    const isMobileChart = window.innerWidth < 768;

    // تحديد لون مختلف لكل عمود لتطابق التدرج الموجود في تصميم فيجما
    // (يمكنك تعديل الأدرج والألوان حسب رغبتك، مثلاً عمود 2021 أو 2025 بلون بارز والباقي بتدرجات فاتحة)
    const backgroundColors = [
        '#2CB9B0', // 2025 (لون تيل بارز)
        '#62CFC7', // 2024
        '#9FE2DC', // 2023
        '#C2EBE7', // 2022
        '#E1F5F3'  // 2021 (فاتح جداً)
    ];

    const chart = new Chart(ele, {
        type: 'bar',
        plugins: [alwaysShowProductValues, balanceMobileYAxis],
        data: {
            labels: product_years,
            datasets: [
                {
                    data: dataValues,
                    backgroundColor: backgroundColors,
                    barPercentage: 0.6,
                    categoryPercentage: 0.7,
                    borderRadius: {
                        topLeft: 4,
                        topRight: 4,
                        bottomLeft: 0,
                        bottomRight: 0
                    },
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 1400, easing: 'easeOutQuart' },
            animations: {
                y: { from: (ctx) => ctx.chart.scales.y.getPixelForValue(0) },
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    rtl: true,
                    callbacks: {
                        label: ctx => ` المستفيدين: ${ctx.parsed.y.toLocaleString()}`
                    }
                },
                datalabels: false
            },
            scales: {
                x: {
                    grid: { display: false },
                    border: { display: false },
                    ticks: {
                        font: { size: 12, weight: 'bold' },
                        color: '#5E7278',
                        autoSkip: false
                    }
                },
                y: {
                    min: 0,
                    max: 100000, // أقصى حد للـ Y لتناسب أرقام الـ 100,000
                    grid: {
                        display: true,
                        drawOnChartArea: false, // إخفاء الخطوط الداخلية وترك خط المنهج فقط
                        drawTicks: false,
                        color: '#DCE5E5',
                    },
                    border: { display: true, color: '#DCE5E5' },
                    ticks: {
                        stepSize: 20000, // الفواصل: 0, 20k, 40k, 60k, 80k, 100k
                        font: { size: 10 },
                        color: '#5E7278',
                        callback: function (value) {
                            return value.toLocaleString(); // إظهار الأرقام بفواصل
                        }
                    }
                }
            }
        }
    });

    return setupGrowOnView(chart);
}

// تشغيل الشارت وإرسال الـ ID الخاص بالعنصر في الـ HTML
createProductChart(product_values, "product-chart-1");