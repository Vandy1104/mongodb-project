const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser'); // to parse all data coming from the database.
const cors = require('cors');  // To include cross origin request.
const bcryptjs = require('bcryptjs'); // To hash & compare passwords in an encrypted way.
const config = require('./config.json');  // has credentials.
const product = require('./Products.json'); // External JSON data from Mockaroo.
const dbProduct = require('./models/products.js');
const User = require('./models/users.js');


const port = 3000;

//Connect to db
// const mongodbURI = 'mongodb+srv://vandy1104:pratik@1104@vandy1104-pey27.mongodb.net/test?retryWrites=true&w=majority';
const mongodbURI = `mongodb+srv://${config.MONGO_USER}:${config.MONGO_PASSWORD}@${config.MONGO_CLUSTER_NAME}.mongodb.net/shop?retryWrites=true&w=majority`;
mongoose.connect(mongodbURI, {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=> console.log('DB connected!'))
.catch(err =>{
  console.log(`DB connection error: ${err.message}`);
});

//Test the connectivity
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
  console.log('We are connected to Mongo DB');
});

app.use((req, res, next)=>{
  console.log(`${req.method} request for ${req.url}`);
  next();
});

//including body-parser, cors, bcryptjs
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use(cors());


app.get('/', (req, res) => res.send('Hello World!'))

app.get('/allProducts', (req, res)=> {
  res.json(product);
});

app.get('/product/p=:id', (req, res)=>{
  const idParam = req.params.id;
  for(let i = 0; i < product.length; i++) {
    if (idParam.toString() === product[i].id.toString()) {
      res.json(product[i]);
    }
  }
});

//Register users.
app.post('/registerUser', (req,res)=>{
// Checking if user is found in the db already.
  User.findOne({username:req.body.username},(err, userResult)=>{
    if (userResult){
      res.send('username taken already, Please try another one')
    } else {
      const hash = bcryptjs.hashSync(req.body.password);
      const user = new User({
        _id : new mongoose.Types.ObjectId,
        username : req.body.username,
        email : req.body.email,
        password: hash
      });
// Save to database and notify the user accordingly.
      user.save().then(result =>{
        res.send(result);
      }).catch(err => res.send(err));
    }
  })


});

//Get all User.
app.get('/allUsers', (req,res)=>{
  User.find().then(result =>{
    res.send(result);
  })

});

//login the user
app.post('/loginUser', (req,res)=>{
  User.findOne({username:req.body.username},(err,userResult)=>{
    if (userResult){
      if (bcryptjs.compareSync(req.body.password, userResult.password)){
        res.send(userResult);
      } else {
        res.send('not authorized');
      }//inner if
    } else {
       res.send('user not found. Please register');
    }//outer if
  });//findOne
});//post


//Keep this at the end.
app.listen(port, () => console.log(`Mongodb app listening on port ${port}!`))
