//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
mongoose.connect("mongodb+srv://admin-daniel:test123@cluster0.quo0dw4.mongodb.net/?retryWrites=true&w=majority/todolistDB");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemsSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemsSchema);

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});
const List = mongoose.model("List", listSchema);

var task1 = new Item({
  name:"Welcome to your todolist!"
});

var task2 = new Item({
  name:"Hit the + button to add a new item."
});

var task3 = new Item({
  name:"<-- Hit this to delete an item."
});

const defaultItems = [task1, task2, task3];

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Succesfully saved!");
        };
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    };
  }); 

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  };
});

app.post("/delete", function(req, res){
  const checkItemId = req.body.checkbox;
  const listName= req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndDelete(checkItemId, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Succesfully deleted!");
      };
    });
    res.redirect("/");
  }else{

    List.findOneAndUpdate({name:listName}, {$pull:{items:{_id: checkItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      };
    });
  };

  
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/"+customListName);
    } else {
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
    }
  });

  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
