<img align="center" src="./assets/media/herb-logo-large.png"></img>

<h1 align="center">HERB Monitoring</h1>

Click [here](https://natte2110.github.io/herb-monitoring/) to view the live project on GitHub Pages.

This is a project for the Code Institute Milestone Project 2. It is a website used to enable users to monitor frequently updated APIs containing geospatial information.

This will contain:
-   Weather Monitoring
-   Flood Alerts
-   Traffic Data

# User Experience (UX)

## User Stories

-    ### Goals For A First-Time Visitor:

        1. As A First Time Visitor - I want to be able to understand the main purpose of the site, and find out useful information regarding the business.
        2. As A First Time Visitor - I want to be able to view an intuitive layout and navigation to easily find the page I require.
        3. As A First Time Visitor - I want to be able to interact with the maps on the page to achieve my desired purpose.

-    #### Goals For A Returning Visitor:

        1. As A Returning Visitor - I want to be able to see any updates to the information on the monitoring maps.
        2. As A Returning Visitor - I want to be able to view a page containing contact details where I can ask for support or pose general queries.
        3. As A Returning Visitor - I want to be able to query the monitoring data to gain a better understanding of what it represents.

-    #### Goals For A Frequent Visitor:

        1. As A Frequent Visitor - I want to be able to view updated information to see if anything is pertinent to me.
        2. As A Frequent Visitor - I want to be able to use a location feature to find a specific area of the country, preferably my own location.
        3. As A Frequent Visitor - I want to be able to check a specific traffic incident to see if it will affect me.

## Design

-   ### Colour Scheme

    -   The main colour scheme will be an off-blue colour with an overall dark feel to the site. White text will be used atop this dark background to ensure clear visibility of all text across all pages.
    - This colour scheme will provide a professional feel to the website as well as being easily accessible to all users.

-   ### Typography

    -   The main font used within the websites design will be Open Sans, with a fall-back font of Sans-Serif if the Open Sans font could not be loaded. The Open Sans font gives off a professional first impression.

-   ### Imagery

    -   The home page will be fitted with a fixed, scrollable background image that will have a dynamic blur effect applied as the user scrolls.
    -   Imagery will also be available in [popups](https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Popup.html) contained within the information displayed on the mapping pages.

## Wireframes

Click on the links below to access the wireframes created to plan and design this website.

-   [Desktop Home Page Wireframe](assets/media/desktop-wireframe01.png)

-   [Mobile Home Page Wireframe](assets/media/mobile-wireframe01.png)

## Features

-   ### Responsive

    -   The website will be responsive on all devices, with CSS media queries to change size and position of elements on different screen sizes.

-   ### Interactive

    -   The website will incorporate interactivity by allowing the user to complete actions within the monitoring map faces.

-   ### Current

    -   The website will pull up-to-date data from monitoring APIs and display them accordingly. This will ensure that any new features will be dynamically loaded and added to the maps.

# Technologies Used

## Languages Used

-   [HTML5](https://en.wikipedia.org/wiki/HTML5)
-   [CSS](https://en.wikipedia.org/wiki/Cascading_Style_Sheets)
-   [JavaScript](https://en.wikipedia.org/wiki/JavaScript)

## External Frameworks, Programmes, Libraries and API's Used

1. [Google Fonts:](https://fonts.google.com/)
    - Google fonts were used in order to import the Open Sans font used in the design of the website. The link to the google font was placed at the top of the overarching CSS File.
2. [Font Awesome:](https://fontawesome.com/)
    - Font Awesome was used to add icons to certain elements in order to provide more information about them, such as a 'Telephone' Icon to preface the company phone number.
3. [Bootstrap 4.1.3:](https://getbootstrap.com/docs/4.1/getting-started/introduction/)
    - Bootstrap was utilised in order to create the main structure of the page more easily, by using the ready-made components to create a responsive design/layout.
4. [jQuery:](https://jquery.com/)
    - jQuery worked in accordance with Bootstrap to add additional interaction and responsivity to the Navbar and other elements.
5. [Git](https://git-scm.com/)
    - Git was used for version control by using the terminal to add and commit files and messages when changes were made in order to keep a documented track of the development process.
6. [GitHub:](https://github.com/)
    - GitHub was used in order to store the files pushed from the terminal using git. It was also used to host the final project using GitHub Pages.
7. [Balsamiq:](https://balsamiq.com/)
    - Balsamiq was used to create the wireframes during the initial design process.
8. [GIMP:](https://www.gimp.org/)
    - GIMP was used to create the websites logos that can be seen on each page.
9. [ArcGIS Maps SDK for JavaScript:](https://developers.arcgis.com/javascript/latest/)
    - This was used in order to create the maps and enable the visualisation of the geospatial data pulled from external API's
    - It also provides added interactivity through the use of widgets that enable the user to have an impact on the information they see.
10. [Environment Agency Real Time flood-monitoring API:](https://environment.data.gov.uk/flood-monitoring/doc/reference)
    - This Flood Monitoring API was used to gather geospatial locations and related attributes from flood monitoring stations across the UK.
    - This data was then used to plot the points on a map to provide a visual representation of the fetched information.
11. [Bing Maps - Traffic Incidents API:](https://learn.microsoft.com/en-us/bingmaps/rest-services/traffic/)
    - The Bing Maps Traffic Incidents API was used to receive data on all traffic incidents reported in a specific area.
    - This was later used in conjuction with the ArcGIS Maps SDK for JavaScript to provide a visual mapping representation of these incidents, allowing the user to interact with said data and attain more information by clicking on specific incidents if they wished to.
12. [Cloud Convert:](https://cloudconvert.com/)
    - Cloud convert was a web based image conversion tool used to convert .jpg and .png images to a more suitable .webp file type.
    - The use of this vastly reduced the file size of the images made for much quicker loading times on each page, and thus a more pleasant experience for a user.