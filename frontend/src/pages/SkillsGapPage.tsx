import React, { useEffect, useState } from 'react';
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Trash2,
  ArrowRight,
  TrendingUp,
  Info
} from 'lucide-react';
import { careerService } from '../services/careerService';
import {
  TargetRole,
  SkillGapAnalysisResponse,
  StudentSkill,
  Skill,
  SkillProficiency
} from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { ProgressBar } from '../components/ProgressBar';
import { Modal } from '../components/Modal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const SkillsGapPage: React.FC = () => {
  const [targetRoles, setTargetRoles] = useState<TargetRole[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<SkillGapAnalysisResponse | null>(null);
  const [mySkills, setMySkills] = useState<StudentSkill[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State for adding/updating skill
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<number>(0);
  const [proficiency, setProficiency] = useState<SkillProficiency>('INTERMEDIATE');
  const [years, setYears] = useState<number>(1.0);
  const [isSavingSkill, setIsSavingSkill] = useState(false);

  const loadData = async (roleId?: number) => {
    setIsLoading(true);
    try {
      const [rolesData, skillsList, mySkillsList] = await Promise.all([
        careerService.getTargetRoles(),
        careerService.getSkills(),
        careerService.getMySkills(),
      ]);
      setTargetRoles(rolesData);
      setAllSkills(skillsList);
      setMySkills(mySkillsList);

      const activeRoleId = roleId || (rolesData.length > 0 ? rolesData[0].id : undefined);
      if (activeRoleId) {
        setSelectedRoleId(activeRoleId);
        const analysisData = await careerService.getSkillGapAnalysis(activeRoleId);
        setAnalysis(analysisData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = async (roleId: number) => {
    setSelectedRoleId(roleId);
    try {
      const data = await careerService.getSkillGapAnalysis(roleId);
      setAnalysis(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkillId) return;

    setIsSavingSkill(true);
    try {
      await careerService.addOrUpdateSkill({
        skill: selectedSkillId,
        proficiency_level: proficiency,
        years_of_experience: years,
      });
      setIsSkillModalOpen(false);
      // Reload gap analysis and my skills
      await loadData(selectedRoleId || undefined);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingSkill(false);
    }
  };

  const handleDeleteSkill = async (id: number) => {
    try {
      await careerService.deleteStudentSkill(id);
      await loadData(selectedRoleId || undefined);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton rows={5} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#29252B] tracking-tight">Skill Gap Analyzer</h1>
          <p className="text-sm text-[#77717A]">
            Compare your current technical competencies directly against target industry roles
          </p>
        </div>

        {/* Target Role Selector Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-[#77717A] shrink-0">Target Career Role:</label>
          <select
            value={selectedRoleId || ''}
            onChange={(e) => handleRoleChange(parseInt(e.target.value))}
            className="px-3.5 py-2 text-xs font-semibold bg-white border border-[#F0DFE5] rounded-xl text-[#29252B] focus:outline-none focus:ring-2 focus:ring-[#E98EAD] card-shadow"
          >
            {targetRoles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {analysis && (
        <div className="space-y-6">
          {/* Target Role Overview & Coverage Gauge */}
          <Card className="p-6 lg:p-8 space-y-6 bg-gradient-to-r from-white via-white to-[#FCE7EF]/60">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="rose">Target Role</Badge>
                  {analysis.target_role.average_salary && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Avg Salary: {analysis.target_role.average_salary}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-extrabold text-[#29252B]">
                  {analysis.target_role.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#77717A] max-w-2xl leading-relaxed">
                  {analysis.target_role.description}
                </p>
              </div>

              {/* Coverage Gauge */}
              <div className="w-full md:w-64 bg-white p-5 rounded-2xl border border-[#F0DFE5] card-shadow text-center space-y-2 shrink-0">
                <div className="text-3xl font-extrabold text-[#D96C94]">
                  {analysis.summary.coverage_percentage}%
                </div>
                <div className="text-xs font-semibold text-[#29252B]">Role Skill Coverage</div>
                <ProgressBar progress={analysis.summary.coverage_percentage} size="sm" />
                <div className="text-[11px] text-[#77717A] pt-1">
                  {analysis.summary.matched_count} of {analysis.summary.total_required_skills} skills verified
                </div>
              </div>
            </div>

            {/* Disclaimer Alert */}
            <div className="p-3 bg-white/80 border border-[#F0DFE5] rounded-xl flex items-start gap-2.5 text-xs text-[#77717A]">
              <Info className="w-4 h-4 text-[#D96C94] shrink-0 mt-0.5" />
              <span>{analysis.disclaimer}</span>
            </div>
          </Card>

          {/* Breakdown Grid: Matched vs Partial vs Missing */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Matched Skills */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#F0DFE5] pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <h3 className="font-bold text-sm text-[#29252B]">Fully Matched</h3>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {analysis.matched_skills.length}
                </span>
              </div>

              {analysis.matched_skills.length === 0 ? (
                <p className="text-xs text-[#77717A] py-4 text-center">No skills fully matched yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {analysis.matched_skills.map((item) => (
                    <div key={item.skill_id} className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-emerald-900">{item.skill_name}</span>
                        <span className="text-[10px] text-emerald-700 uppercase font-semibold">
                          {item.student_level}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#77717A]">
                        Required: {item.required_level} ({item.importance.replace('_', ' ')})
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Partial Gap */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#F0DFE5] pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-sm text-[#29252B]">Partial Gaps</h3>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  {analysis.partially_matched_skills.length}
                </span>
              </div>

              {analysis.partially_matched_skills.length === 0 ? (
                <p className="text-xs text-[#77717A] py-4 text-center">No partial skill gaps.</p>
              ) : (
                <div className="space-y-2.5">
                  {analysis.partially_matched_skills.map((item) => (
                    <div key={item.skill_id} className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-amber-900">{item.skill_name}</span>
                        <span className="text-[10px] text-amber-700 uppercase font-semibold">
                          Current: {item.student_level}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#77717A]">
                        Target: <strong>{item.required_level}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Missing Skills */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#F0DFE5] pb-3">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-500" />
                  <h3 className="font-bold text-sm text-[#29252B]">Missing Skills</h3>
                </div>
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                  {analysis.missing_skills.length}
                </span>
              </div>

              {analysis.missing_skills.length === 0 ? (
                <p className="text-xs text-[#77717A] py-4 text-center">No missing required skills!</p>
              ) : (
                <div className="space-y-2.5">
                  {analysis.missing_skills.map((item) => (
                    <div key={item.skill_id} className="p-3 rounded-xl bg-rose-50/40 border border-rose-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-rose-900">{item.skill_name}</span>
                        <Badge variant={item.importance === 'MUST_HAVE' ? 'rose' : 'gray'} size="sm">
                          {item.importance.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-[#77717A]">
                        Required Level: {item.required_level}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Recommended Learning Priorities */}
          {analysis.recommended_priorities.length > 0 && (
            <Card className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[#F0DFE5] pb-3">
                <TrendingUp className="w-5 h-5 text-[#D96C94]" />
                <div>
                  <h3 className="font-bold text-base text-[#29252B]">Recommended Learning Focus</h3>
                  <p className="text-xs text-[#77717A]">Priority curriculum milestones to bridge your competency gap</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {analysis.recommended_priorities.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-[#F0DFE5] bg-[#FFF5F7] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#29252B]">{p.skill_name}</span>
                      <Badge variant={p.urgency === 'HIGH' ? 'rose' : 'amber'} size="sm">
                        {p.urgency} Priority
                      </Badge>
                    </div>
                    <p className="text-xs text-[#77717A]">{p.action}</p>
                    <div className="text-[11px] font-semibold text-[#D96C94]">
                      Target Level: {p.target_level}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Student Skill Profile Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#29252B]">My Skills Inventory</h2>
            <p className="text-xs text-[#77717A]">Keep your verified and self-assessed tech stack updated</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (allSkills.length > 0) setSelectedSkillId(allSkills[0].id);
              setIsSkillModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Skill
          </Button>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF5F7] border-b border-[#F0DFE5] text-[#77717A] uppercase font-semibold text-[11px]">
                <tr>
                  <th className="p-4">Skill Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Proficiency Level</th>
                  <th className="p-4">Experience</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0DFE5]">
                {mySkills.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#77717A]">
                      No skills added yet. Click 'Add Skill' to populate your tech stack.
                    </td>
                  </tr>
                ) : (
                  mySkills.map((ss) => (
                    <tr key={ss.id} className="hover:bg-[#FFF5F7]/40 transition-colors">
                      <td className="p-4 font-bold text-[#29252B]">{ss.skill_name}</td>
                      <td className="p-4 text-[#77717A]">{ss.skill_category}</td>
                      <td className="p-4">
                        <Badge variant="rose" size="sm">{ss.proficiency_level}</Badge>
                      </td>
                      <td className="p-4 text-[#77717A]">{ss.years_of_experience} yrs</td>
                      <td className="p-4">
                        <Badge variant={ss.verified ? 'green' : 'gray'} size="sm">
                          {ss.verified ? 'Faculty Verified' : 'Self-Assessed'}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteSkill(ss.id)}
                          className="p-1 rounded text-[#77717A] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove Skill"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Add Skill Modal */}
      <Modal
        isOpen={isSkillModalOpen}
        onClose={() => setIsSkillModalOpen(false)}
        title="Add or Update Skill"
      >
        <form onSubmit={handleSaveSkill} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#29252B] mb-1">Select Skill</label>
            <select
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(parseInt(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
            >
              {allSkills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#29252B] mb-1">Proficiency Level</label>
            <select
              value={proficiency}
              onChange={(e) => setProficiency(e.target.value as SkillProficiency)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
            >
              <option value="BEGINNER">Beginner (Foundations & Syntax)</option>
              <option value="INTERMEDIATE">Intermediate (Production features & APIs)</option>
              <option value="ADVANCED">Advanced (Architecture & Optimization)</option>
              <option value="EXPERT">Expert (System Lead & Best Practices)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#29252B] mb-1">Years of Practical Experience</label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={years}
              onChange={(e) => setYears(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#F0DFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E98EAD]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#F0DFE5]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsSkillModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSavingSkill}
            >
              Save to My Skills
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
