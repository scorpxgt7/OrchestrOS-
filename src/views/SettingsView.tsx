import { Sliders, Cpu, Activity, Server, RadioReceiver, Palette } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api';
import { useToast } from '../contexts/ToastContext';

interface SettingsViewProps {
  theme?: string;
  setTheme?: (theme: string) => void;
  accentColor?: string;
  setAccentColor?: (color: string) => void;
}

export function SettingsView({ theme = 'theme-default', setTheme, accentColor = 'accent-blue', setAccentColor }: SettingsViewProps) {
  const [riskThreshold, setRiskThreshold] = useState(75);
  const [primaryModel, setPrimaryModel] = useState('Gemini 1.5 Pro');
  const [costPreference, setCostPreference] = useState('Balanced');
  const [dualApproval, setDualApproval] = useState(false);
  const [autoRemediate, setAutoRemediate] = useState(true);
  const [inactivityLockEnabled, setInactivityLockEnabled] = useState(true);
  
  const [localTheme, setLocalTheme] = useState(theme);
  const [localAccentColor, setLocalAccentColor] = useState(accentColor);
  
  const { showToast } = useToast();

  useEffect(() => {
    setLocalTheme(theme);
    setLocalAccentColor(accentColor);
  }, [theme, accentColor]);

  useEffect(() => {
    fetchApi('/organizations/current').then((org: any) => {
      if (org?.settings) {
        if (org.settings.riskThreshold !== undefined) setRiskThreshold(org.settings.riskThreshold);
        if (org.settings.primaryModel) setPrimaryModel(org.settings.primaryModel);
        if (org.settings.costPreference) setCostPreference(org.settings.costPreference);
        if (org.settings.dualApproval !== undefined) setDualApproval(org.settings.dualApproval);
        if (org.settings.autoRemediate !== undefined) setAutoRemediate(org.settings.autoRemediate);
        if (org.settings.inactivityLockEnabled !== undefined) setInactivityLockEnabled(org.settings.inactivityLockEnabled);
        if (org.settings.theme) {
          if (setTheme) setTheme(org.settings.theme);
          setLocalTheme(org.settings.theme);
        }
        if (org.settings.accentColor) {
          if (setAccentColor) setAccentColor(org.settings.accentColor);
          setLocalAccentColor(org.settings.accentColor);
        }
      }
    });
  }, []);

  const updateSetting = async (key: string, value: any) => {
    try {
      const org = await fetchApi('/organizations/current');
      const newSettings = { ...org.settings, [key]: value };
      await fetchApi('/organizations/current', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: newSettings })
      });
      showToast(`Settings updated successfully`, 'success');
    } catch (e) {
      console.error('Failed to update setting', e);
      showToast('Failed to update setting', 'error');
    }
  };

  const applyThemeChanges = async () => {
    if (setTheme) setTheme(localTheme);
    if (setAccentColor) setAccentColor(localAccentColor);
    
    try {
      const org = await fetchApi('/organizations/current');
      const newSettings = { ...org.settings, theme: localTheme, accentColor: localAccentColor };
      await fetchApi('/organizations/current', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: newSettings })
      });
      showToast(`Theme updated successfully`, 'success');
    } catch (e) {
      console.error('Failed to update theme', e);
      showToast('Failed to update theme', 'error');
    }
  };

  const themeOptions = [
    { id: 'theme-default', label: 'Default Dark' },
    { id: 'theme-high-contrast', label: 'High Contrast' },
    { id: 'theme-blueprint', label: 'Blueprint' },
  ];

  const accentOptions = [
    { id: 'accent-blue', label: 'Blue', colorClass: 'bg-blue-500' },
    { id: 'accent-emerald', label: 'Emerald', colorClass: 'bg-emerald-500' },
    { id: 'accent-purple', label: 'Purple', colorClass: 'bg-purple-500' },
    { id: 'accent-rose', label: 'Rose', colorClass: 'bg-rose-500' },
    { id: 'accent-amber', label: 'Amber', colorClass: 'bg-amber-500' },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 font-sans pb-24">
      <div className="border-b border-[var(--border-base)] pb-6">
        <h2 className="text-2xl font-bold text-[var(--text-base)] tracking-tight mb-1">Architecture & Settings</h2>
        <p className="text-[var(--text-muted)] text-sm">Fine-tune the central intelligence, model routing, and overwatch boundaries.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Routing Policy */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-6 space-y-5">
            <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              LLM Triage & Routing
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Determine the threshold at which tasks are handled by local, cheap models vs. full remote execution by advanced models.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider block mb-2">Primary Global Router Model</label>
                <select 
                  value={primaryModel}
                  onChange={(e) => {
                    setPrimaryModel(e.target.value);
                    updateSetting('primaryModel', e.target.value);
                  }}
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                >
                  <option>Gemini 1.5 Pro</option>
                  <option>Gemini 1.5 Flash</option>
                  <option>Local Network LLM</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider block mb-2">Cost Optimization Preference</label>
                <div className="bg-[var(--bg-base)] border border-[var(--border-base)] rounded-lg p-1 flex gap-1">
                  {['Aggressive (Local First)', 'Balanced', 'Quality First (Remote)'].map(pref => (
                    <button 
                      key={pref}
                      onClick={() => {
                        setCostPreference(pref);
                        updateSetting('costPreference', pref);
                      }}
                      className={`flex-1 py-1.5 rounded px-3 text-xs font-medium border ${costPreference === pref ? 'bg-[#27272a] text-[var(--text-primary)] border-transparent' : 'text-[var(--text-tertiary)] hover:bg-[#27272a]/50 border-transparent'}`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Theme Configuration */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-6 space-y-5">
            <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Palette className="w-5 h-5 text-blue-400" />
              Theme Configuration
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Customize the visual interface appearance, mapping across global variables for all modules.
            </p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider block mb-2">Base Theme</label>
                {themeOptions.map((opt) => (
                  <label key={opt.id} className={`flex items-center gap-3 w-full border px-4 py-3 rounded-lg cursor-pointer transition-colors
                    ${localTheme === opt.id ? 'bg-blue-500/10 border-blue-500/30' : 'bg-[var(--bg-base)] border-[var(--border-base)] hover:border-[var(--text-tertiary)]'}`}>
                    <input 
                      type="radio" 
                      name="theme" 
                      value={opt.id} 
                      checked={localTheme === opt.id}
                      onChange={() => setLocalTheme(opt.id)}
                      className="w-4 h-4 text-blue-500 focus:ring-blue-500 border-[var(--border-base)] bg-[var(--bg-base)]"
                    />
                    <span className={`text-sm font-medium ${localTheme === opt.id ? 'text-blue-400' : 'text-[var(--text-secondary)]'}`}>
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider block mb-2">Accent Color</label>
                <div className="flex flex-wrap gap-3">
                  {accentOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setLocalAccentColor(opt.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                        localAccentColor === opt.id 
                          ? 'bg-[var(--bg-base)] border-blue-500/50 ring-1 ring-blue-500/50' 
                          : 'bg-[var(--bg-base)] border-[var(--border-base)] hover:border-[var(--text-tertiary)]'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${opt.colorClass}`}></span>
                      <span className={`text-xs font-medium ${localAccentColor === opt.id ? 'text-blue-400' : 'text-[var(--text-secondary)]'}`}>
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-time Preview */}
              <div className="pt-6 mt-6 border-t border-[var(--border-base)]">
                <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider block mb-3">Live Preview</label>
                {/* The Preview container applies the selected theme and accent classes locally */}
                <div className={`${localTheme} ${localAccentColor} p-5 rounded-xl border border-[var(--border-base)] bg-[var(--bg-base)] space-y-4 shadow-sm`}>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">Agent Dashboard</h4>
                      <p className="text-xs text-[var(--text-muted)]">System operations are nominal.</p>
                    </div>
                    <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ACTIVE
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[var(--bg-surface)] p-3 rounded-lg border border-[var(--border-base)] space-y-2">
                      <div className="w-6 h-6 rounded-md bg-blue-500/20 flex items-center justify-center">
                        <Activity className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] font-medium">System Health</div>
                      <div className="text-lg font-bold text-[var(--text-primary)]">98.9%</div>
                    </div>
                    <div className="bg-[var(--bg-surface)] p-3 rounded-lg border border-[var(--border-base)] space-y-2">
                      <div className="w-6 h-6 rounded-md bg-[var(--bg-base)] border border-[var(--border-base)] flex items-center justify-center">
                        <Server className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] font-medium">Active Nodes</div>
                      <div className="text-lg font-bold text-[var(--text-primary)]">12</div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1.5 rounded-lg text-xs font-bold transition-colors">
                      Deploy
                    </button>
                    <button className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-base)] text-[var(--text-primary)] py-1.5 rounded-lg text-xs font-medium hover:border-[var(--text-muted)] transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {(localTheme !== theme || localAccentColor !== accentColor) && (
                <div className="flex items-center gap-3 pt-4 mt-2 border-t border-[var(--border-base)] animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <button
                    onClick={applyThemeChanges}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-colors shadow-md shadow-blue-500/10"
                  >
                    Apply Theme Changes
                  </button>
                  <button
                    onClick={() => {
                      setLocalTheme(theme || 'theme-default');
                      setLocalAccentColor(accentColor || 'accent-blue');
                    }}
                    className="flex-1 bg-[var(--bg-base)] border border-[var(--border-base)] hover:border-[var(--text-muted)] text-[var(--text-secondary)] font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
                  >
                    Discard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Overwatch Settings */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-6 space-y-5">
            <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-400" />
              Overwatch Safeguards
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Adjust the sensitivity of the Overwatch monitoring system. Lower thresholds create more human approval bottlenecks.
            </p>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                   <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Halt Risk Threshold</label>
                   <span className="text-rose-400 font-mono text-sm font-bold">{riskThreshold}/100</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={riskThreshold}
                  onChange={(e) => {
                    setRiskThreshold(Number(e.target.value));
                    updateSetting('riskThreshold', Number(e.target.value));
                  }}
                  className="w-full accent-rose-500 bg-[#27272a] h-2 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-1 text-[10px] text-[var(--text-tertiary)]">
                  <span>Strict Analysis</span>
                  <span>Permissive</span>
                </div>
              </div>

              <div className="space-y-3">
                 <button 
                   onClick={() => {
                     setDualApproval(!dualApproval);
                     updateSetting('dualApproval', !dualApproval);
                   }}
                   className="flex items-center gap-3 w-full bg-[var(--bg-base)] border border-[var(--border-base)] px-4 py-3 rounded-lg justify-between"
                 >
                   <span className="text-sm text-[var(--text-secondary)]">Enforce Dual-Approval on Financials</span>
                   <div className={`w-8 h-4 rounded-full relative transition-colors ${dualApproval ? 'bg-blue-500' : 'bg-[var(--border-base)]'}`}>
                     <div className={`absolute top-0.5 w-3 h-3 bg-[#fafafa] rounded-full transition-all ${dualApproval ? 'right-0.5' : 'left-0.5'}`}></div>
                   </div>
                 </button>
                 <button 
                   onClick={() => {
                     setAutoRemediate(!autoRemediate);
                     updateSetting('autoRemediate', !autoRemediate);
                   }}
                   className="flex items-center gap-3 w-full bg-[var(--bg-base)] border border-[var(--border-base)] px-4 py-3 rounded-lg justify-between"
                 >
                   <span className="text-sm text-[var(--text-secondary)]">Auto-Remediate Low Risk Anomalies</span>
                   <div className={`w-8 h-4 rounded-full relative transition-colors ${autoRemediate ? 'bg-blue-500' : 'bg-[var(--border-base)]'}`}>
                     <div className={`absolute top-0.5 w-3 h-3 bg-[#fafafa] rounded-full transition-all ${autoRemediate ? 'right-0.5' : 'left-0.5'}`}></div>
                   </div>
                 </button>
                 <button 
                   onClick={() => {
                     setInactivityLockEnabled(!inactivityLockEnabled);
                     updateSetting('inactivityLockEnabled', !inactivityLockEnabled);
                   }}
                   className="flex items-center gap-3 w-full bg-[var(--bg-base)] border border-[var(--border-base)] px-4 py-3 rounded-lg justify-between"
                 >
                   <span className="text-sm text-[var(--text-secondary)]">Enable Inactivity Lockscreen</span>
                   <div className={`w-8 h-4 rounded-full relative transition-colors ${inactivityLockEnabled ? 'bg-blue-500' : 'bg-[var(--border-base)]'}`}>
                     <div className={`absolute top-0.5 w-3 h-3 bg-[#fafafa] rounded-full transition-all ${inactivityLockEnabled ? 'right-0.5' : 'left-0.5'}`}></div>
                   </div>
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
