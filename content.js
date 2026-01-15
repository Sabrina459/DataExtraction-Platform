// 1. Create the Highlight Overlay (Same as before)
const dashboard = document.createElement('div');
dashboard.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; width: 300px; max-height: 400px;
    background: white; border: 2px solid #333; z-index: 1000001;
    overflow-y: auto; padding: 10px; font-family: sans-serif; box-shadow: 5px 5px 15px rgba(0,0,0,0.3);
`;
dashboard.innerHTML = `
    <h4 style="margin-top:0">Hidden Elements Log</h4>
    <table id="log-table" style="width:100%; border-collapse: collapse; font-size: 12px;">
        <thead>
            <tr style="border-bottom: 2px solid #ccc;">
                <th style="text-align:left">Selector</th>
                <th style="text-align:right">Action</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>
`;
document.body.appendChild(dashboard);
const highlight = document.createElement('div');
highlight.style.cssText = 'position:fixed; pointer-events:none; background:rgba(0,123,255,0.3); border:1px solid #007bff; z-index:999999; transition:all 0.1s ease;';
document.body.appendChild(highlight);

// 2. Create the Popup Menu
const menu = document.createElement('div');
menu.style.cssText = 'position:absolute; display:none; background:white; border:1px solid #ccc; box-shadow:0 2px 10px rgba(0,0,0,0.2); padding:5px; z-index:1000000; border-radius:4px; font-family:sans-serif;';
const hideBtn = document.createElement('button');
hideBtn.innerText = 'Hide Element';
hideBtn.style.cssText = 'padding:8px 12px; cursor:pointer; background:#ff4757; color:white; border:none; border-radius:3px; font-weight:bold;';
menu.appendChild(hideBtn);
document.body.appendChild(menu);

let lastClickedElement = null;
let selectorsMap= new Map();
window.addEventListener('mousemove', (event)=>{

    const el = event.target;
    if (!el || el === highlight || el === menu || el === hideBtn) return;
    if (menu.style.display === 'block'){
        menu.style.display = 'none';
    } // Don't move highlight if menu is open
    const rect = el.getBoundingClientRect();
    highlight.style.width = `${rect.width}px`;
    highlight.style.height = `${rect.height}px`;
    highlight.style.top = `${rect.top}px`;
    highlight.style.left = `${rect.left}px`;
},true)
window.addEventListener('click',(event)=>
{
    const el = event.target;
    if(el===hideBtn) return;
    event.preventDefault();
    event.stopPropagation();
    // Show menu at mouse position
    menu.style.display = 'block';
    menu.style.left = `${event.pageX}px`;
    menu.style.top = `${event.pageY}px`;
    const selector = getSelector(el);
    selectorsMap.set(selector,{element:el});
    lastClickedElement = el;
    updateTable()
    console.log("Selector:" + selector)


},true)
function updateTable(){
    const tbody = document.querySelector('#log-table').querySelector('tbody');
    tbody.innerHTML = '';
    selectorsMap.forEach((selector,data) => {
        const row = document.createElement('tr');
        row.style.borderBottom = "1px solid #eee";
        row.innerHTML =
            `
                <td style="padding: 5px; color: #555; max-width: 180px; overflow: hidden; text-overflow: ellipsis;">${selector}</td>
                <td style="padding: 5px; text-align: right;">
<!--                    <button class="undo-btn" data-selector="${selector}" style="cursor:pointer; background:#2ecc71; color:white; border:none; padding:2px 5px; border-radius:3px;">Undo</button>-->
                    ${data}
                </td>
            `
        ;
        tbody.appendChild(row);
    });
}
function getSelector(el){
    if (el.id) return `#${el.id}`
    if (el.className)
        return '.' + el.className.split(/\s+/).join('.')
    if (el.tagName.toLowerCase() ==='span') return this.getSelector(el.parentElement)
    const parent = el.parentElement
    if (!parent) return el.tagName.toLowerCase()


    const index = Array.from(parent.children).indexOf(el) + 1
    return `${this.getSelector(parent)} > ${el.tagName.toLowerCase()}:nth-child(${index})`
}

hideBtn.addEventListener('click', () => {
    if (lastClickedElement) {
        lastClickedElement.style.setProperty('display', 'none', 'important'); // The Magic Line
        menu.style.display = 'none';
        highlight.style.width = '0'; // Reset highlight
    }
});

// Close menu if clicking elsewhere
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') menu.style.display = 'none'; });