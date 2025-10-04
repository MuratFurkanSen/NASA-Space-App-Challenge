// Örnek veri seti (placeholder)
const sampleData = {
    labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
    values: [12, 19, 3, 5, 2, 3],
    scatterX: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    scatterY: [2, 4, 5, 4, 5, 7, 8, 8, 9, 10],
    categories: ['A Kategorisi', 'B Kategorisi', 'C Kategorisi', 'D Kategorisi'],
    categoryValues: [30, 45, 15, 10],
    timeSeries: {
        x: ['2023-01', '2023-02', '2023-03', '2023-04', '2023-05', '2023-06'],
        y: [100, 120, 90, 150, 130, 180]
    }
};

// DOM elementleri
const csvFileInput = document.getElementById('csvFile');
const fileNameDisplay = document.getElementById('fileName');
const runModelButton = document.getElementById('runModel');
const predictionLoading = document.getElementById('predictionLoading');
const avgPredictionElement = document.getElementById('avgPrediction');
const accuracyRateElement = document.getElementById('accuracyRate');
const predictionTableBody = document.getElementById('predictionTableBody');
const uploadArea = document.getElementById('uploadArea');
const exportResultsButton = document.getElementById('exportResults');

// Grafik elementleri
const histogramChart = document.getElementById('histogramChart');
const scatterChart = document.getElementById('scatterChart');
const lineChart = document.getElementById('lineChart');
const barChart = document.getElementById('barChart');

// Yenileme butonları
const refreshHistogramButton = document.getElementById('refreshHistogram');
const refreshScatterButton = document.getElementById('refreshScatter');
const refreshLineButton = document.getElementById('refreshLine');
const refreshBarButton = document.getElementById('refreshBar');

// İstatistik elementleri
const fileCountElement = document.getElementById('fileCount');
const modelCountElement = document.getElementById('modelCount');
const accuracyRateStatElement = document.getElementById('accuracyRate');
const processingTimeElement = document.getElementById('processingTime');

// Uygulama durumu
let appState = {
    uploadedFile: null,
    modelResults: null,
    chartsInitialized: false
};

// CSV dosyası yükleme işlemi
csvFileInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    handleFileUpload(file);
});

// Sürükle bırak işlevselliği
uploadArea.addEventListener('dragover', function (e) {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', function () {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', function (e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');

    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
        handleFileUpload(file);
    } else {
        showNotification('Lütfen bir CSV dosyası seçin.', 'warning');
    }
});

// Dosya yükleme işlemini yönet
function handleFileUpload(file) {
    if (file) {
        appState.uploadedFile = file;
        fileNameDisplay.textContent = file.name;
        fileCountElement.textContent = '1';

        // Dosya içeriğini oku (simülasyon)
        readCSVFile(file);
        simulateFileProcessing();

        showNotification(`"${file.name}" başarıyla yüklendi!`, 'success');
    }
}

// CSV dosyasını okuma (simülasyon)
function readCSVFile(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const contents = e.target.result;
        console.log('CSV dosya içeriği:', contents.substring(0, 200) + '...');
        // Burada gerçek CSV parsing işlemi yapılabilir
        // Papa Parse gibi bir kütüphane kullanılabilir
    };
    reader.readAsText(file);
}

// Dosya işleme simülasyonu
function simulateFileProcessing() {
    processingTimeElement.textContent = 'İşleniyor...';

    setTimeout(() => {
        const processingTime = (Math.random() * 2 + 0.5).toFixed(2);
        processingTimeElement.textContent = `${processingTime}s`;
    }, 1500);
}

// Model çalıştırma butonu
runModelButton.addEventListener('click', function () {
    if (!appState.uploadedFile) {
        showNotification('Lütfen önce bir CSV dosyası yükleyin.', 'warning');
        return;
    }

    runMachineLearningModel();
});

// Makine öğrenimi modelini çalıştır
async function runMachineLearningModel() {
    // Yükleme animasyonunu göster
    predictionLoading.style.display = 'block';
    runModelButton.disabled = true;

    const fileInput = document.getElementById("csvFile");
    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append("file", file);

    let resp = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        body: formData,
    });
    if (!resp.ok) {
        alert('Something went wrong!');
        return;
    }
    let data = await resp.json();
    if (!data.success) {
        alert(data.message ? data.message : 'Something went wrong! 2');
        return;
    }
    console.log(data.prediction);
}

// Tahmin sonuçlarını oluşturma
function generatePredictionResults() {
    // Rastgele ortalama tahmin ve doğruluk oranı
    const avgPrediction = (Math.random() * 100).toFixed(2);
    const accuracyRate = (75 + Math.random() * 20).toFixed(2);

    avgPredictionElement.textContent = `${avgPrediction}%`;
    accuracyRateElement.textContent = `${accuracyRate}%`;

    // Tablo verilerini oluştur
    let tableHTML = '';
    for (let i = 1; i <= 8; i++) {
        const actualValue = (Math.random() * 100).toFixed(2);
        const prediction = (parseFloat(actualValue) + (Math.random() * 20 - 10)).toFixed(2);
        const difference = (Math.abs(actualValue - prediction)).toFixed(2);
        const status = difference < 10 ? 'success' : 'warning';
        const statusText = difference < 10 ? 'Başarılı' : 'Orta';

        tableHTML += `
            <tr>
                <td>${i}</td>
                <td>${actualValue}</td>
                <td>${prediction}</td>
                <td>${difference}</td>
                <td><span class="status-badge status-${status}">${statusText}</span></td>
            </tr>
        `;
    }

    predictionTableBody.innerHTML = tableHTML;

    // Model sonuçlarını state'e kaydet
    appState.modelResults = {
        avgPrediction: avgPrediction,
        accuracyRate: accuracyRate,
        predictions: tableHTML
    };
}

// İstatistikleri güncelle
function updateStats() {
    const accuracy = (75 + Math.random() * 20).toFixed(1);
    accuracyRateStatElement.textContent = `${accuracy}%`;

    const processingTime = (Math.random() * 1.5 + 0.3).toFixed(2);
    processingTimeElement.textContent = `${processingTime}s`;
}

// Grafikleri güncelleme
function updateAllCharts() {
    updateHistogramChart();
    updateScatterChart();
    updateLineChart();
    updateBarChart();

    if (!appState.chartsInitialized) {
        appState.chartsInitialized = true;
    }
}

// Histogram grafiği
function updateHistogramChart() {
    // Rastgele veri oluştur
    const dataValues = Array.from({length: 20}, () => Math.floor(Math.random() * 100));

    const trace = {
        x: dataValues,
        type: 'histogram',
        marker: {
            color: '#6366f1',
            opacity: 0.7,
            line: {
                color: '#4f46e5',
                width: 1
            }
        },
        nbinsx: 10
    };

    const layout = {
        title: '',
        xaxis: {
            title: 'Değerler',
            gridcolor: 'rgba(255,255,255,0.1)',
            zerolinecolor: 'rgba(255,255,255,0.3)'
        },
        yaxis: {
            title: 'Frekans',
            gridcolor: 'rgba(255,255,255,0.1)',
            zerolinecolor: 'rgba(255,255,255,0.3)'
        },
        font: {color: '#f8fafc'},
        margin: {t: 10, r: 20, b: 50, l: 50},
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        hoverlabel: {
            bgcolor: 'rgba(30, 41, 59, 0.9)',
            font: {color: '#f8fafc'}
        }
    };

    Plotly.newPlot(histogramChart, [trace], layout, {
        responsive: true,
        displayModeBar: false
    });
}

// Scatter grafiği
function updateScatterChart() {
    // Rastgele veri oluştur
    const scatterX = Array.from({length: 15}, () => Math.floor(Math.random() * 100));
    const scatterY = scatterX.map(x => x * 0.8 + Math.random() * 20);

    const trace = {
        x: scatterX,
        y: scatterY,
        mode: 'markers',
        type: 'scatter',
        marker: {
            size: 14,
            color: '#8b5cf6',
            opacity: 0.7,
            line: {
                color: '#7c3aed',
                width: 1
            }
        }
    };

    const layout = {
        title: '',
        xaxis: {
            title: 'X Değerleri',
            gridcolor: 'rgba(255,255,255,0.1)',
            zerolinecolor: 'rgba(255,255,255,0.3)'
        },
        yaxis: {
            title: 'Y Değerleri',
            gridcolor: 'rgba(255,255,255,0.1)',
            zerolinecolor: 'rgba(255,255,255,0.3)'
        },
        font: {color: '#f8fafc'},
        margin: {t: 10, r: 20, b: 50, l: 50},
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        hoverlabel: {
            bgcolor: 'rgba(30, 41, 59, 0.9)',
            font: {color: '#f8fafc'}
        }
    };

    Plotly.newPlot(scatterChart, [trace], layout, {
        responsive: true,
        displayModeBar: false
    });
}

// Line grafiği
function updateLineChart() {
    // Rastgele zaman serisi verisi oluştur
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const timeSeriesData = months.map((month, i) => ({
        x: month,
        y: 100 + Math.random() * 100
    }));

    const trace = {
        x: timeSeriesData.map(d => d.x),
        y: timeSeriesData.map(d => d.y),
        type: 'scatter',
        mode: 'lines+markers',
        line: {
            color: '#10b981',
            width: 3,
            shape: 'spline'
        },
        marker: {
            size: 6,
            color: '#10b981'
        }
    };

    const layout = {
        title: '',
        xaxis: {
            title: 'Zaman',
            gridcolor: 'rgba(255,255,255,0.1)',
            zerolinecolor: 'rgba(255,255,255,0.3)'
        },
        yaxis: {
            title: 'Değer',
            gridcolor: 'rgba(255,255,255,0.1)',
            zerolinecolor: 'rgba(255,255,255,0.3)'
        },
        font: {color: '#f8fafc'},
        margin: {t: 10, r: 20, b: 50, l: 50},
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        hoverlabel: {
            bgcolor: 'rgba(30, 41, 59, 0.9)',
            font: {color: '#f8fafc'}
        }
    };

    Plotly.newPlot(lineChart, [trace], layout, {
        responsive: true,
        displayModeBar: false
    });
}

// Bar grafiği
function updateBarChart() {
    // Rastgele kategori verisi oluştur
    const categories = ['Teknoloji', 'Finans', 'Sağlık', 'Eğitim', 'Perakende'];
    const categoryValues = categories.map(() => Math.floor(Math.random() * 100));

    const trace = {
        x: categories,
        y: categoryValues,
        type: 'bar',
        marker: {
            color: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'],
            opacity: 0.8,
            line: {
                color: ['#4f46e5', '#7c3aed', '#0d966b', '#d97706', '#dc2626'],
                width: 1
            }
        }
    };

    const layout = {
        title: '',
        xaxis: {
            title: 'Kategoriler',
            gridcolor: 'rgba(255,255,255,0.1)',
            zerolinecolor: 'rgba(255,255,255,0.3)'
        },
        yaxis: {
            title: 'Değerler',
            gridcolor: 'rgba(255,255,255,0.1)',
            zerolinecolor: 'rgba(255,255,255,0.3)'
        },
        font: {color: '#f8fafc'},
        margin: {t: 10, r: 20, b: 50, l: 50},
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        hoverlabel: {
            bgcolor: 'rgba(30, 41, 59, 0.9)',
            font: {color: '#f8fafc'}
        }
    };

    Plotly.newPlot(barChart, [trace], layout, {
        responsive: true,
        displayModeBar: false
    });
}

// Yenileme butonları
refreshHistogramButton.addEventListener('click', updateHistogramChart);
refreshScatterButton.addEventListener('click', updateScatterChart);
refreshLineButton.addEventListener('click', updateLineChart);
refreshBarButton.addEventListener('click', updateBarChart);

// Sonuçları dışa aktarma
exportResultsButton.addEventListener('click', function () {
    if (!appState.modelResults) {
        showNotification('Önce model çalıştırmanız gerekiyor.', 'warning');
        return;
    }

    exportResults();
});

// Sonuçları dışa aktarma işlevi
function exportResults() {
    // Basit bir CSV oluşturma
    let csvContent = "ID,Gerçek Değer,Tahmin,Fark,Durum\n";

    const rows = predictionTableBody.querySelectorAll('tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const rowData = Array.from(cells).map(cell => {
            // Durum hücresini özel işle
            if (cell.querySelector('.status-badge')) {
                return cell.querySelector('.status-badge').textContent;
            }
            return cell.textContent;
        });
        csvContent += rowData.join(',') + '\n';
    });

    // Blob oluştur ve indirme linki yarat
    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'model_tahmin_sonuclari.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('Sonuçlar başarıyla dışa aktarıldı!', 'success');
}

// Bildirim sistemi
function showNotification(message, type = 'info') {
    // Mevcut bildirimleri temizle
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });

    // Yeni bildirim oluştur
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Stil ekle (eğer henüz eklenmediyse)
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--card-bg);
                border: 1px solid var(--card-border);
                border-left: 4px solid;
                border-radius: 12px;
                padding: 16px;
                max-width: 400px;
                box-shadow: var(--shadow);
                z-index: 1000;
                animation: slideIn 0.3s ease-out;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .notification-success {
                border-left-color: var(--secondary);
            }
            
            .notification-warning {
                border-left-color: var(--warning);
            }
            
            .notification-info {
                border-left-color: var(--primary);
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
                flex: 1;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: var(--gray);
                cursor: pointer;
                padding: 4px;
                border-radius: 6px;
                transition: var(--transition);
            }
            
            .notification-close:hover {
                background: rgba(255,255,255,0.1);
                color: var(--light);
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Kapatma butonuna event listener ekle
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });

    // 5 saniye sonra otomatik kapat
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Bildirim ikonlarını belirle
function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return 'check-circle';
        case 'warning':
            return 'exclamation-triangle';
        case 'info':
        default:
            return 'info-circle';
    }
}

// Sayfa yüklendiğinde grafikleri oluştur
document.addEventListener('DOMContentLoaded', function () {
    // İlk grafikleri oluştur
    updateAllCharts();

    // Model sayısını rastgele ayarla
    modelCountElement.textContent = Math.floor(Math.random() * 5) + 1;

    // Sayfa yüklendi bildirimi
    setTimeout(() => {
        showNotification('Nexus Analytics Dashboard\'a hoş geldiniz!', 'info');
    }, 1000);
});

// Pencere boyutu değiştiğinde grafikleri yeniden boyutlandır
window.addEventListener('resize', function () {
    if (appState.chartsInitialized) {
        setTimeout(() => {
            Plotly.Plots.resize(histogramChart);
            Plotly.Plots.resize(scatterChart);
            Plotly.Plots.resize(lineChart);
            Plotly.Plots.resize(barChart);
        }, 100);
    }
});