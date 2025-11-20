const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileData, fileName, fileType } = await req.json();

    if (!fileData || !fileName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: fileData and fileName' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Parsing document: ${fileName} (${fileType})`);

    // Decode base64 file data
    const binaryData = Uint8Array.from(atob(fileData), c => c.charCodeAt(0));
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    let extractedText = '';

    if (fileExtension === 'pdf') {
      extractedText = await parsePDF(binaryData, fileName);
    } else if (fileExtension === 'docx') {
      extractedText = await parseDOCX(binaryData, fileName);
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported file type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully extracted ${extractedText.length} characters from ${fileName}`);

    return new Response(
      JSON.stringify({ 
        content: extractedText,
        fileName: fileName,
        characterCount: extractedText.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error parsing document:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to parse document',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function parsePDF(data: Uint8Array, fileName: string): Promise<string> {
  try {
    // Use pdfjs-serverless for serverless environments (no worker needed)
    const { getDocument } = await import('https://esm.sh/pdfjs-serverless@0.3.2');
    
    console.log(`Loading PDF: ${fileName}`);
    const loadingTask = getDocument(data);
    const pdf = await loadingTask.promise;
    
    console.log(`PDF loaded: ${pdf.numPages} pages`);
    
    let fullText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
    }
    
    // If very little text extracted, it might be a scanned PDF
    if (fullText.trim().length < 100) {
      return `[Note: This PDF appears to contain mainly images or scanned content with limited extractable text. For full OCR of scanned documents, additional OCR services would be needed.]\n\n${fullText}`;
    }
    
    return fullText;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error(`PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function parseDOCX(data: Uint8Array, fileName: string): Promise<string> {
  try {
    // Use mammoth for DOCX parsing
    const mammoth = await import('https://esm.sh/mammoth@1.8.0');
    
    // Create a new ArrayBuffer and copy the data to ensure proper type
    const arrayBuffer = new ArrayBuffer(data.byteLength);
    const view = new Uint8Array(arrayBuffer);
    view.set(data);
    
    console.log(`Parsing DOCX: ${fileName}`);
    
    // Parse DOCX
    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer as ArrayBuffer });
    
    if (result.messages && result.messages.length > 0) {
      console.log('Mammoth parsing messages:', result.messages);
    }
    
    if (!result.value || result.value.trim().length === 0) {
      throw new Error('No text content extracted from DOCX file');
    }
    
    return result.value;
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error(`DOCX parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
