/* ============================================
   NutControl — App Logic
   Full business management for dried fruits
   ============================================ */

(function () {
    'use strict';

    // =========== DEFAULT DATA ===========
    const DEFAULT_MATERIAS = [
        { id: 'girasol', nombre: 'Semillas de Girasol', precioKg: 6000, stockG: 0, updatedAt: new Date().toISOString() },
        { id: 'zapallo', nombre: 'Semillas de Zapallo', precioKg: 16000, stockG: 0, updatedAt: new Date().toISOString() },
        { id: 'castanas', nombre: 'Castañas de Cajú', precioKg: 24000, stockG: 0, updatedAt: new Date().toISOString() },
        { id: 'almendras', nombre: 'Almendras', precioKg: 29000, stockG: 0, updatedAt: new Date().toISOString() },
        { id: 'chocolate', nombre: 'Chocolate Alpino', precioKg: 13500, stockG: 0, updatedAt: new Date().toISOString() },
        { id: 'azucar', nombre: 'Azúcar', precioKg: 1400, stockG: 0, updatedAt: new Date().toISOString() },
        { id: 'sal', nombre: 'Sal fina (salmuera)', precioKg: 1500, stockG: 0, updatedAt: new Date().toISOString() },
    ];

    const DEFAULT_INSUMOS = [
        { id: 'bolsitas', nombre: 'Doypack kraft 10x15 (60 g)', precioUnit: 168, stock: 0, updatedAt: new Date().toISOString() },
        { id: 'bolsa300', nombre: 'Doypack 300 g', precioUnit: 300, stock: 0, updatedAt: new Date().toISOString() },
        { id: 'etiquetas', nombre: 'Etiqueta Niimbot 12x40', precioUnit: 78, stock: 0, updatedAt: new Date().toISOString() },
        { id: 'celofan', nombre: 'Celofán + tag (ramos y cajas)', precioUnit: 103, stock: 0, updatedAt: new Date().toISOString() },
    ];

    const STD_INS = [{ insumoId: 'bolsitas', cantidad: 1 }, { insumoId: 'etiquetas', cantidad: 1 }];

    const DEFAULT_PRODUCTOS = [
        { id: 'choco-semillas', nombre: 'Chocolate con semillas', emoji: '🍫', precioVenta: 4000, pesoG: 65, stockBolsas: 0,
          ingredientes: [{ materiaId: 'girasol', cantidadG: 15 }, { materiaId: 'zapallo', cantidadG: 15 }, { materiaId: 'chocolate', cantidadG: 33 }, { materiaId: 'azucar', cantidadG: 2 }],
          insumosExtra: STD_INS },
        { id: 'choco-castanas', nombre: 'Chocolate con castañas', emoji: '🌰', precioVenta: 4000, pesoG: 65, stockBolsas: 0,
          ingredientes: [{ materiaId: 'castanas', cantidadG: 30 }, { materiaId: 'chocolate', cantidadG: 33 }, { materiaId: 'azucar', cantidadG: 2 }],
          insumosExtra: STD_INS },
        { id: 'choco-almendras', nombre: 'Chocolate con almendras', emoji: '🥜', precioVenta: 4000, pesoG: 65, stockBolsas: 0,
          ingredientes: [{ materiaId: 'almendras', cantidadG: 30 }, { materiaId: 'chocolate', cantidadG: 33 }, { materiaId: 'azucar', cantidadG: 2 }],
          insumosExtra: STD_INS },
        { id: 'choco-girasol', nombre: 'Chocolate con girasol', emoji: '🌻', precioVenta: 4000, pesoG: 65, stockBolsas: 0,
          ingredientes: [{ materiaId: 'girasol', cantidadG: 30 }, { materiaId: 'chocolate', cantidadG: 33 }, { materiaId: 'azucar', cantidadG: 2 }],
          insumosExtra: STD_INS },
        { id: 'garrapinada', nombre: 'Garrapiñada de girasol', emoji: '🍬', precioVenta: 4000, pesoG: 70, stockBolsas: 0,
          ingredientes: [{ materiaId: 'girasol', cantidadG: 48 }, { materiaId: 'azucar', cantidadG: 24 }],
          insumosExtra: STD_INS },
        { id: 'girasol-salado', nombre: 'Girasol salado en salmuera', emoji: '🧂', precioVenta: 4000, pesoG: 70, stockBolsas: 0,
          ingredientes: [{ materiaId: 'girasol', cantidadG: 70 }, { materiaId: 'sal', cantidadG: 8 }],
          insumosExtra: STD_INS },
        { id: 'choco-300', nombre: 'Chocolate con semillas 300 g', emoji: '🎁', precioVenta: 20000, pesoG: 300, stockBolsas: 0,
          ingredientes: [{ materiaId: 'girasol', cantidadG: 69 }, { materiaId: 'zapallo', cantidadG: 69 }, { materiaId: 'chocolate', cantidadG: 152 }, { materiaId: 'azucar', cantidadG: 9 }],
          insumosExtra: [{ insumoId: 'bolsa300', cantidad: 1 }, { insumoId: 'etiquetas', cantidad: 1 }] },
        { id: 'rocas-ramo', nombre: 'Rocas de choco + semillas (ramo)', emoji: '🪨', precioVenta: 4667, pesoG: 50, stockBolsas: 0,
          ingredientes: [{ materiaId: 'girasol', cantidadG: 12 }, { materiaId: 'zapallo', cantidadG: 12 }, { materiaId: 'chocolate', cantidadG: 25 }, { materiaId: 'azucar', cantidadG: 1 }],
          insumosExtra: [{ insumoId: 'celofan', cantidad: 1 }] },
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
    let initialLoadComplete = false;

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
        // Solo normaliza la forma del estado. Nada de migraciones de datos:
        // los precios, productos y ventas se cargan desde la app o por importación.
        if (!data) return;
        if (!data.materias) data.materias = JSON.parse(JSON.stringify(DEFAULT_MATERIAS));
        if (!data.insumos) data.insumos = JSON.parse(JSON.stringify(DEFAULT_INSUMOS));
        if (!data.productos) data.productos = JSON.parse(JSON.stringify(DEFAULT_PRODUCTOS));
        if (!data.ventas) data.ventas = [];
        if (!data.gastos) data.gastos = [];
        if (!data.produccion) data.produccion = [];
        data.productos.forEach(p => {
            if (p.stockBolsas === undefined) p.stockBolsas = 0;
            if (!p.ingredientes) p.ingredientes = [];
            if (!p.insumosExtra) p.insumosExtra = [];
        });
    }

    // Show/hide loading overlay
    function showLoading(show) {
        // First try the native loader from index.html
        const nativeLoader = document.getElementById('initial-loader');
        if (nativeLoader) {
            if (!show) {
                nativeLoader.style.opacity = '0';
                nativeLoader.style.pointerEvents = 'none';
                setTimeout(() => nativeLoader.style.visibility = 'hidden', 400);
            }
            return;
        }

        // Fallback to dynamic loader if native isn't there
        let overlay = document.getElementById('loading-overlay');
        if (!overlay && show) {
            overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:1rem;">
                    <div style="font-size:3rem;animation:spin 1s linear infinite">🥜</div>
                    <div style="font-size:1.1rem;font-weight:600;color:var(--text-primary)">Cargando datos...</div>
                    <div style="font-size:0.85rem;color:var(--text-secondary)">Conectando con la nube</div>
                </div>
            `;
            overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:var(--bg-primary,#141210);';
            document.body.appendChild(overlay);
        }
        if (overlay && !show) {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s';
            setTimeout(() => overlay.remove(), 300);
        }
    }

    function loadState() {
        // Show loading overlay while we fetch from Firebase
        showLoading(true);

        // 1) Load from localStorage for instant preview (but don't navigate yet)
        const raw = localStorage.getItem(STORAGE_KEY);
        let hasLocalData = false;
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                state = {
                    materias: parsed.materias || JSON.parse(JSON.stringify(DEFAULT_MATERIAS)),
                    insumos: parsed.insumos || JSON.parse(JSON.stringify(DEFAULT_INSUMOS)),
                    productos: parsed.productos || JSON.parse(JSON.stringify(DEFAULT_PRODUCTOS)),
                    ventas: parsed.ventas || [],
                    gastos: parsed.gastos || [],
                    produccion: parsed.produccion || [],
                };
                // Copy over migration flags
                Object.keys(parsed).forEach(k => { if (k.startsWith('_')) state[k] = parsed[k]; });
                migrateState(state);
                hasLocalData = true;
            } catch (err) {
                console.error("Error loading local state", err);
            }
        }

        if (!hasLocalData) {
            // Set defaults in memory only — DO NOT save to Firebase/localStorage yet
            initDefaults();
        }

        // 2) Try to get Firebase data FIRST (one-time fetch, then setup listener)
        const FIREBASE_TIMEOUT = 5000; // 5 second timeout
        let firebaseResolved = false;

        const timeoutId = setTimeout(() => {
            if (firebaseResolved) return;
            firebaseResolved = true;
            console.warn("Firebase timeout — using local data");
            showLoading(false);
            initialLoadComplete = true;
            // If we have local data, save it to localStorage
            if (hasLocalData) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            }
            if (currentSection) navigateTo(currentSection);
            setupFirebaseListener();
        }, FIREBASE_TIMEOUT);

        dataRef.once('value').then((snapshot) => {
            if (firebaseResolved) return;
            firebaseResolved = true;
            clearTimeout(timeoutId);

            const data = snapshot.val();
            firebaseConnected = true;
            updateStorageUI();

            if (data && data.productos) {
                // Firebase has real data → USE IT (cloud is king)
                state = data;
                migrateState(state);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
                console.log("✅ Datos cargados desde Firebase:", state.ventas.length, "ventas");
            } else if (hasLocalData) {
                // Firebase is empty but we have local data → push local data up
                console.log("☁️ Firebase vacío, subiendo datos locales");
                saveState();
            } else {
                // Both empty → first-time user, save defaults
                console.log("🆕 Primera vez, guardando defaults");
                saveState();
            }

            initialLoadComplete = true;
            showLoading(false);
            if (currentSection) navigateTo(currentSection);
            setupFirebaseListener();
        }).catch((err) => {
            if (firebaseResolved) return;
            firebaseResolved = true;
            clearTimeout(timeoutId);
            console.error("Firebase fetch error:", err);
            firebaseConnected = false;
            updateStorageUI();
            showLoading(false);
            initialLoadComplete = true;
            if (currentSection) navigateTo(currentSection);
            setupFirebaseListener();
        });
    }

    function setupFirebaseListener() {
        // Real-time listener for changes from other devices
        dataRef.on('value', (snapshot) => {
            const data = snapshot.val();
            firebaseConnected = true;
            updateStorageUI();

            if (!data) {
                // Firebase was emptied somehow → push our state back up
                if (state.ventas && state.ventas.length > 0) {
                    console.warn("⚠️ Firebase vacío pero tenemos datos locales, restaurando...");
                    dataRef.set(state);
                }
                return;
            }
            if (!data.productos) return;

            // Only ignore if we JUST saved and the cloud data is our own echo
            if (data._ts && data._ts <= lastSaveTs) return;

            // Remote change from another device → apply it
            state = data;
            migrateState(state);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            
            // Refresh the current view
            if (currentSection) navigateTo(currentSection);
            showToast('🔄 Datos actualizados desde otro dispositivo');
        }, (error) => {
            console.error("Firebase listener error:", error);
            firebaseConnected = false;
            updateStorageUI();
        });

        // Monitor connection status
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
        // DO NOT call saveState() here — wait for Firebase to respond first
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

        const period = $('dashboard-period') ? $('dashboard-period').value : 'month';
        
        let ventasPeriodo = [];
        let gastosPeriodo = [];

        const todayStr = today();
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekStr = weekAgo.getFullYear() + '-' + String(weekAgo.getMonth() + 1).padStart(2, '0') + '-' + String(weekAgo.getDate()).padStart(2, '0');
        const monthStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');

        switch (period) {
            case 'today':
                ventasPeriodo = state.ventas.filter(v => v.fecha === todayStr);
                gastosPeriodo = state.gastos.filter(g => g.fecha === todayStr);
                break;
            case 'week':
                ventasPeriodo = state.ventas.filter(v => v.fecha >= weekStr);
                gastosPeriodo = state.gastos.filter(g => g.fecha >= weekStr);
                break;
            case 'month':
                ventasPeriodo = state.ventas.filter(v => v.fecha.startsWith(monthStr));
                gastosPeriodo = state.gastos.filter(g => g.fecha.startsWith(monthStr));
                break;
            case 'all':
                ventasPeriodo = [...state.ventas];
                gastosPeriodo = [...state.gastos];
                break;
        }

        const ingresos = ventasPeriodo.reduce((s, v) => s + (v.precioVenta * v.cantidad), 0);
        const unidades = ventasPeriodo.reduce((s, v) => s + v.cantidad, 0);
        
        const costoProd = ventasPeriodo.reduce((s, v) => {
            if (v.costoUnitario !== undefined) return s + (v.costoUnitario * v.cantidad);
            const prod = getProducto(v.productoId);
            return s + (prod ? calcCostoProducto(prod) * v.cantidad : 0);
        }, 0);
        
        const totalGastos = gastosPeriodo.reduce((s, g) => s + g.monto, 0);
        const profitPeriodo = ingresos - costoProd - totalGastos;

        $('kpi-ventas-hoy').textContent = formatMoney(ingresos);
        $('kpi-ventas-semana').textContent = unidades.toString() + ' unid.';
        $('kpi-ventas-mes').textContent = formatMoney(costoProd + totalGastos);
        $('kpi-profit-mes').textContent = formatMoney(profitPeriodo);
        $('kpi-profit-mes').style.color = profitPeriodo >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';

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

        const colors = ['#e8a838', '#e07830', '#4caf7d', '#5b9bd5', '#e05680', '#9b59b6'];
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
        renderBulkSale();
        renderQuickSale();
        renderVentasHistorial();
    }

    function renderBulkSale() {
        const grid = $('bulk-sale-grid');
        if (!grid) return;
        $('bulk-sale-date').value = today();
        grid.innerHTML = state.productos.map(p => {
            return `<div class="bulk-sale-item">
                <span class="bulk-sale-emoji">${p.emoji}</span>
                <span class="bulk-sale-label">${p.nombre}</span>
                <span class="bulk-sale-price">${formatMoney(p.precioVenta)}</span>
                <div class="bulk-sale-qty">
                    <button type="button" class="qty-btn qty-minus" data-id="${p.id}">\u2212</button>
                    <input type="number" class="qty-input" id="bulk-qty-${p.id}" value="0" min="0" data-id="${p.id}">
                    <button type="button" class="qty-btn qty-plus" data-id="${p.id}">+</button>
                </div>
            </div>`;
        }).join('');

        grid.querySelectorAll('.qty-minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const input = $('bulk-qty-' + btn.dataset.id);
                input.value = Math.max(0, (parseInt(input.value) || 0) - 1);
            });
        });
        grid.querySelectorAll('.qty-plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const input = $('bulk-qty-' + btn.dataset.id);
                input.value = (parseInt(input.value) || 0) + 1;
            });
        });
    }

    function renderQuickSale() {
        const grid = $('quick-sale-grid');
        grid.innerHTML = state.productos.map(p => {
            const costo = calcCostoProducto(p);
            const profit = p.precioVenta - costo;
            const margin = ((profit / p.precioVenta) * 100).toFixed(0);
            const stock = p.stockBolsas || 0;
            const stockCls = stock > 0 ? 'in-stock' : (stock === 0 ? 'no-stock' : 'negative-stock');

            return `<div class="quick-sale-card" data-product-id="${p.id}">
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

        grid.querySelectorAll('.quick-sale-card').forEach(card => {
            card.addEventListener('click', () => {
                const prodId = card.dataset.productId;
                const prod = getProducto(prodId);
                if (!prod) return;
                $('venta-producto-id').value = prodId;
                $('venta-producto-nombre').value = prod.emoji + ' ' + prod.nombre;
                $('venta-fecha').value = today();
                $('venta-cantidad').value = 1;
                $('venta-cantidad').removeAttribute('max');
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

        prod.ingredientes.forEach(ing => {
            const mat = getMateria(ing.materiaId);
            const needed = ing.cantidadG * qty;
            html += `<div class="prod-consumo-item">
                <span>${mat ? mat.nombre : ing.materiaId}:</span>
                <span>${needed}g</span>
            </div>`;
        });

        (prod.insumosExtra || []).forEach(ins => {
            const insumo = getInsumo(ins.insumoId);
            const needed = ins.cantidad * qty;
            html += `<div class="prod-consumo-item">
                <span>${insumo ? insumo.nombre : ins.insumoId}:</span>
                <span>${needed} unid.</span>
            </div>`;
        });

        container.innerHTML = html;
        $('form-produccion').querySelector('button[type="submit"]').disabled = false;
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
            const unitCost = v.costoUnitario !== undefined ? v.costoUnitario : (prod ? calcCostoProducto(prod) : 0);
            const costo = unitCost * v.cantidad;
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
                    <div style="flex:1">
                        <div class="product-card-title">${p.nombre}</div>
                        <div class="product-card-weight">${p.pesoG}g por bolsita</div>
                    </div>
                    <button class="btn-icon edit-producto" data-id="${p.id}" title="Editar Producto">✏️</button>
                    <button class="btn-icon delete-producto" data-id="${p.id}" title="Eliminar" style="color:var(--accent-red)">🗑️</button>
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

        grid.querySelectorAll('.edit-producto').forEach(btn => {
            btn.addEventListener('click', () => editProducto(btn.dataset.id));
        });
        grid.querySelectorAll('.delete-producto').forEach(btn => {
            btn.addEventListener('click', () => {
                if(confirm('¿Eliminar producto?')) {
                    state.productos = state.productos.filter(p => p.id !== btn.dataset.id);
                    saveState();
                    renderProductos();
                    showToast('Producto eliminado');
                }
            });
        });
    }

    function editProducto(id) {
        const p = id ? getProducto(id) : null;
        $('modal-producto-title').textContent = p ? 'Editar Producto' : 'Crear Producto';
        $('producto-id').value = p ? p.id : '';
        $('producto-nombre').value = p ? p.nombre : '';
        $('producto-emoji').value = p ? p.emoji : '🥜';
        $('producto-precio').value = p ? p.precioVenta : '';
        $('producto-peso').value = p ? p.pesoG : '';

        // Generate Ingredients HTML
        const ingContainer = $('producto-ingredientes-list');
        ingContainer.innerHTML = state.materias.map(m => {
            const currentIng = p ? p.ingredientes.find(i => i.materiaId === m.id) : null;
            const checked = currentIng ? 'checked' : '';
            const qty = currentIng ? currentIng.cantidadG : '';
            return `<div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.4rem">
                <input type="checkbox" id="mat-${m.id}" data-id="${m.id}" class="ing-checkbox" ${checked}>
                <label for="mat-${m.id}" style="flex:1; font-weight:500; font-size:0.9rem">${m.nombre}</label>
                <input type="number" id="qty-mat-${m.id}" class="input-field input-sm ing-qty" placeholder="g" 
                       style="width: 70px;" min="1" step="1" value="${qty}" ${checked ? '' : 'disabled'}>
            </div>`;
        }).join('');

        // Toggles for ingreds
        ingContainer.querySelectorAll('.ing-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const input = $('qty-mat-' + e.target.dataset.id);
                input.disabled = !e.target.checked;
                if (!e.target.checked) input.value = '';
                else input.focus();
            });
        });

        // Generate Insumos HTML
        const insContainer = $('producto-insumos-list');
        insContainer.innerHTML = state.insumos.map(i => {
            const currentIns = p && p.insumosExtra ? p.insumosExtra.find(x => x.insumoId === i.id) : null;
            const checked = currentIns ? 'checked' : '';
            const qty = currentIns ? currentIns.cantidad : '';
            return `<div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.4rem">
                <input type="checkbox" id="ins-${i.id}" data-id="${i.id}" class="ins-checkbox" ${checked}>
                <label for="ins-${i.id}" style="flex:1; font-weight:500; font-size:0.9rem">${i.nombre}</label>
                <input type="number" id="qty-ins-${i.id}" class="input-field input-sm ins-qty" placeholder="Cant." 
                       style="width: 70px;" min="1" step="1" value="${qty}" ${checked ? '' : 'disabled'}>
            </div>`;
        }).join('');

        insContainer.querySelectorAll('.ins-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const input = $('qty-ins-' + e.target.dataset.id);
                input.disabled = !e.target.checked;
                if (!e.target.checked) input.value = '';
                else if(!input.value) input.value = '1';
            });
        });

        openModal('modal-producto');
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
            if (v.costoUnitario !== undefined) return s + (v.costoUnitario * v.cantidad);
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
            const costoTotal = pVentas.reduce((s, v) => s + ((v.costoUnitario !== undefined ? v.costoUnitario : calcCostoProducto(p)) * v.cantidad), 0);
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

        // Dashboard period listener
        if ($('dashboard-period')) {
            $('dashboard-period').addEventListener('change', renderDashboard);
        }

        // Venta form
        $('form-venta').addEventListener('submit', (e) => {
            e.preventDefault();
            const prodId = $('venta-producto-id').value;
            const prod = getProducto(prodId);
            if (!prod) return;
            const qty = parseInt($('venta-cantidad').value);

            // Stock warning (no longer blocks sales)
            if ((prod.stockBolsas || 0) < qty) {
                // Allow sale even without stock — just warn
            }

            const venta = {
                id: uid(),
                productoId: prodId,
                fecha: $('venta-fecha').value,
                cantidad: qty,
                precioVenta: prod.precioVenta,
                costoUnitario: calcCostoProducto(prod)
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

        // Product form
        if ($('form-producto')) {
            $('form-producto').addEventListener('submit', (e) => {
                e.preventDefault();
                const id = $('producto-id').value;
                const data = {
                    nombre: $('producto-nombre').value.trim(),
                    emoji: $('producto-emoji').value.trim(),
                    precioVenta: parseFloat($('producto-precio').value),
                    pesoG: parseFloat($('producto-peso').value),
                    ingredientes: [],
                    insumosExtra: []
                };

                // Recolectar ingredientes seleccionados
                $('producto-ingredientes-list').querySelectorAll('.ing-checkbox:checked').forEach(cb => {
                    const matId = cb.dataset.id;
                    const qty = parseFloat($('qty-mat-' + matId).value);
                    if(qty > 0) data.ingredientes.push({ materiaId: matId, cantidadG: qty });
                });

                // Recolectar insumos seleccionados
                $('producto-insumos-list').querySelectorAll('.ins-checkbox:checked').forEach(cb => {
                    const insId = cb.dataset.id;
                    const qty = parseFloat($('qty-ins-' + insId).value);
                    if(qty > 0) data.insumosExtra.push({ insumoId: insId, cantidad: qty });
                });

                if (data.ingredientes.length === 0) {
                    showToast('Debes agregar al menos 1 ingrediente', true);
                    return;
                }

                if (id) {
                    const p = getProducto(id);
                    if (p) Object.assign(p, data);
                } else {
                    data.id = uid();
                    data.stockBolsas = 0;
                    state.productos.push(data);
                }

                saveState();
                closeModal('modal-producto');
                renderProductos();
                showToast('Producto guardado correctamente');
            });
        }

        // Add buttons
        if ($('btn-add-producto')) $('btn-add-producto').addEventListener('click', () => editProducto(null));
        
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

        // Copy URL
        if ($('btn-copy-url')) {
            $('btn-copy-url').addEventListener('click', () => {
                const url = 'https://facupd96-lab.github.io/nutcontrol/';
                navigator.clipboard.writeText(url).then(() => {
                    showToast('🔗 Link copiado al portapapeles');
                }).catch(err => {
                    console.error('Copy failed', err);
                    showToast('Error al copiar link', true);
                });
            });
        }

        // Bulk Sale
        if ($('btn-bulk-sale')) {
            $('btn-bulk-sale').addEventListener('click', () => {
                const fecha = $('bulk-sale-date').value;
                if (!fecha) { showToast('Seleccioná una fecha', true); return; }
                let totalUnits = 0;
                state.productos.forEach(p => {
                    const input = $('bulk-qty-' + p.id);
                    const qty = parseInt(input.value) || 0;
                    if (qty > 0) {
                        state.ventas.push({
                            id: uid(),
                            productoId: p.id,
                            fecha: fecha,
                            cantidad: qty,
                            precioVenta: p.precioVenta,
                            costoUnitario: calcCostoProducto(p)
                        });
                        p.stockBolsas = (p.stockBolsas || 0) - qty;
                        totalUnits += qty;
                    }
                });
                if (totalUnits === 0) { showToast('No hay cantidades para registrar', true); return; }
                saveState();
                renderVentas();
                showToast(`✅ ${totalUnits} ventas registradas para ${formatDate(fecha)}`);
            });
        }
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

    // =========== PANTALLA "HOY" — carga rápida de ventas ===========
    // Se abre al iniciar. Un toque = una venta. Sin stock, sin producción.
    var HOY = (function () {
        var comboBuf = [];
        var PRECIO_COMBO = Math.round(10000 / 3);
        var root = null;

        function activos() {
            return state.productos.filter(function (p) {
                return p.nombre.indexOf('(discontinuado)') === -1 && p.id !== 'rocas-ramo';
            });
        }
        function ventasDeHoy() {
            var h = today();
            return state.ventas.filter(function (v) { return v.fecha === h; });
        }
        function estilos() {
            if (document.getElementById('hoy-css')) return;
            var s = document.createElement('style');
            s.id = 'hoy-css';
            s.textContent = [
                '#hoy-overlay{position:fixed;inset:0;z-index:9000;background:#141210;color:#f5f0e8;',
                'display:flex;flex-direction:column;font-family:Inter,system-ui,sans-serif;overflow:hidden}',
                '#hoy-top{padding:18px 18px 12px;border-bottom:1px solid #2a2621;flex:0 0 auto}',
                '#hoy-top h2{margin:0;font-size:1.35rem;font-weight:700;letter-spacing:-.02em}',
                '#hoy-fecha{color:#7a6e62;font-size:.82rem;margin-top:2px}',
                '#hoy-combo{margin:14px 0 0;width:100%;padding:16px;border-radius:14px;border:2px solid #3d3630;',
                'background:#1e1b18;color:#f5f0e8;font-size:1rem;font-weight:600;cursor:pointer;transition:.15s}',
                '#hoy-combo.on{background:#c8963e;border-color:#c8963e;color:#1a1512}',
                '#hoy-combo small{display:block;font-weight:400;font-size:.78rem;opacity:.75;margin-top:3px}',
                '#hoy-grid{flex:1 1 auto;overflow-y:auto;padding:14px 18px 18px;display:grid;gap:10px;',
                '-webkit-overflow-scrolling:touch}',
                '.hoy-btn{display:flex;align-items:center;gap:12px;width:100%;padding:16px 14px;border-radius:14px;',
                'border:1px solid #2a2621;background:#1e1b18;color:#f5f0e8;font-size:1rem;text-align:left;cursor:pointer;',
                'font-family:inherit;transition:.12s;min-height:64px}',
                '.hoy-btn:active{transform:scale(.975);background:#272320}',
                '.hoy-btn .em{font-size:1.5rem;flex:0 0 auto}',
                '.hoy-btn .nm{flex:1 1 auto;font-weight:600;line-height:1.25}',
                '.hoy-btn .nm b{display:block;font-weight:400;font-size:.78rem;color:#7a6e62;margin-top:2px}',
                '.hoy-btn .ct{flex:0 0 auto;min-width:34px;height:34px;border-radius:17px;background:#2f2a25;',
                'display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.92rem;padding:0 9px}',
                '.hoy-btn .ct.z{opacity:.28}',
                '#hoy-bot{flex:0 0 auto;border-top:1px solid #2a2621;padding:14px 18px;',
                'padding-bottom:calc(14px + env(safe-area-inset-bottom,0px));background:#1a1714}',
                '#hoy-tot{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px}',
                '#hoy-tot span{color:#7a6e62;font-size:.85rem}',
                '#hoy-tot b{font-size:1.5rem;font-weight:700}',
                '#hoy-acc{display:flex;gap:9px}',
                '#hoy-acc button{flex:1;padding:13px;border-radius:12px;border:1px solid #2a2621;background:#1e1b18;',
                'color:#b3a99c;font-size:.88rem;font-family:inherit;cursor:pointer;font-weight:500}',
                '#hoy-acc button:active{background:#272320}',
                '@media(min-width:700px){#hoy-grid{grid-template-columns:1fr 1fr}#hoy-overlay{max-width:640px;margin:0 auto;',
                'border-left:1px solid #2a2621;border-right:1px solid #2a2621}}'
            ].join('');
            document.head.appendChild(s);
        }

        function registrar(pid, precio) {
            var prod = getProducto(pid);
            if (!prod) return;
            state.ventas.push({
                id: uid(), productoId: pid, fecha: today(), cantidad: 1,
                precioVenta: precio, costoUnitario: calcCostoProducto(prod)
            });
            prod.stockBolsas = (prod.stockBolsas || 0) - 1;
            saveState();
        }

        function tap(pid) {
            if (comboBuf.length || document.getElementById('hoy-combo').classList.contains('on')) {
                comboBuf.push(pid);
                if (comboBuf.length >= 3) {
                    // el tercero absorbe el redondeo para que el combo sume exacto $10.000
                    comboBuf.forEach(function (id, k) {
                        registrar(id, k === 2 ? 10000 - 2 * PRECIO_COMBO : PRECIO_COMBO);
                    });
                    comboBuf = [];
                    document.getElementById('hoy-combo').classList.remove('on');
                    showToast('Combo cargado · $10.000');
                }
            } else {
                registrar(pid, getProducto(pid).precioVenta);
            }
            pintar();
        }

        function deshacer() {
            if (comboBuf.length) { comboBuf = []; document.getElementById('hoy-combo').classList.remove('on'); pintar(); return; }
            var hs = ventasDeHoy();
            if (!hs.length) { showToast('No hay nada para deshacer hoy', true); return; }
            var ult = hs[hs.length - 1];
            var i = state.ventas.indexOf(ult);
            if (i > -1) {
                var pr = getProducto(ult.productoId);
                if (pr) pr.stockBolsas = (pr.stockBolsas || 0) + ult.cantidad;
                state.ventas.splice(i, 1);
                saveState(); pintar(); showToast('Última venta borrada');
            }
        }

        function pintar() {
            if (!root) return;
            var hs = ventasDeHoy();
            var uds = hs.reduce(function (s, v) { return s + v.cantidad; }, 0);
            var tot = hs.reduce(function (s, v) { return s + v.cantidad * v.precioVenta; }, 0);
            var porProd = {};
            hs.forEach(function (v) { porProd[v.productoId] = (porProd[v.productoId] || 0) + v.cantidad; });

            var cb = document.getElementById('hoy-combo');
            if (comboBuf.length) {
                cb.innerHTML = 'Combo: ' + comboBuf.length + ' de 3<small>Tocá ' + (3 - comboBuf.length) + ' bolsita' + (3 - comboBuf.length > 1 ? 's' : '') + ' más</small>';
                cb.classList.add('on');
            } else if (cb.classList.contains('on')) {
                cb.innerHTML = 'Combo activado<small>Tocá las 3 bolsitas que se lleva</small>';
            } else {
                cb.innerHTML = 'Cargar un combo 3 &times; $10.000<small>Después tocá las 3 bolsitas, aunque sean distintas</small>';
            }

            document.getElementById('hoy-grid').innerHTML = activos().map(function (p) {
                var c = porProd[p.id] || 0;
                return '<button class="hoy-btn" data-pid="' + p.id + '">' +
                    '<span class="em">' + (p.emoji || '') + '</span>' +
                    '<span class="nm">' + p.nombre + '<b>' + formatMoney(p.precioVenta) + ' suelta</b></span>' +
                    '<span class="ct' + (c ? '' : ' z') + '">' + c + '</span></button>';
            }).join('');

            document.getElementById('hoy-tot').innerHTML =
                '<span>' + uds + ' bolsita' + (uds === 1 ? '' : 's') + ' hoy</span><b>' + formatMoney(tot) + '</b>';
        }

        function abrir() {
            estilos();
            if (root) { root.style.display = 'flex'; pintar(); return; }
            root = document.createElement('div');
            root.id = 'hoy-overlay';
            var f = new Date();
            var dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
            var meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
            root.innerHTML =
                '<div id="hoy-top"><h2>¿Qué vendiste?</h2>' +
                '<div id="hoy-fecha">' + dias[f.getDay()].charAt(0).toUpperCase() + dias[f.getDay()].slice(1) +
                ' ' + f.getDate() + ' de ' + meses[f.getMonth()] + '</div>' +
                '<button id="hoy-combo"></button></div>' +
                '<div id="hoy-grid"></div>' +
                '<div id="hoy-bot"><div id="hoy-tot"></div>' +
                '<div id="hoy-acc"><button id="hoy-undo">Deshacer</button>' +
                '<button id="hoy-close">Ver los números</button></div></div>';
            document.body.appendChild(root);

            document.getElementById('hoy-grid').addEventListener('click', function (e) {
                var b = e.target.closest('.hoy-btn');
                if (b) tap(b.dataset.pid);
            });
            document.getElementById('hoy-combo').addEventListener('click', function () {
                this.classList.toggle('on'); comboBuf = []; pintar();
            });
            document.getElementById('hoy-undo').addEventListener('click', deshacer);
            document.getElementById('hoy-close').addEventListener('click', function () {
                root.style.display = 'none';
                navigateTo('dashboard');
            });
            pintar();
        }

        return { abrir: abrir, pintar: pintar };
    })();

    window.abrirHoy = HOY.abrir;

    // =========== INIT ===========
    function init() {
        setupEvents();
        navigateTo('dashboard');
        setTimeout(function () { try { HOY.abrir(); } catch (e) { console.warn(e); } }, 120);
        // loadState is async — it shows a loading overlay, fetches Firebase, then refreshes the view
        loadState();
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
