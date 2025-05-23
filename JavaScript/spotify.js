console.log("lets write javascript")
let currentSong = new Audio();
let songs = [];
let currFolder;

// // harry ----> not working
// async function getSongs() {
//     let a = await fetch("http://127.0.0.1:3002/songs/")
//     let response = await a.text()
//     let div = document.createElement("div")
//     console.log("document")
//     div.innerHTML = response;
//     let as = div.getElementsByTagName("a")
//     let songs = [];
//     for (let index = 0; index < as.length; index++) {
//         const element = as[index]
//         if (element.href.endsWith(".mp3")) {
//             songs.push(element.href.split("/songs/")[1]);
//         }
//     }
//     return songs
// }

// // chatgpt -----> working
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3002/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            let songName = element.href.split(`${folder}/`)[1]; // Extract filename
            songs.push(decodeURIComponent(songName)); // Decode URL-encoded name
        }
    }

    // show all the songs inn the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="img/music.svg" alt="">
                             <div class="info">
                                 <div>${song.replaceAll("%20", " ")}</div>
                                 <div>Arijit Singh</div>
                             </div>
                             <div class="playnow">
                                 <span>Play Now</span>
                                 <img id="songList-playnow" class="invert" src="img/playsong.svg" alt="">
                             </div> </li>`;
    }

    // Attach an event listener to each song
    document.querySelectorAll(".songList ul li").forEach(e => {
        e.addEventListener('click', () => {
            // console.log(e.getElementsByTagName(".info").firstElementChild.innerHTML)
            // playMusic(e.getElementsByTagName(".info").firstElementChild.innerHTML.trim())
            let songName = e.querySelector(".info div:first-child").textContent.trim();
            playMusic(songName);
            play.src = "img/play.svg"
        });
    });
    return songs;
}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "Invalid input";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

const playMusic = (track, pause = false) => {
    // let audio=new Audio("/songs/"+track)
    currentSong.src = `${currFolder}/` + track
    currentSong.load(); // Force browser to start loading the audio file
    if (!pause) {
        // currentSong.play()
        // play.src = "img/play.svg"    // maintain pause icon before running
        currentSong.play().then(() => {
            play.src = "img/pausesong.svg";  // Show pause icon when playing
        }).catch(error => {
            console.log("Playback prevented:", error);
        });
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}

async function displayAlbum() {
    let a = await fetch(`http://127.0.0.1:3002/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3002/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round" />
            </svg>
            <img src="/songs/${folder}/cover.jpg" alt="">
            <h3>${response.title}</h3>
            <p>${response.description}</p>
        </div>`
        }
    }
    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })

    

}
async function main() {
    // get the list of all the songs
    await getSongs("songs/ncs")
    playMusic(songs[0], true)

    // Display all the albums on the page
    displayAlbum()

    // Attach and event listener to play next & previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pausesong.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";

    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    // Add an event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    // Add an evenet listener to close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    // // Harry ----------> not working
    // // Add an event listener to previous
    // previous.addEventListener("click", () => {
    //     // currentSong.pause()
    //     console.log("Previous clicked")
    //     let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    //     if ((index - 1) >= 0) {
    //         playMusic(songs[index - 1])
    //     }
    // })
    // // Add an event listener to next
    // next.addEventListener("click", () => {
    //     // currentSong.pause()
    //     console.log("Next clicked")

    //     let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    //     if ((index + 1) < songs.length) {
    //         playMusic(songs[index + 1])
    //     }
    // })

    // // Chatgpt ----------> working
    // // Add an event listener to previous
    previous.addEventListener("click", () => {
        let currentSongName = decodeURIComponent(currentSong.src.split("/").pop());  // Extract only filename
        let index = songs.indexOf(currentSongName);
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    // // Add an event listener to next
    next.addEventListener("click", () => {
        let currentSongName = decodeURIComponent(currentSong.src.split("/").pop());  // Extract only filename
        let index = songs.indexOf(currentSongName);
        if (index >= 0 && index < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });
    
    // Add an event listener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    })

    // Add an event listener to range
    document.querySelector(".volume>img").addEventListener("click",e=>{
        if(e.target.src.includes("img/volume.svg")){
            e.target.src=e.target.src.replace("img/volume.svg","img/mute.svg");
            currentSong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }
        else{
            e.target.src=e.target.src.replace("img/mute.svg","img/volume.svg");
            currentSong.volume=0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value=10;
        }
    })



}
main();











