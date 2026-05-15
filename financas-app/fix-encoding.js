const fs = require('fs');
const path = require('path');

function fixEncoding(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixEncoding(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      // PowerShell Set-Content might have saved as ANSI or mangled UTF-8.
      // We will read with default encoding and convert to utf-8.
      try {
        const buffer = fs.readFileSync(fullPath);
        
        // If it contains a zero byte, it might be UTF-16LE
        if (buffer.includes(0x00)) {
          const content = buffer.toString('utf16le');
          fs.writeFileSync(fullPath, content, 'utf8');
        } else {
          // If it's ANSI, it will have bytes > 127 that are not valid UTF-8 sequences.
          // In Node, we can try to interpret it.
          // Since the only files modified were `.tsx`, let's just do a simpler fix:
          // The issue is Vite said: stream did not contain valid UTF-8
          const content = buffer.toString('latin1');
          if (content.includes('Ã')) {
              // It's probably utf8 interpreted as latin1 somewhere? No.
          }
          // The easiest way to fix powershell ANSI writing is to read as windows-1252 and write utf8
          // Since we don't have windows-1252, we can just use powershell to re-encode.
        }
      } catch (e) {
        console.error(e);
      }
    }
  });
}

fixEncoding('src');
