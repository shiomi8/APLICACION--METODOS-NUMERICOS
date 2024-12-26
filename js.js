document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("pipelineForm");
    const addPipelineBtn = document.getElementById("addPipeline");
    const pipelineInputs = document.getElementById("pipelineInputs");
    const resultsDiv = document.getElementById("results");
    const resultsList = document.getElementById("resultsList");

    let pipelineCount = 0;

 
    addPipelineBtn.addEventListener("click", () => {
        pipelineCount++;
        const pipelineDiv = document.createElement("div");
        pipelineDiv.classList.add("form-group");
        pipelineDiv.innerHTML = `
            <h4>Tubería ${pipelineCount}</h4>
            <label for="L${pipelineCount}">Longitud (m):</label>
            <input type="number" id="L${pipelineCount}" step="0.01" required>

            <label for="D${pipelineCount}">Diámetro (m):</label>
            <input type="number" id="D${pipelineCount}" step="0.01" required>

            <label for="f${pipelineCount}">Factor de fricción:</label>
            <input type="number" id="f${pipelineCount}" step="0.001" required>

            <label for="Q${pipelineCount}">Caudal inicial (m³/s):</label>
            <input type="number" id="Q${pipelineCount}" step="0.01" required>
        `;
        pipelineInputs.appendChild(pipelineDiv);
    });

    
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const caudalTotal = parseFloat(document.getElementById("caudalTotal").value);
        const tuberias = [];

        for (let i = 1; i <= pipelineCount; i++) {
            const L = parseFloat(document.getElementById(`L${i}`).value);
            const D = parseFloat(document.getElementById(`D${i}`).value);
            const f = parseFloat(document.getElementById(`f${i}`).value);
            const Q = parseFloat(document.getElementById(`Q${i}`).value);

            tuberias.push({ L, D, f, Q });
        }

        const resultados = calcularCaudales(caudalTotal, tuberias);
        mostrarResultados(resultados);
    });

    function calcularCaudales(caudalTotal, tuberias) {
        const iteracionesMax = 1000;
        const tolerancia = 1e-6;

        function perdidaEnergia(L, D, f, Q) {
            if (Q === 0) return 0;
            return f * (L / D) * (8 * Q ** 2 / (Math.PI ** 2 * 9.81 * D ** 5));
        }

        for (let iteracion = 0; iteracion < iteracionesMax; iteracion++) {
            const perdidas = tuberias.map(t => perdidaEnergia(t.L, t.D, t.f, t.Q));
            const promedioPerdidas = perdidas.reduce((a, b) => a + b, 0) / tuberias.length;

            let cambios = [];
            tuberias.forEach((t, i) => {
                if (perdidas[i] !== 0) {
                    const ajuste = t.Q * Math.sqrt(promedioPerdidas / perdidas[i]);
                    cambios.push(Math.abs(ajuste - t.Q));
                    t.Q = ajuste;
                }
            });

            const sumaQ = tuberias.reduce((sum, t) => sum + t.Q, 0);
            const factorAjuste = caudalTotal / sumaQ;
            tuberias.forEach(t => t.Q *= factorAjuste);

            if (Math.max(...cambios) < tolerancia) {
                return tuberias;
            }
        }

        return tuberias;
    }

    function mostrarResultados(tuberias) {
        resultsList.innerHTML = "";
        tuberias.forEach((t, index) => {
            const li = document.createElement("li");
            li.textContent = `Tubería ${index + 1}: Q = ${t.Q.toFixed(6)} m³/s`;
            resultsList.appendChild(li);
        });
        resultsDiv.classList.remove("hidden");
    }
});
