# ATS Compatibility

## What Is an ATS?

An **ATS** (Applicant Tracking System) is software used by recruiters and companies to manage job applications. When you upload your CV/resume to a job portal or company website, an ATS parses the document to extract structured data — your name, job titles, companies, dates, skills, and education. This data is then used for keyword matching, ranking, and filtering candidates.

If the ATS cannot parse your document correctly, your application may be discarded or key information may be lost — even if your qualifications are a perfect match.

## Built-In ATS Optimization

CV Manager automatically generates ATS-friendly output on the public site:

- **Schema.org markup** — structured data that ATS systems can parse (Person, OrganizationRole, EducationalOccupationalCredential, etc.)
- **Semantic HTML** — proper heading hierarchy, article elements, and lists
- **Hidden ATS block** — a plain-text version of your CV is embedded in the page for parsers that don't process styled HTML
- **Clean print output** — no visual clutter, proper content hierarchy

No special configuration is needed — these features are always active.

## ATS Document Export

In addition to the built-in web optimization, CV Manager can generate a **dedicated ATS-friendly PDF** designed specifically for uploading to job portals and ATS systems.

### How to Use

1. Click **ATS Document** in the admin toolbar
2. Adjust the **Scale** slider to control content density (50%–150%)
3. Choose your preferred **Paper Size** (A4 or Letter)
4. Preview the document in the modal
5. Click **Download PDF** to save the file

### What Makes It Different from Print / PDF?

| Feature | Print / PDF | ATS Document |
|---------|-------------|--------------|
| **Purpose** | Visual presentation | Machine parsing |
| **Layout** | Full themed design with colors, icons, timeline | Clean structured text, minimal formatting |
| **Content** | All visible sections including timeline | All sections except timeline (not ATS-relevant) |
| **Scale control** | Browser print dialog | Built-in slider with live preview |
| **Generation** | Browser's print engine | Server-side (pdfmake) |
| **Consistency** | Varies by browser | Identical output everywhere |

### Tips for ATS Success

!!! tip "Use the ATS Document for job applications"
    Always upload the ATS Document (not the Print/PDF version) when applying through job portals. The structured layout is designed to be parsed correctly by automated systems.

!!! tip "Keep your skills section complete"
    ATS systems rely heavily on keyword matching. Make sure your Skills section contains all relevant technologies, tools, and methodologies — the ATS export includes them as a flat keyword list for better matching.

!!! tip "Use the Print/PDF for human readers"
    When emailing your CV directly to a hiring manager or bringing it to an interview, use the Print/PDF version — it has the full visual design with your theme colors and timeline.

!!! tip "Scale for density"
    If your CV is long, try reducing the scale to 70–80% to fit more content per page. The preview updates in real-time so you can find the sweet spot.
