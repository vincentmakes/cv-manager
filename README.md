# CV Manager / Resume Builder
[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/vincentmakes)  

This is a CV / Resume management system with an editable theme, persistent database storage, and Docker deployment ready for Unraid.  

<img width="600"  alt="cv1" src="https://github.com/user-attachments/assets/6e20de1e-2001-4097-9844-2aeb611bc53e" />  

<img width="600"  alt="cv2" src="https://github.com/user-attachments/assets/339cec06-2c6b-4024-99dd-5d97f2960478" />  

<img width="600"  alt="cv3" src="https://github.com/user-attachments/assets/5f10edb5-a81e-4715-9d4b-90e8a154de72" />  

<img width="600"  alt="cv4" src="https://github.com/user-attachments/assets/285c131d-2e9b-44e6-abfa-bb45b51ee530" />  




## Features

- **7 Sections**: About, Timeline (auto-generated), Experience, Certifications, Education, Skills, Projects
- **Custom Sections**: Add your own sections with different layout possibilities
- **Full CRUD**: Add, edit, delete any item
- **Visibility Toggles**: Hide items from PDF export while keeping them in database
- **Print/PDF Export**: Clean print styles, hidden items excluded
- **Import/Export**: Backup and restore your CV data as JSON - ideal to process the data via any LLM for optimization
- **Persistent Storage**: SQLite database survives container restarts
- **Multi CV**: Save different of your CV. Preview them and load them as need be
- **Responsive Design**: Works on desktop and mobile
- **Auto-Generated Timeline**: Timeline automatically builds from your experiences
- **ATS Optimized**: Schema.org markup, semantic HTML, hidden keywords for job site parsing
- **SEO Ready**: Dynamic robots.txt and sitemap.xml for the public site

## Quick Start (Docker)

### One-Line Install
``` bash
curl -fsSL https://raw.githubusercontent.com/vincentmakes/cv-manager/main/install.sh | bash
```
Or download and run:

```bash
wget https://raw.githubusercontent.com/vincentmakes/cv-manager/main/install.sh
chmod +x install.sh
./install.sh
```

### Manual Option 1: Docker Compose 

```bash
# Clone or copy the files
cd cv-manager

# Create data directory
mkdir -p /mnt/user/appdata/cv-manager/data/uploads

# Start the container
docker-compose up -d --build

# Access at:
# - http://localhost:3000 (Admin - full edit access)
# - http://localhost:3001 (Public - read-only)
```

### Manual Option 2: Docker Compose with Named Volume

Use `docker-compose.volume.yml` if you prefer Docker-managed volumes:
```bash
docker-compose -f docker-compose.volume.yml up -d --build
```

### Manual Option 3: Docker Run

```bash
# Build the image
docker build -t cv-manager .

# Run with persistent data
docker run -d \
  --name cv-manager \
  -p 3000:3000 \
  -p 3001:3001 \
  -v /mnt/user/appdata/cv-manager/data:/app/data \
  --restart unless-stopped \
  cv-manager
```

## Two Server Modes

| Port | Mode | Description |
|------|------|-------------|
| 3000 | Admin | Full edit access, toolbar, all controls |
| 3001 | Public | Read-only, no toolbar, no edit buttons, security hardened |

### Public Server Security Features (Port 3001)

- **GET-only**: All POST/PUT/DELETE requests blocked
- **Rate limiting**: 60 requests/minute per IP
- **Security headers**: X-Frame-Options, CSP, XSS protection
- **No sensitive data**: Email/phone not exposed in API
- **Visible items only**: Hidden items not returned by API
- **No IDs exposed**: Database IDs not included in responses
- **SEO files**: Dynamic robots.txt and sitemap.xml

### Cloudflare Tunnel Setup

Point your CF tunnel to port 3001 for public access:
```yaml
# In your cloudflared config
ingress:
  - hostname: cv.yourdomain.com
    service: http://cv-manager:3001
```

The sitemap.xml and robots.txt are automatically generated with the correct domain based on the incoming request headers.

## Unraid Deployment

### Method 1: Install from Unraid Apps

1. In the Apps tab, look for "cv manager". 
2. Install cv-manager first then cv-manager-public

<img width="800" height="357" alt="Screenshot 2026-02-01 at 06 14 29" src="https://github.com/user-attachments/assets/e6358881-86fb-4338-b4e9-367d3020cc7a" />



### Method 2: Docker Compose Manager Plugin

1. Install the "Docker Compose Manager" plugin from Community Apps
2. Create a new stack with the `docker-compose.yml` content
3. Set the path for data persistence (e.g., `/mnt/user/appdata/cv-manager/data`)
4. Start the stack


## Data Persistence

The SQLite database is stored in the `data` directory. Make sure to:

1. Mount `/app/data` to a persistent location on your host
2. Back up the `cv.db` file periodically
3. Use the Export feature for JSON backups

## Profile Picture

To add your profile picture:

1. Name your picture `picture.jpeg`
2. Place it in the `data/uploads/` folder:
   - Docker: `/app/data/uploads/picture.jpeg` (inside container)
   - Unraid bind mount: `/mnt/user/appdata/cv-manager/data/uploads/picture.jpeg`
   - Docker volume: Use `docker cp picture.jpeg cv-manager:/app/data/uploads/`

The picture will automatically display instead of initials. If no picture is found, initials are shown as fallback.

Supported format: JPEG (must be named `picture.jpeg`)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get profile data |
| PUT | `/api/profile` | Update profile |
| GET | `/api/experiences` | List all experiences |
| POST | `/api/experiences` | Create experience |
| PUT | `/api/experiences/:id` | Update experience |
| DELETE | `/api/experiences/:id` | Delete experience |
| GET | `/api/certifications` | List certifications |
| POST | `/api/certifications` | Create certification |
| PUT | `/api/certifications/:id` | Update certification |
| DELETE | `/api/certifications/:id` | Delete certification |
| GET | `/api/education` | List education |
| POST | `/api/education` | Create education |
| PUT | `/api/education/:id` | Update education |
| DELETE | `/api/education/:id` | Delete education |
| GET | `/api/skills` | List skill categories |
| POST | `/api/skills` | Create skill category |
| PUT | `/api/skills/:id` | Update skill category |
| DELETE | `/api/skills/:id` | Delete skill category |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| GET | `/api/timeline` | Get auto-generated timeline |
| GET | `/api/sections` | Get section visibility |
| PUT | `/api/sections/:name` | Update section visibility |
| GET | `/api/cv` | Export all CV data |
| POST | `/api/import` | Import CV data |

## Importing Your Existing Data

Create a JSON file with your CV data and use the Import button, or POST to `/api/import`:

```json
{
  "profile": {
    "name": "Your Name",
    "initials": "YN",
    "title": "Your Title",
    "subtitle": "Your tagline",
    "bio": "Your bio...",
    "location": "City, Country",
    "linkedin": "https://linkedin.com/in/yourprofile",
    "languages": "English, French"
  },
  "experiences": [
    {
      "job_title": "Senior Developer",
      "company_name": "Company Inc",
      "start_date": "2020-01",
      "end_date": "",
      "location": "Remote",
      "country_code": "us",
      "highlights": ["Led team of 5", "Delivered project X"]
    }
  ],
  "certifications": [
    {
      "name": "AWS Solutions Architect",
      "provider": "Amazon",
      "issue_date": "Jan 2023"
    }
  ],
  "education": [
    {
      "degree_title": "MSc Computer Science",
      "institution_name": "University",
      "start_date": "2010",
      "end_date": "2014",
      "description": "Focus on AI"
    }
  ],
  "skills": [
    {
      "name": "Programming",
      "icon": "💻",
      "skills": ["JavaScript", "Python", "Go"]
    }
  ],
  "projects": [
    {
      "title": "Project Name",
      "description": "What it does",
      "technologies": ["React", "Node.js"]
    }
  ]
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `PUBLIC_PORT` | `3001` | Server port Read only|
| `DB_PATH` | `./data/cv.db` | SQLite database path |

## Development

```bash
# Install dependencies
npm install

# Run in development mode (auto-reload)
npm run dev

# Run in production mode
npm start
```

## License

MIT
