import * as express from 'express';
import { Request, Response } from 'express';
import * as bodyParser from 'body-parser';
import { User, Site, db, Connection } from './src/db';
import * as multer from 'multer';
import { verifyApiToken } from './src/middlewares';
import { activateHttpsHandler, createBucketHandler, createCloudfrontHandler, deleteBucketHandler, requestCertificateHandler } from './src/handlers/sites';

const app = express();

// db

// Parse JSON request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(verifyApiToken)
app.use(bodyParser.json());

// create a user
app.post('/users', async (req: Request, res: Response) => {})

// edit user data
app.put('/users/:id', async (req: Request, res: Response) => {})

// create a site for a user
app.post('/sites', async (req: Request, res: Response) => {})

// delete a published bucket
app.delete('/site/:bucket', deleteBucketHandler)
// publish a site with a zip file
app.post('/site/requestCertificate', requestCertificateHandler)
app.post('/site/activateHttps', activateHttpsHandler)



// funzionanti
app.post('/site/:bucketName/zip', multer({ dest: 'uploads/' }).single('file'), createBucketHandler)


app.post('/site/:siteId/cloudfront', createCloudfrontHandler)



// API for connections
// Create a new Connection
app.post('/connections/', async (req, res) => {
  const connection = new Connection({
    name: req.body.name,
    user: req.body.user,
    params: req.body.params
  });

  try {
    const result = await connection.save();
    res.status(201).send(result);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all Connections
app.get('/connections/', async (req, res) => {
  try {
    const connections = await Connection.find();
    res.send(connections);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get a single Connection by ID
app.get('/connections/:id', async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);
    if (!connection) {
      return res.status(404).send('Connection not found');
    }
    res.send(connection);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a Connection by ID
app.patch('/connections/:id', async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'user', 'params'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates' });
  }

  try {
    const connection = await Connection.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!connection) {
      return res.status(404).send('Connection not found');
    }

    res.send(connection);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a Connection by ID
app.delete('/connections/:id', async (req, res) => {
  try {
    const connection = await Connection.findByIdAndDelete(req.params.id);
    if (!connection) {
      return res.status(404).send('Connection not found');
    }
    res.send(connection);
  } catch (error) {
    res.status(500).send(error);
  }
});



app.listen(8081, () => {
  console.log('API listening on port 8081');
});