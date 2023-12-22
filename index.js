const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xwdt30p.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const userCollection = client.db('MicroNet').collection('users');
    const taskCollection = client.db('MicroNet').collection('tasks');


    app.post('/users', async (req, res) => {
        const userInfo = req.body;
        const query = {email: userInfo.email}

        const existingUser = await userCollection.findOne(query);

        if(existingUser){
            return res.send({message: 'user already exists', insertedId: null})
        }

        const result = await userCollection.insertOne(userInfo);
        res.send(result);
    })

    app.post('/task', async (req, res) => {

        const task = req.body;
        const result = await taskCollection.insertOne(task);
        res.send(result);

    })

    app.get('/task/:email', async (req, res) => {
        const email = req.params.email;
        const query = {email: email};
        const result = await taskCollection.find(query).toArray();
        res.send(result);
    })

    app.patch('/task/:id', async (req, res) => {
        const id = req.params.id;
        const data = req.body;
        const query = {_id: new ObjectId(id)}
        const updatedDoc = {
            $set: {
                status: data?.status
            }
        }

        const result = await taskCollection.updateOne(query, updatedDoc);
        res.send(result);
    })

    app.delete('/task/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await taskCollection.deleteOne(query);
        res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});