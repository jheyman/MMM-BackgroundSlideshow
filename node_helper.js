/* global Module */

/* node_helper.js
* Custom version by jheyman based on :
 * Module: MMM-BackgroundSlideshow
 *
 * Magic Mirror By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 *
 * Module MMM-BackgroundSlideshow By Darick Carpenter
 * MIT Licensed.
 */

// call in the required classes
var NodeHelper = require('node_helper');
var FileSystemImageSlideshow = require('fs');
const Jimp = require('jimp');
var nodemailer = require('nodemailer');
const EMAIL_PIC_PATHNAME = "modules/MMM-BackgroundSlideshow/email_temp.jpg";

// the main module helper create
module.exports = NodeHelper.create({
  // subclass start method, clears the initial config array
  start: function() {
    //this.moduleConfigs = [];
  },
  // checks there's a valid image file extension
  checkValidImageFileExtension: function(filename, extensions) {
    var extList = extensions.split(',');
    for (var extIndex = 0; extIndex < extList.length; extIndex++) {
      if (filename.toLowerCase().endsWith(extList[extIndex])) return true;
    }
    return false;
  },
  resizeImage: function(inputFile, outputFile) {
      console.log("resizeImage :" + inputFile);
      Jimp.read(inputFile, function (err, test) {
        if (err) throw err;
        test.resize(1024, Jimp.AUTO)
            .quality(95)                 
            .write(EMAIL_PIC_PATHNAME); 
    });
  },
  // gathers the image list
  gatherImageList: function(config) {
    var self = this;
    // create an empty main image list
    var imageStruct = {
      imagePath: "",
      imageDir: "",
    };
    this.getFiles(config.imagesTopDirectory, imageStruct, config);

    console.log("gatherImageList returned " + imageStruct.imagePath + " from " + imageStruct.imageDir);
    return imageStruct;
  },
  getFiles(path, imageStruct, config) {
    var contents = FileSystemImageSlideshow.readdirSync(path);

  	//pick a random element
  	let randomIndex = Math.floor(Math.random() * contents.length)
  	var itemName = contents[randomIndex];
  	var currentItemPath = path + '/' + itemName;

  	var pathElements = path.split("/");
    // keep only the parent directory of the image, that's what we want to display
  	var itemTopDir = pathElements[pathElements.length-1].replace(/_/g, ' ');

    // Beautify the parent directory name, by breaking into separate words & dates with space in between
    if (itemTopDir.match(/[a-zà-ú]+|[A-Z][a-zà-ú]+|[A-Z]+|[0-9]+/g) != null) {
      //console.log("Before beautifying:" + itemTopDir);
      itemTopDir = itemTopDir.match(/[a-zà-ú]+|[A-Z][a-zà-ú]+|[A-Z]+|[0-9]+/g).join(" ");
      //console.log("After beautifying:" + itemTopDir.match(/[a-zà-ú]+|[A-Z][a-zà-ú]+|[A-Z]+|[0-9]+/g).join(" "));
    }

  	try {
  		if (!config.excludedImagePaths.includes(currentItemPath) && !currentItemPath.includes(config.filteredDirectoriesKeyword)) {
  			 var stats = FileSystemImageSlideshow.lstatSync(currentItemPath);
  		    
  		    // if it's a folder, recursively look for a random image in that
  		    if (stats.isDirectory() && config.recursiveSubDirectories) {
  		      this.getFiles(currentItemPath, imageStruct, config);
  		    } 
  			  // if it's an image, boom, we're done
  		    else if (stats.isFile()) {
  		      var isValidImageFileExtension = this.checkValidImageFileExtension(
  		        currentItemPath,
  		        config.validImageFileExtensions
  		      );

  		      if (isValidImageFileExtension) {
                imageStruct.imagePath = currentItemPath; 
                imageStruct.imageDir = itemTopDir;
                //console.log("getFiles returns " + imageStruct.imagePath + ", " + imageStruct.imageDir);
            }
  		    }
  		}
  	}
  	catch(error) {
  		console.error("Caught exception: " + error)
    }
    //console.log("getFiles returns " + imageStruct.imagePath + " from " + imageStruct.imageDir);
  },  
  // subclass socketNotificationReceived, received notification from module
  socketNotificationReceived: function(notification, payload) {
    console.log("MMM-BackgroundSlideShow node_helper: socketNotificationReceived = " + notification);
    // this to self
    var self = this;  
    
    if (notification === 'INIT_MAILER'){
      this.config = payload;
      console.log('BackgroundSlideShow initializing nodemailer, email account used:' + self.config.emailConfig.auth.user);
      this.transporter = nodemailer.createTransport({
          service: self.config.emailConfig.service,
          auth: {
              user: self.config.emailConfig.auth.user,
              pass: self.config.emailConfig.auth.pass
          },
          logger: true, // log to console
          debug: false // don't include SMTP data in the logs
      });
    }
    else if (notification === 'BACKGROUNDSLIDESHOW_GRAB_RANDOM_IMAGE') {

      // get the image list
      var imageStruct = this.gatherImageList(payload);
      // build the return payload
      var returnPayload = {
        identifier: payload.identifier,
        imageStruct: imageStruct
      };
      // send the image list back
      self.sendSocketNotification(
        'BACKGROUNDSLIDESHOW_NEW_IMAGE_INFO',
        returnPayload
      );
    }
    else if (notification === 'BACKGROUNDSLIDESHOW_EMAIL_IMAGE') {
      self.resizeImage(payload.imagePath);
               
      var message = {
          from: 'Julien',
          to: self.config.emailConfig.recipients,
          subject: "[Photo] "+ payload.imageDir,
          text: self.config.emailConfig.emailText,
          attachments: [
              {
                  path: EMAIL_PIC_PATHNAME
              }
          ]
      }

      // send the resized pic as attachment in an email, with a 10s delay 
      // (to make sure the resized pic has been written to disk) 
      setTimeout(function(){
        self.transporter.sendMail(message, function (error, info) {
            console.log('MMM-BackgroundSlideShowMessage sending email now !');
            if (error) {
                console.log('Error occurred');
                console.log(error.message);
                return;
            }
            console.log('MMM-BackgroundSlideShowServer responded with "%s"', info.response);
      })}, 10000);
    }
  }
});

//------------ end -------------
