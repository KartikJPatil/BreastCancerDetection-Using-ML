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

const header = document.querySelector(".header");
const menuBtn = document.querySelector('.btn-mobile-nav');
const navList = document.querySelector('.main-nav-list');
const menuIcon = document.querySelector('ion-icon[name="menu-outline"]');
const closeIcon = document.querySelector('ion-icon[name="close-outline"]');

menuBtn.addEventListener('click', function () {
  navList.classList.toggle('active');
  
  // Toggle icons
  if (navList.classList.contains('active')) {
    menuIcon.style.display = 'none';
    closeIcon.style.display = 'block';
  } else {
    menuIcon.style.display = 'block';
    closeIcon.style.display = 'none';
  }
});


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

// Add drag and drop functionality to the file upload
document.addEventListener("DOMContentLoaded", function() {
  // Get elements
  const uploadForm = document.getElementById("upload-form");
  const fileInput = document.getElementById("file");
  const dragArea = document.getElementById("drag-area");
  const fileInfo = document.getElementById("file-info");
  const fileName = fileInfo ? fileInfo.querySelector(".file-name") : null;
  const fileSize = fileInfo ? fileInfo.querySelector(".file-size") : null;
  const removeFileBtn = fileInfo ? fileInfo.querySelector(".remove-file") : null;
  const uploadMessage = document.querySelector(".upload-message");
  const resultDiv = document.getElementById("result");
  const fileLabel = document.querySelector(".custom-file-upload");
  
  // Only proceed if we have the necessary elements
  if (dragArea && fileInput) {
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dragArea.addEventListener(eventName, preventDefaults, false);
      document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
      dragArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
      dragArea.addEventListener(eventName, unhighlight, false);
    });
    
    // Handle dropped files
    dragArea.addEventListener('drop', handleDrop, false);
    
    // Handle file selection through the input
    fileInput.addEventListener('change', handleFiles);
    
    // Add click handler to drag area to trigger file input
    dragArea.addEventListener('click', function() {
      fileInput.click();
    });
    
    // Add click handler for the remove file button
    if (removeFileBtn) {
      removeFileBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent triggering dragArea click
        resetFileInput();
      });
    }
  }
  
  // Helper functions
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  function highlight() {
    if (dragArea) dragArea.classList.add('active');
  }
  
  function unhighlight() {
    if (dragArea) dragArea.classList.remove('active');
  }
  
  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files && files.length) {
      fileInput.files = files;
      handleFiles();
    }
  }
  
  function handleFiles() {
    const file = fileInput.files[0];
    if (file) {
      displayFileInfo(file);
    }
  }
  
  function displayFileInfo(file) {
    // Update file info display
    if (fileInfo && fileName && fileSize) {
      fileInfo.style.display = "block";
      fileName.textContent = file.name;
      fileSize.textContent = `(${formatFileSize(file.size)})`;
    }
    
    // Change drag area text
    if (dragArea) {
      const dragText = dragArea.querySelector('.drag-text');
      if (dragText) dragText.textContent = "File selected!";
      dragArea.classList.add('has-file');
    }
    
    // Change label text
    if (fileLabel) {
      fileLabel.textContent = "📁 Change File";
    }
  }
  
  function resetFileInput() {
    // Clear the file input
    fileInput.value = "";
    
    // Hide the file info
    if (fileInfo) {
      fileInfo.style.display = "none";
    }
    
    // Reset drag area
    if (dragArea) {
      dragArea.classList.remove('has-file');
      const dragText = dragArea.querySelector('.drag-text');
      if (dragText) dragText.textContent = "Drag & Drop your file here";
    }
    
    // Reset file label
    if (fileLabel) {
      fileLabel.textContent = "📁 Choose Your File";
    }
  }
  
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  // Update the existing upload form submit handler
  if (uploadForm) {
    uploadForm.addEventListener("submit", async function(e) {
      e.preventDefault();
      
      if (e.submitter && e.submitter.id !== "submit-upload") {
        return; // Ignore if it's not the upload button
      }
      
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
              predictionResult.className = `result-box ${result.output === 1 ? 'high-risk' : 'low-risk'}`;
              
              predictionResult.innerHTML = `
                <p>${result.pred}</p>
                <p>Risk Score: ${result.risk_score}%</p>
              `;
              
              if (result.output === 0 && typeof confetti !== "undefined") {
                setTimeout(() => {
                  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                }, 500);
              }
            }
          }
          
          if (uploadMessage) {
            uploadMessage.textContent = "File processed successfully!";
          }
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