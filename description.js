import * as cheerio from "cheerio";
import fetch from "node-fetch";
import { descProfiles } from "./descriptionProfiles.js";

function getDescProfile(host){
    return descProfiles[host]
}

let profile;
async function getDescription(host,url){
    profile = await getDescProfile(host)
    const productFields = Object.entries(profile)
    if (!profile || !url) return "";
    const response = await fetch("https://"+url);
    const html = await response.text();
    //console.log(html)
    const $ = cheerio.load(html);
    let entry ={}
    for (const [fieldKey,selector] of productFields){

        if(typeof selector === "string"){
            entry[fieldKey] = product.querySelector(selector)?.innerText?.replace("(Артикул : )|(Бренд: ) ","") || ""
        }
    }
    const descElement = $(profile.descFieldId).find(profile.descFieldSelector);
    //console.log($(profile.descFieldId))
    //console.log(descElement)
    return descElement;
}
export async function fetchHTMLDescription(host,url){
    const descElement = await getDescription(host,url)
    //console.log(descElement.html())
    return descElement?.html().trim() || "";
}
export async function fetchTextDescription(host,url){
    const descElement = await getDescription(host,url)
    return descElement?.text().trim() || "";
}