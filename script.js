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

async function revealSiteContent() {
  const siteContent = document.getElementById("site-content");
  const lines = siteContent.querySelectorAll(".typed-line");

  for (const line of lines) {
    line.style.opacity = 1;

    // 1️⃣ Ad container special case
    if (line.id === "ad-container") {
      await typeText(line, "[LOADED advertisement]", 20);

      // Append the iframe after typing
      const iframe = document.createElement("iframe");
      iframe.src = line.dataset.iframeSrc;
      iframe.width = "732";
      iframe.height = "94";
      iframe.style.border = "none";

      line.appendChild(document.createElement("br")); // line break
      line.appendChild(iframe);
      continue; // done with this line
    }

    // 2️⃣ Links inside the line
    const link = line.querySelector("a");
    if (link) {
      const fullText = line.textContent;
      const beforeText = fullText.split(link.textContent)[0];
      const afterText = fullText.split(link.textContent)[1] || "";

      line.textContent = ""; // clear content

      const spanBefore = document.createElement("span");
      line.appendChild(spanBefore);
      await typeText(spanBefore, beforeText, 20);

      line.appendChild(link); // keep link intact

      const spanAfter = document.createElement("span");
      line.appendChild(spanAfter);
      await typeText(spanAfter, afterText, 20);

      continue; // done with this line
    }

    // 3️⃣ Normal line without links or iframe
    const originalText = line.textContent;
    line.textContent = "";
    await typeText(line, originalText, 20);
  }

  // After all lines are typed
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