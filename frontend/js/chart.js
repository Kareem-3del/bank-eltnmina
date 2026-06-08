const years = ['2025', '2024', '2023', '2022', '2021'];

const target_1 = [80, 88, 87, 87, 87];
const actual_1 = [86, 85, 88, 92, 89];

const target_2 = [68, 68, 68, 68, 68];
const actual_2 = [75, 75, 75, 80, 73];

const target_3 = [82, 82, 82, 82, 82];
const actual_3 = [86, 82, 82, 81, 80];

const target_4 = [80, 80, 80, 80, 80];
const actual_4 = [84, 80, 79, 81, 81];

//state chart
const state_ar = ["تعويضات العاملين", "السلع والخدمات", "المشاريع"]
const state_en = ["Employee Compensation", "Goods and Services", "Projects"];
const target_5 = [561, 129, 194];
const actual_5 = [561, 129, 194];

//program-chart
const prog_cart_ar = ["الدورات الفنية", "الشهادات المهنية", "الدورات القيادية"]
const prog_cart_en = ["Technical Courses", "Professional Certifications", "Leadership Courses"];
const prog_target = [629, 111, 156]
const prog_actual = [570, 30, 115];

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
                ctx.fillStyle = "#fff";
            } else {
                ctx.fillStyle = "#fff";
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
        ctx.font = windowWidth < 767 ? 'bold 10px Segoe UI, Arial' : 'bold 10px Segoe UI, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle'; // غيرناها لـ middle عشان التوسيط جوه الـ Box

        chart.data.datasets.forEach((dataset, i) => {
            const meta = chart.getDatasetMeta(i);

            meta.data.forEach((bar, j) => {
                const value = dataset.data[j] + '%';

                // 1. حساب أبعاد النص عشان نحدد حجم الـ Box
                const textWidth = ctx.measureText(value).width;
                const padding = windowWidth < 767 ? 5 : 6;
                const boxWidth = textWidth + padding * 2;
                const boxHeight = windowWidth < 767 ? 16 : 18; // ارتفاع ثابت للـ Box

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


const alwaysShowProgramValues = {
    id: 'alwaysShowProgramValues',
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
                ctx.fillText(value + '', bar.x, bar.y - 5);
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
                    backgroundColor: '#D9D9D9',
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
                    backgroundColor: '#fff',
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
                    grid: {
                        display: false // إخفاء خطوط الـ X تماماً
                    },
                    border: {
                        display: true, // إظهار خط المحور الأساسي للـ X
                        color: '#fff'  // لون خط المحور
                    },
                    ticks: {
                        font: { size: 11 },
                        color: '#fff',
                        autoSkip: false
                    }
                },
                y: {
                    min: 0,
                    max: 100,
                    grid: {
                        display: true,        // يجب أن تكون true ليظهر خط المحور
                        drawOnChartArea: false, // ✅ هذا هو السطر الذي سيخفي الخطوط المتقطعة في المنتصف
                        drawTicks: false,       // إخفاء الـ Ticks الصغيرة
                        color: '#fff',          // لون خط المحور Y
                        lineWidth: 1            // سمك الخط
                    },
                    border: {
                        color: "#fff",
                        display: true // ✅ إظهار خط المحور الأساسي للـ Y
                    },
                    ticks: {
                        stepSize: 10,
                        font: { size: 10 },
                        color: '#fff',
                        padding: 0,
                        callback: function (value) {
                            return isAR ? "   " + value : value + "   ";
                        }
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
                    categoryPercentage: windowWidth < 767 ? 0.97 : 0.8,
                    order: 1,
                },
                {
                    label: isAR ? "الفعلية" : "Actual",
                    data: actual,
                    backgroundColor: '#C3E0DF',
                    barPercentage: 0.3,
                    categoryPercentage: windowWidth < 767 ? 0.97 : 0.8,
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
                        font: { size: windowWidth < 767 ? 10 : 14 },
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

function createProgramChart(target, actual, id) {
    const ele = document.getElementById(id);
    if (!ele)
        return;

    new Chart(ele, {
        type: 'bar',
        plugins: [alwaysShowProgramValues],
        data: {
            labels: isAR ? prog_cart_ar : prog_cart_en,
            datasets: [
                {
                    label: isAR ? 'المستهدف السنوي' : "Annual Target",
                    data: target,
                    backgroundColor: '#008A85',
                    barPercentage: 0.3,
                    categoryPercentage: 0.5,
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
                    backgroundColor: '#A9D3D2',
                    barPercentage: 0.3,
                    categoryPercentage: 0.5,
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
                        font: { size: isAR ? 14 : 7 },
                        color: '#008A85',
                        autoSkip: false
                    }
                },
                y: {
                    min: 0,
                    max: 700,
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
                        stepSize: 100,
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

createProgramChart(prog_target, prog_actual, "program-chart")

const data = {
    datasets: [{
        data: [86, 14], // [النسبة المحققة، النسبة المتبقية]
        backgroundColor: ['#008A85', '#E0E0E0'],
        borderWidth: 0,
        borderRadius: 10, // زوايا دائرية
    }]
};

const config = {
    type: 'doughnut',
    data: data,
    options: {
        responsive: true,
        cutout: '80%', // لجعلها نحيفة مثل الصورة
        rotation: -90, // بداية الرسم من الأعلى
        circumference: 270, // زاوية القوس (3/4 دائرة)
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
        },
        animation: {
            animateRotate: true,
            animateScale: true,
            duration: 2000 // مدة الأنميشن
        }
    }
};

new Chart(document.getElementById('progressChart'), config);