//packages
const express = require('express'),
  morgan = require("morgan"),
  cheerio = require("cheerio"),
  mongoose = require("mongoose"),
  axios = require("axios"),
  Promise = require("bluebird"),
  Article = require("./models/article"),
  Comment = require("./models/comment"),
  //variables
  PORT = process.env.PORT || 3000,
  app = express();

mongoose.connect('mongodb://localhost:27017/scrapingDB', {
  useNewUrlParser: true,
  useFindAndModify: false
});




app.set("view engine", "ejs");
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
app.use(express.static("public"));
app.use(morgan("dev"));


app.get("/", (req, res) => {
  axios.get("https://old.reddit.com/r/all/").then(response => {
    const $ = cheerio.load(response.data),
      results = [];

    $("p.title").each((i, element) => {
      const title = $(element).text().split('(')[0];
      const link = $(element).children().attr("href");


      results.unshift(new Promise((resolve, reject) => {
        Article.updateOne({
          link
        }, {
          $setOnInsert: {
            link,
            title
          }
        }, {
          setDefaultsOnInsert: true,
          upsert: true
        }).then(article => resolve(article))
      }))
    });

    Promise.all(results).then(_ => {
      Article.find({}).sort({
        date: 1
      }).limit(1).populate("comments").exec((err, document) => {
        res.render("index", {
          article: document[0]
        })
      })
    })
  })
})

app.get("/articles", (req, res) => {
  Article.find({}).sort({
    date: 1
  }).limit(20).populate("comments").exec((err, documents) => {
    res.json(documents)
  })
})

app.get("/comments/:id", (req, res) => {
  Article.findById(req.params.id).populate("comments").exec((err, document) => {
    res.json(document.comments)
  })
})

app.post("/", (req, res) => {
  console.log(req.body);
  Comment.create({
    comment: req.body.comment
  }).then(comment => {
    console.log("Comment:" + comment);

    Article.findByIdAndUpdate(req.body.id, {
      $push: {
        "comments": comment._id
      }
    }).then(_ => {
      res.json(comment)
    })
  })
})


app.delete("/", (req, res) => {
  Article.findById(req.body.id).then(article => {
    const results = [];

    for (let id of article.comments) {
      results.push(new Promise((resolve, reject) => {
        Comment.deleteOne({
          _id: id
        }).then(data => resolve(data))
      }));
    }

    Promise.all(results).then(data => {
      article.comments = [];
      article.save().then(_ => {
        res.json(data)
      })
    })
  })
})

app.listen(PORT, console.log(`Server running on Port ${PORT}`))