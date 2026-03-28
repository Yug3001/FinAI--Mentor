import axios from 'axios'

export const downloadPDF = async (apiEndpoint, payload, filename) => {
  try {
    const response = await axios.post(apiEndpoint, payload, {
      responseType: 'blob',
      headers: { 'Content-Type': 'application/json' }
    })

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
    alert('Failed to download PDF. Please try again.')
  }
}
