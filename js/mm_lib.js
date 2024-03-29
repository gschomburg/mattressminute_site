var data_sets = [
    '2024_01_12'
]
var mattress_data=[]

async function loadImageData() {
    var path = 'https://mattressminute.com/data/';
    try {
        const response = await fetch(path + 'mattress.php');
        const imageData = await response.json();
        return imageData;
    } catch (error) {
        console.error('Error loading image data:', error);
        return [];
    }
    // try {
    //     const imageData = await mergeJsonFiles(data_sets);
    //     return imageData;
    // } catch (error) {
    //     console.error('Error loading image data:', error);
    //     return [];
    // }
}
async function mergeJsonFiles(jsonFiles) {
    try {
        const mergedData = [];

        for (const jsonFile of jsonFiles) {
            const response = await fetch(`images/${jsonFile}.json`);
            const imageData = await response.json();

            // Add a new value to each object in the array
            const updatedImageData = imageData.map(item => ({
                ...item,
                data_set: jsonFile  // Add the name of the JSON file as a new property
            }));

            mergedData.push(...updatedImageData);
        }

        return mergedData;
    } catch (error) {
        console.error('Error merging JSON files:', error);
        return [];
    }
}

function getImgIndex(index){
    //for time
    // const currentTime = new Date();
    return index%mattress_data.length;
}
function getObjectsByIds(idsToFilter, array) {
    return array.filter(obj => idsToFilter.includes(obj.id));
}

function getMattressData(hour, minute){
    //add in the day of the year
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now - startOfYear;
    const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
    const dayOfYear = Math.floor(diff / oneDay);

    
    // var mult = hour*minute;
    // var div = minute/hour;
    // var extrawild = mult+div;
    // var numStr = "min" + hour.toString() + minute.toString() + dayOfYear.toString() + extrawild.toString();
    var timeNum = getHashIndexForTime(dayOfYear, hour, minute);//simpleHash(numStr);
    // console.log("numStr", numStr);
    // console.log("timeNum", timeNum);
    //show life style images at the top of every hour
    if(minute==0){
        //return a lifestyle image
        var lifestyle = filterMattressData('lifestyle');
        // var index = timeNum%lifestyle.length;
        // console.log('lifestyle:', lifestyle)
        return lifestyle[timeNum%lifestyle.length];
    }
    var index = timeNum%mattress_data.length;
    return mattress_data[index];
    // return minute;
}
function getHashIndexForTime(dayOfYear, hour, minute){
    var mult = hour*minute;
    var div = minute/hour;
    var extrawild = mult+div;
    var numStr = "min" + hour.toString() + minute.toString() + dayOfYear.toString() + extrawild.toString();
    var timeNum = simpleHash(numStr);
    return timeNum;
}

function testHash(){
    var count = mattress_data.length;
    var plotVals = Array.from({ length: count }, () => 0);

    //test values
    var days = 365;
    var hours = 24;
    var minutes = 60;
    for(var d=0; d<days; d++){
        for(var h=0; h<hours; h++){
            for(var m=0; m<minutes; m++){
                var v = getHashIndexForTime(d, h, m);
                var index = v%count;
                plotVals[index] += 1;
            }
        }
    }
    return plotVals;
}

function filterMattressData(tag){
    //only get data that has matching tag
    return mattress_data.filter(item => item.tags && item.tags.includes(tag));
    // return mattress_data.filter(item => item.tags.includes(tag));
}

function getRandomData(){
    return mattress_data[Math.floor(Math.random()*(mattress_data.length-1))];
}


//https://www.google.com/maps/place/40%C2%B043'22.8%22N+73%C2%B056'40.8%22W
function formatLatLong(latLongString) {
    if(latLongString == null || latLongString==""){
        return null;
    }
    // console.log('formatLatLong: ' + latLongString);
    // Split the string into latitude and longitude parts
    const [latPart, longPart] = latLongString.split('+');
    
    // Split each part into degrees, minutes, and seconds
    const [latDeg, latMin, latSec] = latPart.split(',').map(parseFloat);
    const [longDeg, longMin, longSec] = longPart.split(',').map(parseFloat);

    // Format each part with symbols
    const formattedLat = `${latDeg}°${latMin}'${latSec}"N`;
    const formattedLong = `${longDeg}°${longMin}'${longSec}"W`;

    // Create the Google Maps link
    const googleMapsLink = `https://www.google.com/maps/place/${encodeURIComponent(formattedLat)}+${encodeURIComponent(formattedLong)}`;

    // Return the formatted string along with the Google Maps link
    return {
    formattedString: `${formattedLat}, ${formattedLong}`,
    googleMapsLink: googleMapsLink
    };
}

// function updateMetaData(data){
//     const metaDisplay = document.getElementById('meta-display');
//     formatted = "";
//     if(data.id!=null){
//     formatted += `${data.id}<br>`
//     }
//     if(data.lat_long_dms != null){
//     let formLatLong = formatLatLong(data.lat_long_dms)
//     formatted+=`<a href="${formLatLong.googleMapsLink}">${formLatLong.formattedString}</a><br>`;
//     }
//     if(data.make != null){
//     formatted+=`${data.make} ${data.model}<br>`;
//     }
//     if(data.date_taken != null){
//     formatted+=`${data.date_taken}`;
//     }
//     metaDisplay.innerHTML = formatted;
// }
function formatMetaData(data){
    // const metaDisplay = document.getElementById('meta-display');
    formatted = "";
    if(data.id!=null){
        var title = 'untitled'
        if(data.title){
            title = data.title;
        }
    formatted += `${data.id}<br>${title}<br>`
    }
    if(data.lat_long_dms != null && data.lat_long_dms!="")
    {
        let formLatLong = formatLatLong(data.lat_long_dms)
        formatted+=`<a href="${formLatLong.googleMapsLink}" target="_blank">${formLatLong.formattedString}</a><br>`;
    }
    if(data.make != null){
    formatted+=`${data.make} ${data.model}<br>`;
    }
    if(data.date_taken != null){
    formatted+=`${data.date_taken}`;
    }
    return formatted;
}

//get the image paths
// const imageFolder = '2024_01_12'; //todo rename this later all images will be in this folder... maybe
function imagePath(data){
    const path = 'images';
    // const subpath = '2024_01_12/';
    return `${path}/${data.data_set}/${data.filename}`;
    // return path + data.data_set  + data.filename;
}
function thumbPath(data){
    const path = 'images';
    // const subpath = '2024_01_12/thumbnails/t_';
    // return path + subpath + data.filename;
    return `${path}/${data.data_set}/thumbnails/t_${data.filename}`;
}

function simpleHash(inputString) {
    let hash = 0;

    for (let i = 0; i < inputString.length; i++) {
        const charCode = inputString.charCodeAt(i);
        hash = (hash << 5) - hash + charCode;
    }

    // Ensure the result is non-negative
    return Math.abs(hash);
}

//sorting
function sortByDate(a, b) {
    if (!a.date_taken && !b.date_taken) {
      return 0;
    }
  
    if (!a.date_taken) {
      return 1;
    }
  
    if (!b.date_taken) {
      return -1;
    }
  
    var dateA = new Date(a.date_taken.split(' ')[0].replace(/:/g, '-'));
    var dateB = new Date(b.date_taken.split(' ')[0].replace(/:/g, '-'));
  
    return dateA - dateB;
  }