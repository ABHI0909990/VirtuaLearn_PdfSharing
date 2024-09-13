document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('pdfFile');
    const titleInput = document.getElementById('pdfTitle');
    const file = fileInput.files[0];
    const title = titleInput.value;

    if (!file || !title) {
        alert("Please choose a PDF and provide a title.");
        return;
    }

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('title', title);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (result.success) {
            alert('PDF uploaded successfully');
            fetchPdfList();
        } else {
            alert('Upload failed');
        }
    } catch (error) {
        console.error('Error uploading PDF:', error);
    }
});

async function fetchPdfList() {
    try {
        const response = await fetch('/pdfs');
        const pdfs = await response.json();

        const pdfList = document.getElementById('pdfList');
        pdfList.innerHTML = '';

        pdfs.forEach(pdf => {
            const pdfItem = document.createElement('div');
            pdfItem.className = 'pdf-item';
            pdfItem.innerHTML = `
                <span><strong>${pdf.title}</strong> - <a href="/pdf/${pdf._id}" target="_blank">${pdf.filename}</a></span>
                <button onclick="deletePdf('${pdf._id}')">Delete</button>
            `;
            pdfList.appendChild(pdfItem);
        });
    } catch (error) {
        console.error('Error fetching PDFs:', error);
    }
}

async function deletePdf(id) {
    try {
        const response = await fetch(`/pdf/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (result.success) {
            alert('PDF deleted successfully');
            fetchPdfList();
        } else {
            alert('Delete failed');
        }
    } catch (error) {
        console.error('Error deleting PDF:', error);
    }
}

fetchPdfList();
