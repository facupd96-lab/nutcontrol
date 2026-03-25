/* ============================================
   NutControl — App Logic
   Full business management for dried fruits
   ============================================ */

(function () {
    'use strict';

    // =========== DEFAULT DATA ===========
    const DEFAULT_MATERIAS = [
        { id: 'mani', nombre: 'Maní', precioKg: 5600, stockG: 0, updatedAt: new Date().toISOString() },
        { id: 'castanas', nombre: 'Castañas de Cajú', precioKg: 23000, stockG: 0, updatedAt: new Date().toISOString() },
        { id: 'nueces', nombre: 'Nueces', precioKg: 19000, stockG: 0, updatedAt: new Date().toISOString() },
        { id: 'almendras', nombre: 'Almendras', precioKg: 23000, stockG: 0, updatedAt: new Date().toISOString() },
        { id: 'girasol', nombre: 'Semillas de Girasol', precioKg: 5300, stockG: 0, updatedAt: new Date().toISOString() },
        { id: 'pasas', nombre: 'Pasas de Uva', precioKg: 10000, stockG: 0, updatedAt: new Date().toISOString() },
        { id: 'azucar', nombre: 'Azúcar', precioKg: 1700, stockG: 0, updatedAt: new Date().toISOString() },
    ];

    const DEFAULT_INSUMOS = [
        { id: 'bolsitas', nombre: 'Bolsitas', precioUnit: 140, stock: 0, updatedAt: new Date().toISOString() },
        { id: 'etiquetas', nombre: 'Etiquetas', precioUnit: 35, stock: 0, updatedAt: new Date().toISOString() },
    ];

    const DEFAULT_PRODUCTOS = [
        {
            id: 'mix-premium',
            nombre: 'Mix Premium',
            emoji: '👑',
            precioVenta: 3500,
            pesoG: 75,
            ingredientes: [
                { materiaId: 'castanas', cantidadG: 15 },
                { materiaId: 'almendras', cantidadG: 15 },
                { materiaId: 'nueces', cantidadG: 15 },
                { materiaId: 'girasol', cantidadG: 15 },
                { materiaId: 'mani', cantidadG: 15 },
            ],
            insumosExtra: [
                { insumoId: 'bolsitas', cantidad: 1 },
                { insumoId: 'etiquetas', cantidad: 1 },
            ],
        },
        {
            id: 'mix-energico',
            nombre: 'Mix Enérgico',
            emoji: '⚡',
            precioVenta: 3000,
            pesoG: 75,
            ingredientes: [
                { materiaId: 'pasas', cantidadG: 15 },
                { materiaId: 'almendras', cantidadG: 15 },
                { materiaId: 'nueces', cantidadG: 15 },
                { materiaId: 'girasol', cantidadG: 15 },
                { materiaId: 'mani', cantidadG: 15 },
            ],
            insumosExtra: [
                { insumoId: 'bolsitas', cantidad: 1 },
                { insumoId: 'etiquetas', cantidad: 1 },
            ],
        },
        {
            id: 'castanas-caram',
            nombre: 'Castañas Caramelizadas',
            emoji: '🍯',
            precioVenta: 3000,
            pesoG: 65,
            ingredientes: [
                { materiaId: 'castanas', cantidadG: 50 },
                { materiaId: 'azucar', cantidadG: 15 },
            ],
            insumosExtra: [
                { insumoId: 'bolsitas', cantidad: 1 },
                { insumoId: 'etiquetas', cantidad: 1 },
            ],
        },
        {
            id: 'girasol-caram',
            nombre: 'Semillas Caramelizadas',
            emoji: '🌻',
            precioVenta: 2500,
            pesoG: 75,
            ingredientes: [
                { materiaId: 'girasol', cantidadG: 60 },
                { materiaId: 'azucar', cantidadG: 15 },
            ],
            insumosExtra: [
                { insumoId: 'bolsitas', cantidad: 1 },
                { insumoId: 'etiquetas', cantidad: 1 },
            ],
        },
    ];

    // =========== STATE ===========
    let state = {
        materias: [],
        insumos: [],
        productos: [],
        ventas: [],
        gastos: [],
        produccion: [],
    };

    // =========== PERSISTENCE (Firebase Realtime Database) ===========
    const STORAGE_KEY = 'nutcontrol_data';

    // Firebase init
    const firebaseApp = firebase.initializeApp({
        apiKey: "AIzaSyDRQ5j7KlYWVhyM7XffPzyjzexugeVecj0",
        authDomain: "nutcontrol.firebaseapp.com",
        databaseURL: "https://nutcontrol-default-rtdb.firebaseio.com",
        projectId: "nutcontrol",
        storageBucket: "nutcontrol.firebasestorage.app",
        messagingSenderId: "583893813540",
        appId: "1:583893813540:web:a7ee75bdacf8a287b04bb1"
    });
    const db = firebase.database();
    const dataRef = db.ref('nutcontrol_data');

    let firebaseConnected = false;
    let saveTimeout = null;
    let lastSaveTs = 0;

    function saveState() {
        lastSaveTs = Date.now();
        state._ts = lastSaveTs;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

        // Debounced write to Firebase (avoids flooding on rapid edits)
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            dataRef.set(state).then(() => {
                firebaseConnected = true;
                updateStorageUI();
            }).catch(err => {
                console.error("Firebase save error:", err);
                firebaseConnected = false;
                updateStorageUI();
            });
        }, 600);
    }

    function updateStorageUI() {
        const el = $('storage-status');
        if (!el) return;
        if (firebaseConnected) {
            el.classList.add('sync-active');
            el.querySelector('.storage-icon').textContent = '☁️';
            el.querySelector('strong').textContent = 'Nube Activa';
            el.querySelector('span').textContent = 'Sincronizado con Firebase';
        } else {
            el.classList.remove('sync-active');
            el.querySelector('.storage-icon').textContent = '⏳';
            el.querySelector('strong').textContent = 'Conectando...';
            el.querySelector('span').textContent = 'Usando datos locales';
        }
    }

    function migrateState(data) {
        if (!data) return;
        data.productos.forEach(p => { if (p.stockBolsas === undefined) p.stockBolsas = 0; });
        if (!data.produccion) data.produccion = [];
        if (!data.gastos) data.gastos = [];
        if (!data.ventas) data.ventas = [];
        if (!data.materias) data.materias = DEFAULT_MATERIAS;
        if (!data.insumos) data.insumos = DEFAULT_INSUMOS;
    }

    function loadState() {
        // 1) Load from localStorage for instant display
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                state = {
                    materias: parsed.materias || DEFAULT_MATERIAS,
                    insumos: parsed.insumos || DEFAULT_INSUMOS,
                    productos: parsed.productos || DEFAULT_PRODUCTOS,
                    ventas: parsed.ventas || [],
                    gastos: parsed.gastos || [],
                    produccion: parsed.produccion || [],
                };
            } catch (err) {
                console.error("Error loading local state", err);
                initDefaults();
            }
        } else {
            initDefaults();
        }

        // 2) Setup Firebase real-time listener
        dataRef.on('value', (snapshot) => {
            const data = snapshot.val();
            firebaseConnected = true;
            updateStorageUI();

            if (!data) {
                // Firebase is empty → push local data up (first-time migration)
                dataRef.set(state);
                return;
            }
            if (!data.productos) return;

            // Skip re-render if this change came from us
            if (data._ts && data._ts === lastSaveTs) return;

            // Remote change from another device → apply it
            state = data;
            migrateState(state);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            if (currentSection) navigateTo(currentSection);
            showToast('🔄 Datos actualizados desde otro dispositivo');
        }, (error) => {
            console.error("Firebase listener error:", error);
            firebaseConnected = false;
            updateStorageUI();
        });

        // 3) Monitor connection status
        firebase.database().ref('.info/connected').on('value', (snap) => {
            firebaseConnected = snap.val() === true;
            updateStorageUI();
        });
    }

    function initDefaults() {
        state.materias = JSON.parse(JSON.stringify(DEFAULT_MATERIAS));
        state.insumos = JSON.parse(JSON.stringify(DEFAULT_INSUMOS));
        state.productos = JSON.parse(JSON.stringify(DEFAULT_PRODUCTOS));
        state.productos.forEach(p => p.stockBolsas = 0);
        state.ventas = [];
        state.gastos = [];
        state.produccion = [];
        saveState();
    }

    // =========== HELPERS ===========
    function $(id) { return document.getElementById(id); }
    function $$(sel) { return document.querySelectorAll(sel); }
    function uid() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 5); }

    function formatMoney(n) {
        if (n == null || isNaN(n)) return '$0';
        return '$' + Math.round(n).toLocaleString('es-AR');
    }

    function formatDate(iso) {
        if (!iso) return '-';
        const d = new Date(iso + 'T12:00:00');
        return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });
    }

    function today() {
        const d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    function getMateria(id) { return state.materias.find(m => m.id === id); }
    function getInsumo(id) { return state.insumos.find(i => i.id === id); }
    function getProducto(id) { return state.productos.find(p => p.id === id); }

    function calcCostoProducto(prod) {
        let costo = 0;
        for (const ing of prod.ingredientes) {
            const mat = getMateria(ing.materiaId);
            if (mat) {
                costo += (ing.cantidadG / 1000) * mat.precioKg;
            }
        }
        for (const ins of (prod.insumosExtra || [])) {
            const insumo = getInsumo(ins.insumoId);
            if (insumo) {
                costo += ins.cantidad * insumo.precioUnit;
            }
        }
        return costo;
    }

    function showToast(msg, isError) {
        const t = $('toast');
        $('toast-message').textContent = msg;
        t.classList.toggle('error', !!isError);
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2500);
    }

    function openModal(id) {
        $(id).classList.add('show');
    }

    function closeModal(id) {
        $(id).classList.remove('show');
    }

    // =========== NAVIGATION ===========
    let currentSection = 'dashboard';

    function navigateTo(section) {
        currentSection = section;
        $$('.section').forEach(s => s.classList.remove('active'));
        $$('.nav-item').forEach(n => n.classList.remove('active'));
        $('section-' + section).classList.add('active');
        const navItem = document.querySelector(`.nav-item[data-section="${section}"]`);
        if (navItem) navItem.classList.add('active');

        // Close mobile sidebar
        $('sidebar').classList.remove('open');
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) overlay.classList.remove('show');

        // Refresh section
        switch (section) {
            case 'dashboard': renderDashboard(); break;
            case 'ventas': renderVentas(); break;
            case 'produccion': renderProduccion(); break;
            case 'productos': renderProductos(); break;
            case 'materias': renderMaterias(); break;
            case 'gastos': renderGastos(); break;
            case 'reportes': renderReportes(); break;
        }
    }

    // =========== DASHBOARD ===========
    function renderDashboard() {
        const now = new Date();
        $('dashboard-date').textContent = now.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        const todayStr = today();
        const ventasHoy = state.ventas.filter(v => v.fecha === todayStr);
        const totalHoy = ventasHoy.reduce((s, v) => s + (v.precioVenta * v.cantidad), 0);

        // Week
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekStr = weekAgo.getFullYear() + '-' + String(weekAgo.getMonth() + 1).padStart(2, '0') + '-' + String(weekAgo.getDate()).padStart(2, '0');
        const ventasSemana = state.ventas.filter(v => v.fecha >= weekStr);
        const totalSemana = ventasSemana.reduce((s, v) => s + (v.precioVenta * v.cantidad), 0);

        // Month
        const monthStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
        const ventasMes = state.ventas.filter(v => v.fecha.startsWith(monthStr));
        const totalMes = ventasMes.reduce((s, v) => s + (v.precioVenta * v.cantidad), 0);
        const costoMes = ventasMes.reduce((s, v) => {
            const prod = getProducto(v.productoId);
            return s + (prod ? calcCostoProducto(prod) * v.cantidad : 0);
        }, 0);
        const gastosMes = state.gastos.filter(g => g.fecha.startsWith(monthStr)).reduce((s, g) => s + g.monto, 0);
        const profitMes = totalMes - costoMes - gastosMes;

        $('kpi-ventas-hoy').textContent = formatMoney(totalHoy);
        $('kpi-ventas-semana').textContent = formatMoney(totalSemana);
        $('kpi-ventas-mes').textContent = formatMoney(totalMes);
        $('kpi-profit-mes').textContent = formatMoney(profitMes);
        $('kpi-profit-mes').style.color = profitMes >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';

        // Recent sales table
        const recent = [...state.ventas].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id.localeCompare(a.id)).slice(0, 10);
        const tbody = $('table-ultimas-ventas').querySelector('tbody');
        if (recent.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4"><div class="empty-state"><div class="empty-state-icon">🛒</div><div class="empty-state-text">No hay ventas registradas aún</div></div></td></tr>';
        } else {
            tbody.innerHTML = recent.map(v => {
                const prod = getProducto(v.productoId);
                return `<tr>
                    <td>${formatDate(v.fecha)}</td>
                    <td>${prod ? prod.emoji + ' ' + prod.nombre : v.productoId}</td>
                    <td>${v.cantidad}</td>
                    <td style="font-weight:600">${formatMoney(v.precioVenta * v.cantidad)}</td>
                </tr>`;
            }).join('');
        }

        // Charts
        renderWeekChart();
        renderProductsChart();
    }

    // =========== CHARTS (Canvas) ===========
    function renderWeekChart() {
        const canvas = $('chart-ventas-semana');
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = 250 * dpr;
        canvas.style.height = '250px';
        ctx.scale(dpr, dpr);
        const W = rect.width;
        const H = 250;

        ctx.clearRect(0, 0, W, H);

        // Get last 7 days data
        const days = [];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            const dayVentas = state.ventas.filter(v => v.fecha === dateStr);
            const total = dayVentas.reduce((s, v) => s + (v.precioVenta * v.cantidad), 0);
            days.push({
                label: d.toLocaleDateString('es-AR', { weekday: 'short' }),
                value: total,
            });
        }

        const maxVal = Math.max(...days.map(d => d.value), 1);
        const padding = { top: 20, right: 20, bottom: 40, left: 65 };
        const chartW = W - padding.left - padding.right;
        const chartH = H - padding.top - padding.bottom;
        const barWidth = chartW / days.length * 0.6;
        const gap = chartW / days.length;

        // Grid lines
        ctx.strokeStyle = 'rgba(245, 240, 232, 0.06)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chartH / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(W - padding.right, y);
            ctx.stroke();

            // Labels
            ctx.fillStyle = 'rgba(122, 110, 98, 0.8)';
            ctx.font = '11px Inter, sans-serif';
            ctx.textAlign = 'right';
            const val = maxVal - (maxVal / 4) * i;
            ctx.fillText(formatMoney(val), padding.left - 8, y + 4);
        }

        // Bars
        days.forEach((day, i) => {
            const x = padding.left + gap * i + (gap - barWidth) / 2;
            const barH = (day.value / maxVal) * chartH;
            const y = padding.top + chartH - barH;

            // Gradient bar
            const grad = ctx.createLinearGradient(x, y, x, padding.top + chartH);
            grad.addColorStop(0, 'rgba(232, 168, 56, 0.9)');
            grad.addColorStop(1, 'rgba(232, 168, 56, 0.2)');
            ctx.fillStyle = grad;

            // Rounded rect
            const radius = 4;
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + barWidth - radius, y);
            ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
            ctx.lineTo(x + barWidth, padding.top + chartH);
            ctx.lineTo(x, padding.top + chartH);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.fill();

            // Day label
            ctx.fillStyle = 'rgba(184, 169, 154, 0.8)';
            ctx.font = '11px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(day.label, x + barWidth / 2, H - padding.bottom + 20);

            // Value on top
            if (day.value > 0) {
                ctx.fillStyle = 'rgba(245, 240, 232, 0.7)';
                ctx.font = 'bold 10px Inter, sans-serif';
                ctx.fillText(formatMoney(day.value), x + barWidth / 2, y - 6);
            }
        });
    }

    function renderProductsChart() {
        const canvas = $('chart-productos');
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = 250 * dpr;
        canvas.style.height = '250px';
        ctx.scale(dpr, dpr);
        const W = rect.width;
        const H = 250;
        ctx.clearRect(0, 0, W, H);

        // Get monthly data per product
        const now = new Date();
        const monthStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
        const ventasMes = state.ventas.filter(v => v.fecha.startsWith(monthStr));

        const prodData = state.productos.map(p => {
            const qty = ventasMes.filter(v => v.productoId === p.id).reduce((s, v) => s + v.cantidad, 0);
            return { nombre: p.nombre, emoji: p.emoji, qty, color: '' };
        });

        const colors = ['#e8a838', '#e07830', '#4caf7d', '#5b9bd5'];
        prodData.forEach((p, i) => p.color = colors[i % colors.length]);

        const total = prodData.reduce((s, p) => s + p.qty, 0);

        if (total === 0) {
            ctx.fillStyle = 'rgba(122, 110, 98, 0.5)';
            ctx.font = '14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Sin datos este mes', W / 2, H / 2);
            return;
        }

        // Donut chart
        const cx = W / 2 - 50;
        const cy = H / 2;
        const outerR = Math.min(cx, cy) - 20;
        const innerR = outerR * 0.6;
        let startAngle = -Math.PI / 2;

        prodData.forEach(p => {
            if (p.qty === 0) return;
            const sliceAngle = (p.qty / total) * Math.PI * 2;

            ctx.beginPath();
            ctx.arc(cx, cy, outerR, startAngle, startAngle + sliceAngle);
            ctx.arc(cx, cy, innerR, startAngle + sliceAngle, startAngle, true);
            ctx.closePath();
            ctx.fillStyle = p.color;
            ctx.fill();

            startAngle += sliceAngle;
        });

        // Center text
        ctx.fillStyle = 'rgba(245, 240, 232, 0.9)';
        ctx.font = 'bold 22px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(total, cx, cy + 2);
        ctx.fillStyle = 'rgba(122, 110, 98, 0.8)';
        ctx.font = '11px Inter, sans-serif';
        ctx.fillText('unidades', cx, cy + 18);

        // Legend
        const legendX = cx + outerR + 30;
        let legendY = cy - (prodData.length * 26) / 2;
        prodData.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(legendX, legendY, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(184, 169, 154, 0.9)';
            ctx.font = '12px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`${p.emoji} ${p.nombre}`, legendX + 14, legendY + 1);

            ctx.fillStyle = 'rgba(245, 240, 232, 0.7)';
            ctx.font = 'bold 12px Inter, sans-serif';
            ctx.fillText(`${p.qty}`, legendX + 14, legendY + 17);

            legendY += 38;
        });
    }

    // =========== VENTAS ===========
    function renderVentas() {
        renderQuickSale();
        renderVentasHistorial();
    }

    function renderQuickSale() {
        const grid = $('quick-sale-grid');
        grid.innerHTML = state.productos.map(p => {
            const costo = calcCostoProducto(p);
            const profit = p.precioVenta - costo;
            const margin = ((profit / p.precioVenta) * 100).toFixed(0);
            const stock = p.stockBolsas || 0;
            const stockCls = stock > 0 ? 'in-stock' : 'no-stock';
            const disabledCls = stock > 0 ? '' : 'disabled';

            return `<div class="quick-sale-card ${disabledCls}" data-product-id="${p.id}" ${stock > 0 ? '' : 'title="No hay stock de bolsas"'}>
                <div class="stock-badge ${stockCls}">📦 ${stock} bolsas</div>
                <div class="quick-sale-emoji">${p.emoji}</div>
                <div class="quick-sale-name">${p.nombre}</div>
                <div class="quick-sale-price">${formatMoney(p.precioVenta)}</div>
                <div class="quick-sale-details">${p.pesoG}g por bolsita</div>
                <div class="quick-sale-cost-line">
                    <span class="badge-cost">Costo: ${formatMoney(costo)}</span>
                    <span class="badge-profit">+${margin}%</span>
                </div>
            </div>`;
        }).join('');

        grid.querySelectorAll('.quick-sale-card:not(.disabled)').forEach(card => {
            card.addEventListener('click', () => {
                const prodId = card.dataset.productId;
                const prod = getProducto(prodId);
                if (!prod) return;
                $('venta-producto-id').value = prodId;
                $('venta-producto-nombre').value = prod.emoji + ' ' + prod.nombre;
                $('venta-fecha').value = today();
                $('venta-cantidad').value = 1;
                $('venta-cantidad').max = prod.stockBolsas || 1;
                $('venta-precio-unit').textContent = formatMoney(prod.precioVenta);
                $('venta-total').textContent = formatMoney(prod.precioVenta);
                openModal('modal-venta');
            });
        });
    }

    // =========== PRODUCCIÓN ===========
    function renderProduccion() {
        renderProductionCards();
        renderProduccionHistorial();
    }

    function renderProductionCards() {
        const grid = $('production-grid');
        grid.innerHTML = state.productos.map(p => {
            const stock = p.stockBolsas || 0;
            const stockCls = stock > 10 ? 'in-stock' : (stock > 0 ? 'low-stock' : 'no-stock');

            return `<div class="quick-sale-card" data-product-id="${p.id}">
                <div class="stock-badge ${stockCls}">📦 Stock: ${stock} bolsas</div>
                <div class="quick-sale-emoji" style="margin-top:0.5rem">${p.emoji}</div>
                <div class="quick-sale-name">${p.nombre}</div>
                <div style="font-size:0.85rem;color:var(--text-secondary);margin-top:0.5rem">Clic para armar bolsas</div>
            </div>`;
        }).join('');

        grid.querySelectorAll('.quick-sale-card').forEach(card => {
            card.addEventListener('click', () => {
                const prodId = card.dataset.productId;
                const prod = getProducto(prodId);
                if (!prod) return;

                $('prod-producto-id').value = prodId;
                $('prod-producto-nombre').value = prod.emoji + ' ' + prod.nombre;
                $('prod-fecha').value = today();
                $('prod-cantidad').value = 1;
                updateProductionSummary();
                openModal('modal-produccion');
            });
        });
    }

    function updateProductionSummary() {
        const prodId = $('prod-producto-id').value;
        const prod = getProducto(prodId);
        if (!prod) return;

        const qty = parseInt($('prod-cantidad').value) || 0;
        const container = $('prod-consumo-resumen');

        let html = '<strong style="display:block;margin-bottom:0.5rem">Se descontará del stock:</strong>';
        let canProduce = true;

        prod.ingredientes.forEach(ing => {
            const mat = getMateria(ing.materiaId);
            const needed = ing.cantidadG * qty;
            const hasStock = mat && mat.stockG >= needed;
            if (!hasStock) canProduce = false;

            html += `<div class="prod-consumo-item ${!hasStock ? 'no-stock-warning' : ''}">
                <span>${mat ? mat.nombre : ing.materiaId}:</span>
                <span>${needed}g ${!hasStock ? '(Falta stock)' : ''}</span>
            </div>`;
        });

        (prod.insumosExtra || []).forEach(ins => {
            const insumo = getInsumo(ins.insumoId);
            const needed = ins.cantidad * qty;
            const hasStock = insumo && insumo.stock >= needed;
            if (!hasStock) canProduce = false;

            html += `<div class="prod-consumo-item ${!hasStock ? 'no-stock-warning' : ''}">
                <span>${insumo ? insumo.nombre : ins.insumoId}:</span>
                <span>${needed} unid. ${!hasStock ? '(Falta stock)' : ''}</span>
            </div>`;
        });

        container.innerHTML = html;
        $('form-produccion').querySelector('button[type="submit"]').disabled = !canProduce;
    }

    function renderProduccionHistorial() {
        const tbody = $('table-produccion').querySelector('tbody');
        const produccion = [...state.produccion].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id.localeCompare(a.id));

        if (produccion.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><div class="empty-state-icon">🏭</div><div class="empty-state-text">No has producido bolsas aún</div></div></td></tr>';
            return;
        }

        tbody.innerHTML = produccion.map(p => {
            const prod = getProducto(p.productoId);
            return `<tr>
                <td>${formatDate(p.fecha)}</td>
                <td style="font-weight:600">${prod ? prod.emoji + ' ' + prod.nombre : p.productoId}</td>
                <td style="color:var(--accent-blue);font-weight:700">+${p.cantidad} bolsas</td>
                <td style="font-size:0.8rem;color:var(--text-secondary)">${p.resumenMateria || '-'}</td>
                <td><button class="btn-icon delete delete-produccion" data-id="${p.id}" title="Deshacer producción">🗑️</button></td>
            </tr>`;
        }).join('');

        tbody.querySelectorAll('.delete-produccion').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('¿Eliminar esta producción? El stock de materias primas volverá a su estado anterior y se restarán bolsas del producto.')) {
                    const prodRecord = state.produccion.find(x => x.id === btn.dataset.id);
                    if (prodRecord) {
                        const prod = getProducto(prodRecord.productoId);
                        if (prod) {
                            prod.stockBolsas = Math.max(0, (prod.stockBolsas || 0) - prodRecord.cantidad);
                            prod.ingredientes.forEach(ing => {
                                const mat = getMateria(ing.materiaId);
                                if (mat) mat.stockG += (ing.cantidadG * prodRecord.cantidad);
                            });
                            (prod.insumosExtra || []).forEach(ins => {
                                const insumo = getInsumo(ins.insumoId);
                                if (insumo) insumo.stock += (ins.cantidad * prodRecord.cantidad);
                            });
                        }
                    }
                    state.produccion = state.produccion.filter(x => x.id !== btn.dataset.id);
                    saveState();
                    renderProduccion();
                    showToast('Producción eliminada y stock restaurado');
                }
            });
        });
    }

    function renderVentasHistorial(filteredVentas) {
        const ventas = filteredVentas || [...state.ventas].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id.localeCompare(a.id));
        const tbody = $('table-ventas-historial').querySelector('tbody');
        if (ventas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-text">No hay ventas en el período seleccionado</div></div></td></tr>';
            return;
        }
        tbody.innerHTML = ventas.map(v => {
            const prod = getProducto(v.productoId);
            const costo = prod ? calcCostoProducto(prod) * v.cantidad : 0;
            const totalVenta = v.precioVenta * v.cantidad;
            const profit = totalVenta - costo;
            return `<tr>
                <td>${formatDate(v.fecha)}</td>
                <td>${prod ? prod.emoji + ' ' + prod.nombre : v.productoId}</td>
                <td>${v.cantidad}</td>
                <td>${formatMoney(v.precioVenta)}</td>
                <td style="font-weight:600">${formatMoney(totalVenta)}</td>
                <td style="color:var(--accent-green);font-weight:600">${formatMoney(profit)}</td>
                <td><button class="btn-icon delete" data-id="${v.id}" title="Eliminar">🗑️</button></td>
            </tr>`;
        }).join('');

        tbody.querySelectorAll('.delete').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('¿Eliminar esta venta?')) {
                    const venta = state.ventas.find(v => v.id === btn.dataset.id);
                    if (venta) {
                        const prod = getProducto(venta.productoId);
                        if (prod) prod.stockBolsas = (prod.stockBolsas || 0) + venta.cantidad;
                    }
                    state.ventas = state.ventas.filter(v => v.id !== btn.dataset.id);
                    saveState();
                    renderVentas();
                    showToast('Venta eliminada y bolsas restauradas');
                }
            });
        });
    }

    // =========== PRODUCTOS ===========
    function renderProductos() {
        const grid = $('products-grid');
        grid.innerHTML = state.productos.map(p => {
            const costo = calcCostoProducto(p);
            const profit = p.precioVenta - costo;
            const margin = ((profit / p.precioVenta) * 100).toFixed(1);

            const ingredientesHTML = p.ingredientes.map(ing => {
                const mat = getMateria(ing.materiaId);
                const costIng = mat ? (ing.cantidadG / 1000) * mat.precioKg : 0;
                return `<div class="ingredient-row">
                    <span class="ingredient-name"><span class="ingredient-dot"></span> ${mat ? mat.nombre : ing.materiaId}</span>
                    <span class="ingredient-amount">${ing.cantidadG}g — ${formatMoney(costIng)}</span>
                </div>`;
            }).join('');

            const insumosHTML = (p.insumosExtra || []).map(ins => {
                const insumo = getInsumo(ins.insumoId);
                const costIns = insumo ? ins.cantidad * insumo.precioUnit : 0;
                return `<div class="ingredient-row">
                    <span class="ingredient-name"><span class="ingredient-dot" style="background:var(--accent-blue)"></span> ${insumo ? insumo.nombre : ins.insumoId}</span>
                    <span class="ingredient-amount">x${ins.cantidad} — ${formatMoney(costIns)}</span>
                </div>`;
            }).join('');

            return `<div class="product-card">
                <div class="product-card-header">
                    <span class="product-card-emoji">${p.emoji}</span>
                    <div>
                        <div class="product-card-title">${p.nombre}</div>
                        <div class="product-card-weight">${p.pesoG}g por bolsita</div>
                    </div>
                </div>
                <div class="product-ingredients">
                    <h4>Ingredientes</h4>
                    ${ingredientesHTML}
                    ${insumosHTML ? '<h4 style="margin-top:0.6rem">Insumos</h4>' + insumosHTML : ''}
                </div>
                <div class="product-financials">
                    <div class="financial-row">
                        <span class="financial-label">Costo unitario</span>
                        <span class="financial-value">${formatMoney(costo)}</span>
                    </div>
                    <div class="financial-row">
                        <span class="financial-label">Precio de venta</span>
                        <span class="financial-value">${formatMoney(p.precioVenta)}</span>
                    </div>
                    <div class="financial-row total">
                        <span class="financial-label">Ganancia</span>
                        <span class="financial-value profit">${formatMoney(profit)}</span>
                    </div>
                    <div class="financial-row" style="border:none;padding-top:0.4rem">
                        <span class="financial-label">Margen</span>
                        <span class="financial-value margin">${margin}%</span>
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    // =========== MATERIAS PRIMAS ===========
    function renderMaterias() {
        // Ingredientes
        const tbody = $('table-materias').querySelector('tbody');
        tbody.innerHTML = state.materias.map(m => {
            return `<tr>
                <td style="font-weight:600">${m.nombre}</td>
                <td>${formatMoney(m.precioKg)}</td>
                <td>${m.stockG.toLocaleString('es-AR')}g</td>
                <td style="font-size:0.8rem;color:var(--text-muted)">${formatDate(m.updatedAt ? m.updatedAt.split('T')[0] : null)}</td>
                <td>
                    <button class="btn-icon edit-materia" data-id="${m.id}" title="Editar">✏️</button>
                    <button class="btn-icon delete delete-materia" data-id="${m.id}" title="Eliminar">🗑️</button>
                </td>
            </tr>`;
        }).join('');

        tbody.querySelectorAll('.edit-materia').forEach(btn => {
            btn.addEventListener('click', () => editMateria(btn.dataset.id));
        });
        tbody.querySelectorAll('.delete-materia').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('¿Eliminar esta materia prima?')) {
                    state.materias = state.materias.filter(m => m.id !== btn.dataset.id);
                    saveState();
                    renderMaterias();
                    showToast('Materia prima eliminada');
                }
            });
        });

        // Insumos
        const tbody2 = $('table-insumos').querySelector('tbody');
        tbody2.innerHTML = state.insumos.map(i => {
            return `<tr>
                <td style="font-weight:600">${i.nombre}</td>
                <td>${formatMoney(i.precioUnit)}</td>
                <td>${i.stock.toLocaleString('es-AR')}</td>
                <td style="font-size:0.8rem;color:var(--text-muted)">${formatDate(i.updatedAt ? i.updatedAt.split('T')[0] : null)}</td>
                <td>
                    <button class="btn-icon edit-insumo" data-id="${i.id}" title="Editar">✏️</button>
                    <button class="btn-icon delete delete-insumo" data-id="${i.id}" title="Eliminar">🗑️</button>
                </td>
            </tr>`;
        }).join('');

        tbody2.querySelectorAll('.edit-insumo').forEach(btn => {
            btn.addEventListener('click', () => editInsumo(btn.dataset.id));
        });
        tbody2.querySelectorAll('.delete-insumo').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('¿Eliminar este insumo?')) {
                    state.insumos = state.insumos.filter(i => i.id !== btn.dataset.id);
                    saveState();
                    renderMaterias();
                    showToast('Insumo eliminado');
                }
            });
        });
    }

    function editMateria(id) {
        const m = getMateria(id);
        $('modal-materia-title').textContent = m ? 'Editar Materia Prima' : 'Agregar Materia Prima';
        $('materia-id').value = m ? m.id : '';
        $('materia-nombre').value = m ? m.nombre : '';
        $('materia-precio').value = m ? m.precioKg : '';
        $('materia-stock').value = m ? m.stockG : '';
        openModal('modal-materia');
    }

    function editInsumo(id) {
        const i = getInsumo(id);
        $('modal-insumo-title').textContent = i ? 'Editar Insumo' : 'Agregar Insumo';
        $('insumo-id').value = i ? i.id : '';
        $('insumo-nombre').value = i ? i.nombre : '';
        $('insumo-precio').value = i ? i.precioUnit : '';
        $('insumo-stock').value = i ? i.stock : '';
        openModal('modal-insumo');
    }

    // =========== GASTOS ===========
    function renderGastos() {
        const now = new Date();
        const monthStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
        const gastosMes = state.gastos.filter(g => g.fecha.startsWith(monthStr));
        const fijos = gastosMes.filter(g => g.tipo === 'fijo').reduce((s, g) => s + g.monto, 0);
        const variables = gastosMes.filter(g => g.tipo === 'variable').reduce((s, g) => s + g.monto, 0);

        $('kpi-gastos-fijos').textContent = formatMoney(fijos);
        $('kpi-gastos-variables').textContent = formatMoney(variables);
        $('kpi-gastos-total').textContent = formatMoney(fijos + variables);

        const sorted = [...state.gastos].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id.localeCompare(a.id));
        const tbody = $('table-gastos').querySelector('tbody');
        if (sorted.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><div class="empty-state-icon">💸</div><div class="empty-state-text">No hay gastos registrados</div></div></td></tr>';
        } else {
            tbody.innerHTML = sorted.map(g => {
                const tipoBadge = g.tipo === 'fijo'
                    ? '<span style="background:var(--accent-blue-soft);color:var(--accent-blue);padding:0.15rem 0.5rem;border-radius:20px;font-size:0.75rem;font-weight:600">Fijo</span>'
                    : '<span style="background:var(--accent-amber-soft);color:var(--accent-amber);padding:0.15rem 0.5rem;border-radius:20px;font-size:0.75rem;font-weight:600">Variable</span>';
                return `<tr>
                    <td>${formatDate(g.fecha)}</td>
                    <td>${g.concepto}</td>
                    <td>${tipoBadge}</td>
                    <td style="font-weight:600;color:var(--accent-red)">${formatMoney(g.monto)}</td>
                    <td>
                        <button class="btn-icon edit-gasto" data-id="${g.id}" title="Editar">✏️</button>
                        <button class="btn-icon delete delete-gasto" data-id="${g.id}" title="Eliminar">🗑️</button>
                    </td>
                </tr>`;
            }).join('');

            tbody.querySelectorAll('.edit-gasto').forEach(btn => {
                btn.addEventListener('click', () => {
                    const g = state.gastos.find(x => x.id === btn.dataset.id);
                    if (!g) return;
                    $('modal-gasto-title').textContent = 'Editar Gasto';
                    $('gasto-id').value = g.id;
                    $('gasto-fecha').value = g.fecha;
                    $('gasto-concepto').value = g.concepto;
                    $('gasto-tipo').value = g.tipo;
                    $('gasto-monto').value = g.monto;
                    openModal('modal-gasto');
                });
            });
            tbody.querySelectorAll('.delete-gasto').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (confirm('¿Eliminar este gasto?')) {
                        state.gastos = state.gastos.filter(g => g.id !== btn.dataset.id);
                        saveState();
                        renderGastos();
                        showToast('Gasto eliminado');
                    }
                });
            });
        }
    }

    // =========== REPORTES ===========
    function renderReportes() {
        const period = $('report-period').value;
        const now = new Date();
        let filteredVentas = [];
        let filteredGastos = [];

        if (period === 'week') {
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            const weekStr = weekAgo.getFullYear() + '-' + String(weekAgo.getMonth() + 1).padStart(2, '0') + '-' + String(weekAgo.getDate()).padStart(2, '0');
            filteredVentas = state.ventas.filter(v => v.fecha >= weekStr);
            filteredGastos = state.gastos.filter(g => g.fecha >= weekStr);
        } else if (period === 'month') {
            const monthStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
            filteredVentas = state.ventas.filter(v => v.fecha.startsWith(monthStr));
            filteredGastos = state.gastos.filter(g => g.fecha.startsWith(monthStr));
        } else {
            filteredVentas = [...state.ventas];
            filteredGastos = [...state.gastos];
        }

        // Profit summary
        const totalIngresos = filteredVentas.reduce((s, v) => s + (v.precioVenta * v.cantidad), 0);
        const totalCostoProductos = filteredVentas.reduce((s, v) => {
            const prod = getProducto(v.productoId);
            return s + (prod ? calcCostoProducto(prod) * v.cantidad : 0);
        }, 0);
        const totalGastos = filteredGastos.reduce((s, g) => s + g.monto, 0);
        const totalProfit = totalIngresos - totalCostoProductos - totalGastos;
        const totalUnidades = filteredVentas.reduce((s, v) => s + v.cantidad, 0);

        $('report-profit-summary').innerHTML = `
            <div class="report-stat">
                <div class="report-stat-value amber">${formatMoney(totalIngresos)}</div>
                <div class="report-stat-label">Ingresos</div>
            </div>
            <div class="report-stat">
                <div class="report-stat-value red">${formatMoney(totalCostoProductos)}</div>
                <div class="report-stat-label">Costo Productos</div>
            </div>
            <div class="report-stat">
                <div class="report-stat-value red">${formatMoney(totalGastos)}</div>
                <div class="report-stat-label">Otros Gastos</div>
            </div>
            <div class="report-stat">
                <div class="report-stat-value green">${formatMoney(totalProfit)}</div>
                <div class="report-stat-label">Ganancia Neta</div>
            </div>
            <div class="report-stat">
                <div class="report-stat-value blue">${totalUnidades}</div>
                <div class="report-stat-label">Unidades Vendidas</div>
            </div>
        `;

        // Consumption report
        const consumo = {};
        filteredVentas.forEach(v => {
            const prod = getProducto(v.productoId);
            if (!prod) return;
            prod.ingredientes.forEach(ing => {
                if (!consumo[ing.materiaId]) consumo[ing.materiaId] = 0;
                consumo[ing.materiaId] += ing.cantidadG * v.cantidad;
            });
        });

        const tbodyConsumo = $('table-report-consumo').querySelector('tbody');
        const consumoEntries = Object.entries(consumo);
        if (consumoEntries.length === 0) {
            tbodyConsumo.innerHTML = '<tr><td colspan="3"><div class="empty-state"><div class="empty-state-text">Sin datos de consumo</div></div></td></tr>';
        } else {
            tbodyConsumo.innerHTML = consumoEntries.map(([matId, grams]) => {
                const mat = getMateria(matId);
                const cost = mat ? (grams / 1000) * mat.precioKg : 0;
                return `<tr>
                    <td style="font-weight:600">${mat ? mat.nombre : matId}</td>
                    <td>${grams.toLocaleString('es-AR')}g</td>
                    <td style="color:var(--accent-amber);font-weight:600">${formatMoney(cost)}</td>
                </tr>`;
            }).join('');
        }

        // Per product report
        const tbodyProd = $('table-report-productos').querySelector('tbody');
        const prodReport = state.productos.map(p => {
            const pVentas = filteredVentas.filter(v => v.productoId === p.id);
            const qty = pVentas.reduce((s, v) => s + v.cantidad, 0);
            const ingresos = pVentas.reduce((s, v) => s + (v.precioVenta * v.cantidad), 0);
            const costoTotal = calcCostoProducto(p) * qty;
            const ganancia = ingresos - costoTotal;
            const margin = ingresos > 0 ? ((ganancia / ingresos) * 100).toFixed(1) : 0;
            return { p, qty, ingresos, costoTotal, ganancia, margin };
        });

        tbodyProd.innerHTML = prodReport.map(r => {
            return `<tr>
                <td style="font-weight:600">${r.p.emoji} ${r.p.nombre}</td>
                <td>${r.qty}</td>
                <td>${formatMoney(r.ingresos)}</td>
                <td style="color:var(--accent-red)">${formatMoney(r.costoTotal)}</td>
                <td style="color:var(--accent-green);font-weight:700">${formatMoney(r.ganancia)}</td>
                <td><span class="badge-profit">${r.margin}%</span></td>
            </tr>`;
        }).join('');
    }

    // =========== EVENT LISTENERS ===========
    function setupEvents() {
        // Navigation
        $$('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo(item.dataset.section);
            });
        });

        // Mobile
        $('hamburger').addEventListener('click', () => {
            $('sidebar').classList.toggle('open');
            let overlay = document.querySelector('.sidebar-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'sidebar-overlay';
                document.body.appendChild(overlay);
                overlay.addEventListener('click', () => {
                    $('sidebar').classList.remove('open');
                    overlay.classList.remove('show');
                });
            }
            overlay.classList.toggle('show');
        });

        // Close modals
        $$('[data-close]').forEach(btn => {
            btn.addEventListener('click', () => closeModal(btn.dataset.close));
        });

        // Click outside modal
        $$('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) overlay.classList.remove('show');
            });
        });

        // Venta form
        $('form-venta').addEventListener('submit', (e) => {
            e.preventDefault();
            const prodId = $('venta-producto-id').value;
            const prod = getProducto(prodId);
            if (!prod) return;
            const qty = parseInt($('venta-cantidad').value);

            if ((prod.stockBolsas || 0) < qty) {
                showToast('No hay suficiente stock de bolsas para esta venta', true);
                return;
            }

            const venta = {
                id: uid(),
                productoId: prodId,
                fecha: $('venta-fecha').value,
                cantidad: qty,
                precioVenta: prod.precioVenta,
            };
            state.ventas.push(venta);

            // Descontar DE PRODUCTOS TERMINADOS (bolsas)
            prod.stockBolsas -= venta.cantidad;

            saveState();
            closeModal('modal-venta');
            showToast(`✅ Venta registrada: ${venta.cantidad}x ${prod.nombre}`);
            renderVentas();
        });

        // Produccion form
        if ($('prod-cantidad')) {
            $('prod-cantidad').addEventListener('input', updateProductionSummary);
        }

        $('form-produccion').addEventListener('submit', (e) => {
            e.preventDefault();
            const prodId = $('prod-producto-id').value;
            const prod = getProducto(prodId);
            if (!prod) return;
            const qty = parseInt($('prod-cantidad').value);
            if (qty <= 0) return;

            let resumenText = [];

            // Descontar materias primas
            prod.ingredientes.forEach(ing => {
                const mat = getMateria(ing.materiaId);
                if (mat) {
                    const uso = ing.cantidadG * qty;
                    mat.stockG = Math.max(0, mat.stockG - uso);
                    resumenText.push(`${uso}g ${mat.nombre}`);
                }
            });
            // Descontar insumos
            (prod.insumosExtra || []).forEach(ins => {
                const insumo = getInsumo(ins.insumoId);
                if (insumo) {
                    const uso = ins.cantidad * qty;
                    insumo.stock = Math.max(0, insumo.stock - uso);
                    resumenText.push(`${uso}x ${insumo.nombre}`);
                }
            });

            // Sumar a stock de bolsas terminadas
            prod.stockBolsas = (prod.stockBolsas || 0) + qty;

            const produccion = {
                id: uid(),
                productoId: prodId,
                fecha: $('prod-fecha').value,
                cantidad: qty,
                resumenMateria: resumenText.join(', ')
            };
            state.produccion.push(produccion);

            saveState();
            closeModal('modal-produccion');
            showToast(`🏭 Producción registrada: +${qty} bolsas de ${prod.nombre}`);
            renderProduccion();
        });

        // Update venta total on quantity change
        $('venta-cantidad').addEventListener('input', () => {
            const prodId = $('venta-producto-id').value;
            const prod = getProducto(prodId);
            if (!prod) return;
            const qty = parseInt($('venta-cantidad').value) || 0;
            $('venta-total').textContent = formatMoney(prod.precioVenta * qty);
        });

        // Materia form
        $('form-materia').addEventListener('submit', (e) => {
            e.preventDefault();
            const id = $('materia-id').value;
            const data = {
                nombre: $('materia-nombre').value.trim(),
                precioKg: parseFloat($('materia-precio').value),
                stockG: parseFloat($('materia-stock').value) || 0,
                updatedAt: new Date().toISOString(),
            };
            if (id) {
                const m = getMateria(id);
                if (m) Object.assign(m, data);
            } else {
                data.id = uid();
                state.materias.push(data);
            }
            saveState();
            closeModal('modal-materia');
            renderMaterias();
            showToast('Materia prima guardada');
        });

        // Insumo form
        $('form-insumo').addEventListener('submit', (e) => {
            e.preventDefault();
            const id = $('insumo-id').value;
            const data = {
                nombre: $('insumo-nombre').value.trim(),
                precioUnit: parseFloat($('insumo-precio').value),
                stock: parseFloat($('insumo-stock').value) || 0,
                updatedAt: new Date().toISOString(),
            };
            if (id) {
                const i = getInsumo(id);
                if (i) Object.assign(i, data);
            } else {
                data.id = uid();
                state.insumos.push(data);
            }
            saveState();
            closeModal('modal-insumo');
            renderMaterias();
            showToast('Insumo guardado');
        });

        // Gasto form
        $('form-gasto').addEventListener('submit', (e) => {
            e.preventDefault();
            const id = $('gasto-id').value;
            const data = {
                fecha: $('gasto-fecha').value,
                concepto: $('gasto-concepto').value.trim(),
                tipo: $('gasto-tipo').value,
                monto: parseFloat($('gasto-monto').value),
            };
            if (id) {
                const g = state.gastos.find(x => x.id === id);
                if (g) Object.assign(g, data);
            } else {
                data.id = uid();
                state.gastos.push(data);
            }
            saveState();
            closeModal('modal-gasto');
            renderGastos();
            showToast('Gasto guardado');
        });

        // Add buttons
        $('btn-add-materia').addEventListener('click', () => editMateria(null));
        $('btn-add-insumo').addEventListener('click', () => editInsumo(null));
        $('btn-add-gasto').addEventListener('click', () => {
            $('modal-gasto-title').textContent = 'Nuevo Gasto';
            $('gasto-id').value = '';
            $('gasto-fecha').value = today();
            $('gasto-concepto').value = '';
            $('gasto-tipo').value = 'variable';
            $('gasto-monto').value = '';
            openModal('modal-gasto');
        });

        // Filter ventas
        $('btn-filter-ventas').addEventListener('click', () => {
            const from = $('filter-date-from').value;
            const to = $('filter-date-to').value;
            let filtered = [...state.ventas];
            if (from) filtered = filtered.filter(v => v.fecha >= from);
            if (to) filtered = filtered.filter(v => v.fecha <= to);
            filtered.sort((a, b) => b.fecha.localeCompare(a.fecha));
            renderVentasHistorial(filtered);
        });

        // Report
        $('btn-generate-report').addEventListener('click', renderReportes);


        // Export
        $('btn-export').addEventListener('click', () => {
            const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `nutcontrol_backup_${today()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('💾 Backup exportado correctamente');
        });

        // Import
        $('btn-import').addEventListener('click', () => $('import-file').click());
        $('import-file').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const imported = JSON.parse(ev.target.result);
                    if (imported.materias && imported.productos) {
                        state = imported;
                        // migrate just in case
                        state.productos.forEach(p => { if (p.stockBolsas === undefined) p.stockBolsas = 0; });
                        if (!state.produccion) state.produccion = [];
                        
                        saveState();
                        navigateTo(currentSection);
                        showToast('📂 Datos importados correctamente');
                    } else {
                        showToast('Archivo inválido', true);
                    }
                } catch {
                    showToast('Error al leer el archivo', true);
                }
            };
            reader.readAsText(file);
            e.target.value = '';
        });

        // Resize charts
        window.addEventListener('resize', () => {
            if (currentSection === 'dashboard') {
                renderWeekChart();
                renderProductsChart();
            }
        });
    }

    // =========== INIT ===========
    function init() {
        loadState();
        updateStorageUI();
        setupEvents();
        navigateTo('dashboard');
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
