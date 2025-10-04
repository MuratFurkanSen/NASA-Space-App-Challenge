// DOM Elements
let csvFileInput;
let fileNameDisplay;
let runModelButton;
let predictionLoading;
let avgPredictionElement;
let accuracyRateElement;
let predictionTableBody;
let uploadArea;
let exportResultsButton;

// Graphic Elements
let histogramChart;
let scatterChart;
let lineChart;
let barChart;

// Refresh Buttons
let refreshHistogramButton;
let refreshScatterButton;
let refreshLineButton;
let refreshBarButton;

// Statics Elements
let fileCountElement;
let modelCountElement;
let accuracyRateStatElement;
let processingTimeElement;

// App State
let appState;

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    csvFileInput = document.getElementById('csvFile');
    fileNameDisplay = document.getElementById('fileName');
    runModelButton = document.getElementById('runModel');
    predictionLoading = document.getElementById('predictionLoading');
    avgPredictionElement = document.getElementById('avgPrediction');
    accuracyRateElement = document.getElementById('accuracyRate');
    predictionTableBody = document.getElementById('predictionTableBody');
    uploadArea = document.getElementById('uploadArea');
    exportResultsButton = document.getElementById('exportResults');

    // Graphic Elements
    histogramChart = document.getElementById('histogramChart');
    scatterChart = document.getElementById('scatterChart');
    lineChart = document.getElementById('lineChart');
    barChart = document.getElementById('barChart');

    // Refresh Buttons
    refreshHistogramButton = document.getElementById('refreshHistogram');
    refreshScatterButton = document.getElementById('refreshScatter');
    refreshLineButton = document.getElementById('refreshLine');
    refreshBarButton = document.getElementById('refreshBar');

    // Statics Elements
    fileCountElement = document.getElementById('fileCount');
    modelCountElement = document.getElementById('modelCount');
    accuracyRateStatElement = document.getElementById('accuracyRate');
    processingTimeElement = document.getElementById('processingTime');

    // App State
    appState = {
        uploadedFile: null,
        modelResults: null,
        chartsInitialized: false
    };
});

document.addEventListener('DOMContentLoaded', () => {
    // CSV Download Operations
    exportResultsButton.addEventListener('click', function () {
        if (!appState.modelResults) {
            showNotification('Önce model çalıştırmanız gerekiyor.', 'warning');
            return;
        }
        exportResults();
    });

    // CSV Upload Operations
    csvFileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        handleFileUpload(file);
    });

    // Drag-Drop Functionality
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

    runModelButton.addEventListener('click', function () {
        if (!appState.uploadedFile) {
            showNotification('Lütfen önce bir CSV dosyası yükleyin.', 'warning');
            return;
        }
        getPredictions();
    });

    // Initial Notification
    setTimeout(() => {
        showNotification('Nexus Analytics Dashboard\'a hoş geldiniz!', 'info');
    }, 1000);
})


// File Upload Operations
function handleFileUpload(file) {
    if (file) {
        appState.uploadedFile = file;
        fileNameDisplay.textContent = file.name;

        showNotification(`"${file.name}" başarıyla yüklendi!`, 'success');
    }
}

// Model Evaluation
async function getPredictions() {
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
    let tableHTML = '';
    for (let i = 1; i <= data.predictions.length; i++) {
        const prediction = data.predictions[i-1];
        tableHTML += `
            <tr>
                <td>${i}</td>
                <td>${prediction}</td>
            </tr>
        `;
    }
    predictionTableBody.innerHTML = tableHTML;

    // Update App State
    appState.modelResults = {
        predictions: tableHTML
    };
    predictionLoading.style.display = 'None';
    runModelButton.disabled = false;
}

function updateStats() {
    const accuracy = (75 + Math.random() * 20).toFixed(1);
    accuracyRateStatElement.textContent = `${accuracy}%`;

    const processingTime = (Math.random() * 1.5 + 0.3).toFixed(2);
    processingTimeElement.textContent = `${processingTime}s`;
}


function exportResults() {
    // Basit bir CSV oluşturma
    let csvContent = "ID,Tahmin\n";

    const rows = predictionTableBody.querySelectorAll('tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const rowData = Array.from(cells).map(cell => {
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