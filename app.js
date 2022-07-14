const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ =require("lodash");
//const date = require(__dirname + "/date.js");

const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.set("view engine", "ejs");
app.use(express.static("public"));

// let items = ["Buy Food", "Cook Food", "Eat Food"];
// let workItems = [];
mongoose.connect("mongodb+srv://admin-mukund:Mukund12@cluster0.wwnmmfw.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name : "Welcome to your todo list"
});

const item2 = new Item({
  name : "Hit the + button to add the new item"
});

const item3 = new Item({
  name:"<--hit this to delete item"
});

const defaultItems =[item1,item2,item3];


const listSchema = {
  name : String,
  items : [itemsSchema]
};

const List = mongoose.model("List" , listSchema);


// Item.insertMany(defaultItems , function(err){
//   if(err){
//     console.log(err);
//   }
//   else{
//     console.log("Succesfully saved default item to DB.");
//   }
// });



app.get("/", function(req, res) {
  //let day =date.getDate();
  Item.find({},function(err,foundItems){
    //console.log(foundItems);
    if(foundItems.length === 0){
      Item.insertMany(defaultItems , function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Succesfully saved default item to DB.");
        }
        res.redirect("/");
      });
    }
    else{
    res.render("list", {listTitle: "Today",newListItems: foundItems});
  }
  });
  //res.render("list", {listTitle: "Today",newListItems: items});
});

app.get("/:customeListName",function(req,res){
  const customeListName = _.capitalize(req.params.customeListName);

  List.findOne({name : customeListName},function(err,foundList){
     if(!err){
       if(!foundList){
         // console.log("Doesn't exist");
         //Create a new list
         const list = new List({
           name : customeListName,
           items : defaultItems
         });
       list.save();
       res.redirect("/"+customeListName);
       }
       else{
         // console.log("exist");
         //Show an existing list
         res.render("list", {listTitle: foundList.name ,newListItems: foundList.items});
       }
     }
  });
});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;

  const listName = req.body.list;
  const item = new Item({
    name:itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    });
  }
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete",function(req,res){
  //console.log(req.body);
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("Succesfully deleted checked item");
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name : listName}, {$pull : {items : {_id: checkedItemId}}}, function(err,foundList){
      if(!err){
        res.redirect("/"+ listName);
      }
    });
  }

});



// app.get("/work", function(req, res) {
//   res.render("list", {
//     listTitle: "Work list",
//     newListItems: workItems
//   })
// });

app.get("/about",function(req,res){
  res.render("about");
});

// var currentDay = today.getDay();
// var day = "";

// if (currentDay === 6 || currentDay === 0) {
//   day = "Weekend";
//   //res.write("<h1>Yes it is Weekend</h1>");
// } else {
//   // res.write("<p>It is not Weekend</p>")
//   // res.write("<h1>Boo! I have to work!</h1>");
//   // res.send();
//   day = "Weekday";
//   //res.sendFile(__dirname + "/index.html");
// }

// switch (currentDay) {
//   case 0:
//   day = "Sunday";
//   break;
//   case 1:
//   day = "Monday";
//   break;
//   case 2:
//   day = "Tuesday";
//   break;
//   case 3:
//   day = "Wednesday";
//   break;
//   case 4:
//   day = "Thursday";
//   break;
//   case 5:
//   day = "Friday";
//   break;
//   case 6:
//   day = "Saturday";
//   break;
//   default:
//     console.log("Error: Current Day is euqal to:" + currentDay);
// }


app.listen(process.env.PORT || 3000, function() {
  console.log("Server is running on port 3000");
});
