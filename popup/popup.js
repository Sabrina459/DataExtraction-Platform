import {profiles} from "./webSitesProfiles.js"
let host;
async function getHostProfile(){
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = new URL(tab.url);
    host = url.host.replace(/^www\./, "");
    console.log("Detected host:", host);
    return profiles[host]
}
function getRegex(line){
    const escline = line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp("https?:\/\/"+ escline +"|\/*", "g");
    return re
}
let profile;
async function initPopup(){
    profile = await getHostProfile();
    if (!profile) {
        console.log("here")
        document.getElementById('unsupportedMessage').classList.add('show');
        return;
    }
    const [tab] = await chrome.tabs.query({active:true, currentWindow:true});
    const [result] = await chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: (profile,host) => {
            const item = document.querySelector(profile.categoryNameSelector);
            const escline = host.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const re = new RegExp("https?:\/\/"+ escline +"|\/*", "g");
            return item ? item.href?.replace(re, "") : "products";
        },
        args: [profile,host]
    });
    const filename = (result.result || "products") + "_products.csv";
    document.getElementById("filename").value = filename;
    document.getElementById('nodescBtn').addEventListener('click', ()=>loadingOverlay(host, profile,""));
    document.getElementById('htmldescBtn').addEventListener('click', ()=>loadingOverlay(host, profile,"html"));
    document.getElementById('textdescBtn').addEventListener('click',()=> loadingOverlay(host, profile,"text"));
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPopup);
} else {
    initPopup();
}

async function loadingOverlay(host, profile, param){
    console.log("here")
    const [tab] = await chrome.tabs.query({active:true, currentWindow:true});
    const filename = document.getElementById('filename').value;
    document.getElementById('loadingOverlay').classList.add('show');
    try {
        await chrome.scripting.executeScript({
            target: {tabId: tab.id},
            func: exportProducts,
            args: [ host, profile, param, filename ]})
    } finally {
        document.getElementById('loadingOverlay').classList.remove('show');
    }
}


async function exportProducts(host, profile, param, filename) {

    async function productScrapping() {
        console.log("scrappingProducts")
        //console.log(document.querySelector(profile.productListSelector))
        const productFields = Object.entries(profile.fields)
        const productList = [...document.querySelector(profile.productListSelector)?.querySelectorAll(profile.productItemSelector) || []].map(
            product => {
                
                let entry ={}
                for (const [fieldKey,selector] of productFields){

                    if(typeof selector === "string"){
                        if (fieldKey === "notStock" ) entry[fieldKey] = product.querySelector(selector) ? "false" : "true";
                        if (fieldKey === "inStock" ) entry[fieldKey] = product.querySelector(selector) ? "true" : "false";

                        else entry[fieldKey] = product.querySelector(selector)?.innerText?.replace("Артикул : ","") || ""
                    }else{
                        const feature = product.querySelector(selector.selector)
                        if (feature){
                            if (selector.type === "image"){
                                //console.log(feature.style.backgroundImage)
                                let bgLink = feature.getAttribute("data-src") ?? feature.style.backgroundImage.slice(0,-2).replace("url(","") ;
                                entry[fieldKey] =  host+bgLink
                            }else {
                                if (fieldKey==="url") entry[fieldKey]= host + feature.getAttribute(selector.attribute) || ""
                                else entry[fieldKey] = feature.getAttribute(selector.attribute) || ""
                            }

                        }
                    }
                }
                return entry;
                // const title = product.querySelector(profile.title).innerText;
                // const currentPrice = product.querySelector(".current_price").innerText;
                // const oldPrice = product.querySelector(".old_price")?.innerText || "";
                // const bgLink = product.querySelector(".product_slider_img").getAttribute("data-src") ?? product.querySelector(".product_slider_img").style.backgroundImage.slice(0,-2).replace("url(","") ;
                // const image = "https://homepharma.shop"+bgLink;
                // const articule = product.querySelector(".articul").innerText.replace("Артикул : ","");
                // const isAvailable = product.querySelector(".not_in_stock") ? "false" : "true";
                // const url = "https://homepharma.shop"+product.querySelector("a").getAttribute("href");

                // const description = "";
                // return {title, currentPrice, oldPrice, image, articule, isAvailable, url, description};
            }
        );
        if (param!==""){let action;
            if(param==="html") action="getHTMLDescription";
            if(param==="text") action="getTextDescription";
            for (const product of productList) {
                //console.log(host)
                product.description = await chrome.runtime.sendMessage({action: action, url: product.url, host: host}).then(
                        response => response.description ? response.description : ""
                    ).catch(error => console.log("Failed to get description:"+ error));
            }
        }
        return productList;
    }


    function convertToCSV(productList) {
        if (productList.length === 0) return "";
        const headers = Object.keys(productList[0]);
        const csvContent = [headers.join(","), productList.map(row => headers.map(header => {
            const value = String(row[header] || "");
            // Escape quotes by doubling them, then wrap in quotes
            return `"${value.replace(/"/g, '""')}"`;
        }).join(",")).join("\r\n")].join("\r\n");
        return csvContent;
    }

    function downloadCSV(csvContent, filename) {
        const bom = "\uFEFF"; //for correct cyrylic parsing
        const csvWithBOM = bom + csvContent;
        const blob = new Blob([csvWithBOM], {type: "text/csv;charset=utf-8;"}); //csv object
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);//temp url for csv file download
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return true;
        }
        return false;
    }


    downloadCSV(convertToCSV(await productScrapping()), filename);
}