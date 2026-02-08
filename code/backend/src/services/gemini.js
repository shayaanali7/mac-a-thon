const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyze medical images using Gemini Vision
 * @param {Array} imageFiles - Array of multer file objects
 * @returns {Array} Analysis results
 */
async function analyzeImagesWithGemini(imageFiles) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const analyses = [];

    for (const imageFile of imageFiles) {
        try {
            console.log('📸 Analyzing with Gemini:', imageFile.originalname);

            // Convert buffer to Gemini format
            const imagePart = {
                inlineData: {
                    data: imageFile.buffer.toString('base64'),
                    mimeType: imageFile.mimetype,
                },
            };

            const prompt = `You are a medical AI assistant. Analyze this medical image and extract ALL relevant information:

- If it's handwritten notes: Transcribe the text accurately
- If it's a prescription: List medications, dosages, frequency
- If it's lab results: Extract all test names and values
- If it's vital signs: Extract BP, temp, pulse, etc.
- If it's a diagram: Describe what it shows
- If it's an X-ray/scan: Describe findings

Format your response as structured data that can be added to a medical summary.
Be thorough and precise.`;

            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            const text = response.text();

            analyses.push({
                filename: imageFile.originalname,
                analysis: text,
                type: detectImageType(text),
            });

            console.log('✅ Gemini analysis complete:', imageFile.originalname);

        } catch (error) {
            console.error('❌ Gemini analysis failed:', imageFile.originalname, error);
            analyses.push({
                filename: imageFile.originalname,
                analysis: 'Failed to analyze image',
                error: error.message,
            });
        }
    }

    return analyses;
}

/**
 * Generate medical summary combining transcript and images
 */
async function generateSummaryWithGemini(dialogue, imageAnalysis = []) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    console.log('📝 Generating summary with Gemini...');

    // Format conversation
    const conversationText = dialogue
        .map(d => `Speaker ${d.speakerId}: ${d.text}`)
        .join('\n');

    // Format image analysis
    const imageText = imageAnalysis.length > 0
        ? '\n\n=== ADDITIONAL MEDICAL IMAGES ===\n' +
        imageAnalysis.map(img =>
            `\n[${img.type?.toUpperCase() || 'IMAGE'} - ${img.filename}]\n${img.analysis}`
        ).join('\n')
        : '';

    const prompt = `You are a medical AI assistant. Generate a comprehensive medical summary from this doctor-patient consultation.

CONVERSATION TRANSCRIPT:
${conversationText}
${imageText}

Generate a professional medical summary with these sections:

## PATIENT INFORMATION
- Date of Visit
- Chief Complaint

## SUBJECTIVE (Patient's Description)
- Symptoms and their duration
- Relevant medical history
- Current medications
- Known allergies

## OBJECTIVE (Clinical Findings)
- Vital signs (if available)
- Physical examination findings
- Observations from uploaded images

## ASSESSMENT (Diagnosis)
- Primary diagnosis
- Differential diagnoses if applicable
- Clinical reasoning

## PLAN (Treatment & Follow-up)
- Medications prescribed (with exact dosages from images if available)
- Procedures or tests ordered
- Follow-up instructions
- Patient education provided

## NOTES
- Important observations
- Items requiring follow-up
- Any uploaded documentation (prescriptions, lab results, etc.)

Use professional medical terminology. Be thorough and accurate. If information from images contradicts or adds to the conversation, note it clearly.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const summary = response.text();

        console.log('✅ Gemini summary generated');
        return summary;

    } catch (error) {
        console.error('❌ Gemini summary generation failed:', error);
        throw error;
    }
}

function detectImageType(text) {
    const lower = text.toLowerCase();

    if (lower.includes('prescription') || lower.includes('rx') || lower.includes('medication')) return 'prescription';
    if (lower.includes('lab') || lower.includes('test result') || lower.includes('blood')) return 'lab_result';
    if (lower.includes('vital') || lower.includes('bp') || lower.includes('blood pressure') || lower.includes('temperature')) return 'vitals';
    if (lower.includes('x-ray') || lower.includes('scan') || lower.includes('mri') || lower.includes('ct')) return 'imaging';
    if (lower.includes('note') || lower.includes('handwritten')) return 'clinical_note';

    return 'other';
}

module.exports = {
    analyzeImagesWithGemini,
    generateSummaryWithGemini
};