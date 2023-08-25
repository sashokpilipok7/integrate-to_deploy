import * as express from 'express';
import { Request, Response } from 'express';
import * as bodyParser from 'body-parser';
import { User, Site, db } from './src/db';
import * as multer from 'multer';
import { verifyApiToken } from './src/middlewares';
import { addConnectionInfo, createBucketHandler, createSite, deleteBucketHandler } from './src/handlers/sites';
import { decryptString } from './src/utils';

const app = express()

// db

// Parse JSON request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(verifyApiToken)
app.use(bodyParser.json());



const siteRouter = express.Router();



// // get all sites 
// siteRouter.get('/sites', async (req: Request, res: Response) => {
//   const sites = await Site.find({})

//   // const str = '07a2abb5d95414f6bd08ef9bf289547cca05e36a4bc30a04688746e30d7f38b968dead0438a53f68d28e4f77e1879aef'
//   // const iv = '7e12c0233f12e2cd114d180588316bb7'
//   // const d = decryptString(str, iv)

//   res.json({sites})
// })
// crea un sito
siteRouter.post('/sites', createSite)
// add/edit connection infos
siteRouter.post('/sites/:id/connection', addConnectionInfo)
// deploy a site 
siteRouter.post('/sites/:id/deploy/zip', multer({ dest: 'uploads/' }).single('file'), createBucketHandler)
// delete a site
siteRouter.delete('/sites/:id', async (req: Request, res: Response) => {})


// app.post('/site/:bucketName/zip', multer({ dest: 'uploads/' }).single('file'), createBucketHandler)

app.use(siteRouter)

app.listen(8081, () => {
  console.log('API listening on port 8081');
});