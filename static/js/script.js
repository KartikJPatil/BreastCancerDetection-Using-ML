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

const blogCategories = {
  "awareness": ["md/a1.md", "md/a2.md", "md/a3.md"],
  "research": ["md/r1.md", "md/r2.md", "md/r3.md"],
  "personal-stories": ["md/ps1.md", "md/ps2.md", "md/ps3.md"]
};

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

async function loadBlogs() {
  Object.keys(blogCategories).forEach(category => {
    let container = document.getElementById(category);

    if (!container) {
      console.error("Container not found for", category);
      return;
    }

    // Get all existing blog cards in that category
    let cards = container.querySelectorAll(".blog-card");

    // Check if the number of cards matches the number of blogs
    if (cards.length !== blogCategories[category].length) {
      console.error(`Mismatch: Found ${cards.length} cards but expected ${blogCategories[category].length}`);
      return;
    }

    // Update each card instead of creating new ones
    blogCategories[category].forEach((file, index) => {
      let card = cards[index];
      let fileName = file.split("/").pop().replace(".md", ""); // Extract filename without extension

      // Set correct title from blogTitles mapping
      if (blogTitles[fileName]) {
        card.querySelector("h3").textContent = blogTitles[fileName];
      } else {
        console.warn(`Title not found for ${fileName}`);
      }

      // Update blog link
      card.querySelector("a").href = `blog.html?file=${file}`;
    });
  });
}

document.addEventListener("DOMContentLoaded", loadBlogs);
