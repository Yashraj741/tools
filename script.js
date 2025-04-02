// Background Remover Functionality
const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');
const uploadSpinner = document.getElementById('uploadSpinner');
const removeSpinner = document.getElementById('removeSpinner');
const removeBackgroundBtn = document.getElementById('removeBackgroundBtn');
const resetBtn = document.getElementById('resetBtn');
const outputSection = document.getElementById('output');
const resultImage = document.getElementById('resultImage');
const downloadBtn = document.getElementById('downloadBtn');

// API key for Remove.bg
const API_KEY = "1eVmq61BtNLvCkaPqCgwEpTn";

// Function to show loading line
function showLoadingLine(containerId, duration) {
    const container = document.getElementById(containerId);
    const loadingLine = document.createElement('div');
    loadingLine.className = 'loading-line';
    container.appendChild(loadingLine);

    setTimeout(() => {
        loadingLine.remove();
    }, duration);
}

// Show file preview only in the upload box
fileInput.addEventListener('change', function () {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            filePreview.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image" style="width: 615px; height: 416px; border-radius: 10px;">`;
            showLoadingLine('uploadLoadingLine', 4000); // Show loading line for 4 seconds
        };
        reader.readAsDataURL(file);
    }
});

// Handle background removal
removeBackgroundBtn.addEventListener('click', async function () {
    const file = fileInput.files[0];
    if (!file) {
        alert("Please upload an image first!");
        return;
    }

    document.getElementById('uploadLoadingLine').innerHTML = '';
    document.getElementById('removeLoadingLine').innerHTML = '';

    showLoadingLine('removeLoadingLine', 4000); // Show loading line for 4 seconds
    removeSpinner.style.display = 'block';

    const formData = new FormData();
    formData.append('image_file', file);

    try {
        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': API_KEY,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Failed to remove background. Please try again.");
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);

        filePreview.innerHTML = ''; // Remove the preview from the upload section

        resultImage.src = imageUrl;
        resultImage.style.width = '615px'; // Set the width to 615px
        resultImage.style.height = '416px'; // Set the height to 416px
        outputSection.style.display = 'block';
        removeSpinner.style.display = 'none';

        showLoadingLine('removeLoadingLine', 4000);

        downloadBtn.addEventListener('click', function () {
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = 'background-removed-image.png';
            link.click();
        });
    } catch (error) {
        alert(`Error: ${error.message}`);
        removeSpinner.style.display = 'none';
    }
});

// Reset the application for Background Remover
resetBtn.addEventListener('click', function () {
    fileInput.value = "";
    filePreview.innerHTML = ""; // Clear the preview in the upload box
    outputSection.style.display = 'none'; // Hide the result section
    removeSpinner.style.display = 'none';
});

// Show options on the left side
const optionsMenu = document.getElementById('optionsMenu');
const homeSection = document.getElementById('homeSection');
const backgroundRemoverSection = document.getElementById('backgroundRemoverSection');
const pdfConverterSection = document.getElementById('pdfConverterSection');
const imageUpscalerSection = document.getElementById('imageUpscalerSection'); // Add this line

optionsMenu.addEventListener('click', function (event) {
    const target = event.target;
    if (target.tagName === 'BUTTON') {
        const section = target.dataset.section;
        homeSection.style.display = 'none';
        backgroundRemoverSection.style.display = 'none';
        pdfConverterSection.style.display = 'none';
        imageUpscalerSection.style.display = 'none'; // Add this line
        document.getElementById(section).style.display = 'block';
    }
});

// Show home section by default
homeSection.style.display = 'block';
backgroundRemoverSection.style.display = 'none';
pdfConverterSection.style.display = 'none';
imageUpscalerSection.style.display = 'none'; // Add this line
// Import jsPDF from the library
const { jsPDF } = window.jspdf;

// Get DOM elements
const form = document.getElementById('uploadForm');
const pdfFileInput = document.getElementById('imageUpload');
const pdfPreviewDiv = document.getElementById('preview');
const pdfStatusDiv = document.getElementById('status');
const pdfDownloadBtn = document.createElement('button');

// Set up download button
pdfDownloadBtn.textContent = 'Download PDF';
pdfDownloadBtn.style.display = 'none'; // Initially hidden
document.body.appendChild(pdfDownloadBtn);

// Handle Image Preview
pdfFileInput.addEventListener('change', function () {
    const file = pdfFileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;
            img.style.width = '615px';
            img.style.height = '416px';
            pdfPreviewDiv.innerHTML = ''; // Clear previous preview
            pdfPreviewDiv.appendChild(img);
        };
        reader.readAsDataURL(file);
    }
});

// Convert Image to PDF
form.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission

    pdfStatusDiv.textContent = "Processing...";
    const file = pdfFileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function () {
                try {
                    const doc = new jsPDF();
                    const pageWidth = doc.internal.pageSize.getWidth();
                    const pageHeight = doc.internal.pageSize.getHeight();

                    let imgWidth = img.width;
                    let imgHeight = img.height;

                    // Scale image to fit inside the PDF page
                    const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
                    imgWidth *= ratio;
                    imgHeight *= ratio;

                    doc.addImage(img, 'JPEG', 0, 0, imgWidth, imgHeight);

                    // Create PDF Blob
                    const pdfBlob = doc.output('blob');

                    // Create download button functionality
                    pdfDownloadBtn.onclick = function () {
                        const url = URL.createObjectURL(pdfBlob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = 'converted.pdf';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                    };

                    pdfStatusDiv.textContent = 'Conversion complete!';
                    pdfDownloadBtn.style.display = 'inline-block'; // Show download button

                } catch (error) {
                    console.error("Error generating PDF:", error);
                    pdfStatusDiv.textContent = "Error generating PDF: " + error.message;
                }
            };
        };
        reader.readAsDataURL(file);
    } else {
        pdfStatusDiv.textContent = "Please select a file.";
    }
});

// Reset the application
const pdfResetBtn = document.getElementById('pdfResetBtn');
pdfResetBtn.addEventListener('click', function () {
    pdfFileInput.value = "";
    pdfPreviewDiv.innerHTML = ""; // Clear the preview
    pdfStatusDiv.textContent = ""; // Clear the status
    pdfDownloadBtn.style.display = 'none'; // Hide download button
});


// Image Upscaler Functionality
const upscaleFileInput = document.getElementById('upscaleFileInput');
const upscalePreview = document.getElementById('upscalePreview');
const upscaleSpinner = document.getElementById('upscaleSpinner');
const upscaleBtn = document.getElementById('upscaleBtn');
const upscaleOutputSection = document.getElementById('upscaleOutput');
const upscaledImage = document.getElementById('upscaledImage');
const upscaleDownloadBtn = document.getElementById('upscaleDownloadBtn');
const upscaleResetBtn = document.getElementById('upscaleResetBtn');

// Utility function for local upscaling
function localUpscale(imgElement, scale = 2) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = imgElement.naturalWidth * scale;
    canvas.height = imgElement.naturalHeight * scale;

    // Enable image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw scaled image
    ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg', 0.95);
}

// Show file preview for image upscaler
upscaleFileInput.addEventListener('change', function () {
    const file = upscaleFileInput.files[0];
    if (file) {
        if (!file.type.startsWith('image/')) {
            alert("Please upload a valid image file!");
            upscaleFileInput.value = "";
            return;
        }
        const reader = new FileReader();
        reader.onload = function (e) {
            upscalePreview.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image" style="width: 615px; height: 416px; border-radius: 10px;">`;
        };
        reader.readAsDataURL(file);
    }
});

// Handle image upscaling
upscaleBtn.addEventListener('click', async function () {
    const file = upscaleFileInput.files[0];
    if (!file) {
        alert("Please upload an image first!");
        return;
    }

    // Remove loading spinner display
    // upscaleSpinner.style.display = 'block';

    try {
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = async function () {
            // Local upscaling
            const upscaledUrl = localUpscale(img, 2); // 2x upscaling

            upscaledImage.src = upscaledUrl;
            upscaledImage.style.width = '615px';
            upscaledImage.style.height = '416px';
            upscaleOutputSection.style.display = 'block';

            upscaleDownloadBtn.onclick = function () {
                const link = document.createElement('a');
                link.href = upscaledUrl;
                link.download = 'upscaled-image.jpg';
                link.click();
            };

            // API-based upscaling
            const form = new FormData();
            form.append('image', file);
            form.append('upscale_factor', '2');
            form.append('format', 'JPG');

            const options = {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'X-Picsart-API-Key': 'eyJraWQiOiI5NzIxYmUzNi1iMjcwLTQ5ZDUtOTc1Ni05ZDU5N2M4NmIwNTEiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhdXRoLXNlcnZpY2UtMzMxZTE3MjItMmNkYy00MWQ1LWI1MTctYzJjMDBmOTViMjYzIiwiYXVkIjoiNDc1NDkxNTMwMDIwMTAxIiwibmJmIjoxNzM3Nzk1NTYzLCJzY29wZSI6WyJiMmItYXBpLmdlbl9haSIsImIyYi1hcGkuaW1hZ2VfYXBpIl0sImlzcyI6Imh0dHBzOi8vYXBpLnBpY3NhcnQuY29tL3Rva2VuLXNlcnZpY2UiLCJvd25lcklkIjoiNDc1NDkxNTMwMDIwMTAxIiwiaWF0IjoxNzM3Nzk1NTYzLCJqdGkiOiJlMTIyMzhlOS03ODUyLTQzMTQtYmViYy04MGNlMDdjMTUxNDMifQ.OCzFJUHLCsc3RWsigQ6DItUzu-ZpYaTBpc-mDzq2VQfjbxgBpIkZKCYOxAEQlHu63rym46U2LCirvjaxFpZv1tEXTKYj_a_Wld-KjcbBOh11zxEyUW83ciRBufHPNluhpu-EuUQG6NqgQy85aD9ijl34oqL7cv4jA3G84FuSyr5_wFigeXgvYNd7hgzsl-MXkJDatWfPecDjbWqR4qplrLs1zqbLD2CuEGfaWUpKmRbFQT9oZNloAfe8HL-lyC9t5HqHWtapJwYJwQPtMHQSf2x6H69wWB1Nd8-TnKdhoq2CZexFJKZfaW6OoYRDxmk9cYSCbzL0Bk2BxuB--2_DPQ' // Replace with your actual API key
                },
                body: form
            };

            try {
                const response = await fetch('https://api.picsart.io/tools/1.0/upscale', options);
                const result = await response.json();

                if (result.output_url) {
                    upscaledImage.src = result.output_url;
                    upscaleOutputSection.style.display = 'block';

                    upscaleDownloadBtn.onclick = function () {
                        const link = document.createElement('a');
                        link.href = result.output_url;
                        link.download = 'upscaled-image.jpg';
                        link.click();
                    };
                } else {
                    // Handle error
                }
            } catch (error) {
                alert(`API Error: ${error.message}`);
            } finally {
                // Remove loading spinner display
                // upscaleSpinner.style.display = 'none';
            }
        };
    } catch (error) {
        alert(`Error: ${error.message}`);
        // Remove loading spinner display
        // upscaleSpinner.style.display = 'none';
    }
});

// Reset the application for Image Upscaler
upscaleResetBtn.addEventListener('click', function () {
    upscaleFileInput.value = "";
    upscalePreview.innerHTML = ""; // Clear the preview in the upload box
    upscaleOutputSection.style.display = 'none'; // Hide the result section
    upscaleSpinner.style.display = 'none';
    upscaledImage.src = ""; // Clear the upscaled image
    upscaleDownloadBtn.onclick = null; // Remove previous download event listener
});