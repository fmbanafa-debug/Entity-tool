import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, PieChart, DollarSign, BrainCircuit, 
  Plus, Trash2, Edit3, Settings, Loader2, Save, Download 
} from 'lucide-react';

// ============================================================================
// CONFIGURATION & AI INTEGRATION SETUP
// ============================================================================

// The API key is injected by the environment. When moving to Vercel, 
// you will remove this and instead fetch from your own Vercel API routes.
const apiKey = ""; 

// Exponential backoff retry logic for AI Calls
const fetchWithRetry = async (url, options, retries = 5) => {
  const delays = [1000, 2000, 4000, 8000, 16000];
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(res => setTimeout(res, delays[i]));
    }
  }
};

// ============================================================================
// DEFAULT DATA (MIMICKING THE "NOW" SUPPLEMENTS CONCEPT)
// ============================================================================

const DEFAULT_DATA = {
  company: {
    name: "Nature's Wellness Entity",
    industry: "Natural Products & Supplements",
    status: "Private, Independent",
  },
  financials: {
    revenue: 750000000, // Est $500M - $1B
    ebitda: 120000000,
    growthRate: 15,
    employees: 1800,
  },
  stakeholders: [
    { id: '1', name: "The Founding Family", type: "Family", stakePercent: 70, role: "Primary Ownership & Leadership" },
    { id: '2', name: "Employee Stock Ownership Plan (ESOP)", type: "ESOP", stakePercent: 30, role: "Employee Wealth Generation" },
  ],
  employees: [
    { id: '1', name: "Elwood R.", position: "Founder / Board Chair", age: 68, sex: "M", location: "Global HQ" },
    { id: '2', name: "Sarah Jenkins", position: "CEO", age: 52, sex: "F", location: "Global HQ" },
    { id: '3', name: "David Chen", position: "VP of Operations", age: 45, sex: "M", location: "Manufacturing Facility A" },
    { id: '4', name: "Aisha Patel", position: "Head of R&D", age: 39, sex: "F", location: "Innovation Lab" },
  ]
};

// ============================================================================
// MAIN APPLICATION COMPONENT
// ============================================================================

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(DEFAULT_DATA);
  const [loadingFeature, setLoadingFeature] = useState(null);

  // Silent Local Storage Persistence
  useEffect(() => {
    const saved = localStorage.getItem('entity_builder_data');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse local data", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('entity_builder_data', JSON.stringify(data));
  }, [data]);

  // ============================================================================
  // AI FEATURE FUNCTIONS (Easily extractable to Vercel Backend)
  // ============================================================================

  const callGeminiAI = async (prompt, schema) => {
    // When porting to Vercel, replace this URL with your backend endpoint, e.g., `/api/generate`
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-latest-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    };

    const result = await fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    return JSON.parse(result.candidates[0].content.parts[0].text);
  };

  const handleAIGenerateOrg = async () => {
    setLoadingFeature('org');
    try {
      const prompt = `Generate an organizational structure with 8 diverse employees for a company called "${data.company.name}" in the ${data.company.industry} industry. Include realistic synthetic biometric/demographic data.`;
      const schema = {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            id: { type: "STRING" },
            name: { type: "STRING" },
            position: { type: "STRING" },
            age: { type: "INTEGER" },
            sex: { type: "STRING", description: "M or F" },
            location: { type: "STRING" }
          },
          required: ["id", "name", "position", "age", "sex", "location"]
        }
      };
      
      const generatedEmployees = await callGeminiAI(prompt, schema);
      setData(prev => ({ ...prev, employees: generatedEmployees }));
    } catch (error) {
      console.error("AI Generation failed:", error);
    } finally {
      setLoadingFeature(null);
    }
  };

  const handleAIGenerateStakes = async () => {
    setLoadingFeature('stakes');
    try {
      const prompt = `Restructure the ownership stakes for a company transitioning to a partial employee-owned model. Generate 3 to 5 entities (e.g., Founding Family, ESOP, Key Executives). The total stakePercent MUST equal exactly 100.`;
      const schema = {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            id: { type: "STRING" },
            name: { type: "STRING" },
            type: { type: "STRING" },
            stakePercent: { type: "INTEGER" },
            role: { type: "STRING" }
          },
          required: ["id", "name", "type", "stakePercent", "role"]
        }
      };
      
      const generatedStakes = await callGeminiAI(prompt, schema);
      setData(prev => ({ ...prev, stakeholders: generatedStakes }));
    } catch (error) {
      console.error("AI Generation failed:", error);
    } finally {
      setLoadingFeature(null);
    }
  };

  const handleAIFinancials = async () => {
    setLoadingFeature('financials');
    try {
      const prompt = `Generate realistic annual financial metrics for an independent company scaling globally, similar to a successful natural products manufacturer.`;
      const schema = {
        type: "OBJECT",
        properties: {
          revenue: { type: "INTEGER" },
          ebitda: { type: "INTEGER" },
          growthRate: { type: "INTEGER" },
          employees: { type: "INTEGER" }
        },
        required: ["revenue", "ebitda", "growthRate", "employees"]
      };
      
      const genFinancials = await callGeminiAI(prompt, schema);
      setData(prev => ({ ...prev, financials: genFinancials }));
    } catch (error) {
      console.error("AI Generation failed:", error);
    } finally {
      setLoadingFeature(null);
    }
  };


  // ============================================================================
  // DATA MANAGEMENT FUNCTIONS
  // ============================================================================

  const updateCompanyData = (field, value) => {
    setData(prev => ({ ...prev, company: { ...prev.company, [field]: value } }));
  };

  const updateFinancials = (field, value) => {
    setData(prev => ({ ...prev, financials: { ...prev.financials, [field]: Number(value) } }));
  };

  const addStakeholder = () => {
    const newId = Date.now().toString();
    setData(prev => ({
      ...prev,
      stakeholders: [...prev.stakeholders, { id: newId, name: 'New Entity', type: 'Investor', stakePercent: 0, role: 'Advisory' }]
    }));
  };

  const updateStakeholder = (id, field, value) => {
    setData(prev => ({
      ...prev,
      stakeholders: prev.stakeholders.map(s => s.id === id ? { ...s, [field]: field === 'stakePercent' ? Number(value) : value } : s)
    }));
  };

  const removeStakeholder = (id) => {
    setData(prev => ({ ...prev, stakeholders: prev.stakeholders.filter(s => s.id !== id) }));
  };

  const addEmployee = () => {
    const newId = Date.now().toString();
    setData(prev => ({
      ...prev,
      employees: [...prev.employees, { id: newId, name: 'New Employee', position: 'Title', age: 30, sex: 'M', location: 'HQ' }]
    }));
  };

  const updateEmployee = (id, field, value) => {
    setData(prev => ({
      ...prev,
      employees: prev.employees.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  const removeEmployee = (id) => {
    setData(prev => ({ ...prev, employees: prev.employees.filter(e => e.id !== id) }));
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "entity_structure.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const totalStake = data.stakeholders.reduce((sum, s) => sum + (s.stakePercent || 0), 0);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const NavButton = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center w-full px-4 py-3 mb-2 rounded-xl transition-all duration-200 ${
        activeTab === id 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm hidden md:flex">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Building2 className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">EntityForge</h1>
          </div>
          <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Structure Management</p>
        </div>
        
        <nav className="flex-1 p-4">
          <NavButton id="overview" icon={Settings} label="Entity Profile" />
          <NavButton id="ownership" icon={PieChart} label="Ownership & Equity" />
          <NavButton id="organization" icon={Users} label="Organization Chart" />
          <NavButton id="financials" icon={DollarSign} label="Financial Metrics" />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={exportData}
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Config
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-10">
           <div className="flex items-center gap-2 text-blue-600">
            <Building2 className="w-6 h-6" />
            <h1 className="text-xl font-bold">EntityForge</h1>
          </div>
          <select 
            className="bg-slate-100 border-none text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <option value="overview">Profile</option>
            <option value="ownership">Ownership</option>
            <option value="organization">Organization</option>
            <option value="financials">Financials</option>
          </select>
        </header>

        <div className="p-6 md:p-10 max-w-5xl mx-auto">
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Entity Profile</h2>
                <p className="text-slate-500">Configure the foundational identity of your organization.</p>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Entity Name</label>
                  <input 
                    type="text" 
                    value={data.company.name}
                    onChange={(e) => updateCompanyData('name', e.target.value)}
                    className="w-full text-lg px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Industry</label>
                    <input 
                      type="text" 
                      value={data.company.industry}
                      onChange={(e) => updateCompanyData('industry', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Corporate Status</label>
                    <input 
                      type="text" 
                      value={data.company.status}
                      onChange={(e) => updateCompanyData('status', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: OWNERSHIP */}
          {activeTab === 'ownership' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Ownership & Equity</h2>
                  <p className="text-slate-500">Manage stake distribution across founders, investors, and ESOPs.</p>
                </div>
                <button 
                  onClick={handleAIGenerateStakes}
                  disabled={loadingFeature === 'stakes'}
                  className="flex items-center justify-center px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-medium hover:bg-indigo-100 transition-colors border border-indigo-200 disabled:opacity-50"
                >
                  {loadingFeature === 'stakes' ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <BrainCircuit className="w-5 h-5 mr-2" />}
                  AI Auto-Distribute
                </button>
              </div>

              {/* Stake Warning */}
              {totalStake !== 100 && (
                <div className={`p-4 rounded-xl border flex items-center ${totalStake > 100 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
                  <span className="font-semibold mr-2">Notice:</span> Total equity allocation is currently at {totalStake}%. It should equal exactly 100%.
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                        <th className="p-4 font-semibold">Entity / Stakeholder</th>
                        <th className="p-4 font-semibold">Type</th>
                        <th className="p-4 font-semibold">Role</th>
                        <th className="p-4 font-semibold text-right">Stake (%)</th>
                        <th className="p-4 font-semibold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.stakeholders.map((stake) => (
                        <tr key={stake.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <input 
                              className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none py-1"
                              value={stake.name}
                              onChange={(e) => updateStakeholder(stake.id, 'name', e.target.value)}
                            />
                          </td>
                          <td className="p-4">
                            <select 
                              className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none py-1 text-slate-700"
                              value={stake.type}
                              onChange={(e) => updateStakeholder(stake.id, 'type', e.target.value)}
                            >
                              <option value="Family">Family</option>
                              <option value="ESOP">ESOP</option>
                              <option value="Investor">Investor</option>
                              <option value="Founder">Founder</option>
                            </select>
                          </td>
                          <td className="p-4">
                             <input 
                              className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none py-1"
                              value={stake.role}
                              onChange={(e) => updateStakeholder(stake.id, 'role', e.target.value)}
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex justify-end items-center">
                              <input 
                                type="number"
                                className="w-20 text-right bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                value={stake.stakePercent}
                                onChange={(e) => updateStakeholder(stake.id, 'stakePercent', e.target.value)}
                              />
                              <span className="ml-2 text-slate-500 font-medium">%</span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <button onClick={() => removeStakeholder(stake.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50">
                  <button 
                    onClick={addStakeholder}
                    className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Stakeholder
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ORGANIZATION */}
          {activeTab === 'organization' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Organization Chart</h2>
                  <p className="text-slate-500">Manage workforce biometrics, demographics, and roles.</p>
                </div>
                <button 
                  onClick={handleAIGenerateOrg}
                  disabled={loadingFeature === 'org'}
                  className="flex items-center justify-center px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-medium hover:bg-emerald-100 transition-colors border border-emerald-200 disabled:opacity-50"
                >
                  {loadingFeature === 'org' ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <BrainCircuit className="w-5 h-5 mr-2" />}
                  AI Generate Workforce
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {data.employees.map((emp) => (
                  <div key={emp.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center gap-4 hover:shadow-md transition-shadow relative group">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      
                      <div className="col-span-3">
                         <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1 md:hidden">Name</label>
                         <input 
                            className="w-full font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none"
                            value={emp.name}
                            onChange={(e) => updateEmployee(emp.id, 'name', e.target.value)}
                          />
                      </div>

                      <div className="col-span-3">
                         <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1 md:hidden">Position</label>
                         <input 
                            className="w-full text-slate-600 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none"
                            value={emp.position}
                            onChange={(e) => updateEmployee(emp.id, 'position', e.target.value)}
                          />
                      </div>

                      <div className="col-span-2 flex gap-3">
                        <div className="w-1/2">
                          <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1 md:hidden">Age</label>
                          <input 
                              type="number"
                              className="w-full text-center bg-slate-50 border border-slate-200 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={emp.age}
                              onChange={(e) => updateEmployee(emp.id, 'age', e.target.value)}
                            />
                        </div>
                        <div className="w-1/2">
                          <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1 md:hidden">Sex</label>
                          <select 
                            className="w-full text-center bg-slate-50 border border-slate-200 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                            value={emp.sex}
                            onChange={(e) => updateEmployee(emp.id, 'sex', e.target.value)}
                          >
                            <option value="M">M</option>
                            <option value="F">F</option>
                            <option value="O">O</option>
                          </select>
                        </div>
                      </div>

                      <div className="col-span-3">
                         <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1 md:hidden">Location</label>
                         <input 
                            className="w-full text-slate-500 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none text-sm"
                            value={emp.location}
                            onChange={(e) => updateEmployee(emp.id, 'location', e.target.value)}
                          />
                      </div>

                    </div>
                    
                    <button 
                      onClick={() => removeEmployee(emp.id)} 
                      className="absolute top-4 right-4 md:static text-slate-300 hover:text-red-500 transition-colors p-2 md:p-0"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}

                <button 
                  onClick={addEmployee}
                  className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all font-medium flex items-center justify-center"
                >
                  <Plus className="w-5 h-5 mr-2" /> Add Team Member
                </button>
              </div>
            </div>
          )}

          {/* TAB: FINANCIALS */}
          {activeTab === 'financials' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Financial Metrics</h2>
                  <p className="text-slate-500">Track and predict scale and operational capacity.</p>
                </div>
                <button 
                  onClick={handleAIFinancials}
                  disabled={loadingFeature === 'financials'}
                  className="flex items-center justify-center px-4 py-2.5 bg-amber-50 text-amber-700 rounded-xl font-medium hover:bg-amber-100 transition-colors border border-amber-200 disabled:opacity-50"
                >
                  {loadingFeature === 'financials' ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <BrainCircuit className="w-5 h-5 mr-2" />}
                  AI Generate Forecast
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5"><DollarSign className="w-24 h-24" /></div>
                  <label className="block text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wide">Annual Revenue (USD)</label>
                  <div className="flex items-center">
                    <span className="text-2xl text-slate-400 font-light mr-2">$</span>
                    <input 
                      type="number"
                      value={data.financials.revenue}
                      onChange={(e) => updateFinancials('revenue', e.target.value)}
                      className="w-full text-4xl font-bold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                    />
                  </div>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5"><PieChart className="w-24 h-24" /></div>
                  <label className="block text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wide">Adjusted EBITDA (USD)</label>
                  <div className="flex items-center">
                    <span className="text-2xl text-slate-400 font-light mr-2">$</span>
                    <input 
                      type="number"
                      value={data.financials.ebitda}
                      onChange={(e) => updateFinancials('ebitda', e.target.value)}
                      className="w-full text-4xl font-bold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                    />
                  </div>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wide">YoY Growth Rate</label>
                  <div className="flex items-center">
                    <input 
                      type="number"
                      value={data.financials.growthRate}
                      onChange={(e) => updateFinancials('growthRate', e.target.value)}
                      className="w-24 text-3xl font-bold text-blue-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-2xl text-slate-400 font-light ml-3">%</span>
                  </div>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wide">Global Workforce</label>
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-slate-300 mr-3" />
                    <input 
                      type="number"
                      value={data.financials.employees}
                      onChange={(e) => updateFinancials('employees', e.target.value)}
                      className="w-full text-3xl font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none py-1 transition-colors"
                    />
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
