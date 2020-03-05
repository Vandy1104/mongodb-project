const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  _id : mongoose.Schema.Types.ObjectId,
  name  : String,
  price : Number
  // imageUrl : String
});

module.exports = mongoose.model('Prod', productSchema);
