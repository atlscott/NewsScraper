const express = require('express'),
      router = express.Router(),
      db = require("../models");

//get route for root, populating index.handlebars with articles
router.get('/', (req,res) => {
  db.Article
    .find({})
    .then(articles => res.render('index', {articles}))
    .catch(err=> res.json(err));
});

module.exports = router;
