
function createDiv(id) {
 
  const el = document.createElement("div");
  
  el.id = id;
  
  const styles = {
    flex: "1",
    background: "var(--box-bg)",
  };
  
  Object.assign(el.style, styles);
  
  return el;
}


function changeElementsFlex(...args) {
  for(arg of args) {
    const el = document.getElementById(arg[0]);
    const flex = arg[1];
    el.style.flex = flex;
  }
}



function createButton(id, caption) {
  /** @type {HTMLButtonElement} */
  const el = document.createElement("button");
  
  el.id = id;
  el.innerHTML = caption;
  
  const styles = {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
  };
  
  Object.assign(el.style, styles);
  
  return el;
}


// marker: 26b41.js
(() => {
  console.log("[marker] Node2.js loaded");
})();