process.stdin.setEncoding("utf8");
let http = require('http');
let fs = require('fs');
let path = require("path");
let express = require("express");
const { name } = require('ejs');
let app = express(); 
let bodyParser = require("body-parser"); 
require("dotenv").config({ path: path.resolve(__dirname, 'pokeDB.env') }) 
const { MongoClient, ServerApiVersion } = require('mongodb');
const { response } = require('express');
app.use("/styles",express.static(__dirname + "/styles"));

app.use("/scripts", express.static('./scripts'));

let currentProfile;

class Pokemon{
  constructor(name,lvl,img, link){
    this.name = name;
    this.lvl = lvl;
    this.img = img;
    this.link = link;
  }
}

let portNumber = process.env.PORT || 5001;
console.log(`Web server started and running at http://localhost:${portNumber}`);

//Command Line
let prompt = "Type stop to shutdown the server: ";
process.stdout.write(prompt);
process.stdin.on("readable", function () {
  let dataInput = process.stdin.read();
  if (dataInput !== null) {
    let command = dataInput.trim();
	if (command === "stop") {
		console.log("Shutting down the server");
        process.exit(0);
    } else {
		process.stdout.write(`Invalid command: ${command}\n`);
	}
    process.stdout.write(prompt);
    process.stdin.resume();
  }
});

//Web Server
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
http.createServer(app).listen(portNumber);
app.use(bodyParser.urlencoded({extended:false}));

//Mongo DB
const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const databaseAndCollection = {db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_COLLECTION};
const uri = `mongodb+srv://${userName}:${password}@cluster0.bwy3v.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
//==========

//This function inserts data from the form to the database if it alr doesnt exists
async function createProfile(name) {
  let filter = {username: name};
  await client.connect();
  const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).findOne(filter);
  if(result !== null)
  {
    //console.log("exists alr");
    await client.close();
    return; 
  }
    try{
        let profile = { username: name, pokelist : []};
        await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(profile);

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
  }

//Mongo DB Add Pokemon List
async function addPoke(name, pokemon)
{
  let x = await getCaught(name);

  x.push(pokemon);
  await client.connect();

  let filter = {username: name};
  let profile = { username: name, pokelist : x};
  const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).findOneAndReplace(filter,profile);

}

//Mongo DB Get Pokemon List
async function getCaught(name){
  let filter = {username: name};
  await client.connect();
  const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).findOne(filter);
  await client.close();
  return result.pokelist;

}

//========================
app.get("/", (request, response) => {
	response.render("index");
});

app.post("/", (request, response) => {
  currentProfile = request.body.name;
  createProfile(currentProfile);
  response.redirect('/menu');
  response.render("menu", {currentProfile});
  
});

app.get("/menu", (request, response) => {
	response.render("menu", {currentProfile});
});

app.post("/menu",(request,response) =>{
  loadTable(currentProfile,response);
});

app.get("/pcBox",(request,response) =>{
  response.render("pcBox");
  });
  
  app.get("/wild", (request, response) => {
    response.render("wild");
  });
  
  app.post("/wild", (request, response) => {

    let newPoke = new Pokemon(request.body.pokemonName,request.body.pokemonLevel,request.body.pokemonImg, request.body.pokemonLink);
    addPoke(currentProfile,newPoke);
    let vars ={
      currentProfile: currentProfile,
      pokeName: request.body.pokemonName,
      pokeLvl: request.body.pokemonLevel,
      pokeImg: request.body.pokemonImg
    }
    response.render("caught",vars);
  });
  
  app.get("/caught", (request, response) => {
    let vars ={
      currentProfile : currentProfile
    }
    response.render("caught",vars);
  });

async function loadTable(name,response){
  let s = "";
  let t = await getCaught(name);

  s+="<table border=1><tr><td>Pokemon</td><td>Level</td><td>Image</td></tr>";
  t.forEach(element => {
    s+=`<tr><td>${element.name}</td><td>${element.lvl}</td><td><img src='${element.img}'</td></tr>` 
  });

  s+="</table>"

  let vars = {
    currentProfile : currentProfile,
    htmlstr: s
  }
  response.render("pcBox",vars);
}
