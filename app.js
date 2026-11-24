const $ = (id) => document.getElementById(id);
let currentSummary = "";
let quizData = [];
let quizIndex = 0;
let answers = [];

function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2400)}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function renderMarkdown(text){
  return text.split("\n").map(line=>{
    if(line.startsWith("### "))return `<h3>${escapeHtml(line.slice(4))}</h3>`;
    if(line.startsWith("## "))return `<h2>${escapeHtml(line.slice(3))}</h2>`;
    if(line.startsWith("- "))return `<li>${escapeHtml(line.slice(2))}</li>`;
    if(/^\d+\.\s/.test(line))return `<li>${escapeHtml(line.replace(/^\d+\.\s/,""))}</li>`;
    return line.trim()?`<p>${escapeHtml(line)}</p>`:"";
  }).join("").replace(/(<li>.*?<\/li>)+/gs,m=>`<ul>${m}</ul>`);
}
$("makeSummary").addEventListener("click",async()=>{
  const topic=$("topic").value.trim();if(!topic){toast("Escribí un tema para empezar.");$("topic").focus();return}
  const btn=$("makeSummary");btn.disabled=true;btn.textContent="Preparando tu resumen...";
  try{
    const response=await fetch("/.netlify/functions/study",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"summary",topic,level:$("level").value,length:$("length").value})});
    const data=await response.json();if(!response.ok)throw new Error(data.error||"No se pudo generar el resumen.");
    currentSummary=data.summary;$("resultTitle").textContent=topic;$("summaryOutput").innerHTML=renderMarkdown(currentSummary);
    $("results").classList.remove("hidden");$("quiz").classList.add("hidden");$("results").scrollIntoView({behavior:"smooth"});
  }catch(e){toast(e.message)}
  finally{btn.disabled=false;btn.innerHTML="<span>✦</span> Generar mi resumen"}
});
$("copySummary").addEventListener("click",async()=>{await navigator.clipboard.writeText(currentSummary);toast("Resumen copiado.")});
$("saveSummary").addEventListener("click",()=>{
  const saved=JSON.parse(localStorage.getItem("easystudy_saved")||"[]");saved.unshift({topic:$("resultTitle").textContent,summary:currentSummary,date:new Date().toLocaleDateString("es-AR")});localStorage.setItem("easystudy_saved",JSON.stringify(saved.slice(0,20)));renderSaved();toast("¡Resumen guardado!");
});
function renderSaved(){const saved=JSON.parse(localStorage.getItem("easystudy_saved")||"[]");$("savedList").innerHTML=saved.map(x=>`<div class="saved-item"><b>${escapeHtml(x.topic)}</b><span style="float:right;color:var(--muted);font-size:12px">${x.date}</span></div>`).join("");$("savedSection").classList.toggle("hidden",!saved.length)}
$("makeQuiz").addEventListener("click",async()=>{
  const btn=$("makeQuiz");btn.disabled=true;btn.textContent="Creando preguntas...";
  try{const r=await fetch("/.netlify/functions/study",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"quiz",topic:$("resultTitle").textContent,summary:currentSummary})});const d=await r.json();if(!r.ok)throw new Error(d.error||"No se pudo crear el examen.");quizData=d.questions;quizIndex=0;answers=[];$("quiz").classList.remove("hidden");showQuestion();$("quiz").scrollIntoView({behavior:"smooth"})}catch(e){toast(e.message)}finally{btn.disabled=false;btn.textContent="✎ Hacer mini examen"}
});
function showQuestion(){
  const q=quizData[quizIndex];$("quizCounter").textContent=`Pregunta ${quizIndex+1} de ${quizData.length}`;$("quizScore").classList.add("hidden");
  $("quizContent").innerHTML=`<div class="question">${escapeHtml(q.question)}</div>${q.options.map((o,i)=>`<button class="answer ${answers[quizIndex]===i?"selected":""}" data-index="${i}">${String.fromCharCode(65+i)}. ${escapeHtml(o)}</button>`).join("")}`;
  document.querySelectorAll(".answer").forEach(b=>b.addEventListener("click",()=>{answers[quizIndex]=Number(b.dataset.index);document.querySelectorAll(".answer").forEach(x=>x.classList.toggle("selected",x===b))}));
  $("nextQuestion").textContent=quizIndex===quizData.length-1?"Ver resultado":"Siguiente pregunta";
}
$("nextQuestion").addEventListener("click",()=>{
  if(answers[quizIndex]===undefined){toast("Elegí una respuesta para continuar.");return}
  if(quizIndex<quizData.length-1){quizIndex++;showQuestion();return}
  let score=0;quizData.forEach((q,i)=>{if(answers[i]===q.answer)score++});
  $("quizContent").innerHTML=quizData.map((q,i)=>`<div class="saved-item"><b>${i+1}. ${escapeHtml(q.question)}</b><p>${answers[i]===q.answer?"✓ Correcto":"✗ Tu respuesta: "+escapeHtml(q.options[answers[i]])}</p><small>Respuesta correcta: ${escapeHtml(q.options[q.answer])}. ${escapeHtml(q.explanation||"")}</small></div>`).join("");
  $("quizCounter").textContent="Resultado final";$("nextQuestion").classList.add("hidden");$("quizScore").classList.remove("hidden");$("quizScore").innerHTML=`<b>Tu puntaje: ${score} de ${quizData.length}</b><br>${score===quizData.length?"¡Excelente trabajo!":score>=Math.ceil(quizData.length*.6)?"¡Muy bien! Repasá las respuestas que te faltaron.":"¡A seguir practicando! Volvé a leer el resumen y probá otra vez."}`;
});
$("themeToggle").addEventListener("click",()=>{document.body.classList.toggle("light");$("themeToggle").textContent=document.body.classList.contains("light")?"☀":"☾";localStorage.setItem("easystudy_theme",document.body.classList.contains("light")?"light":"dark")});
if(localStorage.getItem("easystudy_theme")==="light"){document.body.classList.add("light");$("themeToggle").textContent="☀"}
renderSaved();