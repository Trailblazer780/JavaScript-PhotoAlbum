// importing the sass stylesheet for bundling
import "./../sass/styles.scss";
import {getJSONData} from "./Toolkit";
import {sendJSONData} from "./Toolkit";
import {CookieManager} from "./CookieManager";
import { Spinner } from "spin.js";
import "./../node_modules/spin.js/spin.css";

// Global Variables
let pictureIndex = 0;
let currentPhotoTitle;
let currentPhotoCaption;
let currentPhotoSource;
let jumpToToggle = 0;
let openCommentToggle = 0;
let pictureClicked = 0;
let counterTarget;
let pictureNumber = 0;
let currentPhotoId;
let picturesToRetrieve = 11;
let imagesPreloaded = 0;
let imgSrc = [];
// JSON
const RETRIEVE_SCRIPT = "https://www.seanmorrow.ca/_lessons/albumRetrieve.php?id=w0415869&count="+picturesToRetrieve;
const SUBMIT_SCRIPT = "https://www.seanmorrow.ca/_lessons/albumAddComment.php?id=w0415869";
let json;
// ---------------------------------------------- Creating Spinner Object -------------------------------------------------------------------

let spinner = new Spinner({ color: '#FFFFFF', lines: 12 }).spin(document.querySelectorAll(".loading-overlay")[0]);

// ------------------------------
function displayPhoto() {
    // Display the photo and all related information like comments, desricption and title
    document.getElementById("mainPicture").src = "./photos/"+currentPhotoSource;
    document.getElementById("mainPictureTitle").innerHTML = currentPhotoTitle;
    document.getElementById("mainPictureCaption").innerHTML = currentPhotoCaption;
    clearComments();
    displayComments();
}

function displayComments() {
    // populate comments that have been made on the photos
    let target = document.getElementById("mainPictureComments");
    for(let i=0; i <json.photos[pictureIndex].comments.length; i++){
        let sampleTemplate = document.getElementById("samplecommenttemplate");
        let sample = sampleTemplate.cloneNode(true);
        //console.log(sample);
        sample.querySelectorAll("div")[0].innerHTML = "Submitted by: " + json.photos[pictureIndex].comments[i].author;
        sample.querySelectorAll("div")[1].innerHTML = "> " + json.photos[pictureIndex].comments[i].comment;
        sample.id = `comment${i}`;
        sample.style.display = "block";
        target.appendChild(sample);
    }
}

function clearComments() {
    // clear the comments when switching to the next photo
    const myNode = document.getElementById("mainPictureComments");
    while(myNode.firstChild){
        myNode.removeChild(myNode.lastChild);
    }
}

function preloadLoop() {
    // loop through images and put paths in an array
    for(let i=0; i<json.photos.length; i++){
        imgSrc.push(json.photos[i].source)
    }
    // preload the images based on thier path
    for(let i=0; i<imgSrc.length; i++){
        preloadImage(imgSrc[i]);
    }

}

function preloadImage(link) {
    // make new image to preload 
    let img = new Image();
    img.src = "./photos/" + link;
    img.onload = function () {
        // when image preloaded
        imagesPreloaded++
        // Check to see if all images are preloaded
        preloadImageCheck();
    }
}

function preloadImageCheck() {
    // Check to see if all images have been loaded
    if(imagesPreloaded == picturesToRetrieve){
        // Remove spinner when all photos have been loaded
        document.getElementById("makeInvisible").style.display = "none";
    }

    else{
        // Keep preloading images
        return;
    }
}

function currentPhotoData() {
    // Get the path to the source of the photo
    currentPhotoSource = json.photos[pictureIndex].source;
    // Get the title of the current photo
    currentPhotoTitle = json.photos[pictureIndex].title;
    // Get the id of the current photo
    currentPhotoId = json.photos[pictureIndex].id;
    //console.log(currentPhotoId);
    // Get the caption of the current photo
    currentPhotoCaption = json.photos[pictureIndex].caption;
    // Display the photo and information
    displayPhoto();
}

function updatePhotoCounter() {
    pictureNumber = (pictureIndex + 1);
    //pictureNumber = pictureIndex;
    // Declare where the photo counter is changed 
    counterTarget = document.getElementById("photoCounter");
    // Change the photo counter dynamically as it is scrolled through
    counterTarget.innerHTML = "Photo " + pictureNumber +" of " + picturesToRetrieve; 

    //console.log(pictureNumber);
}

function onLoaded(result) {
    //console.log("**** RETRIEVED DATA SUCCESS ****");
    //console.table(result);

    // Set the JSON data to a global variable for access 
    json = result;

    // Check the length of how many items are in the JSON data 
    let photoCount = json.photos.length;
    //console.log(photoCount);

    // If the length is more than 0 display the photos
    if (photoCount > 0){
        preloadLoop();
        // Get the current photo data
        currentPhotoData();
        // Update the photo counter
        updatePhotoCounter();

    }

    // If there is nothing in the json give an error of no photos
    else {
        console.log("No Photos");
    }

}

function onError() {
    // If there is an error put this in the console
    console.log("**** ERROR RETRIEVING JSON DATA ****");
}

function jumpToMenu() {
    // Populating the jump to menu
    document.getElementById("jumpToTarget").style.display = "block";
    let target = document.getElementById("jumpToTarget");
    if (jumpToToggle == 0){
        // Loop through photos and make the image nodes
        for(let i =0; i < json.photos.length; i++){
            // get sameple node 
            let sampleTemplate = document.getElementById("sampleimgtemplate");
            // clone sample node
            let sample = sampleTemplate.cloneNode(true);
            // Get the path to the source of the photo
            currentPhotoSource = json.photos[i].source;
            // give the element an id
            sample.id = `${i}`;
            // give the element the source of the photo
            sample.src = "./photos/"+currentPhotoSource;
            // add the action listener if the photo is clicked
            sample.addEventListener("click", function (e) {
                pictureClicked = Number(sample.id);
                // make that image apear as the main image
                jumpToImage();
            });
            // make photo visable 
            sample.style.display = "block";
            // put photo in the jump to menu
            target.appendChild(sample);
        }
        // set the jump to menu to be open
        jumpToToggle = 1;
    }
    // If menu is open and the jump button is clicked close the jump to menu and remove all contents
    else if(jumpToToggle = 1){
        let myNode = document.getElementById("jumpToTarget");
        while(myNode.lastElementChild){
            myNode.removeChild(myNode.lastElementChild);
        }
        document.getElementById("jumpToTarget").style.display = "none";
        // set jump to menu to be closed
        jumpToToggle = 0;
    }
}

function jumpToImage() {
    // Set picture index to load the same image that was clicked in the jump to menu
    pictureIndex = pictureClicked;
    // Update photo counter
    updatePhotoCounterJump();
    // Update button State
    buttonState();
    // Populate the current photo data
    currentPhotoData();
    //console.log(pictureClicked);

}

function updatePhotoCounterJump() {
    // make the picture number equal to index + 1 so the correct number is shown
    pictureNumber = pictureIndex + 1;

    //console.log(pictureNumber);

    // update the photo counter in the html
    counterTarget.innerHTML = "Photo " + pictureNumber +" of " + picturesToRetrieve;
}

function openComment() {
    // Keep comment menu open when button is clicked
    if(openCommentToggle == 0){
        document.getElementById("commentMenu").style.display = "block";
        openCommentToggle = 1;
    }
    // Close the comment menu if the button is clicked while comment menu is open
    else if(openCommentToggle == 1){
        document.getElementById("commentMenu").style.display = "none";
        openCommentToggle = 0;
    }
}

function submitComment() {
    // get the author of the comment
    let author = document.getElementById("commentAuthor").value;
    // Get the content of the comment
    let comment = document.getElementById("commentContent").value;
    // Set the json data that the comment will be sent with
    let sendJSON = {
        "photoId": currentPhotoId,
        "author": author,
        "comment": comment,
    }
    // Check to see if either field is blank and if they are do not submit comment and reset the comment menu
    if(author != "" && comment != ""){
        let sendString = JSON.stringify(sendJSON);
        sendJSONData(SUBMIT_SCRIPT, sendString, onResponse, onSubmitError);
        document.getElementById("commentContent").value = "";
        document.getElementById("commentAuthor").value = "";
        document.getElementById("commentMenu").style.display = "none";

    }
    else {
        // put this in the console if the user clicked submmit 
        console.log("nothing to comment");
    }

    //console.log(sendJSON);
}

function onResponse() {
    // if the comment was recived put this in the console
    console.log("comment Recieved");
}

function onSubmitError() {
    // if there is an error submitting a comment put this in the console
    console.log("**** ERROR SENDING JSON DATA ****");
}


function cancelComment() {
    // If cancel button is clicked clear the comments and make comment menu disappear
    document.getElementById("commentContent").value = "";
    document.getElementById("commentAuthor").value = "";
    document.getElementById("commentMenu").style.display = "none";
    // Variable to control the comment toggle
    openCommentToggle = 0;
}

function nextPicture() {
    // Disable the next button if index is greater than or equal to 9
    if(pictureIndex >= picturesToRetrieve-2) {
        document.getElementById("btnNext").disabled = true;
    }

    // Keep previous button enabled if index is greater than -1
    if(pictureIndex > -1){
        document.getElementById("btnPrevious").disabled = false;
    }

    // Add to the picture index
    pictureIndex = pictureIndex + 1;

    // Update the photo counter that is above the picture
    updatePhotoCounter();

    // Update the photo after picture index has been changed
    currentPhotoData();

    //console.log(pictureIndex);
}

function previousPicture() {
    // Keep next button enabled if index is less than 11
    if (pictureIndex < picturesToRetrieve){
        document.getElementById("btnNext").disabled = false;
    }

    // Disable previous button if index is less that 2 
    if(pictureIndex < 2){
        document.getElementById("btnPrevious").disabled = true;
    }
    
    // Subtract from picture index
    pictureIndex = pictureIndex - 1;

    // Update the photo counter that is above the picture
    updatePhotoCounter();

    // Update the photo after picture index has been changed
    currentPhotoData();

    //console.log(pictureIndex);

}

function buttonState() {
    // Keep button enabled as long as it is not at the maximum number of photos
    if (pictureIndex < picturesToRetrieve){
        document.getElementById("btnNext").disabled = false;
    }
    // Disable previous button if index is less that 2 
    if(pictureIndex < 2){
        document.getElementById("btnPrevious").disabled = true;
    }
    // Disable the next button if it is at the maximum number of photos
    if(pictureIndex >= picturesToRetrieve -1) {
        document.getElementById("btnNext").disabled = true;
    }

    // Keep previous button enabled if index is greater than -1
    if(pictureIndex > 0){
        document.getElementById("btnPrevious").disabled = false;
    }
}


function main() {

    // Disable the previous button if the index is 0
    if(pictureIndex == 0){
        document.getElementById("btnPrevious").disabled = true;
    }
    // Initialize the button state
    if(picturesToRetrieve == 0){
        document.getElementById("makeInvisible").style.display = "none";
        document.getElementById("btnPrevious").disabled = true;
        document.getElementById("btnNext").disabled = true;
        document.getElementById("btnComment").disabled = true;
        document.getElementById("btnJump").disabled = true;
        document.getElementById("NoImage").style.display = "block";
    }

    // Wiring up the event listeners 
    document.getElementById("btnNext").addEventListener("click", nextPicture);
    document.getElementById("btnPrevious").addEventListener("click", previousPicture);
    document.getElementById("btnJump").addEventListener("click", jumpToMenu);
    document.getElementById("btnComment").addEventListener("click", openComment);
    document.getElementById("btnOk").addEventListener("click", submitComment);
    document.getElementById("btnCancel").addEventListener("click", cancelComment);

    // Getting the JSON data 
    getJSONData(RETRIEVE_SCRIPT, onLoaded, onError);

} 

main();