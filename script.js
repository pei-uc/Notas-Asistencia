
/* =========================
   UTILIDADES
========================= */

const grid = document.getElementById("grid");

function formatearNumero(num){
  return Number.isInteger(num) ? num : num.toFixed(1);
}

/* =========================
   INICIALIZACIÓN
========================= */

cargarDatos();
actualizarBotonesAgregar();
activarEnterVertical();

/* =========================
   SISTEMA DE NOTAS
========================= */

function crearRamo(nombre){
  const card = document.createElement("div");
  card.className = "card";
  card.draggable = true;

  card.innerHTML = `
    <div class="menu-container">
      <button class="menu-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="7" cy="7" r="2"></circle>
          <circle cx="17" cy="7" r="2"></circle>
          <circle cx="7" cy="17" r="2"></circle>
          <circle cx="17" cy="17" r="2"></circle>
        </svg>
      </button>
      <div class="menu-dropdown">
        <div class="menu-item reiniciar">Reiniciar ramo</div>
        <div class="menu-item eliminar">Eliminar ramo</div>
      </div>
    </div>

    <input class="ramo-titulo" value="${nombre}">

    <table>
      <thead>
        <tr>
          <th>Evaluación</th>
          <th>%</th>
          <th>Nota</th>
          <th></th>
        </tr>
      </thead>

      <tbody class="evaluaciones"></tbody>

      <tfoot>
        <tr>
          <td><strong>Total</strong></td>
          <td class="total-porcentaje">0%</td>
          <td>
            <span class="nota-final">0</span>
            <div class="mensaje-reescala"></div>
          </td>
          <td></td>
        </tr>
      </tfoot>
    </table>

    <button class="add-btn">+ Añadir evaluación</button>
  `;

  const menuBtn = card.querySelector(".menu-btn");
  const dropdown = card.querySelector(".menu-dropdown");

  menuBtn.addEventListener("click",(e)=>{
    e.stopPropagation();

    document.querySelectorAll(".menu-dropdown").forEach(d=>{
      if(d!==dropdown) d.style.display="none";
    });

    dropdown.style.display =
      dropdown.style.display==="block" ? "none" : "block";
  });

  document.addEventListener("click",()=>{
    dropdown.style.display="none";
  });

  card.querySelector(".eliminar").addEventListener("click",()=>{
    const nombreRamo = card.querySelector(".ramo-titulo")?.value || "este ramo";
    const confirmar = confirm(`¿Estás seguro de que quieres eliminar ${nombreRamo}?`);

    if(confirmar){
      card.remove();
      guardarDatos();
      actualizarBotonesAgregar();
    }
  });

  card.querySelector(".reiniciar").addEventListener("click",()=>{

    const nombreRamo = card.querySelector(".ramo-titulo")?.value || "este ramo";
    const confirmar = confirm(`¿Estás seguro de que quieres reiniciar ${nombreRamo}?`);

    if(!confirmar) return;

    const tbody = card.querySelector(".evaluaciones");
    tbody.innerHTML="";

    for(let j=1;j<=4;j++){
      tbody.appendChild(crearEvaluacion(j,card));
    }

    card.querySelector(".ramo-titulo").value="Ramo";

    calcular(card);
    actualizarTotalPorcentaje(card);
    guardarDatos();

  });

  const tbody = card.querySelector(".evaluaciones");

  for(let j=1;j<=4;j++){
    tbody.appendChild(crearEvaluacion(j,card));
  }

  card.querySelector(".add-btn").addEventListener("click",()=>{
    tbody.appendChild(crearEvaluacion(tbody.children.length+1,card));
    actualizarTotalPorcentaje(card);
    guardarDatos();
  });

  card.querySelector(".ramo-titulo").addEventListener("input",guardarDatos);

  actualizarTotalPorcentaje(card);
  calcular(card);

  return card;
}

/* =========================
   CREAR EVALUACION
========================= */

function crearEvaluacion(numero,card){

  const tr=document.createElement("tr");

  tr.innerHTML=`
    <td><input class="eval-nombre" value="Evaluación ${numero}"></td>
    <td><input type="number" class="porcentaje"></td>
    <td><input type="number" class="nota"></td>
    <td>
      <button class="delete-btn">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6l-1 14H6L5 6"></path>
          <path d="M10 11v6"></path>
          <path d="M14 11v6"></path>
          <path d="M9 6V4h6v2"></path>
        </svg>
      </button>
    </td>
  `;

  tr.querySelectorAll(".porcentaje,.nota,.eval-nombre").forEach(input=>{
    input.addEventListener("input",()=>{
      calcular(card);
      actualizarTotalPorcentaje(card);
      guardarDatos();
    });
  });

  tr.querySelector(".delete-btn").addEventListener("click",()=>{

    const tbody=tr.parentElement;

    tr.remove();

    renumerar(tbody);

    calcular(card);
    actualizarTotalPorcentaje(card);
    guardarDatos();

  });

  return tr;

}

/* =========================
   RENUMERAR
========================= */

function renumerar(tbody){

  const filas=tbody.querySelectorAll("tr");

  filas.forEach((fila,index)=>{

    const input=fila.querySelector(".eval-nombre");
    const nombreActual=input.value.trim();

    const esAutomatico=/^Evaluación \d+$/.test(nombreActual);

    if(esAutomatico){
      input.value=`Evaluación ${index+1}`;
    }

  });

}

/* =========================
   CALCULAR NOTA FINAL
========================= */

function calcular(card){

  const porcentajes=card.querySelectorAll(".porcentaje");
  const notas=card.querySelectorAll(".nota");
  const notaFinal=card.querySelector(".nota-final");
  const mensaje=card.querySelector(".mensaje-reescala");

  if(!notaFinal) return;

  let sumaPonderada=0;
  let totalPorcentaje=0;
  let tablaCompleta=true;

  for(let i=0;i<notas.length;i++){

    const pValue=porcentajes[i].value;
    const nValue=notas[i].value;

    const p=parseFloat(pValue);
    const n=parseFloat(nValue);

    if(pValue===""||nValue===""){
      tablaCompleta=false;
    }

    if(!isNaN(n)){
      notas[i].style.color=n>=40 ? "#0a8f3c" : "#c40000";
    }else{
      notas[i].style.color="";
    }

    if(!isNaN(n)&&!isNaN(p)){
      sumaPonderada+=n*(p/100);
      totalPorcentaje+=p;
    }

  }

  let notaCalculada=0;
  let seReescala=false;

  if(totalPorcentaje>0){

    if(tablaCompleta&&totalPorcentaje<100){
      notaCalculada=sumaPonderada/(totalPorcentaje/100);
      seReescala=true;
    }else{
      notaCalculada=sumaPonderada;
    }

  }

  notaFinal.textContent=formatearNumero(notaCalculada);
  notaFinal.style.color=notaCalculada>=40 ? "#0a8f3c" : "#c40000";

  if(seReescala){
    mensaje.textContent="Promedio re-escalado";
    mensaje.style.fontSize="12px";
    mensaje.style.color="#666";
    mensaje.style.marginTop="4px";
  }else{
    mensaje.textContent="";
  }

}

/* =========================
   CALCULAR PORCENTAJE TOTAL
========================= */

function actualizarTotalPorcentaje(card){

  const porcentajes=card.querySelectorAll(".porcentaje");
  const totalBox=card.querySelector(".total-porcentaje");

  if(!totalBox) return;

  let total=0;

  porcentajes.forEach(input=>{
    const p=parseFloat(input.value);
    if(!isNaN(p)) total+=p;
  });

  totalBox.textContent=formatearNumero(total)+"%";

  if(total>=99.9 && total<=100.1){
    totalBox.style.color="#0a8f3c";
  }else{
    totalBox.style.color="#c40000";
  }

}

/* =========================
   PERSISTENCIA
========================= */

function guardarDatos(){

  const ramos=[];

  grid.querySelectorAll(".card:not(.add-ramo-card)").forEach(card=>{

    const ramo={
      titulo:card.querySelector(".ramo-titulo")?.value || "",
      evaluaciones:[]
    };

    card.querySelectorAll("tbody tr").forEach(tr=>{

      ramo.evaluaciones.push({
        nombre:tr.querySelector(".eval-nombre")?.value || "",
        porcentaje:tr.querySelector(".porcentaje")?.value || "",
        nota:tr.querySelector(".nota")?.value || ""
      });

    });

    ramos.push(ramo);

  });

  localStorage.setItem("calculadoraRamos",JSON.stringify(ramos));

}

function cargarDatos(){

  const datosGuardados=localStorage.getItem("calculadoraRamos");

  grid.innerHTML="";

  if(!datosGuardados){

    for(let i=1;i<=5;i++){
      const card=crearRamo(`Ramo ${i}`);
      grid.appendChild(card);
    }

    guardarDatos();
    return;

  }

  const ramos=JSON.parse(datosGuardados);

  if(ramos.length===0){

    for(let i=1;i<=5;i++){
      const card=crearRamo(`Ramo ${i}`);
      grid.appendChild(card);
    }

    guardarDatos();
    return;

  }

  ramos.forEach(ramo=>{

    const card=crearRamo(ramo.titulo);
    const tbody=card.querySelector(".evaluaciones");

    tbody.innerHTML="";

    ramo.evaluaciones.forEach((ev,index)=>{

      const tr=crearEvaluacion(index+1,card);

      tr.querySelector(".eval-nombre").value=ev.nombre;
      tr.querySelector(".porcentaje").value=ev.porcentaje;
      tr.querySelector(".nota").value=ev.nota;

      tbody.appendChild(tr);

    });

    grid.appendChild(card);

    calcular(card);
    actualizarTotalPorcentaje(card);

  });

}

/* =========================
   BOTON + RAMO
========================= */

function crearBotonAgregarRamo(){

  const btnCard=document.createElement("div");
  btnCard.className="card add-ramo-card";

  btnCard.innerHTML=`<button class="add-ramo-btn">+</button>`;

  btnCard.querySelector(".add-ramo-btn").addEventListener("click",()=>{

    const nuevo=crearRamo("Nuevo Ramo");

    grid.insertBefore(nuevo,btnCard);

    guardarDatos();

  });

  return btnCard;

}

function actualizarBotonesAgregar(){

  document.querySelectorAll(".add-ramo-card").forEach(el=>el.remove());

  grid.appendChild(crearBotonAgregarRamo());

}

/* =========================
   ENTER VERTICAL
========================= */

function activarEnterVertical(){

  document.addEventListener("keydown",function(e){

    if(e.key!=="Enter") return;

    const active=document.activeElement;

    if(!active.matches(".porcentaje,.nota,.eval-nombre,.ramo-titulo")) return;

    e.preventDefault();

    if(active.classList.contains("ramo-titulo")){

      const nextCard=active.closest(".card").nextElementSibling;

      if(nextCard && !nextCard.classList.contains("add-ramo-card")){
        nextCard.querySelector(".ramo-titulo").focus();
      }

      return;

    }

    const td=active.closest("td");
    const tr=active.closest("tr");
    const tbody=tr.parentElement;

    const columnIndex=[...tr.children].indexOf(td);

    const filas=[...tbody.querySelectorAll("tr")];
    const rowIndex=filas.indexOf(tr);

    const nextRow=filas[rowIndex+1];

    if(nextRow){

      const nextInput=nextRow.children[columnIndex].querySelector("input");

      if(nextInput){
        nextInput.focus();
        nextInput.select();
      }

    }

  });

}

/* =========================
   INTERFAZ / TABS
========================= */

const infoBtn=document.getElementById("infoBtn");
const infoPanel=document.getElementById("infoPanel");

infoBtn.addEventListener("click",()=>{
  infoPanel.classList.toggle("active");
});

const tabs=document.querySelectorAll(".tab-btn");
const contents=document.querySelectorAll(".tab-content");
const indicator=document.querySelector(".tab-indicator");

function moveIndicator(el){

  const rect=el.getBoundingClientRect();
  const parentRect=el.parentElement.getBoundingClientRect();

  indicator.style.width=rect.width+"px";
  indicator.style.left=(rect.left-parentRect.left)+"px";

}

tabs.forEach(btn=>{

  btn.addEventListener("click",()=>{

    tabs.forEach(b=>b.classList.remove("active"));
    contents.forEach(c=>c.classList.remove("active"));

    btn.classList.add("active");

    const tabId=btn.getAttribute("data-tab");

    document.getElementById(tabId).classList.add("active");

    moveIndicator(btn);

  });

});

window.addEventListener("load",()=>{

  const active=document.querySelector(".tab-btn.active");

  if(active) moveIndicator(active);

});

/* =========================
   SISTEMA DE ASISTENCIA
========================= */

const asistenciaGrid=document.getElementById("asistenciaGrid");

if(asistenciaGrid){

  cargarAsistencia();

  if(asistenciaGrid.children.length===0){

    for(let i=1;i<=5;i++){
      asistenciaGrid.appendChild(crearRamoAsistencia("Ramo "+i));
    }

    guardarAsistencia();

  }

  actualizarBotonAgregarAsistencia();

}

/* ===== GUARDAR ASISTENCIA ===== */

function guardarAsistencia(){

  const ramos=[];

  document.querySelectorAll("#asistenciaGrid .card:not(.add-ramo-card)").forEach(card=>{

    const ramo={

      titulo:card.querySelector(".ramo-titulo").value,
      clases:card.querySelector(".clases").value,
      faltas:card.querySelector(".faltas").value,
      requerido:card.querySelector(".porcentaje-apr").value

    };

    ramos.push(ramo);

  });

  localStorage.setItem("asistenciaRamos",JSON.stringify(ramos));

}

/* ===== CARGAR ASISTENCIA ===== */

function cargarAsistencia(){

  const datosGuardados=localStorage.getItem("asistenciaRamos");

  if(!datosGuardados) return;

  const ramos=JSON.parse(datosGuardados);

  asistenciaGrid.innerHTML="";

  ramos.forEach(ramo=>{

    const card=crearRamoAsistencia(ramo.titulo);

    card.querySelector(".clases").value=ramo.clases;
    card.querySelector(".faltas").value=ramo.faltas || 0;
    card.querySelector(".porcentaje-apr").value=ramo.requerido;

    asistenciaGrid.appendChild(card);

    card.querySelector(".clases").dispatchEvent(new Event("input"));

  });

}

/* =========================
   CREAR RAMO ASISTENCIA
========================= */

function crearRamoAsistencia(nombre){

const card=document.createElement("div");
card.className="card";
card.draggable = true;

card.innerHTML=`

<input class="ramo-titulo" value="${nombre}">

<div class="menu-container">

<button class="menu-btn">
<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
<circle cx="7" cy="7" r="2"></circle>
<circle cx="17" cy="7" r="2"></circle>
<circle cx="7" cy="17" r="2"></circle>
<circle cx="17" cy="17" r="2"></circle>
</svg>
</button>

<div class="menu-dropdown">

<div class="menu-item reiniciar">
Reiniciar ramo
</div>

<div class="menu-item eliminar">
Eliminar ramo
</div>

</div>
</div>

<table>
<thead>
<tr>
<th>Clases</th>
<th>% Req</th>
<th>Faltas</th>
<th>Asistencia</th>
</tr>
</thead>

<tbody>
<tr>

<td>
<input type="number" class="clases">
</td>

<td>
<input type="number" class="porcentaje-apr">
</td>

<td>
<input type="number" class="faltas" value="0">
</td>

<td>
<span class="resultado">0%</span>
<div class="faltas-restantes"></div>
</td>

</tr>
</tbody>
</table>

`;

const clases=card.querySelector(".clases");
const faltas=card.querySelector(".faltas");
const requerido=card.querySelector(".porcentaje-apr");
const resultado=card.querySelector(".resultado");
const faltasRestantes = card.querySelector(".faltas-restantes");

/* ===== GUARDAR TITULO ===== */

card.querySelector(".ramo-titulo").addEventListener("input",guardarAsistencia);

/* ===== MENU ===== */

const menuBtn = card.querySelector(".menu-btn");
const dropdown = card.querySelector(".menu-dropdown");

menuBtn.addEventListener("click",(e)=>{

e.stopPropagation();

document.querySelectorAll(".menu-dropdown").forEach(d=>{
if(d!==dropdown)d.style.display="none";
});

dropdown.style.display=
dropdown.style.display==="block"?"none":"block";

});

document.addEventListener("click",()=>{
dropdown.style.display="none";
});

card.querySelector(".eliminar").addEventListener("click",()=>{

const nombreRamo=
card.querySelector(".ramo-titulo")?.value || "este ramo";

const confirmar=
confirm(`¿Estás seguro de que quieres eliminar ${nombreRamo}?`);

if(confirmar){
card.remove();
guardarAsistencia();
actualizarBotonAgregarAsistencia();
}

});

card.querySelector(".reiniciar").addEventListener("click",()=>{

const nombreRamo=
card.querySelector(".ramo-titulo")?.value || "este ramo";

const confirmar=
confirm(`¿Estás seguro de que quieres reiniciar ${nombreRamo}?`);

if(!confirmar) return;

card.querySelector(".ramo-titulo").value = "Ramo";

clases.value="";
faltas.value="0";
requerido.value="";
resultado.textContent="0%";
resultado.style.color="";
faltasRestantes.textContent="";

guardarAsistencia();

});

/* ===== CALCULO ===== */

function calcularAsistencia(){

const c=parseFloat(clases.value);
const f=parseFloat(faltas.value) || 0;
const r=parseFloat(requerido.value);

if(isNaN(c)||c===0){

resultado.textContent="0%";
faltasRestantes.textContent="";
return;

}

const asistencia=((c-f)/c)*100;

if(!isNaN(r)){

const faltasMaximas = Math.floor(c*(100-r)/100);
const restantes = faltasMaximas - f;

if(restantes > 0){

if(restantes === 1){
faltasRestantes.textContent = "Puedes faltar 1 clase más";
}

else{
faltasRestantes.textContent = "Puedes faltar " + restantes + " clases más";
}

faltasRestantes.style.color = "#666";

}

else if(restantes === 0){
faltasRestantes.textContent = "No puedes faltar más";
faltasRestantes.style.color = "#c47a00";
}

else{
faltasRestantes.textContent = "Ya superaste el límite de faltas";
faltasRestantes.style.color = "#c40000";
}

}

resultado.textContent=formatearNumero(asistencia)+"%";

if(!isNaN(r)){

resultado.style.color=
asistencia>=r ? "#0a8f3c" : "#c40000";

}

}

/* ===== INPUTS ===== */

clases.addEventListener("input",()=>{
calcularAsistencia();
guardarAsistencia();
});

faltas.addEventListener("input",()=>{
calcularAsistencia();
guardarAsistencia();
});

requerido.addEventListener("input",()=>{
calcularAsistencia();
guardarAsistencia();
});

return card;

}

/* =========================
   BOTON AGREGAR RAMO ASISTENCIA
========================= */

function crearBotonAgregarRamoAsistencia(){

const btnCard=document.createElement("div");
btnCard.className="card add-ramo-card";

btnCard.innerHTML=`<button class="add-ramo-btn">+</button>`;

btnCard.querySelector(".add-ramo-btn").addEventListener("click",()=>{

asistenciaGrid.insertBefore(
crearRamoAsistencia("Nuevo Ramo"),
btnCard
);

guardarAsistencia();
actualizarBotonAgregarAsistencia();

});

return btnCard;

}

function actualizarBotonAgregarAsistencia(){

asistenciaGrid
.querySelectorAll(".add-ramo-card")
.forEach(el=>el.remove());

asistenciaGrid.appendChild(
crearBotonAgregarRamoAsistencia()
);

}

const infoBtnAsistencia = document.getElementById("infoBtnAsistencia");
const infoPanelAsistencia = document.getElementById("infoPanelAsistencia");

if(infoBtnAsistencia){
  infoBtnAsistencia.addEventListener("click", () => {
    infoPanelAsistencia.classList.toggle("active");
  });
}

/* =========================
   DRAG & DROP
========================= */

activarDrag(grid);
activarDrag(asistenciaGrid);

function activarDrag(container){

if(!container) return;

let dragged = null;

container.addEventListener("dragstart", e => {

if(e.target.closest("input, button, table")) {
  e.preventDefault();
  return;
}

const card = e.target.closest(".card");

if(!card || card.classList.contains("add-ramo-card")) return;

dragged = card;
card.classList.add("dragging");

});

container.addEventListener("dragend", () => {

if(dragged){
dragged.classList.remove("dragging");
dragged = null;

guardarDatos();
guardarAsistencia();
actualizarBotonesAgregar();
actualizarBotonAgregarAsistencia();
}

});

container.addEventListener("dragenter", e => {

const target = e.target.closest(".card");

if(!target) return;
if(!dragged) return;
if(target === dragged) return;
if(target.classList.contains("add-ramo-card")) return;

const cards = [...container.querySelectorAll(".card:not(.add-ramo-card)")];

const draggedIndex = cards.indexOf(dragged);
const targetIndex = cards.indexOf(target);

if(draggedIndex < targetIndex){
container.insertBefore(dragged, target.nextSibling);
}else{
container.insertBefore(dragged, target);
}

});

}

/* =========================
   PERMITIR SELECCIONAR TEXTO
========================= */

document.addEventListener("mousedown",(e)=>{

const card = e.target.closest(".card");

if(!card) return;

if(e.target.closest("input, textarea")){
card.draggable = false;
}

});

document.addEventListener("mouseup",()=>{

document.querySelectorAll(".card").forEach(card=>{
card.draggable = true;
});

});

/* =========================
   SWIPE ENTRE TABS
========================= */

let swipeStartX = 0;
let swipeStartY = 0;

const swipeZones = document.querySelectorAll(".tab-content");

swipeZones.forEach(zone => {

zone.addEventListener("touchstart", (e) => {
  swipeStartX = e.touches[0].clientX;
  swipeStartY = e.touches[0].clientY;
}, { passive: true });

zone.addEventListener("touchend", (e) => {

  const endX = e.changedTouches[0].clientX;
  const endY = e.changedTouches[0].clientY;

  const diffX = endX - swipeStartX;
  const diffY = endY - swipeStartY;

  if(Math.abs(diffX) < 80) return;
  if(Math.abs(diffX) < Math.abs(diffY)) return;

  const active = document.querySelector(".tab-btn.active");
  if(!active) return;

  if(diffX < 0){
    const next = active.nextElementSibling;
    if(next && next.classList.contains("tab-btn")){
      next.click();
    }
  }

  if(diffX > 0){
    const prev = active.previousElementSibling;
    if(prev && prev.classList.contains("tab-btn")){
      prev.click();
    }
  }

}, { passive: true });

});
