const fs = require('fs');
let file = fs.readFileSync('src/app/(dashboard)/admin/my-tickets/page.tsx', 'utf8');

file = file.replace(
  /const timelineItems = \[\s*\{ type: 'opened', timestamp: new Date\(selectedCase\.created_at\)\.getTime\(\), data: null \},\s*\.\.\.activities\.filter\(a => !a\.action_text\.startsWith\('CASE OPENED'\)\)\.map\(a => \(\{ type: 'activity', timestamp: new Date\(a\.created_at\)\.getTime\(\), data: a \}\)\)\s*\];/s,
  `const latestMessageTime = comments.length > 0 ? new Date(comments[comments.length - 1].created_at).getTime() : new Date(selectedCase.created_at).getTime() + 1;
                    const timelineItems = [
                      { type: 'opened', timestamp: new Date(selectedCase.created_at).getTime(), data: null },
                      ...activities.filter(a => !a.action_text.startsWith('CASE OPENED')).map(a => ({ type: 'activity', timestamp: new Date(a.created_at).getTime(), data: a })),
                      { type: 'messages_box', timestamp: latestMessageTime, data: null }
                    ];`
);

fs.writeFileSync('src/app/(dashboard)/admin/my-tickets/page.tsx', file);
console.log('Fixed my-tickets');
