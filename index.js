require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// Middleware 
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.zflfj9t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // await client.connect();

        const coffeeCollection = client.db("Coffee_shop_DB").collection("coffees");
        const userCollection = client.db("Coffee_shop_DB").collection("user");

        // Coffees data
        app.get('/coffees', async (req, res) => {
            try {
                const email = req.query.email;
                let query = {};
                if (email) {
                    query.email = email;
                }
                const cursor = coffeeCollection.find(query);
                const result = await cursor.toArray();
                res.send(result);
            } catch (error) {
                // console.error("Error fetching coffees:", error);
                res.status(500).send({ error: 'Internal Server Error' });
            }
        });

        app.get('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollection.findOne(query);
            res.send(result)
        })

        app.get('/coffees', async (req, res) => {
            const email = req.query.email;
            if (!email) return res.status(400).send({ error: 'Email is required' });

            const query = { email };
            const result = await coffeeCollection.find(query).toArray();
            res.send(result);
        });


        app.post('/coffees', async (req, res) => {
            const newCoffee = req.body;
            //console.log(newCoffee);
            const result = await coffeeCollection.insertOne(newCoffee);
            res.send(result);
        })

        app.put('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const option = { upsert: true };
            const updatedCoffee = req.body;
            //console.log(updatedCoffee);

            const coffee = {
                $set: {
                    name: updatedCoffee.name,
                    quantity: updatedCoffee.quantity,
                    supplier: updatedCoffee.supplier,
                    taste: updatedCoffee.taste,
                    price: updatedCoffee.price,
                    details: updatedCoffee.details,
                    photo: updatedCoffee.photo
                }
            }

            const result = await coffeeCollection.updateOne(filter, coffee, option);
            res.send(result);
        })

        app.delete('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollection.deleteOne(query);
            res.send(result);
        })


        // User data 
        app.get('/users', async (req, res) => {
            const cursor = userCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await userCollection.findOne(query);
            res.send(result);
        })

        app.post('/users', async (req, res) => {
            const newUser = req.body;
            //console.log(newUser);
            const result = await userCollection.insertOne(newUser);
            res.send(result);
        })

        app.patch('/users/signin', async (req, res) => {
            //console.log(req.body?.lastSignInTime);
            const email = req.body.email;
            const filter = { email };
            const updateDoc = {
                $set: {
                    lastSignInTime: req.body?.lastSignInTime
                }
            }
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        app.patch('/users/profile', async (req, res) => {
            //console.log('✅ PATCH /users hit');
            //console.log('✅ Body:', req.body);
            //console.log('✅ Email:', req.body.email);
            const email = req.body.email;
            const filter = { email };
            const updateDoc = {
                $set: {
                    name: req.body?.name,
                    photo: req.body?.photo
                }
            }
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        //console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Welcome to ArtiCret Coffee Shop Server !');
})

app.listen(port, () => {
    //console.log(`Coffee Shop Server running on ${port}`);
})