const mongoose = require("mongoose");
const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());

const Restaurant = require("./models/restaurant");
const Item = require("./models/item");

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to Database");
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Error connecting to Database:", err);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;

// Get a restaurant by ID
app.get("/restaurant/:id", async (req, res) => {
  try {
    const getRest = await Restaurant.findById(req.params.id);
    if (!getRest) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json(getRest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new restaurant
app.post("/restaurant-create", async (req, res) => {
  const { name, city } = req.body;
  if (!name || !city) {
    return res.status(400).json({ message: "Name and city are required." });
  }

  try {
    const createRest = new Restaurant({ name, city });
    const createdRest = await createRest.save();
    res.status(201).json(createdRest);
  } catch (err) {
    res.status(500).json({ message: "Error creating restaurant: " + err.message });
  }
});

// Update a restaurant
app.put("/restaurant-update/:id", async (req, res) => {
  try {
    const updatedRest = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedRest) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json(updatedRest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a restaurant
app.delete("/restaurant-delete/:id", async (req, res) => {
  try {
    const deletedRest = await Restaurant.findByIdAndDelete(req.params.id);
    if (!deletedRest) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json(deletedRest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get an item by ID
app.get("/item/:id", async (req, res) => {
  try {
    const getItem = await Item.findById(req.params.id);
    if (!getItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(getItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create an item
app.post("/item-create", async (req, res) => {
  const { name, price, restId } = req.body;
  if (!name || !price || !restId) {
    return res.status(400).json({ message: "Name, price, and restId are required." });
  }

  try {
    const rest = await Restaurant.findById(restId);
    if (!rest) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    
    const newItem = new Item({ name, price, restId });
    const createdItem = await newItem.save();
    
    rest.items.push(createdItem._id);
    await rest.save();

    res.status(201).json(createdItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update an item
app.put("/item-update/:id", async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete an item
app.delete("/item-delete/:id", async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    const rest = await Restaurant.findById(deletedItem.restId);
    if (rest) {
      rest.items.pull(deletedItem._id);
      await rest.save();
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
