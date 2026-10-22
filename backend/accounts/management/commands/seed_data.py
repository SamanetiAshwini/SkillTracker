from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from accounts.models import User, Profile
from courses.models import Course, Batch, Module, Topic, Enrollment, TopicProgress
from assignments.models import Assignment, Submission
from assessments.models import Assessment, Question, AssessmentAttempt, Answer
from careers.models import Skill, StudentSkill, TargetRole, TargetRoleSkill, JobApplication, ProficiencyLevel
from projects.models import Project

class Command(BaseCommand):
    help = 'Seeds database with realistic demo data for SkillTrack platform'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Starting SkillTrack seed process...'))

        # 1. Users
        admin_user, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@skilltrack.dev',
                'first_name': 'Eleanor',
                'last_name': 'Vance',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
            }
        )
        admin_user.set_password('AdminPass123!')
        admin_user.save()
        admin_profile = admin_user.profile
        admin_profile.headline = 'Head of Learning Operations & Admin'
        admin_profile.bio = 'Platform administrator managing learning cohorts, faculty assignments, and curriculum QA.'
        admin_profile.avatar_url = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
        admin_profile.save()

        mentor_user, _ = User.objects.get_or_create(
            username='sarah_mentor',
            defaults={
                'email': 'mentor@skilltrack.dev',
                'first_name': 'Sarah',
                'last_name': 'Jenkins',
                'role': User.Role.MENTOR,
            }
        )
        mentor_user.set_password('MentorPass123!')
        mentor_user.save()
        mentor_profile = mentor_user.profile
        mentor_profile.headline = 'Staff Backend Architect & Senior Faculty Mentor'
        mentor_profile.bio = '12+ years building distributed cloud systems and mentoring junior and mid-level software engineers.'
        mentor_profile.avatar_url = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
        mentor_profile.github_url = 'https://github.com/sarahjenkins-mentor'
        mentor_profile.linkedin_url = 'https://linkedin.com/in/sarahjenkins'
        mentor_profile.save()

        student_user, _ = User.objects.get_or_create(
            username='alex_student',
            defaults={
                'email': 'student@skilltrack.dev',
                'first_name': 'Alex',
                'last_name': 'Rivera',
                'role': User.Role.STUDENT,
            }
        )
        student_user.set_password('StudentPass123!')
        student_user.save()
        student_profile = student_user.profile
        student_profile.headline = 'Aspiring Python Full-Stack & Cloud Engineer'
        student_profile.bio = 'Passionate developer building high-impact full-stack web applications. Focusing on Django, React, and PostgreSQL architecture.'
        student_profile.avatar_url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        student_profile.github_url = 'https://github.com/alexrivera-dev'
        student_profile.linkedin_url = 'https://linkedin.com/in/alexrivera'
        student_profile.location = 'San Francisco, CA'
        student_profile.save()

        self.stdout.write(self.style.SUCCESS('Created users: admin, sarah_mentor, alex_student'))

        # 2. Skills
        skills_data = [
            ('Python', 'Languages', 'Modern Python programming, asynchronous syntax, and OOP.'),
            ('Django', 'Frameworks & Libraries', 'Django ORM, migrations, views, and DRF APIs.'),
            ('PostgreSQL', 'Databases & Storage', 'Relational database schema design, indexing, and SQL queries.'),
            ('Docker', 'DevOps & Cloud', 'Containerization, multi-stage builds, and docker-compose orchestration.'),
            ('React', 'Frameworks & Libraries', 'Component hierarchy, hooks, state management, and JSX architecture.'),
            ('TypeScript', 'Languages', 'Type annotations, generics, interfaces, and strict compiler modes.'),
            ('REST APIs', 'Architecture & Principles', 'HTTP verb semantics, pagination, status codes, and idempotency.'),
            ('Testing', 'Quality Assurance', 'Unit testing, pytest suites, integration testing, and mocks.'),
            ('Git', 'DevOps & Cloud', 'Branching workflows, rebase, cherry-pick, and pull request hygiene.'),
            ('Redis', 'Databases & Storage', 'In-memory caching, pub/sub messaging, and session persistence.')
        ]

        skills_dict = {}
        for name, category, desc in skills_data:
            skill, _ = Skill.objects.get_or_create(name=name, defaults={'category': category, 'description': desc})
            skills_dict[name] = skill

        # 3. Target Career Roles
        python_dev_role, _ = TargetRole.objects.get_or_create(
            title='Python Backend Developer',
            defaults={
                'description': 'Designs, implements, and maintains scalable backend services, RESTful APIs, and relational databases using Python and Django.',
                'average_salary': '$95,000 - $135,000 / year'
            }
        )
        role_requirements = [
            ('Python', ProficiencyLevel.ADVANCED, TargetRoleSkill.Importance.MUST_HAVE),
            ('Django', ProficiencyLevel.ADVANCED, TargetRoleSkill.Importance.MUST_HAVE),
            ('PostgreSQL', ProficiencyLevel.INTERMEDIATE, TargetRoleSkill.Importance.MUST_HAVE),
            ('REST APIs', ProficiencyLevel.ADVANCED, TargetRoleSkill.Importance.MUST_HAVE),
            ('Testing', ProficiencyLevel.INTERMEDIATE, TargetRoleSkill.Importance.MUST_HAVE),
            ('Docker', ProficiencyLevel.INTERMEDIATE, TargetRoleSkill.Importance.MUST_HAVE),
            ('Git', ProficiencyLevel.INTERMEDIATE, TargetRoleSkill.Importance.MUST_HAVE),
            ('Redis', ProficiencyLevel.INTERMEDIATE, TargetRoleSkill.Importance.NICE_TO_HAVE),
        ]
        for s_name, req_level, imp in role_requirements:
            TargetRoleSkill.objects.get_or_create(
                target_role=python_dev_role,
                skill=skills_dict[s_name],
                defaults={'required_level': req_level, 'importance': imp}
            )

        fullstack_role, _ = TargetRole.objects.get_or_create(
            title='Full-Stack Engineer (React + Python)',
            defaults={
                'description': 'End-to-end web engineer bridging modern React TypeScript frontends with Django REST backends.',
                'average_salary': '$105,000 - $145,000 / year'
            }
        )
        fs_requirements = [
            ('Python', ProficiencyLevel.ADVANCED, TargetRoleSkill.Importance.MUST_HAVE),
            ('Django', ProficiencyLevel.ADVANCED, TargetRoleSkill.Importance.MUST_HAVE),
            ('React', ProficiencyLevel.ADVANCED, TargetRoleSkill.Importance.MUST_HAVE),
            ('TypeScript', ProficiencyLevel.INTERMEDIATE, TargetRoleSkill.Importance.MUST_HAVE),
            ('REST APIs', ProficiencyLevel.ADVANCED, TargetRoleSkill.Importance.MUST_HAVE),
            ('PostgreSQL', ProficiencyLevel.INTERMEDIATE, TargetRoleSkill.Importance.MUST_HAVE),
            ('Docker', ProficiencyLevel.INTERMEDIATE, TargetRoleSkill.Importance.NICE_TO_HAVE),
        ]
        for s_name, req_level, imp in fs_requirements:
            TargetRoleSkill.objects.get_or_create(
                target_role=fullstack_role,
                skill=skills_dict[s_name],
                defaults={'required_level': req_level, 'importance': imp}
            )

        # 4. Student Skills for Alex Rivera
        alex_skills = [
            ('Python', ProficiencyLevel.ADVANCED, 2.0, True),
            ('Django', ProficiencyLevel.INTERMEDIATE, 1.5, True),
            ('PostgreSQL', ProficiencyLevel.INTERMEDIATE, 1.0, True),
            ('REST APIs', ProficiencyLevel.INTERMEDIATE, 1.5, True),
            ('Git', ProficiencyLevel.ADVANCED, 2.0, True),
            ('React', ProficiencyLevel.BEGINNER, 0.5, False),
        ]
        for s_name, prof, yoe, ver in alex_skills:
            StudentSkill.objects.get_or_create(
                student=student_user,
                skill=skills_dict[s_name],
                defaults={'proficiency_level': prof, 'years_of_experience': yoe, 'verified': ver}
            )

        # 5. Courses, Modules, Topics
        course1, _ = Course.objects.get_or_create(
            title='Full Stack Python & Django Architecture',
            defaults={
                'category': 'Backend Engineering',
                'level': Course.Level.INTERMEDIATE,
                'description': 'Master Django REST Framework, database query optimization, JWT authentication, and robust production patterns for high-scale applications.',
                'thumbnail_url': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
                'mentor': mentor_user,
                'is_published': True,
                'estimated_hours': 32
            }
        )

        batch1, _ = Batch.objects.get_or_create(
            name='Winter 2026 Accelerator',
            course=course1,
            defaults={'start_date': timezone.now().date(), 'is_active': True}
        )

        mod1, _ = Module.objects.get_or_create(
            course=course1,
            title='Module 1: REST API Foundations with Django & SimpleJWT',
            defaults={'order': 1, 'description': 'Structuring endpoints, custom users, and token security.'}
        )

        t1, _ = Topic.objects.get_or_create(
            module=mod1,
            title='Custom User Model & Database Constraints',
            defaults={
                'order': 1,
                'content_type': Topic.ContentType.ARTICLE,
                'duration_minutes': 25,
                'content': 'Understanding AbstractUser vs AbstractBaseUser, establishing unique email indexes, and configuring role choices cleanly.'
            }
        )

        t2, _ = Topic.objects.get_or_create(
            module=mod1,
            title='Configuring SimpleJWT Tokens & Refresh Lifecycles',
            defaults={
                'order': 2,
                'content_type': Topic.ContentType.VIDEO,
                'duration_minutes': 35,
                'resource_url': 'https://youtube.com',
                'content': 'Walkthrough of access token rotation, blacklist configurations, and secure header authorization.'
            }
        )

        t3, _ = Topic.objects.get_or_create(
            module=mod1,
            title='Serializers & Validation Best Practices',
            defaults={
                'order': 3,
                'content_type': Topic.ContentType.EXERCISE,
                'duration_minutes': 40,
                'content': 'Hands-on practice writing model serializers with field-level and cross-field validation rules.'
            }
        )

        mod2, _ = Module.objects.get_or_create(
            course=course1,
            title='Module 2: Advanced ORM & Relational Data Modeling',
            defaults={'order': 2, 'description': 'Eliminating N+1 queries, writing transactions, and complex query expressions.'}
        )

        t4, _ = Topic.objects.get_or_create(
            module=mod2,
            title='Select_related vs Prefetch_related in DRF Views',
            defaults={
                'order': 1,
                'content_type': Topic.ContentType.ARTICLE,
                'duration_minutes': 30,
                'content': 'Deep dive into SQL execution plans, single vs two-query evaluations, and avoiding catastrophic N+1 query cascades.'
            }
        )

        t5, _ = Topic.objects.get_or_create(
            module=mod2,
            title='Database Transactions & Atomic Blocks',
            defaults={
                'order': 2,
                'content_type': Topic.ContentType.EXERCISE,
                'duration_minutes': 45,
                'content': 'Applying `transaction.atomic` to protect critical financial or assignment submission state transitions.'
            }
        )

        # Course 2
        course2, _ = Course.objects.get_or_create(
            title='Modern React & TypeScript for SaaS Platforms',
            defaults={
                'category': 'Frontend Engineering',
                'level': Course.Level.BEGINNER,
                'description': 'Build responsive, type-safe web applications using React, Tailwind CSS, Lucide icons, and modern REST data fetching.',
                'thumbnail_url': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80',
                'mentor': mentor_user,
                'is_published': True,
                'estimated_hours': 28
            }
        )
        mod2_1, _ = Module.objects.get_or_create(
            course=course2,
            title='Module 1: Component Design Systems & Tailwind CSS',
            defaults={'order': 1, 'description': 'Crafting modular design systems with cohesive palettes.'}
        )
        Topic.objects.get_or_create(
            module=mod2_1,
            title='Design Tokens & Theming with Tailwind',
            defaults={
                'order': 1,
                'content_type': Topic.ContentType.ARTICLE,
                'duration_minutes': 20,
                'content': 'Creating custom color palettes, CSS variables, and building scalable atomic design components.'
            }
        )

        # 6. Alex's Course Enrollment & Topic Progress
        enrollment, _ = Enrollment.objects.get_or_create(
            student=student_user,
            course=course1,
            defaults={'status': Enrollment.Status.ACTIVE, 'batch': batch1}
        )

        # Alex has completed topic 1 and topic 2, in progress with topic 3
        now = timezone.now()
        TopicProgress.objects.get_or_create(
            student=student_user,
            topic=t1,
            defaults={
                'status': TopicProgress.Status.COMPLETED,
                'start_date': now - timedelta(days=5),
                'completion_date': now - timedelta(days=4)
            }
        )
        TopicProgress.objects.get_or_create(
            student=student_user,
            topic=t2,
            defaults={
                'status': TopicProgress.Status.COMPLETED,
                'start_date': now - timedelta(days=3),
                'completion_date': now - timedelta(days=2)
            }
        )
        TopicProgress.objects.get_or_create(
            student=student_user,
            topic=t3,
            defaults={
                'status': TopicProgress.Status.IN_PROGRESS,
                'start_date': now - timedelta(days=1)
            }
        )

        # 7. Assignment & Submission
        assignment1, _ = Assignment.objects.get_or_create(
            course=course1,
            title='Assignment 1: Secure Authentication & Role-Based API Implementation',
            defaults={
                'description': 'Build a Django REST Framework app featuring custom User roles (Student, Mentor, Admin), SimpleJWT access token generation, and an authenticated endpoint with strict object-level permissions.',
                'due_date': now + timedelta(days=3),
                'max_points': 100,
                'passing_points': 70,
                'created_by': mentor_user,
                'is_active': True
            }
        )

        submission1, _ = Submission.objects.get_or_create(
            assignment=assignment1,
            student=student_user,
            defaults={
                'submission_text': 'Completed all role checks and SimpleJWT configurations with comprehensive unit tests for token expiration and unauthorized access.',
                'submission_url': 'https://github.com/alexrivera-dev/django-auth-rbac-demo',
                'status': Submission.Status.GRADED,
                'score': 95,
                'feedback': 'Exceptional implementation Alex! Clean permission classes, correct HTTP status codes, and thorough test cases.',
                'graded_by': mentor_user,
                'graded_at': now - timedelta(hours=12)
            }
        )

        # 8. Assessment with MCQs
        quiz1, _ = Assessment.objects.get_or_create(
            course=course1,
            title='Django REST Framework & Database Architecture Assessment',
            defaults={
                'description': 'Test your comprehension of Django ORM query optimization, serialization rules, and JWT token security lifecycle.',
                'time_limit_minutes': 20,
                'passing_score': 70,
                'is_active': True,
                'created_by': mentor_user
            }
        )

        q1, _ = Question.objects.get_or_create(
            assessment=quiz1,
            order=1,
            defaults={
                'question_text': 'Which method is the most efficient way in Django ORM to eliminate N+1 queries when fetching related ForeignKey objects?',
                'question_type': Question.QuestionType.MCQ,
                'points': 25,
                'options': [
                    {'id': 'A', 'text': 'Using select_related() which performs an SQL JOIN'},
                    {'id': 'B', 'text': 'Calling .all() inside a python list comprehension'},
                    {'id': 'C', 'text': 'Using .iterator() with batch_size=100'},
                    {'id': 'D', 'text': 'Overriding the save() method on each model'}
                ],
                'correct_answer': 'A',
                'explanation': 'select_related() follows foreign key relationships and creates an SQL JOIN, fetching related models in the primary database query.'
            }
        )

        q2, _ = Question.objects.get_or_create(
            assessment=quiz1,
            order=2,
            defaults={
                'question_text': 'What HTTP status code should be returned when a client attempts to access a protected resource without a valid Bearer token?',
                'question_type': Question.QuestionType.MCQ,
                'points': 25,
                'options': [
                    {'id': 'A', 'text': '400 Bad Request'},
                    {'id': 'B', 'text': '401 Unauthorized'},
                    {'id': 'C', 'text': '403 Forbidden'},
                    {'id': 'D', 'text': '404 Not Found'}
                ],
                'correct_answer': 'B',
                'explanation': 'HTTP 401 Unauthorized denotes that authentication is required and has failed or has not yet been provided.'
            }
        )

        q3, _ = Question.objects.get_or_create(
            assessment=quiz1,
            order=3,
            defaults={
                'question_text': 'In Django REST Framework, where should complex cross-field validation rules ideally be placed in a ModelSerializer?',
                'question_type': Question.QuestionType.MCQ,
                'points': 25,
                'options': [
                    {'id': 'A', 'text': 'Inside the validate() method of the serializer'},
                    {'id': 'B', 'text': 'Directly in the template view'},
                    {'id': 'C', 'text': 'In the frontend Javascript handler only'},
                    {'id': 'D', 'text': 'Inside urls.py route parameters'}
                ],
                'correct_answer': 'A',
                'explanation': 'The validate(self, attrs) method in DRF handles cross-field validation after individual field validators succeed.'
            }
        )

        q4, _ = Question.objects.get_or_create(
            assessment=quiz1,
            order=4,
            defaults={
                'question_text': 'True or False: Storing passwords using plaintext or reversible encryption satisfies modern Django security standards.',
                'question_type': Question.QuestionType.TRUE_FALSE,
                'points': 25,
                'options': [
                    {'id': 'TRUE', 'text': 'True'},
                    {'id': 'FALSE', 'text': 'False'}
                ],
                'correct_answer': 'FALSE',
                'explanation': 'Django uses one-way salted PBKDF2/Argon2/bcrypt cryptographic hashes for secure password storage.'
            }
        )

        # 9. Past Attempt for Alex
        attempt1, _ = AssessmentAttempt.objects.get_or_create(
            assessment=quiz1,
            student=student_user,
            defaults={
                'start_time': now - timedelta(days=2),
                'end_time': now - timedelta(days=2, minutes=-15),
                'score': 100,
                'total_points': 100,
                'percentage': 100.0,
                'passed': True,
                'status': AssessmentAttempt.Status.SUBMITTED
            }
        )
        for q in [q1, q2, q3, q4]:
            Answer.objects.get_or_create(
                attempt=attempt1,
                question=q,
                defaults={
                    'selected_option': q.correct_answer,
                    'is_correct': True,
                    'points_awarded': q.points
                }
            )

        # 10. Portfolio Projects
        Project.objects.get_or_create(
            student=student_user,
            title='CloudMetrics — Serverless Telemetry Dashboard',
            defaults={
                'description': 'A high-performance observability platform collecting CPU and memory time-series metrics with Redis time-bucket aggregation and dynamic SVG charts.',
                'tags': 'Python, Django, Redis, React, Tailwind CSS',
                'github_url': 'https://github.com/alexrivera-dev/cloudmetrics-telemetry',
                'live_demo_url': 'https://cloudmetrics-demo.skilltrack.dev',
                'image_url': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
                'is_featured': True
            }
        )
        Project.objects.get_or_create(
            student=student_user,
            title='DevVault — Encrypted Secrets & Config Manager',
            defaults={
                'description': 'Zero-knowledge credential sharing system built with Django REST Framework, Fernet symmetric encryption, and React TypeScript frontend.',
                'tags': 'Django, Python, TypeScript, REST APIs',
                'github_url': 'https://github.com/alexrivera-dev/devvault-secrets',
                'live_demo_url': 'https://devvault-demo.skilltrack.dev',
                'image_url': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
                'is_featured': False
            }
        )

        # 11. Job Applications
        JobApplication.objects.get_or_create(
            student=student_user,
            company='Stripe',
            job_title='Software Engineer - Developer Platforms',
            defaults={
                'application_date': now.date() - timedelta(days=12),
                'status': JobApplication.Status.INTERVIEWING,
                'job_url': 'https://stripe.com/jobs/dev-platforms',
                'salary_range': '$140k - $165k',
                'notes': 'Completed technical phone screen. System architecture round scheduled for next Thursday.'
            }
        )
        JobApplication.objects.get_or_create(
            student=student_user,
            company='GitHub',
            job_title='Backend Systems Engineer',
            defaults={
                'application_date': now.date() - timedelta(days=22),
                'status': JobApplication.Status.SCREENING,
                'job_url': 'https://github.com/careers/backend-eng',
                'salary_range': '$135k - $160k',
                'notes': 'Recruiter reached out following open-source project contributions.'
            }
        )
        JobApplication.objects.get_or_create(
            student=student_user,
            company='Datadog',
            job_title='Junior Cloud Infrastructure Engineer',
            defaults={
                'application_date': now.date() - timedelta(days=5),
                'status': JobApplication.Status.APPLIED,
                'job_url': 'https://datadoghq.com/careers',
                'salary_range': '$120k - $140k',
                'notes': 'Applied with portfolio live demo link and tailored cover letter.'
            }
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded full SkillTrack database!'))
