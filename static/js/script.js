// Fixing flexbox gap property missing in some Safari versions
function checkFlexGap() {
  let flex = document.createElement("div");
  flex.style.display = "flex";
  flex.style.flexDirection = "column";
  flex.style.rowGap = "1px";

  flex.appendChild(document.createElement("div"));
  flex.appendChild(document.createElement("div"));

  document.body.appendChild(flex);
  let isSupported = flex.scrollHeight === 1;
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
const navLinks = document.querySelectorAll(".main-nav-link");

menuBtn.addEventListener("click", function () {
  header.classList.toggle("nav-open");
  document.documentElement.classList.toggle("no-overflow");
});

// Close mobile menu when a link is clicked
navLinks.forEach((link) => {
  link.addEventListener("click", function () {
    header.classList.remove("nav-open");
    document.documentElement.classList.remove("no-overflow");
  });
});

// Smooth scrolling
document.querySelectorAll("a:link").forEach((link) => {
  link.addEventListener("click", function (e) {
    const href = link.getAttribute("href");

    if (href === "#") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (href.startsWith("#")) {
      e.preventDefault();
      const sectionElement = document.querySelector(href);
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  });
});

// Sticky navigation
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

// PDF Viewer
if (window.location.hostname === "pdfobject.com") {
  const script = document.createElement("script");
  script.src = "https://www.googletagmanager.com/gtag/js?id=UA-1394306-6";
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "UA-1394306-6");
}

const API_BASE_URL = window.location.origin;


document.querySelector("#upload-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  if (e.submitter && e.submitter.id !== "submit-upload") {
      return; // Ignore if it's not the upload button
  }

  const fileInput = document.querySelector("#file");
  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
          method: "POST",
          body: formData,
          headers: {
              "Authorization": "Bearer acbcdefghijklmnopqrstu"
          }
      });

      // Check if response is an HTML page
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
          const html = await response.text();
          document.open();
          document.write(html);
          document.close();
          return;
      }

      // If response is JSON, handle as usual
      const result = await response.json();
      if (!response.ok) {
          throw new Error(result.error || "Upload failed");
      }

      alert(result.pred || "File uploaded successfully!");

  } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed: " + error.message);
  }
});






// Embed PDF with error handling
try {
  PDFObject.embed("Report.pdf", ".viewPDF", {
    pdfOpenParams: {
      pagemode: "thumbs",
      navpanes: 0,
      toolbar: 0,
      statusbar: 0,
      view: "FitV",
    },
  });
} catch (error) {
  console.error("PDF embed error:", error);
}
