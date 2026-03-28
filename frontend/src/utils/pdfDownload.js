import axios from 'axios'

export const downloadPDF = async (apiEndpoint, payload, filename) => {
  try {
    const response = await axios.post(apiEndpoint, payload, {
      responseType: 'blob',
      headers: { 'Content-Type': 'application/json' }
    })

    // Check if response is actually a PDF or an error JSON
    const contentType = response.headers['content-type']
    if (contentType && !contentType.includes('application/pdf')) {
      console.error('Received non-PDF response:', contentType)
      
      // Try to parse error message
      const text = await response.data.text()
      const error = JSON.parse(text)
      alert(`Failed to generate PDF: ${error.error || 'Unknown error'}`)
      return
    }

    // Check if blob is empty or too small (might be error JSON)
    if (response.data.size < 1000) {
      try {
        const text = await response.data.text()
        const error = JSON.parse(text)
        alert(`Failed to generate PDF: ${error.error || 'Unknown error'}`)
        return
      } catch (e) {
        // Not JSON, proceed with download
      }
    }

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename || 'report.pdf')
    document.body.appendChild(link)
    link.click()
    link.parentNode.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('PDF download failed:', error)
    if (error.response?.status === 400) {
      alert('Missing or invalid data for PDF generation. Please check the inputs.')
    } else if (error.response?.status === 500) {
      alert('Server error while generating PDF. Please try again.')
    } else {
      alert('Failed to download PDF. Please try again.')
    }
  }
}
