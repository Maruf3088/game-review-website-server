const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// Allow only your frontend's domain
const corsOptions = {
  origin: "https://game-review-client.web.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // if using cookies or sessions
};

app.use(cors(corsOptions));

app.use(express.json());

app.listen(port, () => {
  console.log("Server is running on port 5000");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1gjqpi3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const reviewCollection = client
      .db("game-reviewsDB")
      .collection("game-reviews");

    const watchListCollection = client
      .db("game-reviewsDB")
      .collection("watch-list");

    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });
    app.post("/watchList", async (req, res) => {
      const watchList = req.body;
      const result = await watchListCollection.insertOne(watchList);
      res.send(result);
    });

    app.get("/watchLists", async (req, res) => {
      const email = req.query.email;
      let query = {};

      if (email) {
        query = { userEmail: email };
      }

      const result = await watchListCollection.find(query).toArray();
      res.send(result);
    });
    app.delete("/watchLists/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await watchListCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/reviews", async (req, res) => {
      const email = req.query.email;
      let query = {};

      if (email) {
        query = { userEmail: email };
      }

      const result = await reviewCollection.find(query).limit(6).toArray();
      res.send(result);
    });

    app.get("/all-reviews", async (req, res) => {
      const cursor = reviewCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewCollection.findOne(query);
      res.send(result);
    });

    app.put("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: false };

      const updatedReview = {
        $set: {
          title: updatedData.title,
          genre: updatedData.genre,
          rating: updatedData.rating,
          description: updatedData.description,
          cover: updatedData.cover,
          year: updatedData.year,
        },
      };

      const result = await reviewCollection.updateOne(
        filter,
        updatedReview,
        options
      );
      res.send(result);
    });

    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});
