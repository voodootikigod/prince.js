var sys = require('sys'),
    fs = require('fs'),
    exec = require('child_process').exec,
    express = require("express"),
    formidable = require('formidable'),
    config = require('./config');


    
var app = express.createServer();

var fourofour = function (req, res) {res.send('Not Found', 404);}

app.get("/", fourofour);
app.post("/generate/:key", function (req, res) {
  if (config.api_keys.indexOf(req.params.key) < 0) {
    res.send('Not Found', 404);
  } else {
  var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      var html = fields.html,
          css = fields.css;
      var ts = +(new Date);
      var salt = Math.floor(100000*Math.random());
      var filename = "./tmp/"+ts + "."+salt
      fs.writeFile(filename+".html", html, function (err) {
        var cmd = config.prince_path+" --input=html --server --log=/tmp/prince.log --output="+filename+".pdf";
        if (css) 
          cmd += " -s "+css;
        cmd += " "+filename+".html";
        exec(cmd, function (error, stdout, stderr) {
          fs.readFile(filename+".pdf", function (err, data) {
            res.contentType('.pdf');
            res.write(data);
            res.end();
            fs.unlink(filename+".pdf");
            fs.unlink(filename+".html");
          });
        })
      });   
    });
  }
});
app.get("/*", fourofour);
app.listen(config.port);
console.log('Now serving hot PDF generation power on port '+config.port);