# 🛡️ Lima Safe – Ruta Segura en San Miguel, Lima


> Una app web interactiva que calcula rutas seguras en San Miguel, Lima, combinando distancia y peligrosidad usando el algoritmo de Dijkstra.

---

## 🚶‍♀️ ¿Qué es Lima Safe?

**Lima Safe** es una aplicación que te permite calcular rutas seguras dentro del distrito de **San Miguel (Lima, Perú)**, considerando no solo la distancia sino también un índice de **peligrosidad por intersección**. 

Con una interfaz limpia e interactiva, puedes elegir tu origen y destino sobre un mapa, ajustar tu nivel de prioridad entre *seguridad* y *distancia*, y ver rutas optimizadas en tiempo real.

---

## ✨ Características principales

- 📍 Visualización de intersecciones y calles en Google Maps
- 🧠 Algoritmo de **Dijkstra** con opción de **Min-Heap**
- ⚖️ Control deslizante para elegir entre "Ruta más corta" o "Ruta más segura"
- 🧾 Estadísticas detalladas por ruta: distancia, riesgo, nodos, tiempo
- ⚙️ Lógica completamente en el cliente (no se suben datos)
- 💡 Comparación en vivo entre algoritmos

---

## 🧠 ¿Cómo se calcula la seguridad?

Cada calle/intersección tiene un índice de peligrosidad del 1 al 5.  
El coste de una ruta se calcula como:
coste = longitud * (1 - w) + peligrosidad * w
donde `w` es el valor elegido por el usuario (0 = solo distancia, 1 = solo seguridad).

---

## 🛠️ Tecnologías usadas

- **Frontend:** Next.js 15, React 18, TypeScript
- **UI:** Tailwind CSS, Radix UI, Lucide React
- **Mapas:** Google Maps API (via `@vis.gl/react-google-maps`)
- **Algoritmos:** Implementación personalizada de Dijkstra y MinHeap
- **Datos:** JSON con intersecciones reales de San Miguel

---

## 🚀 ¿Cómo correrlo localmente?

```bash
git clone https://github.com/Lume03/lima_safe.git
cd lima_safe

npm install
cp .env.example .env.local  # Agrega tu API key de Google Maps
npm run dev                 # Corre en localhost:9002

🌟 ¿Por qué es útil?
Porque en ciudades como Lima, la ruta más corta no siempre es la más segura.

Este proyecto busca ser una prueba de concepto y una herramienta de visualización que inspire a integrar datos abiertos, crimen y movilidad urbana en decisiones cotidianas.


