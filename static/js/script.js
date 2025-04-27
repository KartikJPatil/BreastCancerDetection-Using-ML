// Fixing flexbox gap property missing in some Safari versions
function checkFlexGap() {
  const flex = document.createElement("div");
  flex.style.display = "flex";
  flex.style.flexDirection = "column";
  flex.style.rowGap = "1px";
  flex.appendChild(document.createElement("div"));
  flex.appendChild(document.createElement("div"));
  document.body.appendChild(flex);
  const isSupported = flex.scrollHeight === 1;
  flex.remove();
  if (!isSupported) {
    document.documentElement.classList.add("non-flexbox-gap");
  }
}
checkFlexGap();

// Set current year
document.querySelector(".year").textContent = new Date().getFullYear();

// Mobile navigation
const menuBtn = document.querySelector(".btn-mobile-nav");
const header = document.querySelector(".header");

menuBtn.addEventListener("click", function () {
  header.classList.toggle("nav-open");
  document.documentElement.classList.toggle("no-overflow");
});

// Close mobile nav on link click
document.querySelectorAll(".main-nav a").forEach(link => {
  link.addEventListener("click", function () {
    header.classList.remove("nav-open");
    document.documentElement.classList.remove("no-overflow");
  });
});

// Smooth scrolling for internal anchors only
document.querySelectorAll("a:link").forEach(link => {
  link.addEventListener("click", function (e) {
    const href = link.getAttribute("href");
    
    if (href && href.startsWith("#")) {
      e.preventDefault();
      const targetEl = document.querySelector(href);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth" });
      }
    }
    // IMPORTANT: Else do NOT prevent default
    // let browser navigate normally to /blog, /ai-detection, etc.
  });
});

// Sticky header
const sectionHero = document.querySelector(".section-hero");
if (sectionHero) {
  const observer = new IntersectionObserver(
    (entries) => {
      document.body.classList.toggle("sticky", !entries[0].isIntersecting);
    },
    { root: null, threshold: 0, rootMargin: "-80px" }
  );
  observer.observe(sectionHero);
}

// PDF View functionality
document.addEventListener("DOMContentLoaded", function () {
  const pdfViewer = document.querySelector('.viewPDF');
  if (pdfViewer && typeof PDFObject !== 'undefined') {
    PDFObject.embed("/static/uploads/generatedreport.pdf", ".viewPDF", {
      pdfOpenParams: {
        pagemode: "thumbs",
        navpanes: 0,
        toolbar: 0,
        statusbar: 0,
        view: "FitV",
      },
    });
  }
});

// Upload Report to AI Detection
document.addEventListener("DOMContentLoaded", function () {
  const uploadForm = document.querySelector("#upload-form");
  const resultDiv = document.querySelector("#result");
  
  if (uploadForm) {
    uploadForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const fileInput = document.querySelector("#file");
      const uploadMessage = document.querySelector(".upload-message");

      if (fileInput.files.length === 0) {
        alert("Please select a file to upload.");
        return;
      }

      const formData = new FormData();
      formData.append("file", fileInput.files[0]);

      try {
        if (uploadMessage) {
          uploadMessage.textContent = "Processing your file...";
          uploadMessage.style.color = "#28a745";
        }

        const response = await fetch("/upload", {
          method: "POST",
          body: formData,
          headers: { "Authorization": "Bearer acbcdefghijklmnopqrstu" }
        });

        const result = await response.json();

        if (result.success) {
          if (resultDiv) {
            resultDiv.style.display = "block";
            resultDiv.scrollIntoView({ behavior: "smooth" });

            const predictionResult = document.querySelector("#predictionResult");
            if (predictionResult) {
              predictionResult.className = "container mt-4";
              predictionResult.classList.add(result.output === 1 ? "high-risk" : "low-risk");
              predictionResult.innerHTML = `
                <p style="font-size: 18px; font-weight: bold; color: white;">
                  ${result.pred}
                </p>
                <br>
                <p style="font-size: 18px; font-weight: bold; color: white;">
                  Risk Score: ${result.risk_score}%
                </p>
              `;

              if (result.output === 0 && typeof confetti !== "undefined") {
                setTimeout(() => {
                  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                }, 500);
              }
            }
          }
          if (uploadMessage) uploadMessage.textContent = "File processed successfully!";
        } else {
          throw new Error(result.error || "Unknown error during prediction");
        }
      } catch (error) {
        console.error("Upload error:", error);
        if (uploadMessage) {
          uploadMessage.textContent = `Error: ${error.message}`;
          uploadMessage.style.color = "#dc3545";
        }
      }
    });
  }
});
