async function fetchPdfDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const pdfId = urlParams.get('id');

    if (!pdfId) {
        alert('No PDF ID found');
        return;
    }

    try {
        const response = await fetch(`/pdf/${pdfId}`);
        const pdf = await response.json();

        document.getElementById('pdfTitle').textContent = pdf.title;
        document.getElementById('pdfViewer').src = `/pdf/${pdf._id}`;
        
        const downloadLink = document.getElementById('downloadLink');
        downloadLink.href = `/pdf/${pdf._id}`;
        downloadLink.download = pdf.filename;
    } catch (error) {
        console.error('Error fetching PDF details:', error);
    }
}

fetchPdfDetails();
