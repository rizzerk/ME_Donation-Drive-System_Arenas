const express = require("express");
const fs = require("fs");

const app = express();
const PORT = 3000;
const DATA_FILE = __dirname + "/data.json";

app.use(express.json()); 

// Read all campaigns from data.json
function readData() {
    const text = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(text);
}

// Save all campaigns back to data.json
function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET all campaigns
app.get("/api/campaigns", (req, res) => {
    const campaigns = readData();
    res.status(200).json(campaigns);
});

// GET one campaign by id
app.get("/api/campaigns/:id", (req, res) => {
    const id = Number(req.params.id);
    const campaigns = readData();
    const campaign = campaigns.find(e => e.id === id);

    if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
    }

    res.status(200).json(campaign);
});

// POST insert a new campaign
app.post("/api/campaigns", (req, res) => {
    const { campaign_name, deadline} = req.body;
    const target_amount = Number(req.body.target_amount);
    const collected_amount = Number(req.body.collected_amount);

        if (collected_amount > target_amount) {
        return res.status(400).json({ message: "collected_amount cannot be greater than target_amount." });
    }

    const campaigns = readData();

    // next id = highest id + 1 (safe even after deletes)
    let newId = 1;
    if (campaigns.length > 0) {
        newId = Math.max(...campaigns.map(e => e.id)) + 1;
    }

    const newCampaign = {
        id: newId,
        campaign_name: campaign_name,
        target_amount: target_amount,
        collected_amount: collected_amount,
        deadline: deadline
    };
    campaigns.push(newCampaign);
    writeData(campaigns);

    res.status(201).json(newCampaign);
});

// DELETE by id
app.delete("/api/campaigns/:id", (req, res) => {
    const id = Number(req.params.id);
    const campaigns = readData();
    const index = campaigns.findIndex(c => c.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "Campaign not found" });
    }

    const deleted = campaigns.splice(index, 1)[0];
    writeData(campaigns);

    res.status(200).json({ message: "Campaign deleted", campaign: deleted });
});

app.use(express.static(__dirname)); // serves index.html

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
