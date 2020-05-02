# Module: Background Slideshow (jheyman custom version)

Customization of the excellent [module](https://github.com/darickc/MMM-BackgroundSlideshow) for MagicMirror2 to display background images/slideshow:
- optimized random pick of ONE image at a time from an arbitrarily complex directory tree (original code was browsing the whole tree of the specified path, and built a single list will all file paths, which did not scale well to huge directories)
- added title showing the directory name from which the current image was picked.
- added the ability to go back to previous pic
- added the ability to send a scaled-down version of the currently displayed pic in an email to a predefined list of recipients

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
			disabled: false,
			position: 'fullscreen_below',
			config: {
				imagesTopDirectory: 'path/to/your/Images',
				excludedImagePaths: ['path/to/exclude', 'another/path/to/exclude'],
				filteredDirectoriesKeyword: 'NOSHOW_',
				transitionImages: true,
				recursiveSubDirectories: true,
				slideshowSpeed: 60000, /* time between refresh in milliseconds*/
				backgroundSize: "contain",
				gradient: ["rgba(0, 0, 0, 0.0) 0%", "rgba(0, 0, 0, 0) 100%"],
				emailConfig: {
					service: 'gmail', // See nodemailer library for list of supported email providers
					auth: {
						user: 'john.doe@gmail.com', // Your email account
						pass: 'supersecretpassword' // Your password for email account
					},
					recipients: "XXXXXXX@gmail.com, YYYYYYYYY@gmail.com",
					emailText: "(some text to put in the email body)",
					emailDisableTime: 60000 /* email inhibit time after email is sent */
				}
			}
		},
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
		<tr>
			<td><code>BACKGROUNDSLIDESHOW_PREVIOUS</code></td>
			<td>Go back to previous image<br>
			</td>
		</tr>
		<tr>
			<td><code>BACKGROUNDSLIDESHOW_SENDASEMAIL</code></td>
			<td>Send a resized version of the current pic as email<br>
			</td>
		</tr>		
</table>