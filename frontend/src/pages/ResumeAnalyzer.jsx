import React, { useState, useEffect } from 'react';

// You must include the PDF.js library in your main index.html file for this component to work.
// {/* <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.min.js"></script>
// <script>pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js`;</script> */}

const ResumeAnalyzer = () => {
    // --- State Management ---
    const [analysisMode, setAnalysisMode] = useState('title'); // 'title', 'description', or 'both'
    const [jobTitle, setJobTitle] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    
    // --- API Configuration ---
    // IMPORTANT: Replace with your actual API key for local/server deployment.
    // Leaving this in client-side code is a security risk for production apps.
    const API_KEY = "AIzaSyCWzxwj3qJU2AgEfkfm8weOjq4H96YI8sg";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;


    // --- Effect to manage conditional input visibility ---
    useEffect(() => {
        if (analysisMode === 'title') {
            setJobDescription('');
        } else if (analysisMode === 'description') {
            setJobTitle('');
        }
    }, [analysisMode]);

    // --- Event Handlers ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setResumeFile(file);
            setFileName(`Selected: ${file.name}`);
        } else {
            setResumeFile(null);
            setFileName('');
        }
    };

    const handleAnalyzeClick = async () => {
        // --- Validation ---
        if (analysisMode === 'title' && !jobTitle.trim()) {
            setError("Please provide a job title for 'Job Title Only' mode.");
            return;
        }
        if (analysisMode === 'description' && !jobDescription.trim()) {
            setError("Please provide a job description for 'Job Description Only' mode.");
            return;
        }
        if (analysisMode === 'both' && (!jobTitle.trim() || !jobDescription.trim())) {
            setError("Please provide both a job title and a description for 'Both' mode.");
            return;
        }
        if (!resumeFile) {
            setError("Please upload your resume PDF.");
            return;
        }
        if (resumeFile.type !== "application/pdf") {
            setError("Please upload a file in PDF format.");
            return;
        }

        // --- Reset UI and start loading ---
        setError('');
        setAnalysisResult(null);
        setIsLoading(true);

        try {
            const resumeText = await getTextFromPdf(resumeFile);
            if (!resumeText || resumeText.trim().length === 0) {
                setError("Could not extract text from the PDF. The file might be empty, corrupted, or an image-based PDF.");
                setIsLoading(false);
                return;
            }

            const keywords = await getJobKeywords(jobTitle, jobDescription, analysisMode);
            if (keywords && keywords.length > 0) {
                const result = await getLlmAnalysis(resumeText, keywords);
                if (result) {
                    setAnalysisResult(result);
                } else {
                    setError("The AI model could not complete the analysis. Please try again.");
                }
            } else {
                setError("Could not identify keywords for this job. Please try a different title or description.");
            }
        } catch (err) {
            console.error('Analysis failed:', err);
            setError("An error occurred during PDF parsing or analysis. Please check the console for details.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Helper & API Functions ---
    const getTextFromPdf = (file) => {
        return new Promise((resolve, reject) => {
            if (!window.pdfjsLib) {
                return reject(new Error("PDF.js library is not loaded."));
            }
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const typedarray = new Uint8Array(event.target.result);
                    const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
                    let fullText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        fullText += textContent.items.map(item => item.str).join(' ') + '\n';
                    }
                    resolve(fullText);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(file);
        });
    };

    const getJobKeywords = async (title, description, mode) => {
        let systemPrompt = '';
        let userQuery = '';

        switch (mode) {
            case 'title':
                systemPrompt = `You are a world-class technical recruiter. Your task is to identify the most crucial skills for a job title. Based on the job title, generate a comprehensive list of essential technical skills, soft skills, and related technologies. For concepts like "Agent AI", include foundational topics like "Generative AI", "Deep Learning", and "Machine Learning". Return the response as a single comma-separated string of keywords. Do not include any other text.`;
                userQuery = `Job Title: ${title}`;
                break;
            case 'description':
                systemPrompt = `You are a world-class technical recruiter. Your task is to extract the most crucial skills from a job description. Generate a comprehensive list of essential technical skills, soft skills, and related technologies mentioned in the description. Return the response as a single comma-separated string of keywords. Do not include any other text.`;
                userQuery = `Job Description:\n${description}`;
                break;
            case 'both':
                systemPrompt = `You are a world-class technical recruiter. Your task is to identify the most crucial skills for a job, using both the title for high-level context and the description for specific details. Generate a comprehensive list of essential technical skills, soft skills, and related technologies. Prioritize skills mentioned explicitly in the description. For concepts like "Agent AI", include foundational topics like "Generative AI", "Deep Learning", and "Machine Learning". Return the response as a single comma-separated string of keywords. Do not include any other text.`;
                userQuery = `Job Title: ${title}\n\nJob Description:\n${description}`;
                break;
            default:
                return [];
        }

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`API call failed with status: ${response.status}`);
        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        return text ? text.split(',').map(kw => kw.trim().toLowerCase()).filter(kw => kw) : [];
    };

    const getLlmAnalysis = async (resumeText, keywords) => {
        const systemPrompt = `You are an expert AI resume analyzer. Evaluate the resume against the provided keywords and return a JSON object with this exact structure: {"score": number, "matchedKeywords": string[], "missingKeywords": string[], "suggestions": string}.
- score: An integer from 0-100 for how well the resume matches the keywords.
- matchedKeywords: A list of keywords found in the resume.
- missingKeywords: A list of keywords NOT found in the resume.
- suggestions: A concise, actionable paragraph on how to improve the resume.

Follow these examples for intelligent analysis:
- **Example 1 (Inferring skills):** If a resume mentions "led a team to win the national hackathon," you should infer skills like "Project Management" and "Leadership" even if those exact words are not present. Do not list "Project Management" as a missing keyword in this case if it was a target skill.
- **Example 2 (Avoiding over-specificity):** If the job is for a "Data Scientist" and the resume lists multiple data science projects using Python, you can infer knowledge of libraries like "numpy" and "pandas" and concepts like "supervised learning". Do not list these as missing keywords unless the job description specifically emphasizes them as critical and distinct requirements. Focus on the higher-level concepts.

Do not include any text or markdown formatting outside the JSON object.`;
        
        const userQuery = `Analyze this resume against the following keywords.\n\nKeywords: ${keywords.join(', ')}\n\nResume Text:\n${resumeText}`;

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`API call failed: ${response.statusText}`);
            const result = await response.json();
            const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!rawText) return null;
            const jsonString = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonString);
        } catch (err) {
            console.error("Error during LLM analysis:", err);
            return null;
        }
    };


    // --- Sub-components for Rendering ---
    const KeywordList = ({ keywords }) => {
        if (!keywords || keywords.length === 0) {
            return <li className="text-gray-500">None</li>;
        }
        return keywords.sort().map((keyword, index) => (
            <li key={index}>{keyword.charAt(0).toUpperCase() + keyword.slice(1)}</li>
        ));
    };
    
    const ScoreCircle = ({ score = 0 }) => {
        const getColor = () => {
            if (score < 50) return 'bg-red-500';
            if (score < 75) return 'bg-yellow-500';
            return 'bg-green-500';
        };
    
        return (
            <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold text-white transition-all duration-500 ease-in-out ${getColor()}`}>
                <span>{score}%</span>
            </div>
        );
    };

    return (
        <div className="bg-gray-100 text-gray-800 font-sans">
            <div className="container mx-auto p-4 md:p-8 max-w-4xl">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">AI-Powered Resume Analyzer</h1>
                    <p className="text-lg text-gray-600 mt-2">Get an instant, intelligent analysis of your resume against any job title or description.</p>
                </header>

                <main className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
                    <div className="grid grid-cols-1 gap-8">
                        <div>
                            <label className="block text-lg font-semibold text-gray-700 mb-3">Analysis Mode</label>
                            <div className="flex flex-wrap gap-x-6 gap-y-2">
                                {['title', 'description', 'both'].map(mode => (
                                    <div className="flex items-center" key={mode}>
                                        <input
                                            type="radio"
                                            id={`mode-${mode}`}
                                            name="analysis-mode"
                                            value={mode}
                                            checked={analysisMode === mode}
                                            onChange={(e) => setAnalysisMode(e.target.value)}
                                            className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                        />
                                        <label htmlFor={`mode-${mode}`} className="ml-2 block text-sm font-medium text-gray-700">
                                            {mode === 'title' ? 'Job Title Only' : mode === 'description' ? 'Job Description Only' : 'Both'}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {(analysisMode === 'title' || analysisMode === 'both') && (
                            <div>
                                <label htmlFor="job-title" className="block text-lg font-semibold text-gray-700 mb-2">Job Title</label>
                                <input
                                    type="text"
                                    id="job-title"
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                    placeholder="e.g., Senior Software Engineer (AI/ML)"
                                />
                            </div>
                        )}

                        {(analysisMode === 'description' || analysisMode === 'both') && (
                             <div>
                                <label htmlFor="job-description" className="block text-lg font-semibold text-gray-700 mb-2">Job Description</label>
                                <textarea
                                    id="job-description"
                                    rows="8"
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                    placeholder="Paste the full job description here..."
                                ></textarea>
                            </div>
                        )}
                        
                        <div>
                            <label htmlFor="resume-file" className="block text-lg font-semibold text-gray-700 mb-2">Upload Your Resume (PDF)</label>
                            <div className="mt-2 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                     <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                         <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                     </svg>
                                    <div className="flex text-sm text-gray-600 justify-center">
                                        <label htmlFor="resume-file" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                            <span>Upload a file</span>
                                            <input id="resume-file" name="resume-file" type="file" className="sr-only" accept=".pdf" onChange={handleFileChange} />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 mt-2">{fileName}</p>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <button
                                onClick={handleAnalyzeClick}
                                disabled={isLoading}
                                className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Analyzing...' : 'Analyze Resume'}
                            </button>
                        </div>
                    </div>
                    
                    {isLoading && (
                         <div className="text-center mt-8">
                            <div className="animate-spin ease-linear rounded-full border-8 border-t-8 border-gray-200 border-top-color-[#3498db] h-24 w-24 mx-auto"></div>
                            <p className="mt-4 text-lg text-gray-600">Analyzing... The AI is thinking.</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center mt-8 text-red-600 font-semibold">{error}</div>
                    )}
                    
                    {analysisResult && !isLoading && (
                        <div className="mt-10">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-900">Analysis Results</h2>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-2xl shadow-inner">
                                <div className="flex flex-col items-center justify-center mb-6">
                                    <ScoreCircle score={analysisResult.score} />
                                    <p className="text-lg text-gray-600 mt-4">Resume Score</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <h3 className="text-xl font-semibold text-green-600 mb-3">Matched Keywords</h3>
                                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                                            <KeywordList keywords={analysisResult.matchedKeywords} />
                                        </ul>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <h3 className="text-xl font-semibold text-red-600 mb-3">Missing Keywords</h3>
                                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                                            <KeywordList keywords={analysisResult.missingKeywords} />
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 bg-white p-6 rounded-lg border border-gray-200">
                                <h3 className="text-xl font-semibold text-gray-800 mb-3">Improvement Suggestions</h3>
                                <p className="text-gray-600 whitespace-pre-wrap">{analysisResult.suggestions || "No suggestions available."}</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ResumeAnalyzer;
