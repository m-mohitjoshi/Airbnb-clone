const mongoose = require("mongoose");
const initData = require("./data");
const Listing = require("../models/listing");

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj)=>({...obj, owner: "65df026c3607f6bf3c634250"}));
  await Listing.insertMany(initData.data);
  console.log("Data Entered");
};

initDB();
