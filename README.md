# Module: Background Slideshow (jheyman custom version)

Customization of the excellent [module](https://github.com/darickc/MMM-BackgroundSlideshow) for MagicMirror2 to display background images/slideshow:
- optimized random pick of ONE image at a time from an arbitrarily complex directory tree (original code was browsing the whole tree of the specified path, and built a single list will all file paths, which did not scale well to huge directories)
- added title showing the directory name from which the current image was picked.

## Installing the module

In MagicMirror's `modules` directory,

````
git clone https://github.com/jheyman/MMM-BackgroundSlideshow.git'
````

````
cd MMM-BackgroundSlideshow
````

````
npm install
````

## Configuring the module

Add the module to the modules array in the `config/config.js` file:

```javascript
modules: [
  {
    module: 'MMM-BackgroundSlideshow',
    position: 'fullscreen_below',
    config: {
    	// see config options below
    }
  }
];
```

## Notification options

The following notifications can be used:

<table width="100%">
	<!-- why, markdown... -->
	<thead>
		<tr>
			<th>Notification</th>
			<th width="100%">Description</th>
		</tr>
	<thead>
	<tbody>
		<tr>
			<td><code>BACKGROUNDSLIDESHOW_NEXT</code></td>
			<td>Change to the next image, restart the timer for image changes only if already running<br>
			</td>
		</tr>
		<tr>
			<td><code>BACKGROUNDSLIDESHOW_PAUSE</code></td>
			<td>Pause the timer for image changes<br>
			</td>
		</tr>		
		<tr>
			<td><code>BACKGROUNDSLIDESHOW_PLAY</code></td>
			<td>Change to the next image and start the timer for image changes<br>
			</td>
		</tr>
</table>


## Configuration options

The following properties can be configured:

<table width="100%">
	<!-- why, markdown... -->
	<thead>
		<tr>
			<th>Option</th>
			<th width="100%">Description</th>
		</tr>
	<thead>
	<tbody>
		<tr>
			<td><code>imagesTopDirectory</code></td>
			<td>Path to a directory that will be searched (randomly) for images.<br>
				<br><b>Example:</b> <code>['modules/MMM-BackgroundSlideshow/exampleImages']</code>
				<br>This value is <b>REQUIRED</b>
			</td>
		</tr>
		<tr>
			<td><code>excludedImagePaths</code></td>
			<td>An array of strings containing directory paths that should be ignore (within the top directory)<br>
				<br><b>Example:</b> <code>['modules/MMM-BackgroundSlideshow/exampleImages/DontShowThisDir']</code>
				<br>This value is <b>OPTIONAL</b>
			</td>
		</tr>
		<tr>
			<td><code>filteredDirectoriesKeyword</code></td>
			<td>While searching for images, the module will filter out directories which name contains this keyword<br>
				<br><b>Example:</b> <code>'DontShowThisDir_'</code>
				<br>This value is <b>OPTIONAL</b>
			</td>
		</tr>			
		<tr>
			<td><code>slideshowSpeed</code></td>
			<td>Integer value, the length of time to show one image before switching to the next, in milliseconds.<br>
				<br><b>Example:</b> <code>6000</code> for 6 seconds
				<br><b>Default value:</b> <code>10000</code> or 10 seconds
				<br>This value is <b>OPTIONAL</b>
			</td>
		</tr>
        <tr>
			<td><code>recursiveSubDirectories</code></td>
			<td>Boolean value, if true it will scan all sub-directories in the imagePaths.<br>
				<br><b>Example:</b> <code>true</code>
				<br><b>Default value:</b> <code>false</code>
				<br>This value is <b>OPTIONAL</b>
			</td>
		</tr>
        <tr>
			<td><code>validImageFileExtensions</code></td>
			<td>String value, a list of image file extensions, seperated by commas, that should be included. Files found without one of the extensions will be ignored.<br>
				<br><b>Example:</b> <code>'png,jpg'</code>
				<br><b>Default value:</b> <code>'bmp,jpg,gif,png'</code>
				<br>This value is <b>OPTIONAL</b>
			</td>
		</tr>
    <tr>
			<td><code>transitionSpeed</code></td>
			<td>Transition speed from one image to the other, transitionImages must be true. Must be a valid css transition duration.<br>
				<br><b>Example:</b> <code>'2s'</code>
				<br><b>Default value:</b> <code>'1s'</code>
				<br>This value is <b>OPTIONAL</b>
			</td>
		</tr>
    <tr>
			<td><code>backgroundSize</code></td>
			<td>The sizing of the background image. Values can be:<br>
        cover: Resize the background image to cover the entire container, even if it has to stretch the image or cut a little bit off one of the edges.<br>
        contain: Resize the background image to make sure the image is fully visible<br>
				<br><b>Example:</b> <code>'contain'</code>
				<br><b>Default value:</b> <code>'cover'</code>
				<br>This value is <b>OPTIONAL</b>
			</td>
		</tr>
    <tr>
			<td><code>backgroundPosition</code></td>
			<td>Determines where the background image is placed if it doesn't fill the whole screen (i.e. backgroundSize is 'contain'). Module already defaults to 'center', so the most useful options would be: 'top' 'bottom' 'left' or 'right'. However, any valid value for CSS background-position could be used.<br>
				<br><b>Example:</b> <code>'top'</code>
				<br><b>Default value:</b> <code>'center'</code>
				<br>This value is <b>OPTIONAL</b>
			</td>
		</tr>
    <tr>
			<td><code>transitionImages</code></td>
			<td>Transition from one image to the other (may be a bit choppy on slower devices, or if the images are too big).<br>
				<br><b>Example:</b> <code>true</code>
				<br><b>Default value:</b> <code>false</code>
				<br>This value is <b>OPTIONAL</b>
			</td>
		</tr>
    <tr>
			<td><code>gradient</code></td>
			<td>The vertical gradient to make the text more visible.  Enter gradient stops as an array.<br>
				<br><b>Example:</b> <code>[
      "rgba(0, 0, 0, 0.75) 0%",
      "rgba(0, 0, 0, 0) 40%"
    ]</code>
				<br><b>Default value:</b> <code>[
      "rgba(0, 0, 0, 0.75) 0%",
      "rgba(0, 0, 0, 0) 40%",
      "rgba(0, 0, 0, 0) 80%",
      "rgba(0, 0, 0, 0.75) 100%"
    ]</code>
				<br>This value is <b>OPTIONAL</b>
			</td>
		</tr>
		<tr>
			<td><code>horizontalGradient</code></td>
			<td>The horizontal gradient to make the text more visible.  Enter gradient stops as an array.<br>
				<br><b>Example:</b> <code>[
      "rgba(0, 0, 0, 0.75) 0%",
      "rgba(0, 0, 0, 0) 40%"
    ]</code>
				<br><b>Default value:</b> <code>[
      "rgba(0, 0, 0, 0.75) 0%",
      "rgba(0, 0, 0, 0) 40%",
      "rgba(0, 0, 0, 0) 80%",
      "rgba(0, 0, 0, 0.75) 100%"
    ]</code>
				<br>This value is <b>OPTIONAL</b>
			</td>
		</tr>
    <tr>
			<td><code>gradientDirection</code></td>
			<td>The direction of the gradient<br>
				<br><b>Example:</b> <code>'horizontal'</code>
				<br><b>Default value:</b> <code>'vertical'</code>
				<br><b>Possible values:</b> <code>'vertical', 'horizontal', 'both'</code>
				<br>This value is <b>OPTIONAL</b>
			</td>
		</tr>
    </tbody>
</table>