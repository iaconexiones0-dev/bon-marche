import { useState, useEffect } from "react";
import {
  BarChart2,
  Tablet,
  Search,
  RefreshCw,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Wifi,
  WifiOff,
  Layers,
  Database,
  Truck,
  ChevronRight,
  ArrowRight,
  Info,
  X,
} from "lucide-react";

// --- TIPOS ---
interface Notification {
  message: string;
  type: "success" | "error" | "warning";
}

interface ProductionBatch {
  lotePT: string;
  recetaId: string;
  recetaName: string;
  cantidad: number;
  operario: string;
  fecha: string;
  hora: string;
  lotesMP: Array<{
    mpId: string;
    name: string;
    lote: string;
    realUtilizado: number;
  }>;
  desperdicio: number;
  causaDesperdicio: string;
  despachos: Array<{
    tiendaId: string;
    cant: number;
  }>;
}

// --- CONFIGURACIÓN DE DATOS INICIALES SEMILLA ---
const RECIPES_PRESETS = [
  {
    id: "R1",
    name: "Croissant de Pollo (Congelado)",
    category: "Congelados",
    yieldUnit: "paquete x 6 und",
    ingredients: [
      {
        id: "MP1",
        name: "Harina de Trigo Haz de Oros",
        stdQty: 0.25,
        unit: "kg",
        tolerance: 5,
      }, // 5% por humedad
      {
        id: "MP2",
        name: "Pollo Desmechado Cocido",
        stdQty: 0.18,
        unit: "kg",
        tolerance: 8,
      }, // 8% por merma de hueso/desmechado
      {
        id: "MP3",
        name: "Mantequilla Industrial",
        stdQty: 0.08,
        unit: "kg",
        tolerance: 3,
      },
    ],
  },
  {
    id: "R2",
    name: "Pandebono Valluno (Congelado)",
    category: "Congelados",
    yieldUnit: "paquete x 10 und",
    ingredients: [
      {
        id: "MP4",
        name: "Almidón de Yuca",
        stdQty: 0.3,
        unit: "kg",
        tolerance: 4,
      },
      {
        id: "MP5",
        name: "Queso Costeño Molido",
        stdQty: 0.35,
        unit: "kg",
        tolerance: 6,
      },
      { id: "MP6", name: "Leche Entera", stdQty: 0.1, unit: "L", tolerance: 2 },
    ],
  },
  {
    id: "R3",
    name: "Pastel de Gloria (Horneado)",
    category: "Horneados",
    yieldUnit: "paquete x 6 und",
    ingredients: [
      {
        id: "MP1",
        name: "Harina de Trigo Haz de Oros",
        stdQty: 0.2,
        unit: "kg",
        tolerance: 5,
      },
      {
        id: "MP7",
        name: "Arequipe Repostería",
        stdQty: 0.15,
        unit: "kg",
        tolerance: 4,
      },
      {
        id: "MP3",
        name: "Mantequilla Industrial",
        stdQty: 0.06,
        unit: "kg",
        tolerance: 3,
      },
    ],
  },
];

const STORES_PRESETS = [
  { id: "T1", name: "Pereira - Centro Cra 7", color: "#0081c9", label: "Azul" },
  {
    id: "T2",
    name: "Pereira - Circunvalar",
    color: "#f07f07",
    label: "Zapote",
  },
  { id: "T3", name: "Manizales - Cable", color: "#10b981", label: "Verde" },
  { id: "T4", name: "Armenia - Fundadores", color: "#8b5cf6", label: "Morado" },
  {
    id: "T5",
    name: "Medellín - El Poblado",
    color: "#ec4899",
    label: "Rosado",
  },
  { id: "T6", name: "Calarcá - Plaza", color: "#eab308", label: "Amarillo" },
];

const INITIAL_INVENTORY = [
  {
    id: "MP1",
    name: "Harina de Trigo Haz de Oros",
    stockInicial: 450.0,
    entradas: 120.0,
    consumoReal: 142.5,
    consumoTeorico: 135.0,
    unit: "kg",
    tolerance: 5,
  },
  {
    id: "MP2",
    name: "Pollo Desmechado Cocido",
    stockInicial: 120.0,
    entradas: 50.0,
    consumoReal: 89.2,
    consumoTeorico: 81.0,
    unit: "kg",
    tolerance: 8,
  },
  {
    id: "MP3",
    name: "Mantequilla Industrial",
    stockInicial: 180.0,
    entradas: 0.0,
    consumoReal: 44.1,
    consumoTeorico: 43.2,
    unit: "kg",
    tolerance: 3,
  },
  {
    id: "MP4",
    name: "Almidón de Yuca",
    stockInicial: 300.0,
    entradas: 100.0,
    consumoReal: 92.0,
    consumoTeorico: 90.0,
    unit: "kg",
    tolerance: 4,
  },
  {
    id: "MP5",
    name: "Queso Costeño Molido",
    stockInicial: 150.0,
    entradas: 80.0,
    consumoReal: 112.4,
    consumoTeorico: 105.0,
    unit: "kg",
    tolerance: 6,
  },
  {
    id: "MP6",
    name: "Leche Entera",
    stockInicial: 90.0,
    entradas: 30.0,
    consumoReal: 30.2,
    consumoTeorico: 30.0,
    unit: "L",
    tolerance: 2,
  },
  {
    id: "MP7",
    name: "Arequipe Repostería",
    stockInicial: 80.0,
    entradas: 0.0,
    consumoReal: 22.5,
    consumoTeorico: 22.5,
    unit: "kg",
    tolerance: 4,
  },
];

const INITIAL_PRODUCTION_HISTORY = [
  {
    lotePT: "LPT-20260522-01",
    recetaId: "R1",
    recetaName: "Croissant de Pollo (Congelado)",
    cantidad: 450, // Paquetes
    operario: "Carlos Mendoza",
    fecha: "2026-05-22",
    hora: "07:15 AM",
    lotesMP: [
      {
        mpId: "MP1",
        name: "Harina Haz de Oros",
        lote: "LMP-HAR-982",
        realUtilizado: 112.5,
      },
      {
        mpId: "MP2",
        name: "Pollo Cocido",
        lote: "LMP-POL-441",
        realUtilizado: 81.0,
      },
      {
        mpId: "MP3",
        name: "Mantequilla Ind.",
        lote: "LMP-MAN-102",
        realUtilizado: 36.0,
      },
    ],
    desperdicio: 1.2, // kg
    causaDesperdicio: "Masa de borde sobreada",
    despachos: [
      { tiendaId: "T1", cant: 150 },
      { tiendaId: "T2", cant: 150 },
      { tiendaId: "T5", cant: 150 },
    ],
  },
  {
    lotePT: "LPT-20260522-02",
    recetaId: "R2",
    recetaName: "Pandebono Valluno (Congelado)",
    cantidad: 300,
    operario: "Yolanda Ruiz",
    fecha: "2026-05-22",
    hora: "09:30 AM",
    lotesMP: [
      {
        mpId: "MP4",
        name: "Almidón de Yuca",
        lote: "LMP-ALM-221",
        realUtilizado: 92.0,
      },
      {
        mpId: "MP5",
        name: "Queso Costeño",
        lote: "LMP-QUE-809",
        realUtilizado: 112.4,
      },
      {
        mpId: "MP6",
        name: "Leche Entera",
        lote: "LMP-LEC-091",
        realUtilizado: 30.2,
      },
    ],
    desperdicio: 0.5,
    causaDesperdicio: "Queso residual en tolva",
    despachos: [
      { tiendaId: "T3", cant: 100 },
      { tiendaId: "T4", cant: 100 },
      { tiendaId: "T6", cant: 100 },
    ],
  },
];

export default function App() {
  // --- ESTADOS DE LA APLICACIÓN ---
  const [activeTab, setActiveTab] = useState("dashboard");
  const [offlineMode, setOfflineMode] = useState(false);
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [productionHistory, setProductionHistory] = useState<ProductionBatch[]>(
    INITIAL_PRODUCTION_HISTORY,
  );
  const [localSyncQueue, setLocalSyncQueue] = useState<ProductionBatch[]>([]);
  const [notification, setNotification] = useState<Notification | null>(null);

  // Estado para buscador de trazabilidad
  const [traceSearchQuery, setTraceSearchQuery] = useState("LPT-20260522-01");
  const [searchResult, setSearchResult] = useState<ProductionBatch | null>(
    null,
  );

  // Estados del terminal de planta (Operario)
  const [opStep, setOpStep] = useState(1); // 1: Receta, 2: Cantidad, 3: Pesajes, 4: Desperdicios/Lotes MP, 5: Éxito
  const [selectedRecipe, setSelectedRecipe] = useState(RECIPES_PRESETS[0]);
  const [opQuantity, setOpQuantity] = useState("");
  const [opMpaLots, setOpMpaLots] = useState<Record<string, string>>({}); // { MP1: 'LOTE-X', MP2: 'LOTE-Y' }
  const [opRealWeights, setOpRealWeights] = useState<
    Record<string, string | number>
  >({}); // { MP1: 110.5, MP2: 82.1 }
  const [opWaste, setOpWaste] = useState("0");
  const [opWasteCause, setOpWasteCause] = useState("");
  const [opActiveField, setOpActiveField] = useState("qty"); // Campo activo para el numpad digital
  const [opOperario] = useState("Juan Gómez");

  // Estado de sincronización Avanx
  const [avanxSyncStatus, setAvanxSyncStatus] = useState("CONECTADO");
  const [lastSyncDate, setLastSyncDate] = useState(
    "Hoy, hace 2 horas (01:30 PM)",
  );

  // Efecto de inicialización de búsqueda de trazabilidad
  useEffect(() => {
    handleTraceSearch(traceSearchQuery);
  }, [productionHistory]);

  // Mostrar notificaciones personalizadas tipo Toast
  const showNotification = (
    message: string,
    type: "success" | "error" | "warning" = "success",
  ) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Manejador del teclado numérico virtual del operario
  const handleNumpadPress = (val: string) => {
    if (opActiveField === "qty") {
      if (val === "C") {
        setOpQuantity("");
      } else if (val === "back") {
        setOpQuantity((prev) => prev.slice(0, -1));
      } else {
        setOpQuantity((prev) => prev + val);
      }
    } else if (opActiveField.startsWith("weight_")) {
      const mpId = opActiveField.split("_")[1];
      const currentVal = opRealWeights[mpId] || 0;
      if (val === "C") {
        setOpRealWeights((prev) => ({ ...prev, [mpId]: 0 }));
      } else if (val === "back") {
        setOpRealWeights((prev) => ({
          ...prev,
          [mpId]: currentVal.toString().slice(0, -1),
        }));
      } else {
        // Evitar múltiples puntos decimales
        if (val === "." && currentVal.toString().includes(".")) return;
        setOpRealWeights((prev) => ({ ...prev, [mpId]: currentVal + val }));
      }
    } else if (opActiveField === "waste") {
      const currentVal = opWaste || "";
      if (val === "C") {
        setOpWaste("");
      } else if (val === "back") {
        setOpWaste((prev) => prev.slice(0, -1));
      } else {
        if (val === "." && currentVal.includes(".")) return;
        setOpWaste((prev) => prev + val);
      }
    }
  };

  // Buscar un lote en el sistema de trazabilidad
  const handleTraceSearch = (query: string) => {
    const cleanQuery = query.trim().toUpperCase();
    const batch = productionHistory.find(
      (p) =>
        p.lotePT.toUpperCase() === cleanQuery ||
        p.lotesMP.some((l) => l.lote.toUpperCase() === cleanQuery),
    );
    if (batch) {
      setSearchResult(batch);
    } else {
      setSearchResult(null);
    }
  };

  // Guardar la producción desde la tablet del operario
  const submitTabletProduction = () => {
    // Generar ID de lote secuencial
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const seq = String(productionHistory.length + 1).padStart(2, "0");
    const newLotePT = `LPT-${dateStr}-${seq}`;

    const newBatch = {
      lotePT: newLotePT,
      recetaId: selectedRecipe.id,
      recetaName: selectedRecipe.name,
      cantidad: parseInt(opQuantity) || 100,
      operario: opOperario,
      fecha: now.toISOString().slice(0, 10),
      hora: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      lotesMP: selectedRecipe.ingredients.map((ing) => ({
        mpId: ing.id,
        name: ing.name,
        lote: opMpaLots[ing.id] || `LMP-${ing.id}-${dateStr}`,
        realUtilizado:
          parseFloat(String(opRealWeights[ing.id])) ||
          ing.stdQty * (parseInt(opQuantity) || 100),
      })),
      desperdicio: parseFloat(opWaste) || 0,
      causaDesperdicio: opWasteCause || "Proceso estándar",
      // Repartir despachos aleatorios de simulación a tiendas de la red
      despachos: [
        {
          tiendaId: "T1",
          cant: Math.round((parseInt(opQuantity) || 100) * 0.4),
        },
        {
          tiendaId: "T2",
          cant: Math.round((parseInt(opQuantity) || 100) * 0.3),
        },
        {
          tiendaId: "T4",
          cant: Math.round((parseInt(opQuantity) || 100) * 0.3),
        },
      ],
    };

    if (offlineMode) {
      // Almacenamiento local temporal (Modo Offline)
      setLocalSyncQueue((prev) => [...prev, newBatch]);
      // Igualmente actualizamos para simular, pero informando de cola local
      setProductionHistory((prev) => [newBatch, ...prev]);
      updateDashboardInventory(newBatch);
      showNotification("Bache guardado localmente (Offline)", "warning");
    } else {
      // Sincronización inmediata online
      setProductionHistory((prev) => [newBatch, ...prev]);
      updateDashboardInventory(newBatch);
      showNotification("Bache enviado e integrado en tiempo real", "success");
    }

    setOpStep(5); // Ir a pantalla de éxito
  };

  // Actualizar el inventario consolidado cuando hay producción
  const updateDashboardInventory = (newBatch: ProductionBatch) => {
    setInventory((prevInv) => {
      return prevInv.map((invItem) => {
        const mpUsage = newBatch.lotesMP.find((l) => l.mpId === invItem.id);
        if (mpUsage) {
          // Teórico = cantidad de baches producidos * receta estándar
          const recipeInfo = selectedRecipe.ingredients.find(
            (i) => i.id === invItem.id,
          );
          const theoreticalUsage = recipeInfo
            ? recipeInfo.stdQty * newBatch.cantidad
            : 0;

          return {
            ...invItem,
            consumoReal: parseFloat(
              (invItem.consumoReal + mpUsage.realUtilizado).toFixed(2),
            ),
            consumoTeorico: parseFloat(
              (invItem.consumoTeorico + theoreticalUsage).toFixed(2),
            ),
          };
        }
        return invItem;
      });
    });
  };

  // Forzar sincronización manual de la cola offline
  const triggerSyncQueue = () => {
    if (localSyncQueue.length > 0) {
      // Simular latencia de red
      setTimeout(() => {
        const count = localSyncQueue.length;
        setLocalSyncQueue([]);
        showNotification(
          `¡Éxito! Se han sincronizado ${count} lotes pendientes con el servidor central de Bon Marché.`,
          "success",
        );
      }, 800);
    }
  };

  // Resetear el flujo de la tablet operario
  const resetTabletFlow = () => {
    setOpStep(1);
    setOpQuantity("");
    setOpWaste("0");
    setOpWasteCause("");
    setOpRealWeights({});
    setOpMpaLots({});
    setOpActiveField("qty");
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800 selection:bg-[#f07f07]/30">
        {/* --- NOTIFICACIONES EN PANTALLA (TOASTS) --- */}
        {notification && (
          <div
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl border transition-all duration-300 flex items-center space-x-3 max-w-sm animate-bounce ${
              notification.type === "error"
                ? "bg-red-50 text-red-800 border-red-200"
                : notification.type === "warning"
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
            }`}
          >
            <div
              className={`p-2 rounded-lg ${
                notification.type === "error"
                  ? "bg-red-100 text-red-600"
                  : notification.type === "warning"
                    ? "bg-amber-100 text-amber-600"
                    : "bg-emerald-100 text-emerald-600"
              }`}
            >
              <CheckCircle2 size={18} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-wider">
                Notificación de Sistema
              </p>
              <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* --- HEADER PRINCIPAL DE BON MARCHÉ --- */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
            {/* Logo Brand Area */}
            <div className="flex items-center space-x-4">
              <div className="relative h-14 w-52 flex items-center justify-center rounded-lg overflow-hidden bg-slate-50 p-1 border border-slate-100">
                {/* Fallback inteligente si no carga la imagen de la URL local */}
                <img
                  src="684da358fc74bde7ccd2f776.jpeg"
                  alt="Bon Marché Logo"
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const fb = document.getElementById("logo-fallback");
                    if (fb) fb.style.display = "flex";
                  }}
                />
                <div
                  id="logo-fallback"
                  className="hidden flex-col items-center justify-center font-black leading-none select-none"
                >
                  <span className="text-[#0081c9] text-xl tracking-tight">
                    bon <span className="text-[#f07f07]">marché</span>
                  </span>
                  <span className="text-[8px] text-slate-400 font-semibold tracking-widest mt-1">
                    SISTEMA INTEGRAL DE CONTROL
                  </span>
                </div>
              </div>

              <div className="hidden md:block h-8 w-px bg-slate-200"></div>

              <div className="hidden md:block text-xs text-slate-500">
                <span className="font-bold text-[#0081c9]">
                  Planta de Producción
                </span>{" "}
                • Pereira, Risaralda
              </div>
            </div>

            {/* Estado de Conexión de la Planta */}
            <div className="flex items-center space-x-3">
              {/* Toggle de Simulación Offline */}
              <button
                onClick={() => {
                  setOfflineMode(!offlineMode);
                  showNotification(
                    !offlineMode
                      ? "El terminal de planta ha entrado en modo simulación de desconexión."
                      : "La conectividad con el servidor central ha sido restaurada.",
                    !offlineMode ? "warning" : "success",
                  );
                }}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm ${
                  offlineMode
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                }`}
              >
                {offlineMode ? (
                  <>
                    <WifiOff size={14} className="animate-pulse" />
                    <span>Modo Offline Planta Activo</span>
                  </>
                ) : (
                  <>
                    <Wifi size={14} />
                    <span>Planta Conectada Online</span>
                  </>
                )}
              </button>

              {localSyncQueue.length > 0 && (
                <button
                  onClick={triggerSyncQueue}
                  className="bg-[#f07f07] hover:bg-[#d67004] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center space-x-1 animate-bounce"
                >
                  <RefreshCw size={12} className="animate-spin" />
                  <span>Sincronizar ({localSyncQueue.length})</span>
                </button>
              )}

              <div className="text-right text-xs hidden sm:block">
                <p className="font-semibold text-slate-700">
                  Bienvenido, Familia Directiva
                </p>
                <p className="text-slate-400 text-[10px]">
                  Rol: Administrador General
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* --- NAVEGACIÓN PRINCIPAL --- */}
        <nav className="bg-[#0081c9] text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-1 overflow-x-auto scrollbar-none py-2">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === "dashboard"
                    ? "bg-white text-[#0081c9] shadow-inner"
                    : "hover:bg-white/10 text-white"
                }`}
              >
                <BarChart2 size={18} />
                <span>Diferencias Diarias (Madre)</span>
              </button>

              <button
                onClick={() => setActiveTab("tablet")}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap relative ${
                  activeTab === "tablet"
                    ? "bg-white text-[#0081c9] shadow-inner"
                    : "hover:bg-white/10 text-white"
                }`}
              >
                <Tablet size={18} />
                <span>Terminal de Planta (Operario)</span>
                {localSyncQueue.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#f07f07] text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black animate-pulse border border-white">
                    {localSyncQueue.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("traceability")}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === "traceability"
                    ? "bg-white text-[#0081c9] shadow-inner"
                    : "hover:bg-white/10 text-white"
                }`}
              >
                <Search size={18} />
                <span>Trazabilidad de Lotes</span>
              </button>

              <button
                onClick={() => setActiveTab("avanx")}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === "avanx"
                    ? "bg-white text-[#0081c9] shadow-inner"
                    : "hover:bg-white/10 text-white"
                }`}
              >
                <RefreshCw size={18} />
                <span>Integración Avanx ERP</span>
              </button>

              <button
                onClick={() => setActiveTab("docs")}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === "docs"
                    ? "bg-white text-[#0081c9] shadow-inner"
                    : "hover:bg-white/10 text-white"
                }`}
              >
                <FileText size={18} />
                <span>Arquitectura y Ruta Técnica</span>
              </button>
            </div>
          </div>
        </nav>

        {/* --- ÁREA DE CONTENIDO DINÁMICO --- */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {/* ================= PESTAÑA 1: PANEL DE CONTROL DE DIFERENCIAS (LA MADRE) ================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Encabezado y Contexto de la Pestaña */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <BarChart2 className="text-[#0081c9]" />
                    Control Diario de Consumos y Diferencias
                  </h1>
                  <p className="text-slate-500 text-sm mt-1">
                    Reemplazo digital directo de la planilla Excel de la madre.
                    Comparativa de Consumos Reales (Tablet Planta) vs. Teóricos
                    (Avanx ERP).
                  </p>
                </div>
                <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>
                    Actualizado hoy: <strong>En Tiempo Real</strong>
                  </span>
                </div>
              </div>

              {/* Tarjetas Informativas Claves */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-red-100 rounded-lg text-red-600">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      Alertas Activas
                    </p>
                    <p className="text-2xl font-black text-red-600">
                      2 Insumos
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Exceden rango de tolerancia
                    </p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      Aprobaciones Hoy
                    </p>
                    <p className="text-2xl font-black text-emerald-600">
                      100% Cuadrado
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Pendiente cierre de inventario
                    </p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                    <Layers size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      Producción Registrada
                    </p>
                    <p className="text-2xl font-black text-blue-600">
                      {productionHistory.reduce(
                        (acc, curr) => acc + curr.cantidad,
                        0,
                      )}{" "}
                      Paq
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Registrados en tablets planta
                    </p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4 border-l-4 border-l-[#f07f07]">
                  <div className="p-3 bg-orange-100 rounded-lg text-[#f07f07]">
                    <Wifi size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      Estado Transmisión
                    </p>
                    <p className="text-lg font-black text-slate-800">
                      {localSyncQueue.length} locales
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Sin procesar en ERP
                    </p>
                  </div>
                </div>
              </div>

              {/* TABLA PRINCIPAL DE CONCILIACIÓN DIARIA */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                  <div>
                    <h2 className="text-lg font-black text-slate-800">
                      Grilla de Conciliación de Materia Prima Diaria
                    </h2>
                    <p className="text-slate-400 text-xs">
                      Cálculo en base a stock inicial, compras del día y consumo
                      registrado por operarios.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500 font-medium">
                      Editar tolerancias:
                    </span>
                    <div className="inline-flex rounded-md shadow-sm">
                      <button className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-3 py-1.5 border border-slate-300 rounded-l-md">
                        Restablecer estándar
                      </button>
                      <button
                        onClick={() =>
                          showNotification(
                            "Tolerancias y límites salvaguardados correctamente en servidor.",
                            "success",
                          )
                        }
                        className="bg-[#0081c9] hover:bg-[#006ca8] text-white font-bold text-xs px-3 py-1.5 border-t border-b border-r border-[#0081c9] rounded-r-md"
                      >
                        Guardar Ajustes
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-100">
                        <th className="p-4">Materia Prima / Ingrediente</th>
                        <th className="p-4 text-right">Inv. Inicial</th>
                        <th className="p-4 text-right">Entradas (Bodega)</th>
                        <th className="p-4 text-right bg-blue-50/20">
                          Consumo Real (A)
                        </th>
                        <th className="p-4 text-right bg-amber-50/20">
                          Consumo Teórico (B)
                        </th>
                        <th className="p-4 text-right">Diferencia (A - B)</th>
                        <th className="p-4 text-right">Desviación %</th>
                        <th className="p-4 text-center">Tolerancia Max</th>
                        <th className="p-4 text-center">Alerta Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {inventory.map((item) => {
                        const diff = parseFloat(
                          (item.consumoReal - item.consumoTeorico).toFixed(2),
                        );
                        const deviationPct =
                          item.consumoTeorico > 0
                            ? parseFloat(
                                ((diff / item.consumoTeorico) * 100).toFixed(1),
                              )
                            : 0;
                        const hasAlert =
                          Math.abs(deviationPct) > item.tolerance;
                        const invFinal = parseFloat(
                          (
                            item.stockInicial +
                            item.entradas -
                            item.consumoReal
                          ).toFixed(1),
                        );

                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="p-4 font-bold text-slate-700">
                              <div>{item.name}</div>
                              <div className="text-[10px] text-slate-400 font-normal">
                                ID: {item.id} | Inv. Final Teórico: {invFinal}{" "}
                                {item.unit}
                              </div>
                            </td>
                            <td className="p-4 text-right text-slate-600">
                              {item.stockInicial.toFixed(1)} {item.unit}
                            </td>
                            <td className="p-4 text-right text-slate-600">
                              +{item.entradas.toFixed(1)} {item.unit}
                            </td>
                            <td className="p-4 text-right font-black text-blue-700 bg-blue-50/10">
                              {item.consumoReal.toFixed(1)} {item.unit}
                            </td>
                            <td className="p-4 text-right font-semibold text-amber-700 bg-amber-50/10">
                              {item.consumoTeorico.toFixed(1)} {item.unit}
                            </td>
                            <td
                              className={`p-4 text-right font-bold ${diff > 0 ? "text-red-600" : "text-emerald-600"}`}
                            >
                              {diff > 0 ? `+${diff}` : diff} {item.unit}
                            </td>
                            <td
                              className={`p-4 text-right font-bold ${hasAlert ? "text-red-600" : "text-slate-600"}`}
                            >
                              {deviationPct > 0
                                ? `+${deviationPct}`
                                : deviationPct}
                              %
                            </td>
                            <td className="p-4 text-center">
                              <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full font-bold">
                                ±{item.tolerance}%
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              {hasAlert ? (
                                <span className="inline-flex items-center space-x-1 bg-red-100 text-red-800 text-xs font-extrabold px-3 py-1 rounded-full border border-red-200">
                                  <AlertTriangle size={12} />
                                  <span>CRÍTICA</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-200">
                                  <CheckCircle2 size={12} />
                                  <span>OK</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Análisis y Recomendación de Operación */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4">
                <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
                  <Info size={24} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-amber-800">
                    Análisis Técnico Automatizado de Mermas (Humedad e
                    Ingredientes)
                  </h3>
                  <p className="text-sm text-amber-900/80 leading-relaxed">
                    1. La desviación en la{" "}
                    <strong>Harina de Trigo (+5.6%)</strong> supera levemente el
                    margen de tolerancia del 5% configurado. Esto es habitual si
                    se registra alta humedad ambiental en Pereira durante las
                    últimas 48 horas (mayor absorción de agua que requiere
                    ajuste de balance en masa). <br />
                    2. La desviación en{" "}
                    <strong>Pollo Desmechado Cocido (+10.1%)</strong> es
                    crítica. Indica un problema de desposte del proveedor o una
                    merma excesiva en cocción. Se sugiere auditar el lote del
                    proveedor de pechuga.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() =>
                        showNotification(
                          "Se ha despachado la alerta y orden de auditoría de mermas al operario líder.",
                          "warning",
                        )
                      }
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-all"
                    >
                      Generar Orden de Auditoría de Mermas
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= PESTAÑA 2: TERMINAL DE PLANTA PARA OPERARIOS (TABLET VIEW) ================= */}
          {activeTab === "tablet" && (
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Cabecera del Marco de la Tablet */}
              <div className="flex items-center justify-between px-2 text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Tablet size={14} /> SIMULADOR DE DISPOSITIVO: TABLET
                  RUGERIZADA IP68 (PLANTA)
                </span>
                <span className="text-xs">
                  Batería: 94%🔋 | Conexión:{" "}
                  {offlineMode ? "Local Caching 💾" : "WiFi de Planta 📡"}
                </span>
              </div>

              {/* Chasis de la Tablet */}
              <div className="bg-slate-900 p-3 sm:p-5 rounded-[2.5rem] shadow-2xl border-4 border-slate-700 relative overflow-hidden">
                {/* Pantalla Interna de la Tablet */}
                <div className="bg-white rounded-[1.5rem] min-h-[550px] overflow-hidden flex flex-col text-slate-800 relative">
                  {/* Banner Superior de Estado Operario */}
                  <div className="bg-[#0081c9] text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                        {opOperario
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm leading-tight">
                          {opOperario}
                        </h3>
                        <p className="text-[10px] text-white/70">
                          OPERARIO DE PRODUCCIÓN
                        </p>
                      </div>
                    </div>
                    <div className="bg-black/20 px-3 py-1.5 rounded-lg text-xs font-bold">
                      Estación: Mezclado & Moldeo
                    </div>
                  </div>

                  {/* Paso del proceso: Barra de Progreso */}
                  <div className="bg-slate-100 px-6 py-3 flex items-center justify-between border-b border-slate-200">
                    <span className="text-xs font-extrabold text-slate-500">
                      PROCESO DE REGISTRO DIARIO
                    </span>
                    <div className="flex items-center space-x-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <div
                          key={s}
                          className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-black ${
                            opStep === s
                              ? "bg-[#f07f07] text-white"
                              : opStep > s
                                ? "bg-emerald-500 text-white"
                                : "bg-slate-300 text-slate-500"
                          }`}
                        >
                          {s === 5 ? "✓" : s}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CONTENIDO DE LA PANTALLA SEGÚN PASO ACTUAL */}
                  <div className="flex-1 p-6 overflow-y-auto">
                    {/* PASO 1: SELECCIONAR RECETA */}
                    {opStep === 1 && (
                      <div className="space-y-4">
                        <h2 className="text-xl font-black text-slate-800 text-center">
                          Toca el Producto que vas a fabricar hoy:
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                          {RECIPES_PRESETS.map((recipe) => (
                            <button
                              key={recipe.id}
                              onClick={() => {
                                setSelectedRecipe(recipe);
                                setOpStep(2);
                              }}
                              className={`p-6 rounded-2xl border-3 text-left transition-all ${
                                selectedRecipe.id === recipe.id
                                  ? "border-[#0081c9] bg-blue-50/50 shadow-md ring-2 ring-[#0081c9]/20"
                                  : "border-slate-200 hover:border-slate-300 bg-white"
                              }`}
                            >
                              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-[#0081c9] font-black text-lg mb-4">
                                {recipe.name[0]}
                              </div>
                              <h3 className="font-extrabold text-slate-800 leading-tight">
                                {recipe.name}
                              </h3>
                              <p className="text-xs text-slate-400 mt-2">
                                Unidad: {recipe.yieldUnit}
                              </p>
                              <p className="text-xs text-slate-400">
                                Ingredientes: {recipe.ingredients.length}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* PASO 2: INGRESAR CANTIDAD PRODUCIDA */}
                    {opStep === 2 && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => setOpStep(1)}
                            className="text-slate-500 hover:text-slate-800 text-sm font-bold flex items-center"
                          >
                            ← Volver
                          </button>
                          <span className="text-xs text-slate-400 font-bold uppercase">
                            {selectedRecipe.name}
                          </span>
                        </div>

                        <h2 className="text-xl font-black text-slate-800 text-center">
                          ¿Cuántos PAQUETES produjeron?
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-2">
                          <div>
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                                CANTIDAD EN UNIDADES DE PAQUETE
                              </span>
                              <div className="text-4xl font-black text-[#0081c9] tracking-tight">
                                {opQuantity || "0"}{" "}
                                <span className="text-lg text-slate-500 font-normal">
                                  paquetes
                                </span>
                              </div>
                            </div>

                            {/* Botones de Selección Rápida */}
                            <div className="grid grid-cols-3 gap-2 mt-4">
                              {[100, 150, 200, 300, 450, 600].map(
                                (quickVal) => (
                                  <button
                                    key={quickVal}
                                    onClick={() => {
                                      setOpQuantity(String(quickVal));
                                      setOpActiveField("qty");
                                    }}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-3 px-1 rounded-xl text-sm border border-slate-200 transition-colors"
                                  >
                                    {quickVal} paq
                                  </button>
                                ),
                              )}
                            </div>
                          </div>

                          {/* Teclado Numérico Virtual para Pantalla Táctil */}
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-3 gap-2">
                            {[
                              "1",
                              "2",
                              "3",
                              "4",
                              "5",
                              "6",
                              "7",
                              "8",
                              "9",
                              "0",
                              "C",
                              "back",
                            ].map((num) => (
                              <button
                                key={num}
                                onClick={() => {
                                  setOpActiveField("qty");
                                  handleNumpadPress(num);
                                }}
                                className={`py-4 rounded-xl font-bold text-lg flex items-center justify-center border transition-all ${
                                  num === "C"
                                    ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                                    : num === "back"
                                      ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
                                      : "bg-white hover:bg-slate-100 border-slate-200 text-slate-800"
                                }`}
                              >
                                {num === "back" ? "←" : num}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end pt-4">
                          <button
                            disabled={!opQuantity}
                            onClick={() => {
                              // Inicializar pesos sugeridos teóricos para que el operario los edite si hubo desviación
                              const weights: Record<string, string | number> =
                                {};
                              selectedRecipe.ingredients.forEach((ing) => {
                                weights[ing.id] = parseFloat(
                                  (ing.stdQty * parseInt(opQuantity)).toFixed(
                                    1,
                                  ),
                                );
                              });
                              setOpRealWeights(weights);
                              setOpStep(3);
                            }}
                            className="bg-[#0081c9] hover:bg-[#006ca8] text-white disabled:opacity-50 disabled:cursor-not-allowed font-black px-8 py-4 rounded-xl flex items-center space-x-2 shadow-md transition-all text-base"
                          >
                            <span>Siguiente: Consumo de Insumos</span>
                            <ChevronRight size={20} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* PASO 3: INGRESAR PESOS REALES (CONSUMO INSUMOS) */}
                    {opStep === 3 && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => setOpStep(2)}
                            className="text-slate-500 hover:text-slate-800 text-sm font-bold flex items-center"
                          >
                            ← Volver
                          </button>
                          <span className="text-xs text-slate-400 font-bold uppercase">
                            LOTE MP USADO
                          </span>
                        </div>

                        <h2 className="text-xl font-black text-slate-800 text-center">
                          Registrar Pesajes Reales Utilizados
                        </h2>
                        <p className="text-slate-400 text-xs text-center -mt-2">
                          Pre-calculados teóricos basados en {opQuantity}{" "}
                          paquetes. Ajusta el peso exacto del lote.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pt-2">
                          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                            {selectedRecipe.ingredients.map((ing) => (
                              <div
                                key={ing.id}
                                onClick={() =>
                                  setOpActiveField(`weight_${ing.id}`)
                                }
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                  opActiveField === `weight_${ing.id}`
                                    ? "border-[#0081c9] bg-blue-50/50"
                                    : "border-slate-200 bg-white hover:border-slate-300"
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-slate-700 text-sm">
                                    {ing.name}
                                  </span>
                                  <span className="text-xs text-slate-400 font-bold">
                                    Standard:{" "}
                                    {(
                                      ing.stdQty * parseInt(opQuantity)
                                    ).toFixed(1)}{" "}
                                    {ing.unit}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center mt-3">
                                  <div className="text-2xl font-black text-[#0081c9]">
                                    {opRealWeights[ing.id] || "0"}{" "}
                                    <span className="text-xs font-normal text-slate-500">
                                      {ing.unit}
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-400">
                                    Lote MP:{" "}
                                    <input
                                      type="text"
                                      placeholder="Digitar Lote"
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) =>
                                        setOpMpaLots((prev) => ({
                                          ...prev,
                                          [ing.id]: e.target.value,
                                        }))
                                      }
                                      value={
                                        opMpaLots[ing.id] ||
                                        `LMP-${ing.id.substring(2)}-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}`
                                      }
                                      className="bg-slate-100 font-mono text-slate-700 px-2 py-1 rounded border border-slate-200 text-[10px] w-24 text-center ml-1 uppercase"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Teclado Numérico con punto decimal para pesaje real */}
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-center mb-2">
                              {opActiveField.startsWith("weight_")
                                ? `EDITANDO PESO PARA: ${selectedRecipe.ingredients.find((i) => `weight_${i.id}` === opActiveField)?.name || ""}`
                                : "Toca un ingrediente de la izquierda para editar peso"}
                            </span>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                "1",
                                "2",
                                "3",
                                "4",
                                "5",
                                "6",
                                "7",
                                "8",
                                "9",
                                "0",
                                ".",
                                "C",
                                "back",
                              ].map((num) => (
                                <button
                                  key={num}
                                  onClick={() => handleNumpadPress(num)}
                                  className={`py-3.5 rounded-xl font-bold text-lg flex items-center justify-center border transition-all ${
                                    num === "C"
                                      ? "bg-red-50 text-red-600 border-red-200"
                                      : num === "back"
                                        ? "bg-amber-50 text-amber-600 border-amber-200"
                                        : "bg-white hover:bg-slate-100 border-slate-200 text-slate-800"
                                  }`}
                                >
                                  {num === "back" ? "←" : num}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end pt-4">
                          <button
                            onClick={() => setOpStep(4)}
                            className="bg-[#0081c9] hover:bg-[#006ca8] text-white font-black px-8 py-4 rounded-xl flex items-center space-x-2 shadow-md transition-all text-base"
                          >
                            <span>Siguiente: Registrar Desperdicios</span>
                            <ChevronRight size={20} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* PASO 4: REGISTRAR DESPERDICIOS Y CAUSAS */}
                    {opStep === 4 && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => setOpStep(3)}
                            className="text-slate-500 hover:text-slate-800 text-sm font-bold flex items-center"
                          >
                            ← Volver
                          </button>
                          <span className="text-xs text-slate-400 font-bold uppercase">
                            DESPERDICIO
                          </span>
                        </div>

                        <h2 className="text-xl font-black text-slate-800 text-center">
                          ¿Hubo Desperdicio de Producto Terminado / Masa?
                        </h2>
                        <p className="text-slate-400 text-xs text-center -mt-2">
                          Indica si existió merma física por fallas o recortes
                          inservibles.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pt-2">
                          <div className="space-y-4">
                            <div
                              onClick={() => setOpActiveField("waste")}
                              className={`p-6 rounded-2xl border-2 text-center cursor-pointer transition-all ${
                                opActiveField === "waste"
                                  ? "border-[#0081c9] bg-blue-50/20"
                                  : "border-slate-200 bg-white"
                              }`}
                            >
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                                DESPERDICIO DETECTADO
                              </span>
                              <div className="text-4xl font-black text-red-600 tracking-tight">
                                {opWaste || "0"}{" "}
                                <span className="text-lg text-slate-500 font-normal">
                                  kg
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                Causa del Desperdicio:
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                {[
                                  "Defecto Horneado",
                                  "Recorte de Bordes",
                                  "Fallo de Envoltura",
                                  "Masa Sucia",
                                  "Otro / Exceso Humedad",
                                ].map((cause) => (
                                  <button
                                    key={cause}
                                    onClick={() => setOpWasteCause(cause)}
                                    className={`py-3 px-1 text-xs font-bold rounded-xl border text-center transition-all ${
                                      opWasteCause === cause
                                        ? "bg-red-500 text-white border-red-500 shadow-sm"
                                        : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
                                    }`}
                                  >
                                    {cause}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Numpad */}
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-center mb-2">
                              Digitador de Desperdicio
                            </span>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                "1",
                                "2",
                                "3",
                                "4",
                                "5",
                                "6",
                                "7",
                                "8",
                                "9",
                                "0",
                                ".",
                                "C",
                                "back",
                              ].map((num) => (
                                <button
                                  key={num}
                                  onClick={() => {
                                    setOpActiveField("waste");
                                    handleNumpadPress(num);
                                  }}
                                  className={`py-3.5 rounded-xl font-bold text-lg flex items-center justify-center border transition-all ${
                                    num === "C"
                                      ? "bg-red-50 text-red-600 border-red-200"
                                      : num === "back"
                                        ? "bg-amber-50 text-amber-600 border-amber-200"
                                        : "bg-white hover:bg-slate-100 border-slate-200 text-slate-800"
                                  }`}
                                >
                                  {num === "back" ? "←" : num}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end pt-4">
                          <button
                            onClick={submitTabletProduction}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-10 py-4 rounded-xl flex items-center space-x-2 shadow-md transition-all text-base animate-pulse"
                          >
                            <CheckCircle2 size={20} />
                            <span>GUARDAR Y FINALIZAR BACHE</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* PASO 5: ÉXITO */}
                    {opStep === 5 && (
                      <div className="py-12 text-center space-y-6">
                        <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                          <CheckCircle2 size={56} className="animate-bounce" />
                        </div>
                        <div className="space-y-2">
                          <h2 className="text-2xl font-black text-slate-800">
                            ¡Bache Registrado Correctamente!
                          </h2>
                          <p className="text-slate-500 text-sm">
                            El bache ha sido enviado a la cola central de Bon
                            Marché.
                          </p>
                          {offlineMode ? (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-sm mx-auto text-xs text-amber-800 mt-2">
                              <strong>Nota de Modo Offline:</strong> El bache
                              está en caché local temporal dentro de la tablet.
                              Se subirá automáticamente al servidor cuando se
                              restablezca el WiFi de planta.
                            </div>
                          ) : (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 max-w-sm mx-auto text-xs text-emerald-800 mt-2">
                              <strong>Estado de Envío:</strong> Registrado en la
                              base de datos en tiempo real de forma exitosa y
                              conciliado en tiempo real.
                            </div>
                          )}
                        </div>
                        <div className="pt-6">
                          <button
                            onClick={resetTabletFlow}
                            className="bg-[#0081c9] hover:bg-[#006ca8] text-white font-black px-8 py-3.5 rounded-xl transition-all"
                          >
                            Iniciar Nuevo Bache de Producción
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pie de Pantalla Operario */}
                  <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-between items-center text-xs text-slate-400 font-bold">
                    <span>BON MARCHÉ • SOFTWARE DE PLANTA DE PRODUCCIÓN</span>
                    <span>v2.1 (PWA Ready)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= PESTAÑA 3: RASTREADOR DE TRAZABILIDAD (DE FIN A FIN) ================= */}
          {activeTab === "traceability" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                  <Search className="text-[#0081c9]" />
                  Rastreador de Trazabilidad Total
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Herramienta para auditar cualquier lote sospechoso o
                  requerimiento INVIMA. Busca un lote de Producto Terminado
                  (LPT) o Materia Prima (LMP) para ver su árbol completo.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Search size={18} />
                    </span>
                    <input
                      type="text"
                      value={traceSearchQuery}
                      onChange={(e) => setTraceSearchQuery(e.target.value)}
                      placeholder="Ej. LPT-20260522-01 o LMP-QUE-809..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0081c9]/30 uppercase"
                    />
                  </div>
                  <button
                    onClick={() => handleTraceSearch(traceSearchQuery)}
                    className="bg-[#0081c9] hover:bg-[#006ca8] text-white font-black px-8 py-3 rounded-xl shadow-sm transition-all text-sm whitespace-nowrap"
                  >
                    Buscar Lote
                  </button>
                </div>

                {/* Sugerencias Rápidas */}
                <div className="mt-3 flex items-center space-x-2 text-xs">
                  <span className="text-slate-400">Lotes de prueba:</span>
                  {productionHistory.map((h, i) => (
                    <button
                      key={h.lotePT}
                      onClick={() => {
                        setTraceSearchQuery(h.lotePT);
                        handleTraceSearch(h.lotePT);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-2 py-1 rounded"
                    >
                      {h.lotePT} ({i === 0 ? "Reciente" : "Pandebono"})
                    </button>
                  ))}
                </div>
              </div>

              {searchResult ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* 1. Lotes de Origen: Materia Prima */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                      <span className="p-2 bg-blue-100 text-[#0081c9] rounded-lg">
                        <Database size={18} />
                      </span>
                      <h3 className="font-extrabold text-slate-800">
                        1. Entrada: Materia Prima Usada
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {searchResult.lotesMP.map((ing) => (
                        <div
                          key={ing.mpId}
                          className="p-4 rounded-xl bg-slate-50 border border-slate-150"
                        >
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>INGREDIENTE</span>
                            <span className="font-bold text-slate-500 font-mono">
                              ID: {ing.mpId}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-700 text-sm mt-1">
                            {ing.name}
                          </h4>

                          <div className="grid grid-cols-2 gap-2 mt-3 text-xs bg-white p-2 rounded-lg border border-slate-100">
                            <div>
                              <span className="text-slate-400 block text-[9px]">
                                LOTE REGISTRADO
                              </span>
                              <span className="font-bold font-mono text-[#f07f07]">
                                {ing.lote}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px]">
                                CANT UTILIZADA
                              </span>
                              <span className="font-extrabold text-slate-700">
                                {ing.realUtilizado.toFixed(1)} kg
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. El Proceso de Producción en Planta */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                        <span className="p-2 bg-orange-100 text-[#f07f07] rounded-lg">
                          <Layers size={18} />
                        </span>
                        <h3 className="font-extrabold text-slate-800">
                          2. Proceso: Fabricación de Lote
                        </h3>
                      </div>

                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 relative overflow-hidden">
                        {/* Badge decorativo con el lote de PT */}
                        <div className="absolute top-0 right-0 bg-[#0081c9] text-white px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-bl-xl">
                          PT LOT
                        </div>

                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                            Producto Terminado
                          </span>
                          <h4 className="font-black text-[#0081c9] text-base leading-tight">
                            {searchResult.recetaName}
                          </h4>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase block">
                              Código Lote PT
                            </span>
                            <span className="font-black text-slate-800 font-mono text-xs">
                              {searchResult.lotePT}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase block">
                              Volumen Lote
                            </span>
                            <span className="font-black text-slate-800 text-xs">
                              {searchResult.cantidad} Paquetes
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase block">
                              Operario Responsable
                            </span>
                            <span className="font-bold text-slate-600 text-xs">
                              {searchResult.operario}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase block">
                              Fecha y Hora
                            </span>
                            <span className="font-bold text-slate-600 text-xs">
                              {searchResult.fecha} ({searchResult.hora})
                            </span>
                          </div>
                        </div>

                        {searchResult.desperdicio > 0 && (
                          <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-xs text-red-800">
                            <strong>Desperdicio registrado:</strong>{" "}
                            {searchResult.desperdicio} kg (
                            {searchResult.causaDesperdicio})
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 flex justify-center text-slate-300">
                      <ArrowRight size={32} className="rotate-90 lg:rotate-0" />
                    </div>
                  </div>

                  {/* 3. Salida y Distribución: Tiendas Identificadas por Color */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                      <span className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                        <Truck size={18} />
                      </span>
                      <h3 className="font-extrabold text-slate-800">
                        3. Salida: Despacho a Tiendas
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {searchResult.despachos.map((desp, index) => {
                        const store = STORES_PRESETS.find(
                          (s) => s.id === desp.tiendaId,
                        );
                        return (
                          <div
                            key={index}
                            className="p-4 rounded-xl border border-slate-150 flex items-center justify-between"
                            style={{
                              borderLeftWidth: "6px",
                              borderLeftColor: store?.color,
                            }}
                          >
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm">
                                {store?.name}
                              </h4>
                              <p className="text-xs text-slate-400">
                                Identificador Tienda:{" "}
                                <strong>Color {store?.label}</strong>
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                Guía de Despacho #: GD-
                                {searchResult.lotePT.substring(4)}-0{index + 1}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="bg-slate-100 text-slate-800 text-xs font-black px-3 py-1.5 rounded-lg border border-slate-200 block">
                                {desp.cant} paq
                              </span>
                              <span className="text-[9px] text-slate-400 font-bold block mt-1">
                                Despachado Congelado
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                    <Search size={28} />
                  </div>
                  <h3 className="font-black text-slate-800 text-lg">
                    No se encontró información del lote
                  </h3>
                  <p className="text-slate-400 text-sm max-w-md mx-auto">
                    Ingresa un código de lote de producto terminado válido para
                    simular el rastreo completo. Puedes usar uno de los botones
                    rápidos de sugerencia.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ================= PESTAÑA 4: INTEGRACIÓN CON AVANX ERP ================= */}
          {activeTab === "avanx" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                  <RefreshCw className="text-[#0081c9]" />
                  Middleware de Integración: Avanx ERP
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Conectividad del módulo de producción con la base de datos de
                  Avanx. Permite importar recetas teóricas y sincronizar el
                  inventario real al cierre del día.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card de Estado de Conectividad */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-slate-800 border-b border-slate-100 pb-2">
                    Estado del Middleware
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">
                        Canal de Comunicación:
                      </span>
                      <span className="font-bold text-slate-700">
                        API REST / JSON sync
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Estado Conexión:</span>
                      <span className="font-black text-emerald-600">
                        CONECTADO
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">
                        Última Carga Recetas:
                      </span>
                      <span className="text-slate-700">{lastSyncDate}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">
                        Frecuencia de Sinc:
                      </span>
                      <span className="text-slate-700">
                        Diaria (Cierre de Día)
                      </span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => {
                        setAvanxSyncStatus("SINCRONIZANDO");
                        setTimeout(() => {
                          setAvanxSyncStatus("CONECTADO");
                          setLastSyncDate(new Date().toLocaleTimeString());
                          showNotification(
                            "¡Recetas importadas con éxito desde Avanx ERP!",
                            "success",
                          );
                        }, 1500);
                      }}
                      className="w-full bg-[#0081c9] hover:bg-[#006ca8] text-white font-black py-3 rounded-xl shadow-sm text-xs flex items-center justify-center space-x-2 transition-all"
                    >
                      <RefreshCw
                        size={14}
                        className={
                          avanxSyncStatus === "SINCRONIZANDO"
                            ? "animate-spin"
                            : ""
                        }
                      />
                      <span>Forzar Carga de Recetas de Avanx</span>
                    </button>
                  </div>
                </div>

                {/* Card de Flujo de Datos XML/JSON */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-slate-800 border-b border-slate-100 pb-2">
                    Simulación de Intercambio (Avanx)
                  </h3>

                  <div className="bg-slate-900 rounded-xl p-4 font-mono text-[10px] text-emerald-400 overflow-x-auto space-y-2">
                    <p className="text-slate-500">
                      // Consumo Real para Descarga de Inventario
                    </p>
                    <p>{"{"}</p>
                    <p>{'  "fecha": "2026-05-22",'}</p>
                    <p>{'  "origen": "TabletPlanta01",'}</p>
                    <p>{'  "consumos": ['}</p>
                    <p>{'    { "insumoId": "MP1", "real": 142.5 },'}</p>
                    <p>{'    { "insumoId": "MP2", "real": 89.2 }'}</p>
                    <p>{"  ]"}</p>
                    <p>{"}"}</p>
                  </div>

                  <p className="text-xs text-slate-400">
                    Formato de salida automatizado JSON enviado al ERP Avanx
                    para deprimir el stock físico real conciliado.
                  </p>
                </div>

                {/* Configuración de Homologación de Recetas */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-slate-800 border-b border-slate-100 pb-2">
                    Mapeo de Códigos de Insumos
                  </h3>
                  <p className="text-xs text-slate-500">
                    Asegura la correspondencia entre los códigos de la tablet y
                    los códigos internos de Avanx ERP.
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-lg border border-slate-150">
                      <div>
                        <p className="font-bold text-slate-700">
                          Harina Haz de Oros
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Tablet ID: MP1
                        </p>
                      </div>
                      <ChevronRight size={14} className="text-slate-400" />
                      <div>
                        <p className="font-bold text-slate-700">AV-IN-HAR01</p>
                        <p className="text-[10px] text-slate-400">Avanx SKU</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-lg border border-slate-150">
                      <div>
                        <p className="font-bold text-slate-700">
                          Pollo Desmechado
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Tablet ID: MP2
                        </p>
                      </div>
                      <ChevronRight size={14} className="text-slate-400" />
                      <div>
                        <p className="font-bold text-slate-700">AV-IN-POL20</p>
                        <p className="text-[10px] text-slate-400">Avanx SKU</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= PESTAÑA 5: DOCUMENTACIÓN DE ARQUITECTURA DETALLADA (PRESET) ================= */}
          {activeTab === "docs" && (
            <div className="space-y-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
              <div className="border-b border-slate-200 pb-6">
                <span className="bg-[#0081c9]/10 text-[#0081c9] text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                  Documento de Arquitectura de Software
                </span>
                <h1 className="text-3xl font-black text-slate-900 mt-3 leading-tight">
                  Sistema de Trazabilidad y Control de Producción Diaria (Bon
                  Marché)
                </h1>
                <p className="text-slate-500 text-sm mt-2">
                  <strong>Autor:</strong> Arquitecto de Software Senior •{" "}
                  <strong>Cliente:</strong> Bon Marché (Pereira, Colombia)
                </p>
              </div>

              {/* SECCIÓN 1: VISIÓN GENERAL Y DIAGRAMA DE FLUJO */}
              <section className="space-y-4">
                <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                  <span className="bg-[#f07f07] text-white w-7 h-7 rounded-lg flex items-center justify-center text-sm">
                    1
                  </span>
                  Visión General del Flujo de Información
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  El sistema actúa como un **middleware especializado de
                  producción** que conecta el ingreso táctil en la planta con el
                  ERP Avanx, garantizando que el control diario de consumo sea
                  preciso, digital y en tiempo real.
                </p>

                {/* Diagrama de Arquitectura de Flujo de Datos ASCII */}
                <div className="bg-slate-900 text-emerald-400 p-6 rounded-2xl font-mono text-xs overflow-x-auto leading-normal whitespace-pre">
                  {`+----------------------------------------------------------------------------------------+
|                              ESTACIÓN DE TRABAJO (PLANTA)                              |
|                                                                                        |
|  [ Operario en Tablet ]                                                                |
|       │                                                                                |
|       ▼                                                                                |
|  [ Almacenamiento Local (IndexedDB / Caché SQLite) ] <─── WiFi Inestable / Caído       |
|       │                                                                                |
|       ▼                                                                                |
|  [ Sincronizador de Planta ] ─────────────────────────── WiFi Restablecido / En línea  |
+───────┼────────────────────────────────────────────────────────────────────────────────+
        │
        ▼ (Protocolo seguro HTTPS con autenticación JWT de planta)
+────────────────────────────────────────────────────────────────────────────────────────+
|                              APLICATIVO CENTRAL DE GESTIÓN                             |
|                                                                                        |
|  [ API Gateway (Capa Node.js/FastAPI) ]                                               |
|       │                                                                                |
|       ├───► [ Motor de Trazabilidad ] ──────────► [ Base de Datos PostgreSQL ]          |
|       │                                                                                |
|       └───► [ Motor de Reglas & Tolerancia ] ─────► [ Alertas Inmediatas (Panel Madre) ]|
+───────┼────────────────────────────────────────────────────────────────────────────────+
        │
        ▼ (Sincronización Diaria / Integrador Avanx)
+────────────────────────────────────────────────────────────────────────────────────────+
|                             SISTEMA CONTABLE ERP AVANX                                 |
|                                                                                        |
|  [ Middleware / CSV Export ] ──► [ Inventarios de Bodega de Avanx ERP ]                |
+────────────────────────────────────────────────────────────────────────────────────────+`}
                </div>
              </section>

              {/* SECCIÓN 2: MÓDULOS Y FUNCIONALIDADES */}
              <section className="space-y-4">
                <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                  <span className="bg-[#f07f07] text-white w-7 h-7 rounded-lg flex items-center justify-center text-sm">
                    2
                  </span>
                  Módulos y Funcionalidades del Sistema
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden text-sm">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-3">Módulo</th>
                        <th className="p-3">Descripción / Responsabilidad</th>
                        <th className="p-3">Usuario Principal</th>
                        <th className="p-3 text-center">Prioridad</th>
                        <th className="p-3 text-center">Fase</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-600">
                      <tr>
                        <td className="p-3 font-bold text-slate-800">
                          Tablet Planta (Operario)
                        </td>
                        <td className="p-3">
                          Interfaz optimizada para tablets de alta dureza en
                          cocina. Botones táctiles de gran tamaño, sin necesidad
                          de escritura alfabética constante. Captura bache por
                          bache.
                        </td>
                        <td className="p-3">Operario de Cocina</td>
                        <td className="p-3 text-center">
                          <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded">
                            Alta
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold text-slate-700">
                          Fase 1
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-800">
                          Conciliación de Consumos (Excel Digital)
                        </td>
                        <td className="p-3">
                          Visualización interactiva diaria que compara el
                          Consumo Real vs. Teórico. Generación de alertas para
                          desviaciones fuera de tolerancia por humedad o mermas
                          de carne.
                        </td>
                        <td className="p-3">La Madre (Controladora)</td>
                        <td className="p-3 text-center">
                          <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded">
                            Alta
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold text-slate-700">
                          Fase 1
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-800">
                          Trazabilidad Extrema de Lotes
                        </td>
                        <td className="p-3">
                          Vinculación secuencial: Lote de Materia Prima {"→"}{" "}
                          Lote de Producto Terminado {"→"} Despacho a Tiendas
                          Propias y Franquicias (Identificadas por colores).
                        </td>
                        <td className="p-3">Calidad / Dirección</td>
                        <td className="p-3 text-center">
                          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded">
                            Media
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold text-slate-700">
                          Fase 2
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-800">
                          Middleware ERP Avanx
                        </td>
                        <td className="p-3">
                          Sincronización de recetas estándar e inventarios
                          iniciales de Avanx. Al cierre del día, exporta la
                          conciliación física real aprobada para deprimir
                          inventarios en Avanx.
                        </td>
                        <td className="p-3">Tesorero (Jorge) / Soporte</td>
                        <td className="p-3 text-center">
                          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded">
                            Media
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold text-slate-700">
                          Fase 1
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* SECCIÓN 3: MODELO DE TRAZABILIDAD (ENTIDADES) */}
              <section className="space-y-4">
                <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                  <span className="bg-[#f07f07] text-white w-7 h-7 rounded-lg flex items-center justify-center text-sm">
                    3
                  </span>
                  Modelo de Trazabilidad (Entidades y Relaciones)
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Para responder a los reclamos con precisión (ej. "paquete 1876
                  tiene problemas"), estructuramos el almacenamiento con un
                  modelo relacional estricto basado en las siguientes entidades:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <h4 className="font-extrabold text-slate-800 text-sm">
                      LoteMateriaPrima
                    </h4>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                      <li>`lote_proveedor_id` (PK)</li>
                      <li>`materia_prima_id` (FK)</li>
                      <li>`fecha_ingreso` (Date)</li>
                      <li>`fecha_vencimiento_lote` (Date)</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <h4 className="font-extrabold text-slate-800 text-sm">
                      BacheProduccion
                    </h4>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                      <li>`lote_pt_id` (PK)</li>
                      <li>`receta_id` (FK)</li>
                      <li>`cantidad_paquetes` (Integer)</li>
                      <li>`fecha_produccion` (Date)</li>
                      <li>`operario` (String)</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <h4 className="font-extrabold text-slate-800 text-sm">
                      DespachoTienda
                    </h4>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                      <li>`guia_despacho_id` (PK)</li>
                      <li>`lote_pt_id` (FK)</li>
                      <li>`tienda_destino_id` (FK)</li>
                      <li>`color_tienda_identificador` (String)</li>
                      <li>`fecha_despacho` (Date)</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* SECCIÓN 4: LÓGICA DE ALERTAS Y VARIACIONES */}
              <section className="space-y-4">
                <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                  <span className="bg-[#f07f07] text-white w-7 h-7 rounded-lg flex items-center justify-center text-sm">
                    4
                  </span>
                  Lógica de Alertas y Tolerancias por Receta
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  El sistema no es rígido; reconoce las variaciones biológicas
                  de la harina (que absorbe humedad) y del pollo (con mermas de
                  carne respecto al hueso según lote). La tolerancia se evalúa
                  dinámicamente con la fórmula:
                </p>

                <div className="bg-slate-100 p-4 rounded-xl text-center font-mono text-sm text-slate-800 border border-slate-200">
                  ConsumoTeorico = CantidadProducida × DosificacionStandard
                  <br />
                  <span className="text-xs text-slate-400 block mt-2">
                    Diferencia % = [ (ConsumoReal - ConsumoTeorico) /
                    ConsumoTeorico ] × 100
                  </span>
                </div>

                <div className="text-sm text-slate-600 leading-relaxed">
                  <strong>Configuración preestablecida por ingrediente:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1 pl-4">
                    <li>
                      <strong>Harina de Trigo:</strong> Tolerancia de{" "}
                      <span className="font-bold">±5.0%</span> para admitir
                      mermas de polvo en tolva y variaciones de absorción de
                      agua.
                    </li>
                    <li>
                      <strong>Pollo Desmechado:</strong> Tolerancia de{" "}
                      <span className="font-bold">±8.0%</span> por variaciones
                      de merma física en desposte de pechuga.
                    </li>
                    <li>
                      <strong>Almidones y Quesos:</strong> Tolerancia de{" "}
                      <span className="font-bold">±6.0%</span>.
                    </li>
                  </ul>
                </div>
              </section>

              {/* SECCIÓN 5: INTEGRACIÓN CON AVANX ERP */}
              <section className="space-y-4">
                <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                  <span className="bg-[#f07f07] text-white w-7 h-7 rounded-lg flex items-center justify-center text-sm">
                    5
                  </span>
                  Estrategia de Integración con Avanx
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Dado que Avanx ERP es un sistema tradicional instalado de
                  manera local o con base de datos cerrada, se implementará una
                  **estrategia híbrida de archivos planos y sincronización
                  programada**:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-slate-200 p-4 rounded-xl space-y-2">
                    <h4 className="font-bold text-[#0081c9] text-sm flex items-center gap-1.5">
                      <Database size={16} /> Lectura (Entradas)
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Sincronización automatizada cada mañana (06:00 AM) de: 1.
                      Recetas estándar registradas en Avanx (para evitar volver
                      a digitarlas en la app). 2. Compras y traslados
                      autorizados del día anterior desde bodega.
                    </p>
                  </div>
                  <div className="border border-slate-200 p-4 rounded-xl space-y-2">
                    <h4 className="font-bold text-[#f07f07] text-sm flex items-center gap-1.5">
                      <RefreshCw size={16} /> Escritura (Consumos de Cierre)
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Al final de la jornada de producción, tras la aprobación
                      de la madre del reporte de mermas, el middleware genera un
                      **archivo JSON de consumo neto diario** que Avanx procesa
                      para dar de baja automáticamente la materia prima del
                      stock contable de forma real.
                    </p>
                  </div>
                </div>
              </section>

              {/* SECCIÓN 6: STACK TECNOLÓGICO */}
              <section className="space-y-4">
                <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                  <span className="bg-[#f07f07] text-white w-7 h-7 rounded-lg flex items-center justify-center text-sm">
                    6
                  </span>
                  Stack Tecnológico Recomendado
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                  <div className="border border-slate-200 p-4 rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0081c9] flex items-center justify-center mx-auto mb-3 font-bold">
                      1
                    </div>
                    <h4 className="font-bold text-sm text-slate-800">
                      Front (Tablet)
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      React 18 + Tailwind CSS. Diseñado como Progressive Web App
                      (PWA) para instalación directa en tablets.
                    </p>
                  </div>

                  <div className="border border-slate-200 p-4 rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0081c9] flex items-center justify-center mx-auto mb-3 font-bold">
                      2
                    </div>
                    <h4 className="font-bold text-sm text-slate-800">
                      Caché Planta
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      IndexedDB + RxDB en tablet. Almacenamiento local seguro e
                      indestructible ante microcortes de WiFi.
                    </p>
                  </div>

                  <div className="border border-slate-200 p-4 rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0081c9] flex items-center justify-center mx-auto mb-3 font-bold">
                      3
                    </div>
                    <h4 className="font-bold text-sm text-slate-800">
                      Backend API
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Node.js (NestJS) o Python (FastAPI). Ligero, robusto,
                      ideal para procesamiento rápido de colas de pesajes.
                    </p>
                  </div>

                  <div className="border border-slate-200 p-4 rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0081c9] flex items-center justify-center mx-auto mb-3 font-bold">
                      4
                    </div>
                    <h4 className="font-bold text-sm text-slate-800">
                      Base de Datos
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      PostgreSQL en la nube (ej. AWS RDS o DigitalOcean
                      Managed). Costo de hosting bajo (~$120.000 COP/mes).
                    </p>
                  </div>
                </div>
              </section>

              {/* SECCIÓN 7: HOJA DE RUTA */}
              <section className="space-y-4">
                <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                  <span className="bg-[#f07f07] text-white w-7 h-7 rounded-lg flex items-center justify-center text-sm">
                    7
                  </span>
                  Hoja de Ruta por Sprints
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden text-sm">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-3">Fase</th>
                        <th className="p-3">Duración</th>
                        <th className="p-3">Entregable Concreto</th>
                        <th className="p-3">Dependencias</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-600">
                      <tr>
                        <td className="p-3 font-bold text-slate-800">
                          Fase 1: Planta Digital & Cuadre Diario
                        </td>
                        <td className="p-3">6 Semanas</td>
                        <td className="p-3">
                          Tablet PWA para operarios con almacenamiento offline,
                          panel de diferencias de insumos para la madre, y base
                          de datos relacional de consumos.
                        </td>
                        <td className="p-3">
                          Estructuración de recetas estándar de Avanx.
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-800">
                          Fase 2: Trazabilidad Extrema de Lotes
                        </td>
                        <td className="p-3">4 Semanas</td>
                        <td className="p-3">
                          Mapeo de número de lote de materia prima de entrada
                          hasta el despacho físico a tiendas (color
                          identificador de bolsas por punto de venta).
                        </td>
                        <td className="p-3">
                          Fase 1 completa y operarios entrenados.
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-800">
                          Fase 3: Automatización Avanx
                        </td>
                        <td className="p-3">4 Semanas</td>
                        <td className="p-3">
                          Middleware de exportación/importación programada de
                          lotes e inventarios con el servidor local de Avanx.
                        </td>
                        <td className="p-3">Soporte de IT del ERP Avanx.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
        </main>

        {/* --- PIE DE PÁGINA --- */}
        <footer className="bg-slate-900 text-white mt-12 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400">
            <p className="mb-4 md:mb-0">
              © {new Date().getFullYear()} Bon Marché S.A.S. Todos los derechos
              reservados.
            </p>
            <div className="flex space-x-6">
              <span className="hover:text-white cursor-pointer">
                Pereira, Risaralda
              </span>
              <span className="hover:text-white cursor-pointer">
                Soporte Tecnológico Planta
              </span>
              <span className="hover:text-white cursor-pointer">
                Manual de Calidad INVIMA
              </span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
