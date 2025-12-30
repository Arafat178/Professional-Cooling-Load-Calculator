/* Professional Cooling Load Calculator 
    Reference: "Cooling Load Calculation Guide: ASHRAE Standards & Methods" PDF
*/

// CONSTANTS from ASHRAE Fundamentals
const AIR_DENSITY = 1.204; // kg/m3 [cite: 3835]
const AIR_CP = 1005; // J/kg.K [cite: 3836]
const LATENT_HEAT_VAP = 2450000; // (h_fg) J/kg [cite: 3836]

// Metabolic Rates (W/person) [cite: 3760-3762]
const METABOLIC_RATES = {
    'office': { sens: 70, lat: 45 },
    'retail': { sens: 75, lat: 55 }, // Approx from similar standards
    'gym': { sens: 210, lat: 315 }   // Athletics
};

function calculateLoad() {
    // 1. INPUTS
    // Space
    const area = parseFloat(document.getElementById('area_floor').value);
    const height = parseFloat(document.getElementById('height_room').value);
    const volume = area * height; // [cite: 3901]
    const Ti = parseFloat(document.getElementById('temp_in').value);
    const To = parseFloat(document.getElementById('temp_out').value);
    const dT = To - Ti; // [cite: 3812]
    const dw = parseFloat(document.getElementById('delta_w').value);

    // Envelope Areas & U-Values
    const wallArea = parseFloat(document.getElementById('area_walls').value);
    const wallU = parseFloat(document.getElementById('u_walls').value);
    // --- NEW: Door Inputs ---
    const doorArea = parseFloat(document.getElementById('area_door').value) || 0;
    const doorU = parseFloat(document.getElementById('u_door').value) || 0;

    const roofArea = parseFloat(document.getElementById('area_roof').value);
    const roofU = parseFloat(document.getElementById('u_roof').value);
    const glassArea = parseFloat(document.getElementById('area_glass').value);
    const glassU = parseFloat(document.getElementById('u_glass').value);

    // Solar
    const solarI = parseFloat(document.getElementById('solar_intensity').value);
    const shgc = parseFloat(document.getElementById('shgc').value);
    const sc = parseFloat(document.getElementById('sc').value);

    // Internals
    const nPeople = parseFloat(document.getElementById('n_people').value);
    const actLevel = document.getElementById('activity_level').value;
    const lightDens = parseFloat(document.getElementById('dens_light').value);
    const equipDens = parseFloat(document.getElementById('dens_equip').value);

    // Airflow
    const ventPerPerson = parseFloat(document.getElementById('vent_rate').value);
    const ach = parseFloat(document.getElementById('inf_ach').value);
    const sf = parseFloat(document.getElementById('safety_factor').value);

    // 2. CALCULATIONS

    let report = [];
    let totalSensible = 0;
    let totalLatent = 0;

    // --- A. TRANSMISSION (Sensible) [cite: 3807] ---
    // Q = U * A * dT
    const q_wall = wallU * wallArea * dT;
    const q_door = doorU * doorArea * dT;
    const q_roof = roofU * roofArea * dT;
    const q_glass_cond = glassU * glassArea * dT;
    
    report.push({name: "Walls (Trans)", sens: q_wall, lat: 0});
    report.push({name: "Doors (Trans)", sens: q_door, lat: 0});
    report.push({name: "Roof (Trans)", sens: q_roof, lat: 0});
    report.push({name: "Glass (Trans)", sens: q_glass_cond, lat: 0});

    // --- B. SOLAR GAIN (Sensible)  ---
    // Q = A * I * SHGC * SC
    const q_solar = glassArea * solarI * shgc * sc;
    report.push({name: "Glass (Solar)", sens: q_solar, lat: 0});

    // --- C. INTERNAL GAINS [cite: 3752, 3765, 3776] ---
    // People
    const peopleRates = METABOLIC_RATES[actLevel];
    const q_p_sens = nPeople * peopleRates.sens;
    const q_p_lat = nPeople * peopleRates.lat;
    report.push({name: "People", sens: q_p_sens, lat: q_p_lat});

    // Lights (P * A)
    const q_lights = lightDens * area;
    report.push({name: "Lighting", sens: q_lights, lat: 0});

    // Equipment (P * A)
    const q_equip = equipDens * area;
    report.push({name: "Equipment", sens: q_equip, lat: 0});

    // --- D. VENTILATION [cite: 3830, 3832] ---
    // Flow rate in m3/s
    // Input is L/s per person -> (N * L/s) / 1000
    const ventFlow_m3s = (nPeople * ventPerPerson) / 1000;
    
    // Sensible: V * rho * cp * dT
    const q_vent_sens = ventFlow_m3s * AIR_DENSITY * AIR_CP * dT;
    // Latent: V * rho * hfg * dw
    const q_vent_lat = ventFlow_m3s * AIR_DENSITY * LATENT_HEAT_VAP * dw;
    
    report.push({name: "Ventilation", sens: q_vent_sens, lat: q_vent_lat});

    // --- E. INFILTRATION [cite: 3848] ---
    // Flow rate = (ACH * Vol) / 3600
    const infFlow_m3s = (ach * volume) / 3600;

    const q_inf_sens = infFlow_m3s * AIR_DENSITY * AIR_CP * dT;
    const q_inf_lat = infFlow_m3s * AIR_DENSITY * LATENT_HEAT_VAP * dw;

    report.push({name: "Infiltration", sens: q_inf_sens, lat: q_inf_lat});

    // 3. SUMMATION & SAFETY FACTOR
    report.forEach(item => {
        totalSensible += item.sens;
        totalLatent += item.lat;
    });

    const grandTotal = totalSensible + totalLatent;
    const designTotal = grandTotal * sf; // 
    
    // 4. METRICS
    const tons = designTotal / 3517; // 
    const loadDensity = grandTotal / area; // [cite: 4072]
    const shr = totalSensible / grandTotal; // [cite: 4056]
    
    // Airflow Req (CFM) based on sensible load
    // CFM = Sensible / (1.08 * dT_supply_F) -> metric approx: Q / (rho*cp*dT_supply)
    // Assuming 10C supply diff
    const airFlowReq_m3s = totalSensible / (AIR_DENSITY * AIR_CP * 10);
    const airFlowCFM = airFlowReq_m3s * 2118.88; // [cite: 3890]

    // 5. RENDER
    renderResults(report, totalSensible, totalLatent, grandTotal, designTotal, tons, loadDensity, shr, airFlowCFM);
}

function renderResults(report, sens, lat, tot, design, tons, dens, shr, cfm) {
    const tbody = document.getElementById('result_body');
    tbody.innerHTML = '';

    report.forEach(row => {
        const rowTot = row.sens + row.lat;
        tbody.innerHTML += `
            <tr>
                <td>${row.name}</td>
                <td>${row.sens.toFixed(0)}</td>
                <td>${row.lat.toFixed(0)}</td>
                <td><b>${rowTot.toFixed(0)}</b></td>
            </tr>
        `;
    });

    document.getElementById('sum_sens').innerText = sens.toFixed(0);
    document.getElementById('sum_lat').innerText = lat.toFixed(0);
    document.getElementById('sum_tot').innerText = tot.toFixed(0);
    
    // Design Load
    document.getElementById('design_tot').innerText = design.toFixed(0) + " W";
    document.getElementById('res_kw').innerText = (design / 1000).toFixed(1) + " kW";
    document.getElementById('res_tons').innerText = tons.toFixed(1) + " Tons";

    // Metrics
    document.getElementById('res_density').innerText = dens.toFixed(0);
    document.getElementById('res_shr').innerText = shr.toFixed(2);
    document.getElementById('res_cfm').innerText = cfm.toFixed(0);
}

// Modal Logic
function openModal() { document.getElementById('theoryModal').style.display = 'block'; }
function closeModal() { document.getElementById('theoryModal').style.display = 'none'; }
window.onclick = function(event) {
    if (event.target == document.getElementById('theoryModal')) closeModal();
}