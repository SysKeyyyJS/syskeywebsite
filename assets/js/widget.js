const username = "SysKeyyy";
const apiKey = "3c8f980f6d6bc7ce9aea51309becb0c5";

const container = document.getElementById("lastfm-widget");

container.innerHTML = `
<div class="lfm-card" id="lfm-card">
  <img id="lfm-cover" crossorigin="anonymous" src="">
  <div class="lfm-info">
    <div id="lfm-status">Loading...</div>
    <div class="lfm-marquee">
      <div id="lfm-track"></div>
    </div>
    <div id="lfm-artist"></div>
    <div class="lfm-eq" id="lfm-eq">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
</div>
`;

let currentTrack = "";

async function updateLastFM(){
    try {
        const res = await fetch(
            `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&format=json&limit=1`
        );
        const data = await res.json();
        const track = data.recenttracks.track[0];

        const trackName = track.name;
        const artist = track.artist["#text"];
        const cover = track.image[3]["#text"] || 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?q=80&w=200'; // Space backup fallback image if no art covers exist
        const url = track.url;
        const isPlaying = track["@attr"] && track["@attr"].nowplaying;

        if(currentTrack !== trackName){
            const card = document.getElementById("lfm-card");
            card.classList.add("fade");

            setTimeout(()=>{
                document.getElementById("lfm-track").textContent = trackName;
                document.getElementById("lfm-artist").textContent = artist;
                document.getElementById("lfm-cover").src = cover;
                card.onclick = () => window.open(url, "_blank");
                card.classList.remove("fade");
            }, 300);

            currentTrack = trackName;
        }

        /* Playing indicator styling */
        const status = document.getElementById("lfm-status");
        const eq = document.getElementById("lfm-eq");

        if(isPlaying){
            status.textContent = "🟢 I am listening to...";
            eq.classList.add("playing");
        } else {
            status.textContent = "☄️ Last Played";
            eq.classList.remove("playing");
        }

        /* Marquee scrolling bounds test */
        const trackEl = document.getElementById("lfm-track");
        const marquee = document.querySelector(".lfm-marquee");

        setTimeout(()=>{
            if(trackEl.scrollWidth > marquee.clientWidth){
                marquee.classList.add("scroll");
            } else {
                marquee.classList.remove("scroll");
            }
        }, 100);

        /* Cover dynamic glow extractor execution loop */
        const img = document.getElementById("lfm-cover");
        img.onload = ()=>{
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = 1;
            canvas.height = 1;
            ctx.drawImage(img, 0, 0, 1, 1);
            const pixel = ctx.getImageData(0, 0, 1, 1).data;
            const color = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;

            if(isPlaying){
                img.style.boxShadow = `0 0 10px ${color}, 0 0 25px ${color}`;
                document.getElementById("lfm-card").style.boxShadow = `0 10px 30px rgba(${pixel[0]},${pixel[1]},${pixel[2]}, 0.15)`;
            } else {
                img.style.boxShadow = "none";
                document.getElementById("lfm-card").style.boxShadow = "none";
            }
        };

    } catch(err) {
        console.error("Last.fm Engine Error: ", err);
    }
}

// Initialize loop
updateLastFM();
setInterval(updateLastFM, 15000);