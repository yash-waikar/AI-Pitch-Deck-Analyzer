document.addEventListener('DOMContentLoaded', () => {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'src/pdf.worker.js';
document.getElementById('analyzeButton').addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
  
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = async function() {
        try {
          const typedarray = new Uint8Array(this.result);
          const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
          let content = '';
  
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            textContent.items.forEach(item => {
              content += item.str + ' ';
            });
          }
  
          console.log('PDF Content:', content);
          analyzeContent(content);
        } catch (error) {
          console.error('Error reading PDF:', error);
          document.getElementById('result').innerText = 'Error reading PDF.';
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      document.getElementById('result').innerText = 'Please upload a valid PDF file.';
    }
  });
async function analyzeContent(content) {
  const apiUrl = 'https://api.openai.com/v1/engines/davinci-codex/completions';

  try {
    const response = await axios.post(apiUrl, {
      prompt: `Analyze the following pitch deck content and provide feedback:\n\n${content}`,
      max_tokens: 150
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.apiKey}`
      }
    });

    console.log('OpenAI Response:', response.data);
    document.getElementById('result').innerText = response.data.choices[0].text.trim();
  } catch (error) {
    console.error('Error with OpenAI API:', error);
    document.getElementById('result').innerText = 'Error analyzing content.';
  }
}
});
