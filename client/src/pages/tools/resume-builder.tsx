import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FileUser, Download, Plus, Trash2, Eye, User, Briefcase, GraduationCap, Star, Phone, Mail, MapPin } from "lucide-react";

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationYear: string;
  gpa?: string;
}

interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export default function ResumeBuilder() {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    summary: ""
  });

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [activeSection, setActiveSection] = useState<string>("personal");
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      current: false,
      description: ""
    };
    setExperiences([...experiences, newExp]);
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    setExperiences(experiences.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      institution: "",
      degree: "",
      field: "",
      graduationYear: "",
      gpa: ""
    };
    setEducation([...education, newEdu]);
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducation(education.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const removeEducation = (id: string) => {
    setEducation(education.filter(edu => edu.id !== id));
  };

  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: "",
      level: "Intermediate"
    };
    setSkills([...skills, newSkill]);
  };

  const updateSkill = (id: string, field: keyof Skill, value: string) => {
    setSkills(skills.map(skill => 
      skill.id === id ? { ...skill, [field]: value } : skill
    ));
  };

  const removeSkill = (id: string) => {
    setSkills(skills.filter(skill => skill.id !== id));
  };

  const downloadResumeJSON = () => {
    const resumeData = {
      personalInfo,
      experiences,
      education,
      skills
    };
    
    const dataStr = JSON.stringify(resumeData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${personalInfo.fullName.replace(/\s+/g, '_')}_Resume.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadResumePDF = async () => {
    try {
      const resumeHtml = generateResumeHTML();
      
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ html: resumeHtml })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        // Fallback: download as HTML
        downloadResumeHTML();
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
      // Fallback: download as HTML
      downloadResumeHTML();
    }
  };

  const downloadResumeHTML = () => {
    const resumeHtml = generateResumeHTML();
    const dataBlob = new Blob([resumeHtml], {type: 'text/html'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${personalInfo.fullName.replace(/\s+/g, '_')}_Resume.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateResumeHTML = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${personalInfo.fullName} - Resume</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .name {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 10px;
            color: #2c3e50;
        }
        .contact-info {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
            font-size: 0.9em;
            color: #666;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 1.4em;
            font-weight: bold;
            color: #2c3e50;
            border-bottom: 1px solid #bdc3c7;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .experience-item, .education-item {
            margin-bottom: 20px;
        }
        .job-title {
            font-weight: bold;
            font-size: 1.1em;
            color: #2c3e50;
        }
        .company {
            color: #7f8c8d;
            font-style: italic;
        }
        .date {
            float: right;
            color: #95a5a6;
            font-size: 0.9em;
        }
        .description {
            margin-top: 5px;
            text-align: justify;
        }
        .skills {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        .skill {
            background: #ecf0f1;
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 0.9em;
            border: 1px solid #bdc3c7;
        }
        .summary {
            font-style: italic;
            text-align: justify;
            color: #555;
            margin-bottom: 20px;
        }
        @media print {
            body { margin: 0; padding: 10px; }
            .header { page-break-after: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="name">${personalInfo.fullName || 'Your Name'}</div>
        <div class="contact-info">
            ${personalInfo.email ? `<span>📧 ${personalInfo.email}</span>` : ''}
            ${personalInfo.phone ? `<span>📞 ${personalInfo.phone}</span>` : ''}
            ${personalInfo.location ? `<span>📍 ${personalInfo.location}</span>` : ''}
        </div>
    </div>

    ${personalInfo.summary ? `
    <div class="section">
        <div class="section-title">Professional Summary</div>
        <div class="summary">${personalInfo.summary}</div>
    </div>` : ''}

    ${experiences.length > 0 ? `
    <div class="section">
        <div class="section-title">Experience</div>
        ${experiences.map(exp => `
        <div class="experience-item">
            <div class="job-title">${exp.position}</div>
            <div class="company">${exp.company} <span class="date">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</span></div>
            ${exp.description ? `<div class="description">${exp.description}</div>` : ''}
        </div>`).join('')}
    </div>` : ''}

    ${education.length > 0 ? `
    <div class="section">
        <div class="section-title">Education</div>
        ${education.map(edu => `
        <div class="education-item">
            <div class="job-title">${edu.degree} in ${edu.field}</div>
            <div class="company">${edu.institution} <span class="date">${edu.graduationYear}</span></div>
            ${edu.gpa ? `<div>GPA: ${edu.gpa}</div>` : ''}
        </div>`).join('')}
    </div>` : ''}

    ${skills.length > 0 ? `
    <div class="section">
        <div class="section-title">Skills</div>
        <div class="skills">
            ${skills.map(skill => `<span class="skill">${skill.name} (${skill.level})</span>`).join('')}
        </div>
    </div>` : ''}
</body>
</html>`;
  };

  const renderPersonalInfoSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Personal Information
        </CardTitle>
        <CardDescription>
          Basic contact information and professional summary
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={personalInfo.fullName}
              onChange={(e) => setPersonalInfo({...personalInfo, fullName: e.target.value})}
              placeholder="John Doe"
              data-testid="input-full-name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={personalInfo.email}
              onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
              placeholder="john@example.com"
              data-testid="input-email"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={personalInfo.phone}
              onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
              placeholder="+1 (555) 123-4567"
              data-testid="input-phone"
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={personalInfo.location}
              onChange={(e) => setPersonalInfo({...personalInfo, location: e.target.value})}
              placeholder="New York, NY"
              data-testid="input-location"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="summary">Professional Summary</Label>
          <Textarea
            id="summary"
            value={personalInfo.summary}
            onChange={(e) => setPersonalInfo({...personalInfo, summary: e.target.value})}
            placeholder="Brief description of your professional background and career objectives..."
            rows={4}
            data-testid="textarea-summary"
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderExperienceSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Work Experience
        </CardTitle>
        <CardDescription>
          Your professional work history and achievements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {experiences.map((exp, index) => (
          <div key={exp.id} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Experience {index + 1}</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeExperience(exp.id)}
                data-testid={`button-remove-experience-${index}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Company</Label>
                <Input
                  value={exp.company}
                  onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                  placeholder="Company Name"
                  data-testid={`input-company-${index}`}
                />
              </div>
              <div>
                <Label>Position</Label>
                <Input
                  value={exp.position}
                  onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                  placeholder="Job Title"
                  data-testid={`input-position-${index}`}
                />
              </div>
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={exp.startDate}
                  onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                  data-testid={`input-start-date-${index}`}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={exp.endDate}
                  onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                  disabled={exp.current}
                  data-testid={`input-end-date-${index}`}
                />
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="checkbox"
                    checked={exp.current}
                    onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                    data-testid={`checkbox-current-${index}`}
                  />
                  <Label className="text-sm">Current Position</Label>
                </div>
              </div>
            </div>
            
            <div>
              <Label>Job Description</Label>
              <Textarea
                value={exp.description}
                onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                placeholder="Describe your responsibilities and achievements..."
                rows={3}
                data-testid={`textarea-description-${index}`}
              />
            </div>
          </div>
        ))}
        
        <Button
          variant="outline"
          onClick={addExperience}
          className="w-full"
          data-testid="button-add-experience"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Experience
        </Button>
      </CardContent>
    </Card>
  );

  const renderEducationSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          Education
        </CardTitle>
        <CardDescription>
          Your educational background and qualifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {education.map((edu, index) => (
          <div key={edu.id} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Education {index + 1}</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeEducation(edu.id)}
                data-testid={`button-remove-education-${index}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Institution</Label>
                <Input
                  value={edu.institution}
                  onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                  placeholder="University/School Name"
                  data-testid={`input-institution-${index}`}
                />
              </div>
              <div>
                <Label>Degree</Label>
                <Input
                  value={edu.degree}
                  onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                  placeholder="Bachelor's, Master's, etc."
                  data-testid={`input-degree-${index}`}
                />
              </div>
              <div>
                <Label>Field of Study</Label>
                <Input
                  value={edu.field}
                  onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                  placeholder="Computer Science, Business, etc."
                  data-testid={`input-field-${index}`}
                />
              </div>
              <div>
                <Label>Graduation Year</Label>
                <Input
                  value={edu.graduationYear}
                  onChange={(e) => updateEducation(edu.id, 'graduationYear', e.target.value)}
                  placeholder="2023"
                  data-testid={`input-graduation-year-${index}`}
                />
              </div>
              <div>
                <Label>GPA (Optional)</Label>
                <Input
                  value={edu.gpa || ""}
                  onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                  placeholder="3.8"
                  data-testid={`input-gpa-${index}`}
                />
              </div>
            </div>
          </div>
        ))}
        
        <Button
          variant="outline"
          onClick={addEducation}
          className="w-full"
          data-testid="button-add-education"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Education
        </Button>
      </CardContent>
    </Card>
  );

  const renderSkillsSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          Skills
        </CardTitle>
        <CardDescription>
          Your technical and professional skills
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {skills.map((skill, index) => (
          <div key={skill.id} className="flex items-center gap-3">
            <Input
              value={skill.name}
              onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
              placeholder="Skill name"
              className="flex-1"
              data-testid={`input-skill-name-${index}`}
            />
            <select
              value={skill.level}
              onChange={(e) => updateSkill(skill.id, 'level', e.target.value)}
              className="px-3 py-2 border rounded-md"
              data-testid={`select-skill-level-${index}`}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeSkill(skill.id)}
              data-testid={`button-remove-skill-${index}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        
        <Button
          variant="outline"
          onClick={addSkill}
          className="w-full"
          data-testid="button-add-skill"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Skill
        </Button>
      </CardContent>
    </Card>
  );

  const renderPreview = () => (
    <Card>
      <CardHeader>
        <CardTitle>Resume Preview</CardTitle>
        <CardDescription>
          Preview of your resume
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-white dark:bg-gray-900 p-8 rounded-lg border-2 border-dashed min-h-96">
          {/* Header */}
          <div className="text-center border-b pb-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="preview-name">
              {personalInfo.fullName || "Your Name"}
            </h1>
            <div className="flex justify-center items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
              {personalInfo.email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  <span data-testid="preview-email">{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span data-testid="preview-phone">{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span data-testid="preview-location">{personalInfo.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          {personalInfo.summary && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Professional Summary</h2>
              <p className="text-gray-700 dark:text-gray-300" data-testid="preview-summary">
                {personalInfo.summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {experiences.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Experience</h2>
              {experiences.map((exp, index) => (
                <div key={exp.id} className="mb-4" data-testid={`preview-experience-${index}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{exp.position}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{exp.company}</p>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </p>
                  </div>
                  {exp.description && (
                    <p className="mt-2 text-gray-700 dark:text-gray-300">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Education</h2>
              {education.map((edu, index) => (
                <div key={edu.id} className="mb-3" data-testid={`preview-education-${index}`}>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {edu.degree} in {edu.field}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {edu.institution} • {edu.graduationYear}
                    {edu.gpa && ` • GPA: ${edu.gpa}`}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge
                    key={skill.id}
                    variant="secondary"
                    className="text-sm"
                    data-testid={`preview-skill-${index}`}
                  >
                    {skill.name} ({skill.level})
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
          <FileUser className="w-8 h-8" />
          Resume Builder
        </h1>
        <p className="text-lg text-muted-foreground">
          Create a professional resume with our easy-to-use builder
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <Button
          variant={previewMode ? "outline" : "default"}
          onClick={() => setPreviewMode(false)}
          data-testid="button-edit-mode"
        >
          Edit
        </Button>
        <Button
          variant={previewMode ? "default" : "outline"}
          onClick={() => setPreviewMode(true)}
          data-testid="button-preview-mode"
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
        <Button
          variant="outline"
          onClick={downloadResumePDF}
          disabled={!personalInfo.fullName}
          data-testid="button-download-pdf"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
        <Button
          variant="outline"
          onClick={downloadResumeHTML}
          disabled={!personalInfo.fullName}
          data-testid="button-download-html"
        >
          <Download className="w-4 h-4 mr-2" />
          Download HTML
        </Button>
        <Button
          variant="outline"
          onClick={downloadResumeJSON}
          disabled={!personalInfo.fullName}
          data-testid="button-download-json"
        >
          <Download className="w-4 h-4 mr-2" />
          Download JSON
        </Button>
      </div>

      {previewMode ? (
        renderPreview()
      ) : (
        <div className="space-y-6">
          {renderPersonalInfoSection()}
          {renderExperienceSection()}
          {renderEducationSection()}
          {renderSkillsSection()}
        </div>
      )}
    </div>
  );
}