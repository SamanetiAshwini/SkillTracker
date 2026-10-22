export type UserRole = 'STUDENT' | 'MENTOR' | 'ADMIN';

export interface UserProfile {
  avatar?: string;
  avatar_url?: string;
  headline?: string;
  bio?: string;
  phone?: string;
  location?: string;
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  date_joined: string;
  profile?: UserProfile;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  message?: string;
}

export interface TopicProgress {
  id?: number;
  topic?: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  start_date?: string | null;
  completion_date?: string | null;
  updated_at?: string;
}

export interface Topic {
  id: number;
  module: number;
  title: string;
  content_type: 'ARTICLE' | 'VIDEO' | 'EXERCISE' | 'RESOURCE';
  content: string;
  resource_url?: string;
  duration_minutes: number;
  order: number;
  created_at: string;
  student_progress?: TopicProgress;
}

export interface Module {
  id: number;
  course: number;
  title: string;
  description: string;
  order: number;
  topics: Topic[];
  created_at: string;
}

export interface Batch {
  id: number;
  name: string;
  course: number;
  start_date: string;
  end_date?: string | null;
  is_active: boolean;
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  thumbnail_url?: string;
  mentor?: User | null;
  is_published: boolean;
  estimated_hours: number;
  total_topics: number;
  is_enrolled?: boolean;
  progress_percentage?: number;
  modules?: Module[];
  batches?: Batch[];
  created_at: string;
  updated_at?: string;
}

export interface Enrollment {
  id: number;
  student: number;
  student_details?: User;
  course: Course;
  batch?: Batch | null;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
  enrolled_at: string;
  completed_at?: string | null;
  progress_percentage: number;
}

export interface Assignment {
  id: number;
  course: number;
  course_title?: string;
  module?: number | null;
  title: string;
  description: string;
  due_date: string;
  max_points: number;
  passing_points: number;
  attachment_url?: string;
  is_active: boolean;
  my_submission?: Submission | null;
  created_at: string;
}

export interface Submission {
  id: number;
  assignment: number;
  assignment_title?: string;
  max_points?: number;
  student: User;
  submission_text?: string;
  submission_url?: string;
  attachment_file?: string | null;
  submitted_at: string;
  status: 'PENDING' | 'GRADED' | 'RESUBMISSION_REQUESTED';
  score?: number | null;
  feedback?: string;
  graded_by?: User | null;
  graded_at?: string | null;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: number;
  question_text: string;
  question_type: 'MCQ' | 'TRUE_FALSE';
  points: number;
  options: QuestionOption[];
  order: number;
  correct_answer?: string;
  explanation?: string;
}

export interface Assessment {
  id: number;
  course: number;
  course_title?: string;
  title: string;
  description: string;
  time_limit_minutes: number;
  passing_score: number;
  is_active: boolean;
  questions_count?: number;
  questions?: Question[];
  my_latest_attempt?: {
    id: number;
    score: number;
    total_points: number;
    percentage: number;
    passed: boolean;
    start_time: string;
  } | null;
  created_at: string;
}

export interface AnswerResult {
  id: number;
  question: number;
  question_text: string;
  options: QuestionOption[];
  selected_option: string;
  correct_answer: string;
  is_correct: boolean;
  points_awarded: number;
  explanation?: string;
}

export interface AssessmentAttemptResult {
  id: number;
  assessment: number;
  assessment_title: string;
  course_title: string;
  passing_score: number;
  student: User;
  start_time: string;
  end_time?: string;
  score: number;
  total_points: number;
  percentage: number;
  passed: boolean;
  status: string;
  answers: AnswerResult[];
}

export type SkillProficiency = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export interface Skill {
  id: number;
  name: string;
  category: string;
  description?: string;
}

export interface StudentSkill {
  id: number;
  skill: number;
  skill_name: string;
  skill_category: string;
  proficiency_level: SkillProficiency;
  years_of_experience: number;
  verified: boolean;
  created_at: string;
}

export interface TargetRoleSkill {
  id: number;
  skill: number;
  skill_name: string;
  skill_category: string;
  required_level: SkillProficiency;
  importance: 'MUST_HAVE' | 'NICE_TO_HAVE';
}

export interface TargetRole {
  id: number;
  title: string;
  description: string;
  average_salary?: string;
  role_skills: TargetRoleSkill[];
}

export interface GapSkillItem {
  skill_id: number;
  skill_name: string;
  category: string;
  student_level: string;
  required_level: string;
  importance: string;
  status: 'MATCHED' | 'PARTIAL_GAP' | 'MISSING';
}

export interface LearningPriority {
  skill_name: string;
  category: string;
  target_level: string;
  urgency: 'HIGH' | 'MEDIUM';
  action: string;
}

export interface SkillGapAnalysisResponse {
  target_role: {
    id: number;
    title: string;
    description: string;
    average_salary?: string;
  };
  summary: {
    total_required_skills: number;
    matched_count: number;
    partial_count: number;
    missing_count: number;
    coverage_percentage: number;
  };
  matched_skills: GapSkillItem[];
  partially_matched_skills: GapSkillItem[];
  missing_skills: GapSkillItem[];
  recommended_priorities: LearningPriority[];
  disclaimer: string;
}

export interface JobApplication {
  id: number;
  student: number;
  company: string;
  job_title: string;
  application_date: string;
  status: 'APPLIED' | 'SCREENING' | 'INTERVIEWING' | 'OFFER' | 'REJECTED';
  job_url?: string;
  salary_range?: string;
  notes?: string;
  created_at: string;
}

export interface Project {
  id: number;
  student: User;
  title: string;
  description: string;
  tags?: string;
  github_url?: string;
  live_demo_url?: string;
  image_url?: string;
  is_featured: boolean;
  created_at: string;
}
