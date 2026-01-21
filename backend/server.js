const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = "./data.json";

const readDB = () => JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
const writeDB = data => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

app.post("/found", (req, res) => {
  const { item, location, keptAt, identifiers } = req.body;
  const db = readDB();

  db.foundItems.push({
    item,
    location,
    keptAt,
    identifiers,
    claimed: false
  });

  writeDB(db);
  res.json({ message: "Item stored" });
});

app.get("/found", (req, res) => {
  const db = readDB();
  res.json(db.foundItems);
});

app.post("/claim", (req, res) => {
  const { index, enteredDetail } = req.body;
  const db = readDB();

  const item = db.foundItems[index];
  if (!item || item.claimed) {
    return res.json({ success: false, message: "Item unavailable" });
  }

  const match = item.identifiers.some(id =>
    id.toLowerCase().includes(enteredDetail.toLowerCase()) ||
    enteredDetail.toLowerCase().includes(id.toLowerCase())
  );

  if (match) {
    item.claimed = true;
    writeDB(db);
    return res.json({ success: true });
  }

  res.json({ success: false, message: "Verification failed" });
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
