// Type text one character at a time
function typeText(element, text, speed = 20) {
  return new Promise(resolve => {
    element.textContent = "";
    let i = 0;
    function typeChar() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(typeChar, speed);
      } else {
        resolve();
      }
    }
    typeChar();
  });
}

// Reveal all .typed-line elements sequentially
async function revealSiteContent() {
  const siteContent = document.getElementById("site-content");
  const lines = siteContent.querySelectorAll(".typed-line");

  for (const line of lines) {
    line.style.opacity = 1;
    await typeText(line, line.textContent, 20);
  }

  fetchCityGreeting();
  countLinesOfCode();
}

// Terminal boot simulation
document.addEventListener("DOMContentLoaded", () => {
  const terminalText = document.getElementById("terminal-text");

  let commands = [
    "sudo ./runsite",
    "[Running SysKey site...]"
  ];
  let i = 0;

  function typeNext() {
    if (i < commands.length) {
      terminalText.textContent += commands[i] + "\n";
      i++;
      setTimeout(typeNext, 1000);
    } else {
      setTimeout(() => {
        document.getElementById("terminal").style.display = "none";
        revealSiteContent();
      }, 500);
    }
  }

  typeNext();
});

// Fetch location with fallback
async function fetchCityGreeting() {
  try {
    let response = await fetch("https://ipapi.co/json/");
    if (!response.ok) throw new Error("ipapi.co failed");
    let data = await response.json();

    if (!data.org) {
      response = await fetch("https://ipwho.is/");
      if (response.ok) {
        const alt = await response.json();
        data.org = alt.connection?.isp || "Unknown ISP";
      }
    }

    const city = data.city || "Unknown City";
    const region = data.region || "Unknown Region";
    const postal = data.postal || "???";
    const country = data.country_name || "Unknown Country";
    const ip = data.ip || "???";
    const isp = data.org || "Unknown ISP";
    const timezone = data.timezone || "Unknown Timezone";

    document.getElementById("greeting").textContent =
      `Hello, you are from ${city}, ${region} ${postal}, ${country}. ` +
      `Your IP is ${ip}, timezone is ${timezone}, and your ISP is ${isp}. 👀`;
  } catch (err) {
    console.error("Geolocation fetch failed:", err);
    document.getElementById("greeting").textContent = "Hello there!";
  }
}

// Count total lines of code in index.html + script.js + style.css
async function countLinesOfCode() {
  try {
    const files = ["index.html", "script.js", "style.css"];
    let totalLines = 0;

    for (const file of files) {
      const response = await fetch(file);
      if (response.ok) {
        const text = await response.text();
        totalLines += text.split("\n").length;
      }
    }

    const footer = document.querySelector("footer");
    if (footer) {
      footer.innerHTML += `<br>This site is made up of ${totalLines} lines of code.`;
    }
  } catch (err) {
    console.error("Line count failed:", err);
  }
}
