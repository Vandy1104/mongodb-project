const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser'); // to parse all data coming from the database.
const cors = require('cors');  // To include cross origin request.
const bcryptjs = require('bcryptjs'); // To hash & compare passwords in an encrypted way.
const config = require('./config.json');  // has credentials.
const product = require('./Products.json'); // External JSON data from Mockaroo.
const Prod = require('./models/products.js');
const User = require('./models/users.js');


const port = 3000;

//Connect to db
// const mongodbURI = 'mongodb+srv://vandy1104:pratik@1104@vandy1104-pey27.mongodb.net/test?retryWrites=true&w=majority';
const mongodbURI = `mongodb+srv://${config.MONGO_USER}:${config.MONGO_PASSWORD}@${config.MONGO_CLUSTER_NAME}.mongodb.net/shop?retryWrites=true&w=majority`;
// const mongodbURI = `mongodb+srv://${config.MONGO_USER}:${config.MONGO_PASSWORD}@${config.MONGO_CLUSTER_NAME}.mongodb.net/shop-products?retryWrites=true&w=majority`;
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
  for(var i = 0; i < product.length; i++) {
    if (idParam.toString() === product[i].id.toString()) {
      res.json(product[i]);
    }
  }
});

//Test to grab individual products records
app.get('/showProduct/Prod=:Prod._id', (req, res)=>{
  const idParam = req.params.Prod._id;
  for(var i = 0; i < Prod.length; i++) {
    if (idParam.toString() === Prod[i].id.toString()) {
      res.json(Prod[i]);
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
//
// //Get all User.
app.get('/allUsers', (req,res)=>{
  User.find().then(result =>{
    res.send(result);
  })

});
//
// //login the user
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


//productSchema

//Add records
app.post('/addProduct', (req, res)=>{
  //checking if user is found in the db already.
  Prod.findOne({name:req.body.name},(err, userResult)=>{
    if(userResult){
      res.send('Product entered already, Please add another one')
    } else {
      //const hash = bcryptjs.hashSync(req.body.password);
      const prod = new Prod({
        _id : new mongoose.Types.ObjectId,
        name  : req.body.name,
        price : req.body.price,
        user_id :req.body.userId

        // password  : hash
      });
      //Save to database and notify the user accordingly
      prod.save().then(result =>{
        res.send(result);
      }).catch(err => res.send(err));
    }
  })
});  //Post

//Get all Products
app.get('/showProducts', (req, res)=>{
  Prod.find().then(result =>{
    res.send(result);
  })
});


//Delete a product
app.delete('/deleteProduct/:id', (req, res)=>{
  const idParam = req.params.id;
  Prod.findOne({_id:idParam}, (err,productResult)=>{
    if (productResult){
      Prod.deleteOne({_id:idParam},err=>{
        res.send('deleted');
      });
    } else{
      res.send('not found')
    }
  }).catch(err => res.send(err));
});

  app.patch('/updateProduct/:id', (req,res)=>{
    const idParam = req.params.id;
    Prod.findById(idParam,(err,productResult)=>{
        const updatedProduct = {
            name : req.body.name,
           price : req.body.price
        // imageUrl : req.body.imageUrl
      };
      Prod.updateOne({_id:idParam}, updatedProduct).then(result=>{
        res.send(result);
      }).catch(err=>res.send(err));
    }).catch(err=>res.send('not found'));
  });

//Keep this at the end.
app.listen(port, () => console.log(`Mongodb app listening on port ${port}!`))
