import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import XLSX from "xlsx";

const app = express();
app.use(
  cors({
    origin: "https://facts-finder.netlify.app",
  })
);
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(
    "mongodb+srv://formservices10:orCFD0tIt4zjfMD3@cluster0.8wlv5xx.mongodb.net/formsDb"
  )
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Schema for Facts Finders
const factsFindersSchema = new mongoose.Schema({
  dateTime: Date,
  name: String,
  etcCode: String,
  customerName: String,
  dob: Date,
  contactNo1: String,
  contactNo2: String,
  force: String,
  bn: String,
  comp: String,
  married: String,
  kids: String,
  child1Age: Number,
  child2Age: Number,
  income: Number,
  savings: Number,
  insurancePremium: Number,
  planName: String,
  mfSipAmount: Number,
  investAmount: Number,
  futureInvestments: String,
  clientNeeds: String,
  financialServices: String,
  feedback: String,
  customerImage: String,
  latitude: Number,
  longitude: Number,
});

const FactsFinders = mongoose.model("FactsFinders", factsFindersSchema);

// POST - Save record
app.post("/api/factsfinders", async (req, res) => {
  try {
    const data = req.body;

    if (data.dateTime) data.dateTime = new Date(data.dateTime);
    if (data.dob) data.dob = new Date(data.dob);

    const newRecord = new FactsFinders(data);
    await newRecord.save();

    res.status(201).json({ message: "Record saved successfully" });
  } catch (err) {
    console.error("❌ Save error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET - Download Excel with optional filters
app.get("/api/factsfinders/excel", async (req, res) => {
  try {
    const { startDate, endDate, name } = req.query;
    const filter = {};

    if (startDate || endDate) {
      filter.dateTime = {};
      if (startDate) filter.dateTime.$gte = new Date(startDate);
      if (endDate) filter.dateTime.$lte = new Date(endDate);
    }

    if (name) {
      filter.name = new RegExp(name, "i");
    }

    const records = await FactsFinders.find(filter).lean();
    if (!records.length)
      return res
        .status(404)
        .json({ message: "No data found for given filters" });

    const formattedData = records.map((c) => ({
      Date: c.dateTime ? new Date(c.dateTime).toLocaleString() : "",
      Name: c.name,
      "ETC Code": c.etcCode,
      "Customer Name": c.customerName,
      DOB: c.dob ? new Date(c.dob).toLocaleDateString() : "",
      "Contact No.1": c.contactNo1,
      "Contact No.2": c.contactNo2,
      "Force / Civil": c.force,
      BN: c.bn,
      Comp: c.comp,
      Married: c.married,
      Kids: c.kids,
      "1st Child Age": c.child1Age,
      "2nd Child Age": c.child2Age,
      Income: c.income,
      Savings: c.savings,
      "Insurance Premium": c.insurancePremium,
      "Plan Name": c.planName,
      "MF / SIP Amount": c.mfSipAmount,
      "Invest Amount": c.investAmount,
      "Future Investments / Saving Plans": c.futureInvestments,
      "Client Needs / Requirements": c.clientNeeds,
      "Financial Services": c.financialServices,
      Feedback: c.feedback,
      "Customer Image": c.customerImage,
      Latitude: c.latitude,
      Longitude: c.longitude,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    // Auto column width
    worksheet["!cols"] = Object.keys(formattedData[0]).map((key) => ({
      wch:
        Math.max(
          key.length,
          ...formattedData.map((row) =>
            row[key] ? row[key].toString().length : 0
          )
        ) + 2,
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FactsFinders");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=factsfinders_data.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(excelBuffer);
  } catch (err) {
    console.error("❌ Excel error:", err);
    res.status(500).json({ message: "Error generating Excel" });
  }
});

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
