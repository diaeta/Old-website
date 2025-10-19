const fs = require('fs');
const path = require('path');

// Read the audit CSV and extract all issues
const csvPath = path.join('C:', 'Users', 'pierr', 'Downloads', 'rapport_aperçu_problemes.csv');
const auditData = fs.readFileSync(csvPath, 'utf8');
const lines = auditData.split('\n');

console.log('=== ALL AUDIT ISSUES (Complete List) ===\n');

let issueNumber = 1;
let highPriority = [];
let mediumPriority = [];
let lowPriority = [];
let opportunities = [];

for (let i = 2; i < lines.length; i++) {
  if (!lines[i].trim()) continue;
  
  const match = lines[i].match(/^"([^"]+)","([^"]+)","([^"]+)","([^"]+)"/);
  if (match) {
    const issueName = match[1];
    const issueType = match[2];
    const priority = match[3];
    const count = match[4];
    
    const issue = {
      number: issueNumber,
      name: issueName,
      type: issueType,
      priority: priority,
      count: count
    };
    
    if (priority === 'Élevée') highPriority.push(issue);
    else if (priority === 'Moyenne') mediumPriority.push(issue);
    else if (priority === 'Faible') lowPriority.push(issue);
    else if (priority === 'Opportunité') opportunities.push(issue);
    
    issueNumber++;
  }
}

console.log('HIGH PRIORITY (ÉLEVÉE):');
highPriority.forEach(issue => {
  console.log(`  ${issue.number}. ${issue.name} - ${issue.count} pages`);
});

console.log('\nMEDIUM PRIORITY (MOYENNE):');
mediumPriority.forEach(issue => {
  console.log(`  ${issue.number}. ${issue.name} - ${issue.count} pages`);
});

console.log('\nLOW PRIORITY (FAIBLE):');
lowPriority.forEach(issue => {
  console.log(`  ${issue.number}. ${issue.name} - ${issue.count} pages`);
});

console.log('\nOPPORTUNITIES (OPPORTUNITÉ):');
opportunities.forEach(issue => {
  console.log(`  ${issue.number}. ${issue.name} - ${issue.count} pages`);
});

console.log('\n=== TOTAL: ' + (issueNumber - 1) + ' issue types ===');
