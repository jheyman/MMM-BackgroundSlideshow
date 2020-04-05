/* global Module */

/* MMM-BackgroundSlideshow.js
 * Custom version by jheyman based on :
 * Module: MMM-BackgroundSlideshow
 *
 * Magic Mirror By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 *
 * Module MMM-Slideshow By Darick Carpenter
 * MIT Licensed.
 */

Module.register('MMM-BackgroundSlideshow', {
  // Default module config.
  defaults: {
    // an array of strings, each is a path to a directory with images
    imagesTopDirectory: 'modules/MMM-BackgroundSlideshow/exampleImages',
    // an array of string,s each is a path to a blacklisted directory
    excludedImagePaths: [],
    // a keyword to filter out directories
    filteredDirectoriesKeyword: "NO_SHOW_",
    // the speed at which to switch between images, in milliseconds
    slideshowSpeed: 10 * 1000,
     // if false each path with be viewed seperately in the order listed
    recursiveSubDirectories: false,
    // list of valid file extensions, seperated by commas
    validImageFileExtensions: 'bmp,jpg,gif,png',
    // transition speed from one image to the other, transitionImages must be true
    transitionSpeed: '1s',
    // the sizing of the background image
    // cover: Resize the background image to cover the entire container, even if it has to stretch the image or cut a little bit off one of the edges
    // contain: Resize the background image to make sure the image is fully visible
    backgroundSize: 'cover', // cover or contain
    // if backgroundSize contain, determine where to zoom the picture. Towards top, center or bottom
    backgroundPosition: 'center', // Most useful options: "top" or "center" or "bottom"
    // transition from one image to the other (may be a bit choppy on slower devices, or if the images are too big)
    transitionImages: false,
    // the gradient to make the text more visible
    gradient: [
      'rgba(0, 0, 0, 0.75) 0%',
      'rgba(0, 0, 0, 0) 40%',
      'rgba(0, 0, 0, 0) 80%',
      'rgba(0, 0, 0, 0.75) 100%'
    ],
    horizontalGradient: [
      'rgba(0, 0, 0, 0.75) 0%',
      'rgba(0, 0, 0, 0) 40%',
      'rgba(0, 0, 0, 0) 80%',
      'rgba(0, 0, 0, 0.75) 100%'
    ],
    // the direction the gradient goes, vertical or horizontal
    gradientDirection: 'vertical'
  },

  // load function
  start: function() {
    // add identifier to the config
    this.config.identifier = this.identifier;
    // ensure file extensions are lower case
    this.config.validImageFileExtensions = this.config.validImageFileExtensions.toLowerCase();
    // set no error
    this.errorMessage = null;
    if (this.config.imagesTopDirectory == undefined) {
      this.errorMessage =
        'MMM-BackgroundSlideshow: Missing required parameter.';
    } else {
      // create an empty image
      this.imageStruct = {};
      // initialize by getting a first image
      this.grabNewImageInfo();
    }
  },

  getScripts: function() {
		return ["modules/" + this.name + "/node_modules/exif-js/exif.js"];
  },
  
  getStyles: function() {
    // the css contains the make grayscale code
    return ['BackgroundSlideshow.css'];
  },

  // generic notification handler
  notificationReceived: function(notification, payload, sender) {
    if (sender) {
      console.log(this.name + " received a module notification: " + notification + " from sender: " + sender.name);
      if(notification === 'BACKGROUNDSLIDESHOW_IMAGE_UPDATE'){
        //console.log("MMM-BackgroundSlideshow: Changing Background");
        this.suspend();
        this.updateImage();
        this.resume();
      }
      else if (notification === 'BACKGROUNDSLIDESHOW_NEXT'){ // Change to next image
        this.suspend();
        this.grabNewImageInfo();
        if(this.timer){   // Restart timer only if timer was already running
          this.resume();
        }
      }
      else if (notification === 'BACKGROUNDSLIDESHOW_PLAY'){ // Change to next image and start timer.
        this.grabNewImageInfo();
        this.resume();
      }
      else if (notification === 'BACKGROUNDSLIDESHOW_PAUSE'){ // Stop timer.
        this.suspend();
      }
      else {
        Log.log(this.name + " received a system notification: " + notification);
      }
    }
  },

  // manage notifications from our node_helper
  socketNotificationReceived: function(notification, payload) {
    // if an update was received
    if (notification === 'BACKGROUNDSLIDESHOW_NEW_IMAGE_INFO') {
      // check this is for this module based on the woeid
      if (payload.identifier === this.identifier) {
        console.info('Returning Images, payload:' + JSON.stringify(payload));
        // set the image list
        this.imageStruct = payload.imageStruct;
        // if image info actually contains an image path
        // trig an update on the displayed page
        if (this.imageStruct.imagePath != '') {
          this.updateImage();
          this.resume();
        } else {
          // the random search returned an empty path, 
          // don't try immediately fetching another image, we may stall the program  
        	// by continuously trying and getting an empty result (e.g. single empty directory set as image path)
        	// but still retry a few seconds later (if the random pick returned nothing, the next one likely won't) 
        	setTimeout(this.resume(), 2000);
        }
      }
    }
  },

  // Override dom generator.
  getDom: function() {
    var wrapper = document.createElement('div');
    this.div1 = this.createDiv('big1');
    this.div2 = this.createDiv('big2');

    // insert title line
   	this.titleDiv = document.createElement('div');
    this.titleDiv.className = "imageTitleClass";
    this.titleDiv.innerHTML = "Image Title Test!";
    wrapper.appendChild(this.titleDiv);

    // insert the two overlapping images (the current one and the hidden one for fade effect)
    wrapper.appendChild(this.div1);
    wrapper.appendChild(this.div2);

    if (
      this.config.gradientDirection === 'vertical' ||
      this.config.gradientDirection === 'both'
    ) {
      this.createGradientDiv('bottom', this.config.gradient, wrapper);
    }

    if (
      this.config.gradientDirection === 'horizontal' ||
      this.config.gradientDirection === 'both'
    ) {
      this.createGradientDiv('right', this.config.gradient, wrapper);
    }

    return wrapper;
  },

  createGradientDiv: function(direction, gradient, wrapper) {
    var div = document.createElement('div');
    div.style.backgroundImage =
      'linear-gradient( to ' + direction + ', ' + gradient.join() + ')';
    div.className = 'gradient';
    wrapper.appendChild(div);
  },

  createDiv: function(name) {
    var div = document.createElement('div');
    div.id = name + this.identifier;
    div.style.backgroundSize = this.config.backgroundSize;
    div.style.backgroundPosition = this.config.backgroundPosition;
    div.style.transition =
      'opacity ' + this.config.transitionSpeed + ' ease-in-out';
    div.className = 'backgroundSlideShow';
    return div;
  },

  updateImage: function() {
    //console.log("MMM-BackgroundSlideShow UPDATE IMAGE");
    if (this.imageStruct && this.imageStruct.imagePath != '') {
        if (this.config.transitionImages) {
          this.swapDivs();
        }
        var div1 = this.div1;
        var div2 = this.div2;
        var title = this.titleDiv;
        
        // update titel
        title.innerHTML = this.imageStruct.imageDir;

        // update image source/content
        var image = new Image();
        image.onload = function() {
  			div1.style.backgroundImage = "url('" + this.src + "')";
  			div1.style.opacity = '1';
        
        // manage image orientation from EXIT data in the file
        div1.style.transform="rotate(0deg)";
  			EXIF.getData(image, function() {
  				var Orientation = EXIF.getTag(this, "Orientation");
  				if (Orientation != null) {
  					// console.info('Updating image, orientation:' + Orientation);
  					if (Orientation == 3) {
  						// console.info('Updating rotation to 0deg');
  						div1.style.transform="rotate(180deg)";
  					}
  					else 
  						if (Orientation == 6) {
  						// console.info('Updating rotation to 90deg');
  						div1.style.transform="rotate(90deg)";
  						}
  					else
  						if (Orientation == 8) {
  						// console.info('Updating rotation to -90deg');
  						div1.style.transform="rotate(-90deg)";
  						}
  					}
  				}
  			)

          div2.style.opacity = '0';
        };
        image.src = encodeURI(this.imageStruct.imagePath);
        this.sendNotification('BACKGROUNDSLIDESHOW_IMAGE_UPDATED', {url:image.src});
		    console.info('Updating image, source:' + image.src);
    }
  },

  swapDivs: function() {
    var temp = this.div1;
    this.div1 = this.div2;
    this.div2 = temp;
  },

  suspend: function() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  resume: function() {
    this.suspend();
    var self = this;
    this.timer = setInterval(function() {
		 //console.log('MMM-BackgroundSlideshow updating after setInterval timeout');
      self.grabNewImageInfo();
    }, self.config.slideshowSpeed);
  },

  grabNewImageInfo: function() {
    //console.log("grabNewImageInfo called");
    this.suspend();
    // ask helper function to get a fresh image
    this.sendSocketNotification(
      'BACKGROUNDSLIDESHOW_GRAB_RANDOM_IMAGE',
      this.config
    );
  }
});
