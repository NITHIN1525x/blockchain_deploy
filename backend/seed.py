# backend/seed.py
# Run this to populate the database with sample data
# Command: python seed.py

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from users.models import User
from jobs.models import Job
from datetime import date, timedelta

print("Seeding database...")

# ── Create Users ───────────────────────────────────────────────

# Admin
if not User.objects.filter(email='admin@test.com').exists():
    admin = User.objects.create_superuser(
        username='admin',
        email='admin@test.com',
        password='admin123',
    )
    print("DONE Admin created: admin@test.com / admin123")

# Clients
clients_data = [
    {
        'username': 'john_client',
        'email': 'john@test.com',
        'password': 'test1234',
        'role': 'client',
        'bio': 'Tech startup founder looking for talented developers.',
    },
    {
        'username': 'sarah_client',
        'email': 'sarah@test.com',
        'password': 'test1234',
        'role': 'client',
        'bio': 'Marketing agency owner needing creative freelancers.',
    },
    {
        'username': 'mike_client',
        'email': 'mike@test.com',
        'password': 'test1234',
        'role': 'client',
        'bio': 'E-commerce business owner.',
    },
]

clients = []
for data in clients_data:
    if not User.objects.filter(email=data['email']).exists():
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            role=data['role'],
            bio=data['bio'],
        )
        clients.append(user)
        print(f"DONE Client created: {data['email']} / test1234")
    else:
        clients.append(User.objects.get(email=data['email']))

# Freelancers
freelancers_data = [
    {
        'username': 'alex_dev',
        'email': 'alex@test.com',
        'password': 'test1234',
        'role': 'freelancer',
        'bio': 'Full-stack developer with 5 years experience in React and Django.',
        'skills': 'React, Django, Python, PostgreSQL, REST API',
    },
    {
        'username': 'priya_design',
        'email': 'priya@test.com',
        'password': 'test1234',
        'role': 'freelancer',
        'bio': 'UI/UX designer specializing in modern web interfaces.',
        'skills': 'Figma, Adobe XD, CSS, HTML, UI Design',
    },
    {
        'username': 'carlos_mobile',
        'email': 'carlos@test.com',
        'password': 'test1234',
        'role': 'freelancer',
        'bio': 'Mobile developer for iOS and Android apps.',
        'skills': 'React Native, Flutter, Swift, Kotlin',
    },
    {
        'username': 'nina_writer',
        'email': 'nina@test.com',
        'password': 'test1234',
        'role': 'freelancer',
        'bio': 'Content writer and SEO specialist.',
        'skills': 'Content Writing, SEO, Copywriting, Blogging',
    },
]

freelancers = []
for data in freelancers_data:
    if not User.objects.filter(email=data['email']).exists():
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            role=data['role'],
            bio=data['bio'],
            skills=data['skills'],
        )
        freelancers.append(user)
        print(f"DONE Freelancer created: {data['email']} / test1234")
    else:
        freelancers.append(User.objects.get(email=data['email']))

# ── Create Jobs ────────────────────────────────────────────────

jobs_data = [
    {
        'client': clients[0],
        'title': 'Build a React E-commerce Website',
        'description': '''We need a modern e-commerce website built with React.js frontend and Django backend.

Requirements:
- Product listing with filters and search
- Shopping cart and checkout flow
- User authentication (register/login)
- Admin dashboard for product management
- Payment gateway integration (Stripe)
- Mobile responsive design
- Clean and modern UI

Please share your portfolio of similar projects.''',
        'category': 'web_dev',
        'budget': 1500,
        'deadline': date.today() + timedelta(days=30),
        'skills_required': 'React, Django, Python, Stripe, CSS',
    },
    {
        'client': clients[0],
        'title': 'Design a Mobile App UI for Fitness Tracker',
        'description': '''Looking for a talented UI/UX designer to create a complete mobile app design for our fitness tracking app.

Deliverables:
- Full app wireframes (20+ screens)
- High-fidelity UI designs in Figma
- Design system / component library
- Prototype with interactions
- App icon and branding

Target audience: Health-conscious millennials aged 20-35.''',
        'category': 'design',
        'budget': 800,
        'deadline': date.today() + timedelta(days=21),
        'skills_required': 'Figma, UI Design, Mobile Design, Prototyping',
    },
    {
        'client': clients[1],
        'title': 'Write 10 SEO Blog Articles for Tech Blog',
        'description': '''We need 10 well-researched SEO-optimized blog articles for our technology blog.

Requirements:
- Each article: 1500-2000 words
- Topics: AI, Web Development, Cybersecurity, Cloud Computing
- Proper keyword research and optimization
- Meta descriptions for each article
- Internal linking suggestions
- Plagiarism-free content
- Delivered in Google Docs format

We provide topic ideas. You do the research and writing.''',
        'category': 'writing',
        'budget': 400,
        'deadline': date.today() + timedelta(days=14),
        'skills_required': 'SEO, Content Writing, Research, Blogging',
    },
    {
        'client': clients[1],
        'title': 'Build React Native Food Delivery App',
        'description': '''We are building a food delivery app similar to Uber Eats. Need an experienced React Native developer.

Features needed:
- Customer app (browse restaurants, order food, track delivery)
- Restaurant dashboard (manage menu, orders)
- Driver app (accept orders, navigation)
- Real-time order tracking with maps
- Push notifications
- Payment integration

Must have prior experience with React Native and maps integration.''',
        'category': 'mobile_dev',
        'budget': 3000,
        'deadline': date.today() + timedelta(days=60),
        'skills_required': 'React Native, Node.js, MongoDB, Google Maps API',
    },
    {
        'client': clients[2],
        'title': 'Setup Google Ads Campaign for E-commerce Store',
        'description': '''Need an experienced digital marketer to set up and manage Google Ads for our online store selling home decor products.

Scope:
- Google Search Ads campaign setup
- Shopping Ads configuration
- Remarketing campaigns
- Keyword research and bid strategy
- Ad copywriting
- Monthly performance report
- Budget: $500/month ad spend

Must have Google Ads certification.''',
        'category': 'marketing',
        'budget': 600,
        'deadline': date.today() + timedelta(days=7),
        'skills_required': 'Google Ads, PPC, Digital Marketing, Analytics',
    },
    {
        'client': clients[2],
        'title': 'Data Analysis Dashboard with Python',
        'description': '''We have a large dataset (CSV files) from our sales system. Need a Python developer to:

- Clean and preprocess the data
- Build interactive visualizations
- Create a Streamlit or Dash dashboard
- Key metrics: Revenue trends, customer segmentation, product performance
- Export reports to PDF/Excel
- Deploy on a cloud server

Data contains ~500k rows of sales transactions from 2020-2024.''',
        'category': 'data',
        'budget': 1200,
        'deadline': date.today() + timedelta(days=25),
        'skills_required': 'Python, Pandas, Plotly, Streamlit, Data Analysis',
    },
    {
        'client': clients[0],
        'title': 'WordPress Website for Restaurant',
        'description': '''Need a beautiful WordPress website for a fine dining restaurant.

Pages needed:
- Homepage with hero section
- Menu page (with PDF menu upload)
- About Us page
- Gallery page
- Reservation/booking form
- Contact page with Google Maps
- Blog section

Must be mobile responsive and load fast.
Please provide examples of restaurant websites you have built.''',
        'category': 'web_dev',
        'budget': 500,
        'deadline': date.today() + timedelta(days=12),
        'skills_required': 'WordPress, PHP, CSS, Elementor',
    },
    {
        'client': clients[1],
        'title': 'Create Brand Identity Package',
        'description': '''Startup company needs complete brand identity design.

Deliverables:
- Logo design (3 concepts, unlimited revisions)
- Color palette and typography
- Business card design
- Letterhead design
- Social media profile templates (Instagram, Facebook, LinkedIn)
- Brand guidelines document
- All files in AI, EPS, PNG, SVG formats

Industry: FinTech / Financial Services
Style: Modern, professional, trustworthy''',
        'category': 'design',
        'budget': 700,
        'deadline': date.today() + timedelta(days=18),
        'skills_required': 'Logo Design, Branding, Adobe Illustrator, Figma',
    },
]

created_jobs = []
for data in jobs_data:
    if not Job.objects.filter(title=data['title']).exists():
        job = Job.objects.create(**data)
        created_jobs.append(job)
        print(f"DONE Job created: {data['title']}")
    else:
        created_jobs.append(Job.objects.get(title=data['title']))

print("\n" + "="*50)
print("Database seeded successfully!")
print("="*50)
print("\nTEST ACCOUNTS:")
print("\nADMIN:")
print("   Email: admin@test.com")
print("   Password: admin123")
print("   Admin Panel: http://127.0.0.1:8000/admin")
print("\nCLIENTS:")
print("   john@test.com / test1234")
print("   sarah@test.com / test1234")
print("   mike@test.com / test1234")
print("\nFREELANCERS:")
print("   alex@test.com / test1234")
print("   priya@test.com / test1234")
print("   carlos@test.com / test1234")
print("   nina@test.com / test1234")
print(f"\nJobs created: {len(created_jobs)}")
print("\nFrontend: http://localhost:5173")
print("Backend: http://127.0.0.1:8000")
print("="*50)