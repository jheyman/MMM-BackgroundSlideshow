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
  // shuffles an array at random and returns it
  shuffleArray: function(array) {
    var currentIndex = array.length,
      temporaryValue,
      randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  },
  // sort by filename attribute
  sortByFilename: function(a, b) {
    aL = a.imagePath.toLowerCase();
    bL = b.imagePath.toLowerCase();
    if (aL > bL) return 1;
    else return -1;
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
    var imageList = [];
    for (var i = 0; i < config.imagePaths.length; i++) {
      this.getFiles(config.imagePaths[i], imageList, config);
    }

    imageList = config.randomizeImageOrder
      ? this.shuffleArray(imageList)
      : imageList.sort(this.sortByFilename);

 	for (var i = 0; i < imageList.length; i++) {
	    console.log("gatherImageList["+ i +"]: " + imageList[i].imagePath) 
    }

    return imageList;
  },
  getFiles(path, imageList, config) {
    var contents = FileSystemImageSlideshow.readdirSync(path);

	//pick a random element
	let randomIndex = Math.floor(Math.random() * contents.length)
	var itemName = contents[randomIndex];
	var currentItemPath = path + '/' + itemName;


	var pathElements = path.split("/");
	var itemTopDir = pathElements[pathElements.length-1].replace(/_/g, ' ');

  if (itemTopDir.match(/[A-Z][a-z]+|[0-9]+/g) != null) {
    itemTopDir = itemTopDir.match(/[A-Z][a-z]+|[0-9]+/g).join(" ");
    console.log("JOINED:" + itemTopDir.match(/[A-Z][a-z]+|[0-9]+/g).join(" "));
  } else{
    console.log("NOT JOINED:" + itemTopDir);
  }

  //console.log("itemTopDir.match.typeof:" + itemTopDir.match(/[A-Z][a-z]+|[0-9]+/g).toString().join(" "));

  // break at each uppercase letter and Number
  //itemTopDir = itemTopDir.match(/[A-Z][a-z]+|[0-9]+/g).join(" ");

	try {
		if (!config.excludedImagePaths.includes(currentItemPath)) {

			var stats = FileSystemImageSlideshow.lstatSync(currentItemPath);
		    
		    // if it's a folder, recursively look for a random image in that
		    if (stats.isDirectory() && config.recursiveSubDirectories) {
		      this.getFiles(currentItemPath, imageList, config);
		    } 
			// if it's an image, boom, we're done
		    else if (stats.isFile()) {
		      var isValidImageFileExtension = this.checkValidImageFileExtension(
		        currentItemPath,
		        config.validImageFileExtensions
		      );


				var imageStruct = {
				  imagePath: [currentItemPath],
				  imageDir: [itemTopDir],
				};


		      if (isValidImageFileExtension) imageList.push(imageStruct);
		    }
		}
	}
	catch(error) {
		console.log("Caught exception: " + error)
	}
  },  
  // subclass socketNotificationReceived, received notification from module
  socketNotificationReceived: function(notification, payload) {
    console.log("socketNotificationReceived with not=" + notification);
    if (notification === 'BACKGROUNDSLIDESHOW_REGISTER_CONFIG') {

      console.log("SLIDESHOW node helper CALLED");

      // this to self
      var self = this;
      // get the image list
      var imageList = this.gatherImageList(payload);
      // build the return payload
      var returnPayload = {
        identifier: payload.identifier,
        imageList: imageList
      };
      // send the image list back
      self.sendSocketNotification(
        'BACKGROUNDSLIDESHOW_FILELIST',
        returnPayload
      );
    }
  }
});

//------------ end -------------
