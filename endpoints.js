import express from "express"
import {fetchHTMLDescription,fetchTextDescription} from "./description.js";

const app = express();
app.use(express.json());
function unpackJSON(json){
    const json = req.body;
    const url = json.url;
    const host = json.host;
    const descProfile = json.profile;
    return [url, descProfile];

}

app.post("/api/description/html", async (req,res)=>{
    try {
        const json = req.body;
        const url = json.url;
        const host = json.host;
        const descProfile = json.profile;
        
        
        if (!url) {
            return res.status(400).json({ error: "URL is required" });
        }
        
        const desc = await fetchHTMLDescription(host, url);

        res.json({ description: desc });
    } catch (error) {
        console.error("Error fetching description:", error);
        res.status(500).json({ error: "Failed to fetch description" });
    }
});
app.post("/api/description/text", async (req,res)=>{
    try {
        const json = req.body;
        const url = json.url;
        const host = json.host;
        
        if (!url) {
            return res.status(400).json({ error: "URL is required" });
        }
        if (!host) {
            return res.status(400).json({ error: "Host is required" });
        }
        
        const desc = await fetchTextDescription(host,url);

        res.json({ description: desc });
    } catch (error) {
        console.error("Error fetching description:", error);
        res.status(500).json({ error: "Failed to fetch description" });
    }
});

app.listen(8080, ()=> console.log("node scrapping server running"));
