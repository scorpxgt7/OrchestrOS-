import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { fetchApi } from '../lib/api';
import { Building2, Users, Network, Plus, ShieldCheck, ChevronRight, Settings, PlusCircle, Trash2 } from 'lucide-react';
import { auditService } from '../services/auditService';

export function OrganizationBuilderView() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [newDeptName, setNewDeptName] = useState('');
  const [isCreatingDept, setIsCreatingDept] = useState(false);

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

  const handleCreateDepartment = async () => {
    if (!newDeptName.trim()) return;
    try {
      const newDept = await fetchApi('/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDeptName })
      });
      
      await auditService.logEvent({
        action: 'Department Created',
        metadata: { departmentName: newDeptName },
        outcome: 'success'
      });

      setDepartments([...departments, newDept]);
      setNewDeptName('');
      setIsCreatingDept(false);
    } catch (err) {
      console.error('Failed to create department', err);
    }
  };

  const handleDeleteDepartment = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete the ${name} department?`)) return;
    try {
      await fetchApi(`/departments/${id}`, { method: 'DELETE' });
      await auditService.logEvent({
        action: 'Department Deleted',
        metadata: { departmentName: name },
        outcome: 'success'
      });
      setDepartments(departments.filter(d => d.id !== id));
    } catch (err) {
      console.error('Failed to delete department', err);
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
          onClick={() => setIsCreatingDept(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {isCreatingDept && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-surface)] border border-[var(--border-base)] p-6 rounded-xl flex items-end gap-4"
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
              onClick={() => setIsCreatingDept(false)}
              className="px-4 py-2 border border-[var(--border-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg text-sm font-bold transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleCreateDepartment}
              disabled={!newDeptName.trim()}
              className="px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/20 disabled:opacity-50 rounded-lg text-sm font-bold transition-colors"
            >
              Save Department
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map(dept => {
          const deptAgents = agents.filter(a => a.departmentId === dept.id);
          return (
            <motion.div 
              key={dept.id}
              className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl overflow-hidden hover:border-[var(--border-muted)] transition-colors"
            >
              <div className="p-5 border-b border-[var(--border-base)] flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">{dept.name}</h3>
                  <p className="text-sm text-[var(--text-tertiary)] mt-1 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {deptAgents.length} Agents Assigned
                  </p>
                </div>
                <button 
                  onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                  className="text-[var(--text-tertiary)] hover:text-rose-400 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 bg-[var(--bg-base)]/50 space-y-3 min-h-[120px]">
                {deptAgents.length === 0 ? (
                  <p className="text-xs text-[var(--text-tertiary)] italic text-center py-4">No agents assigned to this department yet.</p>
                ) : (
                  deptAgents.slice(0, 3).map(agent => (
                    <div key={agent.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500/50"></div>
                        <span className="text-[var(--text-secondary)] truncate max-w-[150px]">{agent.name}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] bg-[var(--bg-surface)] px-2 py-0.5 rounded border border-[var(--border-base)]">
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
              <div className="p-3 border-t border-[var(--border-base)] bg-[var(--bg-surface)] flex justify-between">
                 <button className="text-xs font-bold text-[var(--text-tertiary)] hover:text-blue-400 transition-colors flex items-center gap-1">
                    <Settings className="w-3 h-3" /> Settings
                 </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
