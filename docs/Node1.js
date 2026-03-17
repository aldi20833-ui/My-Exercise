/**
 * Helper functions for butiran/26b39 note.
 */
function getContainer(id, width = "640px") {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLDivElement)) return null;
  Object.assign(el.style, {
    marginTop: "1em",
    width: width,
    background: "var(--box-bg)",
    border: "0 solid var(--border)",
    display: "flex",
  });
  return el;
}

function createTextarea(id, height = "20em") {
  const el = document.createElement("textarea");
  el.id = id;
  Object.assign(el.style, {
    flex: "1",
    height: typeof height === "number" ? `${height}px` : height,
    overflowY: "scroll",
    fontFamily: "monospace",
    fontSize: "12px",
    lineHeight: "1.5",
    padding: "0.25em 0.5em",
    resize: "none",
    boxSizing: "border-box",
  });
  return el;
}

const consolex = {
  el: null,
  eol: "\n",
  setEOL(eol) { this.eol = eol; },
  setOutput(el) { this.el = el instanceof HTMLTextAreaElement ? el : null; },
  log(...args) {
    if (!this.el) return;
    const message = args.map(v => typeof v === "object" ? JSON.stringify(v, null, 2) : String(v)).join(" ");
    this.el.value += message + "\n";
    this.el.scrollTop = this.el.scrollHeight;
  },
  clear() { if (this.el) this.el.value = ""; }
};

(() => { console.log("[marker] Node1.js loaded"); })();