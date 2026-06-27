import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchApi } from '../lib/api';
import { Building2, Users, Network, Plus, ShieldCheck, ChevronRight, Settings, PlusCircle, Trash2, X } from 'lucide-react';
import { auditService } from '../services/auditService';
import { useToast } from '../contexts/ToastContext';
import { ConfirmationModal } from '../components/ConfirmationModal';

export function OrganizationBuilderView() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [newDeptName, setNewDeptName] = useState('');
  const [isCreatingDept, setIsCreatingDept] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [settingsTarget, setSettingsTarget] = useState<any | null>(null);
  const [isConfirmingUpdate, setIsConfirmingUpdate] = useState(false);
  const [editDeptName, setEditDeptName] = useState('');
  const [editDeptDescription, setEditDeptDescription] = useState('');
  const [editDeptRegion, setEditDeptRegion] = useState('');
  const [assignAgentId, setAssignAgentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const deptsRes = await fetchApi('/departments');
      const agentsRes = await fetchApi('/agents');
      setDepartments(deptsRes);
      setAgents(agentsRes);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveAgent = async (agentId: number) => {
    try {
      await fetchApi(`/agents/${agentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departmentId: null })
      });
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, departmentId: null } : a));
      showToast('Agent removed from department', 'success');
    } catch(err) {
      showToast('Failed to remove agent', 'error');
    }
  };

  const handleCreateDepartment = async () => {
    if (isSubmitting || !newDeptName.trim()) return;

    // Client-side validation: check for duplicates
    const isDuplicate = departments.some(
      (dept) => dept.name.trim().toLowerCase() === newDeptName.trim().toLowerCase()
    );
    if (isDuplicate) {
      showToast(`A department named "${newDeptName.trim()}" already exists.`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const newDept = await fetchApi('/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDeptName.trim() })
      });
      
      await auditService.logEvent({
        action: 'Department Created',
        metadata: { departmentName: newDeptName.trim() },
        outcome: 'success'
      });

      setDepartments(prev => {
        if (prev.some(d => d.id === newDept.id)) return prev;
        return [...prev, newDept];
      });
      setNewDeptName('');
      setIsCreatingDept(false);
      showToast(`Department "${newDeptName.trim()}" created successfully`, 'success');
    } catch (err) {
      console.error('Failed to create department', err);
      showToast('Failed to create department', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenSettings = (dept: any) => {
    setSettingsTarget(dept);
    setEditDeptName(dept.name);
    setEditDeptDescription(dept.description || '');
    setEditDeptRegion(dept.region || '');
    setAssignAgentId('');
  };

  const handleUpdateDepartmentClick = () => {
    if (!settingsTarget || !editDeptName.trim()) return;

    // Client-side validation: check for duplicates excluding itself
    const isDuplicate = departments.some(
      (dept) => dept.id !== settingsTarget.id && dept.name.trim().toLowerCase() === editDeptName.trim().toLowerCase()
    );
    if (isDuplicate) {
      showToast(`A department named "${editDeptName.trim()}" already exists.`, 'error');
      return;
    }

    setIsConfirmingUpdate(true);
  };

  const confirmUpdateDepartment = async () => {
    if (!settingsTarget || !editDeptName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const updated = await fetchApi(`/departments/${settingsTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: editDeptName.trim(),
          description: editDeptDescription.trim(),
          region: editDeptRegion.trim(),
        })
      });

      await auditService.logEvent({
        action: 'Department Updated',
        metadata: { 
          departmentId: settingsTarget.id, 
          oldName: settingsTarget.name, 
          newName: editDeptName.trim(),
          description: editDeptDescription.trim(),
          region: editDeptRegion.trim()
        },
        outcome: 'success'
      });

      if (assignAgentId) {
        await fetchApi(`/agents/${assignAgentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ departmentId: settingsTarget.id })
        });
        await auditService.logEvent({
          action: 'Agent Assigned to Department',
          metadata: { departmentId: settingsTarget.id, agentId: assignAgentId },
          outcome: 'success'
        });
        setAgents(prev => prev.map(a => a.id === parseInt(assignAgentId) ? { ...a, departmentId: settingsTarget.id } : a));
      }

      setDepartments(prev => prev.map(d => d.id === settingsTarget.id ? { 
        ...d, 
        name: editDeptName.trim(),
        description: editDeptDescription.trim(),
        region: editDeptRegion.trim(),
      } : d));
      showToast(`Department settings updated successfully`, 'success');
      setSettingsTarget(null);
      setIsConfirmingUpdate(false);
    } catch (err) {
      console.error('Failed to update department', err);
      showToast('Failed to update department', 'error');
      setSettingsTarget(null);
      setIsConfirmingUpdate(false);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteDepartment = async () => {
    if (!deleteTarget || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await fetchApi(`/departments/${deleteTarget.id}`, { method: 'DELETE' });
      await auditService.logEvent({
        action: 'Department Deleted',
        metadata: { departmentName: deleteTarget.name },
        outcome: 'success'
      });
      setDepartments(prev => prev.filter(d => d.id !== deleteTarget.id));
      showToast(`Department "${deleteTarget.name}" deleted successfully`, 'success');
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete department', err);
      showToast('Failed to delete department. Make sure no agents are assigned.', 'error');
      setDeleteTarget(null);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 font-sans pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[var(--border-base)] pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-[var(--text-primary)]">Organization Builder</h1>
          <p className="text-[var(--text-tertiary)] mt-2">Design and manage your autonomous organizational structure.</p>
        </div>
        <button 
          id="btn-add-department"
          onClick={() => setIsCreatingDept(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {isCreatingDept && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-surface)] border border-[var(--border-base)] p-6 rounded-xl flex items-end gap-4 shadow-md"
        >
          <div className="flex-1 space-y-2">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Department Name</label>
            <input 
              type="text" 
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              placeholder="e.g. Compliance & Risk Management" 
              className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50" 
            />
          </div>
          <div className="flex gap-3">
            <button 
              id="btn-cancel-create"
              onClick={() => setIsCreatingDept(false)}
              className="px-4 py-2 border border-[var(--border-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg text-sm font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              id="btn-save-create"
              onClick={handleCreateDepartment}
              disabled={!newDeptName.trim() || isSubmitting}
              className="px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/20 disabled:opacity-50 rounded-lg text-sm font-bold transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Save Department'}
            </button>
          </div>
        </motion.div>
      )}

      {departments.length === 0 && !isCreatingDept ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 bg-[var(--bg-surface)] border border-dashed border-[var(--border-muted)] rounded-2xl">
          <svg className="w-48 h-48 text-[var(--border-muted)] mb-6 opacity-50" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="80" width="160" height="100" rx="12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8 8" />
            <path d="M70 80V50C70 44.4772 74.4772 40 80 40H120C125.523 40 130 44.4772 130 50V80" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8 8" />
            <rect x="50" y="120" width="100" height="40" rx="8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8 8" />
            <path d="M100 120V80" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8 8" />
            <circle cx="100" cy="140" r="8" fill="currentColor" />
          </svg>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Departments Yet</h3>
          <p className="text-[var(--text-tertiary)] text-center max-w-sm mb-6">
            Get started by creating your first department to organize your agents and streamline workflows.
          </p>
          <button 
            onClick={() => setIsCreatingDept(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/10"
          >
            <Plus className="w-4 h-4" />
            Create First Department
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept, idx) => {
            const deptAgents = agents.filter(a => a.departmentId === dept.id);
            return (
              <motion.div 
                key={dept.id || `dept-${idx}`}
                className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl overflow-hidden hover:border-[var(--border-muted)] transition-colors flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="p-5 border-b border-[var(--border-base)] flex items-start justify-between">
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-[var(--text-primary)] truncate" title={dept.name}>{dept.name}</h3>
                        {dept.region && (
                          <span className="text-[9px] font-mono font-bold bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-700">
                            {dept.region}
                          </span>
                        )}
                      </div>
                      {dept.description && (
                        <p className="text-xs text-[var(--text-tertiary)] line-clamp-2 mb-2 leading-relaxed" title={dept.description}>
                          {dept.description}
                        </p>
                      )}
                      <p className="text-sm text-[var(--text-tertiary)] mt-1 flex items-center gap-1">
                        <Users className="w-3 h-3 text-blue-400/80" />
                        {deptAgents.length} Agents Assigned
                      </p>
                    </div>
                    <button 
                      onClick={() => setDeleteTarget(dept)}
                      className="text-[var(--text-tertiary)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors p-1.5 rounded-lg cursor-pointer"
                      title={`Delete ${dept.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-5 bg-[var(--bg-base)]/50 space-y-3 min-h-[120px]">
                    {deptAgents.length === 0 ? (
                      <p className="text-xs text-[var(--text-tertiary)] italic text-center py-6">No agents assigned to this department yet.</p>
                    ) : (
                      deptAgents.slice(0, 3).map((agent, agentIdx) => (
                        <div key={`${agent.id || 'agent'}-${agentIdx}`} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                            <span className="text-[var(--text-secondary)] truncate max-w-[140px]" title={agent.name}>{agent.name}</span>
                          </div>
                          <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] bg-[var(--bg-surface)] px-2 py-0.5 rounded border border-[var(--border-base)] shrink-0 font-mono">
                            {agent.role}
                          </span>
                        </div>
                      ))
                    )}
                    {deptAgents.length > 3 && (
                      <div className="text-xs text-[var(--text-tertiary)] text-center pt-2">
                        + {deptAgents.length - 3} more agents
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-3 border-t border-[var(--border-base)] bg-[var(--bg-surface)] flex justify-between">
                   <button 
                     onClick={() => handleOpenSettings(dept)}
                     className="text-xs font-bold text-[var(--text-tertiary)] hover:text-blue-400 transition-colors flex items-center gap-1.5 cursor-pointer hover:bg-blue-500/5 px-2.5 py-1.5 rounded-lg"
                   >
                      <Settings className="w-3.5 h-3.5" /> Settings
                   </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* CUSTOM MODALS & ANIMATED OVERLAYS */}
      <AnimatePresence>
        {/* Settings Modal */}
        {settingsTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSettingsTarget(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[var(--bg-surface)] border border-[var(--border-base)] w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden z-10"
            >
              {/* Header */}
              <div className="p-5 border-b border-[var(--border-base)] flex justify-between items-center bg-[var(--bg-base)]/40">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-[var(--text-primary)] text-lg">Department Settings</h3>
                </div>
                <button
                  onClick={() => setSettingsTarget(null)}
                  className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-base)] p-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Department Name</label>
                  <input
                    type="text"
                    value={editDeptName}
                    onChange={(e) => setEditDeptName(e.target.value)}
                    className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                    placeholder="Enter department name..."
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Description</label>
                  <textarea
                    value={editDeptDescription}
                    onChange={(e) => setEditDeptDescription(e.target.value)}
                    className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 resize-none h-20"
                    placeholder="Enter department description..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Region</label>
                  <select
                    value={editDeptRegion}
                    onChange={(e) => setEditDeptRegion(e.target.value)}
                    className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                  >
                    <option value="">-- Select Region --</option>
                    <option value="Global">Global</option>
                    <option value="NA">North America (NA)</option>
                    <option value="EMEA">Europe, Middle East, Africa (EMEA)</option>
                    <option value="APAC">Asia-Pacific (APAC)</option>
                    <option value="LATAM">Latin America (LATAM)</option>
                  </select>
                </div>

                <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 flex gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  <div className="text-[11px] text-zinc-400 leading-relaxed">
                    Renaming the department updates the structure in real-time. All currently assigned agents will automatically adapt to the renamed container.
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border-base)] space-y-3">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Agents in Department</label>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                    {agents.filter(a => a.departmentId === settingsTarget?.id).map((a, i) => (
                      <div key={a.id || `ma-${i}`} className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-base)]">
                        <span className="text-sm text-[var(--text-secondary)]">{a.name}</span>
                        <button onClick={() => handleRemoveAgent(a.id)} className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 bg-rose-500/10 rounded">Remove</button>
                      </div>
                    ))}
                    {agents.filter(a => a.departmentId === settingsTarget?.id).length === 0 && (
                      <div className="text-xs text-[var(--text-tertiary)] italic p-2 text-center">No agents assigned.</div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <select value={assignAgentId} onChange={(e) => setAssignAgentId(e.target.value)} className="flex-1 bg-[var(--bg-base)] border border-[var(--border-base)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none">
                      <option value="">-- Assign New Agent --</option>
                      {agents.filter(a => a.departmentId !== settingsTarget?.id).map((a, i) => (
                        <option key={a.id || `ua-${i}`} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-[var(--bg-base)]/40 border-t border-[var(--border-base)] flex justify-end gap-3">
                <button
                  onClick={() => setSettingsTarget(null)}
                  className="px-4 py-2 border border-[var(--border-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateDepartmentClick}
                  disabled={!editDeptName.trim() || isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-500/10"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal using Reusable Component */}
        <ConfirmationModal
          isOpen={deleteTarget !== null}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDeleteDepartment}
          title="Delete Department"
          message={`Are you sure you want to delete the "${deleteTarget?.name}" department?`}
          description="Warning: This action is permanent. Deleting the department is only allowed if no active agents are currently assigned to it."
          confirmText="Delete Department"
          cancelText="Cancel"
          variant="danger"
          showProgressBar={true}
        />

        {/* Settings Update Confirmation Modal using Reusable Component */}
        <ConfirmationModal
          isOpen={isConfirmingUpdate}
          onClose={() => setIsConfirmingUpdate(false)}
          onConfirm={confirmUpdateDepartment}
          title="Confirm Rename"
          message={`Are you sure you want to rename "${settingsTarget?.name}" to "${editDeptName.trim()}"?`}
          description="Renaming the department updates the structure in real-time. All currently assigned agents will automatically adapt to the renamed container."
          confirmText="Confirm Rename"
          cancelText="Cancel"
          variant="info"
          showProgressBar={true}
        />
      </AnimatePresence>
    </div>
  );
}
