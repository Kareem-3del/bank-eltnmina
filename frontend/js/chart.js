const years = ['2025', '2024', '2023', '2022', '2021'];

const target_1 = [80, 88, 87, 87, 87];
const actual_1 = [68, 85, 88, 92, 89];

const target_2 = [68, 68, 68, 68, 68];
const actual_2 = [75, 75, 75, 80, 73];

const target_3 = [82, 82, 82, 82, 82];
const actual_3 = [86, 82, 82, 82, 82];

const target_4 = [80, 80, 80, 80, 80];
const actual_4 = [84, 80, 79, 81, 81];

const isAR = (document.documentElement.getAttribute("lang") || "en").toLowerCase().startsWith("ar");

const windowWidth = window.innerWidth;

const alwaysShowValues = {
    id: 'alwaysShowValues',
    // afterDatasetsDraw بتضمن إن الرسم يحصل فوق الأعمدة في كل تحديث (حتى الـ Hover)
    afterDatasetsDraw(chart) {
        const { ctx } = chart;
        ctx.save();
        ctx.font = 'bold 10px Segoe UI, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        chart.data.datasets.forEach((dataset, i) => {
            const meta = chart.getDatasetMeta(i);
            if (i === 0) {
                ctx.fillStyle = "#008A85";
            } else {
                ctx.fillStyle = "#5E7278";
            }
            // ✅ بنحدد لون النص هنا بناءً على لون الـ Dataset (العمود)
            meta.data.forEach((bar, j) => {
                const value = dataset.data[j];

                // الرسم بيعتمد على إحداثيات العمود الحالية (bar.x, bar.y)
                ctx.fillText(value + '%', bar.x, bar.y - 5);
            });
        });
        ctx.restore();
    }
};

function createChart(target, actual, id) {
    const ele = document.getElementById(id);
    if (!ele)
        return;

    new Chart(ele, {
        type: 'bar',
        plugins: [alwaysShowValues], // ✅ تفعيل الـ Plugin هنا
        data: {
            labels: years,
            datasets: [
                {
                    label: isAR ? 'المستهدف السنوي' : "Annual Target",
                    data: target,
                    backgroundColor: '#008A85',
                    barPercentage: 0.7,
                    categoryPercentage: windowWidth < 767 ? 0.8 : 0.35,
                    // categoryPercentage: (context) => {
                    //     const chartWidth = context.chart.width;
                    //     return chartWidth < 767 ? 0.8 : 0.35; // 0.9 للموبايل و 0.4 للديسك توب
                    // },
                    order: 2,
                    borderRadius: {
                        topLeft: 4,
                        topRight: 4,
                        bottomLeft: 0,
                        bottomRight: 0
                    },
                },
                {
                    label: isAR ? 'الفعلي بالسنوات' : "Actual by Years",
                    data: actual,
                    backgroundColor: '#C3E0DF',
                    barPercentage: 0.7,
                    categoryPercentage: windowWidth < 767 ? 0.8 : 0.35,
                    order: 1,
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
                        font: { size: 11 },
                        color: '#5E7278',
                        autoSkip: false
                    }
                },
                y: {
                    min: 0,
                    max: 100,
                    grid: {
                        display: true,
                        drawOnChartArea: true,
                        drawTicks: false,
                        color: '#DCE5E5',
                        lineWidth: 1, // زود السمك شوية عشان النقط تبان
                        borderDash: [10, 8], // نقطة 1 بكسل وفراغ كبير 8 بكسل
                    },

                    border: { display: false },
                    ticks: {
                        stepSize: 25,
                        font: { size: 10 },
                        color: '#5E7278'
                    }
                }
            }
        }
    });
}

createChart(target_1, actual_1, "char-1")
createChart(target_2, actual_2, "char-2")
createChart(target_3, actual_3, "char-3")
createChart(target_4, actual_4, "char-4")

