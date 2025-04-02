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

// PDF Uploads
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

document.addEventListener("DOMContentLoaded", function() {
  // Define API base URL - adjust as needed for your environment
// Empty string for same domain, or specify full URL if different

  // Hide the result div initially
  const resultDiv = document.querySelector("#result");
  if (resultDiv) {
    resultDiv.style.display = "none";
  }

  // Add submit event listener to the form
  const uploadForm = document.querySelector("#upload-form");
  if (uploadForm) {
    uploadForm.addEventListener("submit", async function(e) {
      e.preventDefault();

      if (e.submitter && e.submitter.id !== "submit-upload") {
        return; // Ignore if it's not the upload button
      }

      const fileInput = document.querySelector("#file");
      const formData = new FormData();
      
      // Check if file is selected
      if (fileInput.files.length === 0) {
        alert("Please select a file to upload");
        return;
      }
      
      formData.append("file", fileInput.files[0]);

      try {
        // Show loading state
        const uploadMessage = document.querySelector(".upload-message");
        if (uploadMessage) {
          uploadMessage.textContent = "Processing your file...";
          uploadMessage.style.color = "#28a745"; // Reset to success color
        }
        
        const response = await fetch(`${API_BASE_URL}/upload`, {
          method: "POST",
          body: formData,
          headers: {
            "Authorization": "Bearer acbcdefghijklmnopqrstu"
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        // Parse the JSON response
        const result = await response.json();

        // Show the result div
        if (resultDiv) {
          resultDiv.style.display = "block";
          
          // Scroll to result section
          resultDiv.scrollIntoView({ behavior: 'smooth' });
          
          // Update prediction result with data from backend
          const predictionResult = document.querySelector("#predictionResult");
          if (predictionResult) {
            // Apply appropriate styling based on the output
            predictionResult.className = "container mt-4";
            predictionResult.classList.add(result.output === 1 ? "high-risk" : "low-risk");
            
            // Set the prediction text
            predictionResult.innerHTML = `
              <p style="font-size: 18px; font-weight: bold; color: ${result.output === 1 ? 'white' : 'white'}">
                ${result.pred}
              </p>
              <br>
              <p style="font-size: 18px; font-weight: bold; color:white;">Risk Score: ${result.risk_score}%</p>
            `;
            
            // Add confetti effect for low risk results
            if (result.output === 0 && typeof confetti !== 'undefined') {
              setTimeout(() => {
                confetti({
                  particleCount: 100,
                  spread: 70,
                  origin: { y: 0.6 }
                });
              }, 500);
            }
          }
        }

        // Update upload message
        if (uploadMessage) {
          uploadMessage.textContent = "File processed successfully!";
        }

      } catch (error) {
        console.error("Upload failed:", error);
        
        // Update upload message in case of error
        const uploadMessage = document.querySelector(".upload-message");
        if (uploadMessage) {
          uploadMessage.textContent = "Error: " + error.message;
          uploadMessage.style.color = "#dc3545";
        }
      }
    });
  }
});

// Section switching functionality
document.addEventListener('DOMContentLoaded', function () {
  // Get all navigation links
  const navLinks = document.querySelectorAll('.main-nav-list a');

  // Get all sections
  const sections = document.querySelectorAll('section');

  // Function to hide all sections
  function hideAllSections() {
    sections.forEach(section => {
      section.classList.remove('section-active');
      section.style.display = 'none';
      section.style.visibility = 'hidden';
    });
  }

  // Function to show a specific section
  function showSection(sectionId) {
    hideAllSections();
    const targetSection = document.querySelector(sectionId);
    if (targetSection) {
      targetSection.classList.add('section-active');
      targetSection.style.display = 'block';
      targetSection.style.visibility = 'visible';
    }
  }

  // Add click event listeners to navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      showSection(targetId);
    });
  });

  // Handle logo click to show hero section
  const logoLink = document.querySelector('.header-logo');
  if (logoLink) {
    logoLink.addEventListener('click', function (e) {
      e.preventDefault();
      showSection('#hero-section');
    });
  }

  // Handle hero section buttons
  const heroButtons = document.querySelectorAll('.section-hero .btn');
  heroButtons.forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      showSection(targetId);
    });
  });
});

// Mobile navigation functionality
const btnNavEl = document.querySelector('.btn-mobile-nav');
const headerEl = document.querySelector('.header');

btnNavEl.addEventListener('click', function () {
  headerEl.classList.toggle('nav-open');
});

// PDF viewing functionality
document.addEventListener('DOMContentLoaded', function () {
  const pdfViewer = document.querySelector('.viewPDF');
  if (pdfViewer) {
    try {
      // Use the correct path to your PDF file
      const pdfPath = '/static/uploads/generatedreport.pdf';

      // Check if PDFObject is available
      if (typeof PDFObject !== 'undefined') {
        PDFObject.embed(pdfPath, ".viewPDF", {
          pdfOpenParams: {
            pagemode: "thumbs",
            navpanes: 0,
            toolbar: 0,
            statusbar: 0,
            view: "FitV",
          },
        });
      } else {
        console.error('PDFObject is not loaded');
      }
    } catch (error) {
      console.error('Error loading PDF:', error);
    }
  }
});




/*blog script*/

async function fetchBlog() {
  const urlParams = new URLSearchParams(window.location.search);
  let fileName = urlParams.get('file');

  if (!fileName) {
    document.getElementById("blogContent").innerHTML = "<h2>Blog not found!</h2>";
    return;
  }

  try {
    let response = await fetch(fileName);
    if (!response.ok) throw new Error("Blog not found");

    let markdown = await response.text();

    let converter = new showdown.Converter({
      tables: true,         // Enable support for tables
      simplifiedAutoLink: true, // Auto-convert URLs into clickable links
      strikethrough: true,  // Enable ~~strikethrough~~ formatting
      tasklists: true       // Enable task lists
    });

    let htmlContent = converter.makeHtml(markdown);
    document.getElementById("blogContent").innerHTML = htmlContent;
  } catch (error) {
    document.getElementById("blogContent").innerHTML = "<h2>Error loading blog!</h2>";
  }
}

let script = document.createElement("script");
script.src = "https://cdnjs.cloudflare.com/ajax/libs/showdown/1.9.1/showdown.min.js";
script.onload = fetchBlog;
document.body.appendChild(script);


// Blog Titles Mapping
const blogTitles = {
  "a1": "Breast Cancer: Understanding, Symptoms, Prevention, and Treatment",
  "a2": "Why is Breast Cancer Awareness so Important?",
  "a3": "Setting Healthy Boundaries for Breast Cancer Patients",
  "r1": "BCRF-Supported Study Reports New Discoveries on Breast Cancer’s Origins",
  "r2": "Ground-breaking Discovery into the Genetic Causes of Breast Cancer",
  "r3": "18 Trailblazing Women Researchers Who Changed Breast Cancer Forever",
  "ps1": "The Overlooked Side of Breast Cancer: Mental Health",
  "ps2": "The Power of Genetic Testing: Danielle’s Family’s Story",
  "ps3": "I Didn’t Have Cancer, But I Still Carry the Scars: A BRCA Previvor’s Story"
};


