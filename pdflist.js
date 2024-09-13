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
                <strong>${pdf.title}</strong> 
                - <a href="/pdfview/${pdf._id}">View</a>
                - <button onclick="deletePdf('${pdf._id}')">Delete</button>
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
