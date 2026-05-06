const years = ['2025', '2024', '2023', '2022', '2021'];

const target_1 = [80, 88, 87, 87, 87];
const actual_1 = [68, 85, 88, 92, 89];

const target_2 = [68, 68, 68, 68, 68];
const actual_2 = [75, 75, 75, 80, 73];

const target_3 = [82, 82, 82, 82, 82];
const actual_3 = [86, 82, 82, 82, 82];

const target_4 = [80, 80, 80, 80, 80];
const actual_4 = [84, 80, 79, 81, 81];

//state chart
const state_ar = ["تعويضات العاملين", "السلع والخدمات", "المشاريع"]
const state_en = ["Employee Compensation", "Goods and Services", "Projects"];
const target_5 = [561, 129, 194];
const actual_5 = [561, 129, 194];

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

const alwaysShowStateValues = {
    id: 'alwaysShowValues',
    afterDatasetsDraw(chart) {
        const { ctx } = chart;
        ctx.save();
        ctx.font = 'bold 10px Segoe UI, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle'; // غيرناها لـ middle عشان التوسيط جوه الـ Box

        chart.data.datasets.forEach((dataset, i) => {
            const meta = chart.getDatasetMeta(i);

            meta.data.forEach((bar, j) => {
                const value = dataset.data[j] + '%';

                // 1. حساب أبعاد النص عشان نحدد حجم الـ Box
                const textWidth = ctx.measureText(value).width;
                const padding = 6;
                const boxWidth = textWidth + padding * 2;
                const boxHeight = 18; // ارتفاع ثابت للـ Box

                // 2. تحديد مكان الـ Box (فوق العمود بمسافة 10px)
                const x = bar.x;
                const y = bar.y - 12;

                // 3. رسم الـ Background (مستطيل بـ Border Radius)
                ctx.fillStyle = "rgba(194, 231, 225, 0.5)"; // لون الخلفية حسب الـ Dataset

                // دالة رسم مستطيل بـ زوايا دائرية
                const radius = 10;
                ctx.beginPath();
                ctx.moveTo(x - boxWidth / 2 + radius, y - boxHeight / 2);
                ctx.lineTo(x + boxWidth / 2 - radius, y - boxHeight / 2);
                ctx.quadraticCurveTo(x + boxWidth / 2, y - boxHeight / 2, x + boxWidth / 2, y - boxHeight / 2 + radius);
                ctx.lineTo(x + boxWidth / 2, y + boxHeight / 2 - radius);
                ctx.quadraticCurveTo(x + boxWidth / 2, y + boxHeight / 2, x + boxWidth / 2 - radius, y + boxHeight / 2);
                ctx.lineTo(x - boxWidth / 2 + radius, y + boxHeight / 2);
                ctx.quadraticCurveTo(x - boxWidth / 2, y + boxHeight / 2, x - boxWidth / 2, y + boxHeight / 2 - radius);
                ctx.lineTo(x - boxWidth / 2, y - boxHeight / 2 + radius);
                ctx.quadraticCurveTo(x - boxWidth / 2, y - boxHeight / 2, x - boxWidth / 2 + radius, y - boxHeight / 2);
                ctx.closePath();
                ctx.fill();

                // 4. رسم النص (باللون الأبيض عشان يبان فوق الخلفية)
                ctx.fillStyle = i === 0 ? "#007974" : "#003D3E";
                ctx.fillText(value, x, y);
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

function createStateChart(target, actual, id) {
    const ele = document.getElementById(id);
    if (!ele) return;

    // 1. ضبط اتجاه الـ Canvas نفسه في الـ DOM
    ele.style.direction = isAR ? "rtl" : "ltr";

    new Chart(ele, {
        type: 'bar',
        plugins: [alwaysShowStateValues],
        data: {
            labels: isAR ? state_ar : state_en,
            datasets: [
                {
                    label: isAR ? "المعتمدة" : "Approved",
                    data: target,
                    backgroundColor: '#008A85',
                    barPercentage: 0.3,
                    categoryPercentage: 0.8,
                    order: 1,
                },
                {
                    label: isAR ? "الفعلية" : "Actual",
                    data: actual,
                    backgroundColor: '#C3E0DF',
                    barPercentage: 0.3,
                    categoryPercentage: 0.8,
                    order: 2,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            // 2. تفعيل دعم الـ RTL في النصوص والـ Tooltip
            rtl: isAR,
            plugins: {
                legend: {
                    display: false,
                    rtl: isAR // يدعم اتجاه الـ Labels في الـ Legend لو فعلتها مستقبلاً
                },
                tooltip: {
                    rtl: isAR,
                    textDirection: isAR ? 'rtl' : 'ltr',
                    callbacks: {
                        label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}`
                        // شلنا الـ % هنا بناءً على بيانات الـ State (561, 129..)
                    }
                },
                datalabels: false
            },
            scales: {
                x: {
                    // 3. عكس ترتيب الأعمدة لتبدأ من اليمين
                    reverse: isAR,
                    grid: { display: false },
                    border: { display: false },
                    ticks: {
                        font: { size: 14 },
                        color: '#061415',
                        autoSkip: false
                    }
                },
                y: {
                    // 4. نقل المحور Y ليكون على اليمين في حالة العربي
                    position: isAR ? 'right' : 'left',
                    min: 0,
                    max: 600,
                    grid: {
                        display: true,
                        drawOnChartArea: true,
                        drawTicks: false,
                        color: '#DCE5E5',
                        lineWidth: 1,
                        borderDash: [10, 8],
                    },
                    border: { display: false },
                    ticks: {
                        stepSize: 150,
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

createStateChart(target_5, actual_5, "char-5")