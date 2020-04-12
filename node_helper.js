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
    if (notification === 'BACKGROUNDSLIDESHOW_GRAB_RANDOM_IMAGE') {
      // this to self
      var self = this;
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
  }
});

//------------ end -------------
