import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  TrendingUp, 
  Award, 
  Clock, 
  User, 
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Star,
  Download,
  Share2,
  ArrowLeft
} from 'lucide-react';

import { useParams } from 'react-router-dom';
import axios from 'axios';
const ReportsPage = () => {
    const navigate = useNavigate();
  const { id } = useParams();

  // Sample report data - this would come from your API
 const [reportData, setReportData] = useState({});
   const [loading, setLoading] = useState(true);

   useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.post(
          `http://localhost:3000/api/interviews/get-report/`, // <-- pass id here
          { id },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        console.log("Fetched Report Data:", res.data); // Debug log
        setReportData(res.data.report); // save response
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading) return <p>Loading report...</p>;
  if (!reportData) return <p>No report found</p>;


  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreIcon = (score) => {
    if (score >= 90) return <Award className="w-6 h-6" />;
    if (score >= 80) return <CheckCircle className="w-6 h-6" />;
    if (score >= 70) return <AlertCircle className="w-6 h-6" />;
    return <AlertCircle className="w-6 h-6" />;
  };

  const getDomainLevelColor = (level) => {
    switch (level) {
      case 'Expert': return 'bg-purple-100 text-purple-800';
      case 'Intermediate': return 'bg-blue-100 text-blue-800';
      case 'Beginner': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const MetricCard = ({ title, value, icon: Icon }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Interview Report</h1>
                  <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Score Overview */}
        <div className={`rounded-xl p-8 mb-8 border-2 ${getScoreColor(reportData.score)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getScoreIcon(reportData.score)}
              <div>
                <h2 className="text-2xl font-bold mb-1">Overall Score</h2>
                <p className="opacity-80">Interview Performance Assessment</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold mb-1">{reportData.score}</div>
              <div className="text-sm opacity-80">out of 100</div>
            </div>
          </div>
        </div>

        {/* Content & Knowledge Metrics */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Content & Knowledge Metrics</h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <MetricCard 
              title="Relevance" 
              value={reportData["Content & Knowledge Metrics"]["Relevance"]}
              icon={MessageSquare}
            />
            <MetricCard 
              title="Correctness" 
              value={reportData["Content & Knowledge Metrics"]["Correctness"]}
              icon={CheckCircle}
            />
            <MetricCard 
              title="Completeness" 
              value={reportData["Content & Knowledge Metrics"]["Completeness"]}
              icon={FileText}
            />
            <MetricCard 
              title="Problem-solving" 
              value={reportData["Content & Knowledge Metrics"]["Problem-solving"]}
              icon={TrendingUp}
            />
          </div>

          {/* Domain Knowledge Level */}
          <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Domain Knowledge Depth</h3>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getDomainLevelColor(reportData["Content & Knowledge Metrics"]["Domain Knowledge Depth"])}`}>
                {reportData["Content & Knowledge Metrics"]["Domain Knowledge Depth"]}
              </span>
            </div>
          </div>
        </div>

        {/* Communication & Language Metrics */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Communication & Language Metrics</h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <MetricCard 
              title="Clarity" 
              value={reportData["Communication & Language Metrics"]["Clarity"]}
              icon={MessageSquare}
            />
            <MetricCard 
              title="Conciseness" 
              value={reportData["Communication & Language Metrics"]["Conciseness"]}
              icon={Clock}
            />
            <MetricCard 
              title="Vocabulary" 
              value={reportData["Communication & Language Metrics"]["Vocabulary"]}
              icon={FileText}
            />
            <MetricCard 
              title="Grammar & Fluency" 
              value={reportData["Communication & Language Metrics"]["Grammar & Fluency"]}
              icon={CheckCircle}
            />
          </div>
        </div>

        {/* Overall Summary */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Overall Summary</h2>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">{reportData["Overall Summary"]}</p>
          </div>
        </div>

        {/* Action Items */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">Next Steps</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Review detailed feedback for improvement areas
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Schedule follow-up session if needed
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Share results with relevant stakeholders
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;