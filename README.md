# ❄️ Professional Cooling Load Estimator

A precise, web-based engineering tool for calculating building cooling loads. This application utilizes the **ASHRAE Heat Balance / TETD Method**, focusing on direct temperature differences ($\Delta T$) for transmission and specific solar gain equations for fenestration.

The user interface is designed with a professional **"Bangladesh Theme"**, utilizing the national flag's bottle green and red palette for a distinct, localized identity.

🔗 **[Live Demo]([https://arafat178.github.io/Professional-Cooling-Load-Calculator/]** 

---

## Key Features

* **Dynamic U-Value Calculation:** Automatically computes U-values based on user-defined brick and plaster thickness ($R = L/k$) for walls.
* **Precise Solar Gain:** Calculates solar radiation through glass using Solar Intensity, Solar Heat Gain Coefficient (SHGC), and Shading Coefficients (SC).
* **Detailed Transmission:** Separate calculations for Walls, Roofs, and Doors (Wood, PVC, Steel) using direct $\Delta T$.
* **Psychrometric Analysis:** Computes both Sensible and Latent heat gains for Ventilation and Infiltration based on Air Changes Per Hour (ACH) or L/s per person.
* **Professional UI:** * Responsive Grid Layout.
    * **🇧🇩 Bangladesh-Themed** Color Palette (Bottle Green & Red).
    * Interactive "Theory" Modal for educational reference.
* **Comprehensive Reporting:** Generates a detailed breakdown of Sensible vs. Latent loads and converts total heat to **Tonnage (TR)**.

---

## Technology Stack

* **HTML5:** Semantic structure for engineering inputs.
* **CSS3:** Custom properties (variables) for the specific color theme, Flexbox/Grid for layout, and responsive design for mobile compatibility.
* **JavaScript (ES6+):** Modular functions for thermal calculations, DOM manipulation, and dynamic result rendering.

---

## Engineering Methodology

This calculator strictly follows the **ASHRAE Standards & Methods** guide.

### 1. Transmission Heat Gain (Walls, Roof, Doors)
Instead of the simplified CLTD table method, this tool uses the direct heat transfer equation based on the temperature differential:
$$Q = U \times A \times (T_{out} - T_{in})$$
*Reference: ASHRAE Fundamentals Handbook*

### 2. Solar Heat Gain (Glass)
Solar energy entering through fenestration is calculated separately from conduction:
$$Q_{solar} = A \times I_{solar} \times SHGC \times SC$$
* **SHGC:** Solar Heat Gain Coefficient
* **SC:** Shading Coefficient
* **I:** Solar Intensity ($W/m^2$)

### 3. Internal Loads
* **People:** Split into Sensible and Latent heat based on activity level (e.g., Office: 75W Sensible / 55W Latent).
* **Lighting:** $Q = Watts \times BallastFactor \times CLF$
* **Equipment:** $Q = Watts \times UsageFactor$

### 4. Ventilation & Infiltration
Calculates the load required to treat outside air:
* **Sensible:** $Q_s = 1200 \times \dot{V} (m^3/s) \times \Delta T$
* **Latent:** $Q_l = 3010 \times 10^3 \times \dot{V} (m^3/s) \times \Delta \omega$
*(Where $\Delta \omega$ is the humidity ratio difference in kg/kg)*

---

## Project Structure

```text
/
├── index.html      # Main user interface and input forms
├── style.css       # Custom styling with Bangladesh color palette
├── script.js       # Core engineering logic and calculations
└── README.md       # Project documentation
