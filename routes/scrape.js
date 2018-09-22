const express = require('express'),
      cheerio = require('cheerio'),
      rp = require('request-promise'),
      router = express.Router(),
      db = require('../models');

//route to scrape new sports articles
router.get("/newArticles", function(req, res) {
  //configuring options object for request-promist
  const options = {
    uri: 'https://www.nytimes.com/section/sports',
    transform: function (body) {
        return cheerio.load(body);
    }
  };
  //return all saved articles
  db.Article
    .find({})
    .then((savedArticles) => {
      //creating an array of saved article headlines
      let savedHeadlines = savedArticles.map(article => article.headline);

        rp(options)
        .then(function ($) {
          let newArticleArr = [];
          //iterating over returned articles, and creating a newArticle object from the data
          $('#latest-panel article.story.theme-summary').each((i, element) => {
            let newArticle = new db.Article({
              storyUrl: $(element).find('.story-body>.story-link').attr('href'),
              headline: $(element).find('h2.headline').text().trim(),
              summary : $(element).find('p.summary').text().trim(),
              imgUrl  : $(element).find('img').attr('src'),
              byLine  : $(element).find('p.byline').text().trim()
            });
            if (newArticle.storyUrl) {
              //validation/check to make sure article isn't alredy saved, if not add it to array of new articles
              if (!savedHeadlines.includes(newArticle.headline)) {
                newArticleArr.push(newArticle);
              }
            }
          });
          //adding all new articles to database
          db.Article
            .create(newArticleArr)
            .then(result => res.json({count: newArticleArr.length}))
            .catch(error => {});
        })
        .catch(error => console.log(error));
    })
    .catch(error => console.log(error));
});

module.exports = router;
