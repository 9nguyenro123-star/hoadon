// Helper: format currency
function formatCurrency(num) {
    if (!num) return '0';
    return num.toLocaleString('vi-VN');
}

function unformatCurrency(str) {
    return parseFloat(str.replace(/,/g, '').replace(/\./g, '')) || 0;
}

// Vietnamese Number Reader
function readVietnameseNumber(number) {
    const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
    const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    
    function readGroup(n, isFirst) {
        let str = '';
        let h = Math.floor(n / 100);
        let t = Math.floor((n % 100) / 10);
        let u = n % 10;
        
        if (!isFirst || h > 0) {
            str += digits[h] + ' trăm ';
        }
        
        if (t === 0) {
            if (u > 0 && (!isFirst || h > 0)) {
                str += 'lẻ ' + digits[u];
            } else if (u > 0) {
                str += digits[u];
            }
        } else if (t === 1) {
            str += 'mười ';
            if (u === 5) str += 'lăm';
            else if (u > 0) str += digits[u];
        } else {
            str += digits[t] + ' mươi ';
            if (u === 1) str += 'mốt';
            else if (u === 4) str += 'tư';
            else if (u === 5) str += 'lăm';
            else if (u > 0) str += digits[u];
        }
        return str.trim();
    }
    
    if (number === 0) return 'Không đồng.';
    let strNum = Math.floor(number).toString();
    let parts = [];
    while (strNum.length > 0) {
        parts.unshift(parseInt(strNum.slice(-3), 10));
        strNum = strNum.slice(0, -3);
    }
    
    let words = [];
    for (let i = 0; i < parts.length; i++) {
        let val = parts[i];
        if (val === 0 && words.length > 0) continue; 
        
        let groupWord = readGroup(val, i === 0);
        let unit = units[parts.length - 1 - i];
        words.push(groupWord + (unit ? ' ' + unit : ''));
    }
    
    let res = words.join(' ').trim().replace(/\s+/g, ' ') + ' đồng.';
    return res.charAt(0).toUpperCase() + res.slice(1);
}

// App State
let state = {
    project: {
        name: "Xây dựng hàng rào giáp văn phòng",
        client: "Anh Út",
        address: "Võ Thị Liễu, Quận 12",
        contact: ""
    },
    items: [
        {
            id: Date.now(),
            name: "Hàng rào nhân công và vật tư hoàn thiện",
            size: 31.70,
            coef: 1,
            price: 7300000
        }
    ],
    descriptions: `Đào móng đóng cừ tràm 30 cây/1 hố kích thước 1.20 x 1.20 ; lót đá 4.0 x 6.0 lăm le; đặt vỉ sắt ∅12A150; đổ bê tông MÁC 250 dày 200 vuốt ý, lấy cổ cột 200x300 sắt ∅14; đan lưới sắt ∅12A200 qui cách 1 lớp làm vách chống sạt, kích thước vách cao 1m dày 200mm bằng bê tông MÁC 250.
Đổ đá kiềng 200x300 sắt ∅16, đổ bê tông MÁC 250.
Cấy sắt cột ∅14 từ mặt đá cao 3m, đổ cột 200x200 bê tông MÁC 250.
Tường gạch ống, tô tường 2 mặt và đổ bi giằng tường qui cách100 x 200.
Bên trong sơn nước và mặt ngoài quét xi măng chống thấm.`
};

// Render Functions
function renderEditor() {
    // Sync text inputs
    document.getElementById('inp-project-name').value = state.project.name;
    document.getElementById('inp-client-name').value = state.project.client;
    document.getElementById('inp-client-address').value = state.project.address;
    document.getElementById('inp-client-contact').value = state.project.contact;
    document.getElementById('inp-descriptions').value = state.descriptions;

    // Render Items
    const container = document.getElementById('editor-items-container');
    container.innerHTML = '';
    state.items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'item-editor-card';
        card.innerHTML = `
            <button class="remove-btn" onclick="removeItem(${item.id})" title="Xóa hạng mục"><i class="fas fa-trash-alt"></i></button>
            <div class="form-group">
                <label>Hạng mục ${index + 1}</label>
                <input type="text" value="${item.name}" oninput="updateItem(${item.id}, 'name', this.value)">
            </div>
            <div class="item-grid">
                <div class="form-group">
                    <label>Kích thước (m)</label>
                    <input type="number" step="0.01" value="${item.size}" oninput="updateItem(${item.id}, 'size', parseFloat(this.value) || 0)">
                </div>
                <div class="form-group">
                    <label>Hệ số</label>
                    <input type="number" step="0.01" value="${item.coef}" oninput="updateItem(${item.id}, 'coef', parseFloat(this.value) || 0)">
                </div>
            </div>
            <div class="form-group">
                <label>Đơn giá phần thô (VND/m²)</label>
                <input type="text" value="${formatCurrency(item.price)}" oninput="this.value=formatCurrency(unformatCurrency(this.value)); updateItem(${item.id}, 'price', unformatCurrency(this.value))">
            </div>
        `;
        container.appendChild(card);
    });
}

// Global update wrappers for inline handlers
window.updateItem = function(id, field, value) {
    const item = state.items.find(i => i.id === id);
    if (item) {
        item[field] = value;
        renderPreview();
    }
};

window.removeItem = function(id) {
    state.items = state.items.filter(i => i.id !== id);
    renderEditor();
    renderPreview();
};

function addItem() {
    state.items.push({
        id: Date.now(),
        name: "Hạng mục mới",
        size: 0,
        coef: 1,
        price: 0
    });
    renderEditor();
    renderPreview();
}

function updateProjectInfo(field, value) {
    state.project[field] = value;
    renderPreview();
}

function updateDescriptions(value) {
    state.descriptions = value;
    renderPreview();
}

function renderPreview() {
    // Project info mapping
    document.getElementById('out-project-name').innerText = state.project.name || '...';
    document.getElementById('out-project-name-bold').innerText = state.project.name || '...';
    document.getElementById('out-client-name').innerText = state.project.client || '...';
    document.getElementById('out-client-address').innerText = state.project.address || '...';
    document.getElementById('out-client-contact').innerText = state.project.contact || '...';

    // Table rendering
    const tbody = document.getElementById('out-table-body');
    tbody.innerHTML = '';
    let total = 0;

    state.items.forEach((item, index) => {
        const area = item.size * item.coef;
        const amount = area * item.price;
        total += amount;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td style="text-align: left; padding-left: 10px; font-weight: 500;">${item.name}</td>
            <td>${item.size > 0 ? item.size.toFixed(2) : '-'}</td>
            <td>${item.coef > 0 ? item.coef : '-'}</td>
            <td>${area > 0 ? area.toFixed(2) : '-'}</td>
            <td class="text-right">${item.price > 0 ? formatCurrency(item.price) : '-'}</td>
            <td class="text-right">${amount > 0 ? formatCurrency(amount) : '-'}</td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('out-total').innerText = formatCurrency(total);
    document.getElementById('out-total-words').innerText = readVietnameseNumber(total);

    // Descriptions rendering
    const descList = document.getElementById('out-descriptions-list');
    descList.innerHTML = '';
    if (state.descriptions.trim()) {
        const lines = state.descriptions.split('\n');
        lines.forEach(line => {
            if (line.trim()) {
                const div = document.createElement('div');
                div.className = 'desc-line';
                div.innerText = line.trim();
                descList.appendChild(div);
            }
        });
    }
}

// Event Bindings
document.getElementById('inp-project-name').addEventListener('input', e => updateProjectInfo('name', e.target.value));
document.getElementById('inp-client-name').addEventListener('input', e => updateProjectInfo('client', e.target.value));
document.getElementById('inp-client-address').addEventListener('input', e => updateProjectInfo('address', e.target.value));
document.getElementById('inp-client-contact').addEventListener('input', e => updateProjectInfo('contact', e.target.value));
document.getElementById('inp-descriptions').addEventListener('input', e => updateDescriptions(e.target.value));

document.getElementById('btn-add-item').addEventListener('click', addItem);
document.getElementById('btn-print').addEventListener('click', () => {
    window.print();
});

document.getElementById('btn-save').addEventListener('click', () => {
    localStorage.setItem('nsp-invoice-data', JSON.stringify(state));
    alert('Đã lưu dữ liệu báo giá vào trình duyệt!');
});

// Initialization
function init() {
    const saved = localStorage.getItem('nsp-invoice-data');
    if (saved) {
        try { 
            state = JSON.parse(saved); 
        } catch(e) {
            console.error("Could not load saved data", e);
        }
    }
    renderEditor();
    renderPreview();
}

init();
