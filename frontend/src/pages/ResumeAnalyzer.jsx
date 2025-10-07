import React, { useState, useEffect } from 'react';

// You must include the PDF.js library in your main index.html file for this component to work.
// <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.min.js"></script>
// <script>pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js`;</script>

const ResumeAnalyzer = () => {
    // --- State Management, Effects, and basic handlers ---
    const [analysisMode, setAnalysisMode] = useState('title');
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
    const API_KEY = "AIzaSyCWzxwj3qJU2AgEfkfm8weOjq4H96YI8sg"; // Replace with your key
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

    useEffect(() => {
        if (analysisMode === 'title') {
            setJobDescription('');
        } else if (analysisMode === 'description') {
            setJobTitle('');
        }
    }, [analysisMode]);

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
            setError("Please provide a job title."); return;
        }
        if (analysisMode === 'description' && !jobDescription.trim()) {
            setError("Please provide a job description."); return;
        }
        if (analysisMode === 'both' && (!jobTitle.trim() || !jobDescription.trim())) {
            setError("Please provide both a job title and a description."); return;
        }
        if (!resumeFile) {
            setError("Please upload your resume PDF."); return;
        }
        if (resumeFile.type !== "application/pdf") {
            setError("Please upload a file in PDF format."); return;
        }

        // --- Reset UI and start loading ---
        setError('');
        setAnalysisResult(null);
        setIsLoading(true);

        try {
            const resumeText = await getTextFromPdf(resumeFile);
            if (!resumeText || resumeText.trim().length === 0) {
                throw new Error("Could not extract text from the PDF. The file might be empty, corrupted, or an image-based PDF.");
            }
            const keywords = await getJobKeywords(jobTitle, jobDescription, analysisMode);
            if (keywords && keywords.length > 0) {
                const result = await getLlmAnalysis(resumeText, keywords);
                if (result) {
                    setAnalysisResult(result);
                } else {
                    throw new Error("The AI model could not complete the analysis. Please try again.");
                }
            } else {
                throw new Error("Could not identify keywords for this job. Please try a different title or description.");
            }
        } catch (err) {
            console.error('Analysis failed:', err);
            setError(err.message || "An error occurred during analysis.");
        } finally {
            setIsLoading(false);
        }
    };

    const getTextFromPdf = (file) => {
        return new Promise((resolve, reject) => {
            if (!window.pdfjsLib) return reject(new Error("PDF.js library is not loaded."));
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
                } catch (error) { reject(error); }
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
                systemPrompt = `You are a world-class technical recruiter. Based on the job title, generate a comprehensive list of essential technical skills, soft skills, and related technologies. Return the response as a single comma-separated string of keywords. Do not include any other text.`;
                userQuery = `Job Title: ${title}`;
                break;
            case 'description':
                systemPrompt = `You are a world-class technical recruiter. Your task is to extract the most crucial skills from a job description. Return the response as a single comma-separated string of keywords. Do not include any other text.`;
                userQuery = `Job Description:\n${description}`;
                break;
            case 'both':
                systemPrompt = `You are a world-class technical recruiter. Using both the title for high-level context and the description for specific details, generate a comprehensive list of essential skills. Prioritize skills mentioned explicitly in the description. Return the response as a single comma-separated string of keywords. Do not include any other text.`;
                userQuery = `Job Title: ${title}\n\nJob Description:\n${description}`;
                break;
            default: return [];
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
        const systemPrompt = `You are an expert AI resume analyzer. Evaluate the resume against the provided keywords.
        - Hard skills are specific, teachable abilities (e.g., 'Python', 'React', 'SQL', 'Graphic Design').
        - Soft skills are interpersonal attributes (e.g., 'Leadership', 'Communication', 'Teamwork', 'Problem-solving').

        Return a JSON object with this exact structure: 
        {
            "score": number, 
            "matchedSkills": {"hardSkills": string[], "softSkills": string[]}, 
            "missingSkills": {"hardSkills": string[], "softSkills": string[]}, 
            "suggestions": string
        }. 

        Do not include any text or markdown formatting outside the JSON object. Infer skills from context (e.g., "hackathon win" implies "leadership").`;
        
        const userQuery = `Analyze this resume against the following keywords.\n\nKeywords: ${keywords.join(', ')}\n\nResume Text:\n${resumeText}`;
        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { responseMimeType: "application/json" }
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
            return JSON.parse(rawText);
        } catch (err) {
            console.error("Error during LLM analysis:", err);
            return null;
        }
    };

    // --- Sub-components for Rendering ---
    const KeywordList = ({ keywords }) => {
        if (!keywords || keywords.length === 0) {
            return <li className="text-gray-500">None found.</li>;
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
            <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold text-white transition-all duration-500 ease-in-out shadow-lg ${getColor()}`}>
                <span>{score}%</span>
            </div>
        );
    };

    // --- Main Component Render ---
    return (
        <div className="bg-gradient-to-br from-orange-50 via-amber-100 to-orange-200 text-gray-800 font-sans min-h-screen">
            <div className="container mx-auto p-4 md:p-8 max-w-4xl">
                <header className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-orange-900">AI-Powered Resume Analyzer</h1>
                    <p className="text-lg text-amber-800 mt-2">Instantly match your resume against any job description.</p>
                </header>

                <main className="bg-white/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-lg shadow-orange-200/60">
                    <div className="space-y-8">
                        {/* --- Step 1 Card --- */}
                        <div className="bg-white/70 p-6 rounded-xl shadow-md border border-orange-200/50">
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0 bg-orange-500 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-lg">1</div>
                                <h3 className="ml-4 text-xl font-semibold text-orange-800">Choose Analysis Mode</h3>
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-3 pl-12">
                                {['title', 'description', 'both'].map(mode => (
                                    <div className="flex items-center" key={mode}>
                                        <input type="radio" id={`mode-${mode}`} name="analysis-mode" value={mode} checked={analysisMode === mode} onChange={(e) => setAnalysisMode(e.target.value)} className="h-4 w-4 text-orange-600 border-gray-300 focus:ring-orange-500"/>
                                        <label htmlFor={`mode-${mode}`} className="ml-2 block font-medium text-gray-700">
                                            {mode === 'title' ? 'Job Title Only' : mode === 'description' ? 'Job Description Only' : 'Both'}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* --- Step 2 Card --- */}
                        <div className="bg-white/70 p-6 rounded-xl shadow-md border border-orange-200/50">
                             <div className="flex items-center mb-4">
                                <div className="flex-shrink-0 bg-orange-500 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-lg">2</div>
                                <h3 className="ml-4 text-xl font-semibold text-orange-800">Provide Job Details</h3>
                            </div>
                            <div className="space-y-4 pl-12">
                                {(analysisMode === 'title' || analysisMode === 'both') && (
                                    <div>
                                        <label htmlFor="job-title" className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                                        <input type="text" id="job-title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition" placeholder="e.g., Senior Software Engineer (AI/ML)" />
                                    </div>
                                )}
                                {(analysisMode === 'description' || analysisMode === 'both') && (
                                    <div>
                                        <label htmlFor="job-description" className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                                        <textarea id="job-description" rows="6" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition" placeholder="Paste the full job description here..."></textarea>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* --- Step 3 Card --- */}
                        <div className="bg-white/70 p-6 rounded-xl shadow-md border border-orange-200/50">
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0 bg-orange-500 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-lg">3</div>
                                <h3 className="ml-4 text-xl font-semibold text-orange-800">Upload Your Resume</h3>
                            </div>
                             <div className="mt-2 pl-12">
                                <div className="flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-orange-300 border-dashed rounded-md transition-colors duration-300 hover:border-orange-500 hover:bg-orange-50/50">
                                    <div className="space-y-1 text-center">
                                        <svg className="mx-auto h-12 w-12 text-orange-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v10.5A2.25 2.25 0 0118.75 19.5H5.25A2.25 2.25 0 013 17.25z" /></svg>
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <label htmlFor="resume-file" className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500 px-1">
                                                <span>Upload a file</span>
                                                <input id="resume-file" name="resume-file" type="file" className="sr-only" accept=".pdf" onChange={handleFileChange} />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-sm font-medium text-amber-800 mt-2">{fileName || 'PDF file up to 10MB'}</p>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>

                    <div className="text-center mt-10">
                        <button onClick={handleAnalyzeClick} disabled={isLoading} className="bg-orange-600 text-white font-bold py-3 px-12 rounded-lg hover:bg-orange-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-300 disabled:bg-orange-400 disabled:cursor-not-allowed disabled:scale-100">
                            {isLoading ? 'Analyzing...' : 'Analyze My Resume'}
                        </button>
                    </div>
                    
                    {isLoading && (
                         <div className="text-center mt-8">
                            <div className="animate-spin rounded-full h-20 w-20 border-8 border-t-8 border-gray-200 border-t-orange-600 mx-auto"></div>
                            <p className="mt-4 text-lg text-orange-800 font-semibold">Analyzing... The AI is thinking.</p>
                        </div>
                    )}
                    {error && (<div className="text-center mt-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"><strong>Error:</strong> {error}</div>)}
                    
                    {analysisResult && !isLoading && (
                        <div className="mt-10 animate-fade-in">
                            <div className="text-center mb-8"><h2 className="text-3xl font-bold text-orange-900">Analysis Results</h2></div>
                            <div className="bg-orange-50/70 p-6 rounded-2xl shadow-inner">
                                <div className="flex flex-col items-center justify-center mb-6">
                                    <ScoreCircle score={analysisResult.score} />
                                    <p className="text-lg text-amber-800 font-semibold mt-4">Resume Match Score</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Matched Skills Card */}
                                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                        <h3 className="text-xl font-semibold text-green-600 mb-3">✅ Matched Skills</h3>
                                        {analysisResult.matchedSkills?.hardSkills?.length > 0 && (
                                            <>
                                                <h4 className="font-semibold text-gray-800 mt-2 mb-1">Hard Skills</h4>
                                                <ul className="list-disc list-inside text-gray-700 space-y-1"><KeywordList keywords={analysisResult.matchedSkills.hardSkills} /></ul>
                                            </>
                                        )}
                                        {analysisResult.matchedSkills?.softSkills?.length > 0 && (
                                            <>
                                                <h4 className="font-semibold text-gray-800 mt-4 mb-1">Soft Skills</h4>
                                                <ul className="list-disc list-inside text-gray-700 space-y-1"><KeywordList keywords={analysisResult.matchedSkills.softSkills} /></ul>
                                            </>
                                        )}
                                    </div>
                                    {/* Missing Skills Card */}
                                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                        <h3 className="text-xl font-semibold text-red-600 mb-3">❌ Missing Skills</h3>
                                        {analysisResult.missingSkills?.hardSkills?.length > 0 && (
                                            <>
                                                <h4 className="font-semibold text-gray-800 mt-2 mb-1">Hard Skills</h4>
                                                <ul className="list-disc list-inside text-gray-700 space-y-1"><KeywordList keywords={analysisResult.missingSkills.hardSkills} /></ul>
                                            </>
                                        )}
                                        {analysisResult.missingSkills?.softSkills?.length > 0 && (
                                            <>
                                                <h4 className="font-semibold text-gray-800 mt-4 mb-1">Soft Skills</h4>
                                                <ul className="list-disc list-inside text-gray-700 space-y-1"><KeywordList keywords={analysisResult.missingSkills.softSkills} /></ul>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="text-xl font-semibold text-orange-900 mb-3">💡 Improvement Suggestions</h3>
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