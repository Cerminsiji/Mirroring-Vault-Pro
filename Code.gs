/** Mirroring Vault Pro
 */

function doGet() {
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('Mirroring Vault Pro')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function startProcess(data) {
  const props = PropertiesService.getScriptProperties();
  props.deleteAllProperties(); 

  const rootFolder = getOrCreateFolder("Mirroring_Vault");
  const sessionFolder = rootFolder.createFolder(data.folderName || "Job_" + new Date().getTime());
  const allLinks = collectAllLinks(data.targetUrl, data.fileTypes);
  
  if (allLinks.length === 0) return "No links found";

  props.setProperties({
    'FOLDER_ID': sessionFolder.getId(),
    'QUEUE': JSON.stringify(allLinks),
    'TOTAL_COUNT': allLinks.length.toString(),
    'LOGS': JSON.stringify(["📡 Menemukan " + allLinks.length + " file. Menyiapkan antrean..."]),
    'STATUS': 'RUNNING'
  });
  
  createTrigger(); 
  return "OK"; 
}

function runBatch() {
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty('STATUS') !== 'RUNNING') return;

  deleteTriggers(); 
  const startTime = new Date().getTime();
  const folder = DriveApp.getFolderById(props.getProperty('FOLDER_ID'));
  
  let queue = JSON.parse(props.getProperty('QUEUE') || "[]");
  let logs = JSON.parse(props.getProperty('LOGS') || "[]");

  const options = {
    "headers": { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    "followRedirects": true, "muteHttpExceptions": true
  };

  while (queue.length > 0) {
    if (PropertiesService.getScriptProperties().getProperty('STATUS') !== 'RUNNING') break;
    
    // Safety Break (5 menit)
    if (new Date().getTime() - startTime > 300000) {
      props.setProperties({'QUEUE': JSON.stringify(queue), 'LOGS': JSON.stringify(logs)});
      createTrigger();
      return;
    }

    let currentUrl = queue.shift();
    try {
      const resp = UrlFetchApp.fetch(currentUrl, options);
      if (resp.getResponseCode() === 200) {
        let name = currentUrl.split('/').pop().split(/[?#]/)[0] || "file_" + new Date().getTime();
        folder.createFile(resp.getBlob().setName(decodeURIComponent(name)));
        logs.push("✅ Selesai: " + name);
      }
    } catch (e) {
      logs.push("❌ Gagal: " + currentUrl.split('/').pop());
    }

    // Push update ke properties agar UI bisa baca secara live
    props.setProperties({
      'QUEUE': JSON.stringify(queue),
      'LOGS': JSON.stringify(logs.slice(-40))
    });
  }

  if (queue.length === 0) {
    props.setProperties({'STATUS': 'FINISHED'});
    deleteTriggers();
  }
}

// Tombol Manual Kickstart & Resume
function manualKick() {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('STATUS', 'RUNNING');
  runBatch();
  return "Mesin Dipacu Manual";
}

function setStatus(status) {
  PropertiesService.getScriptProperties().setProperty('STATUS', status);
  if (status === 'RUNNING') {
    createTrigger();
    runBatch();
  } else {
    deleteTriggers();
  }
  return status;
}

function getProgress() {
  const props = PropertiesService.getScriptProperties();
  return {
    logs: JSON.parse(props.getProperty('LOGS') || "[]"),
    queueCount: JSON.parse(props.getProperty('QUEUE') || "[]").length,
    total: parseInt(props.getProperty('TOTAL_COUNT') || 0),
    status: props.getProperty('STATUS') || 'IDLE'
  };
}

// Scraper Logic (Sama seperti sebelumnya)
function collectAllLinks(url, extensions) {
  const html = UrlFetchApp.fetch(url, { "headers": { "User-Agent": "Mozilla/5.0" } }).getContentText();
  const extList = extensions.split(',').map(e => e.trim().toLowerCase());
  const regex = /href="([^"]+)"/g;
  let matches, links = [];
  while ((matches = regex.exec(html)) !== null) {
    let link = matches[1];
    if (!link.startsWith('http')) {
      const base = url.split('/').slice(0, 3).join('/');
      link = link.startsWith('/') ? base + link : url.split('/').slice(0, -1).join('/') + '/' + link;
    }
    if (link.includes('/web/')) { // Archive.org fix
       let p = link.split('/'); let i = p.findIndex(x => x.startsWith('http'));
       if (i !== -1) link = p.slice(i).join('/');
    }
    const ext = link.split('.').pop().toLowerCase().split(/[?#]/)[0];
    if (extList.includes(ext)) links.push(link);
  }
  return [...new Set(links)];
}

function createTrigger() {
  deleteTriggers();
  ScriptApp.newTrigger('runBatch').timeBased().after(1000).create();
}
function deleteTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
}
function getOrCreateFolder(name) {
  const f = DriveApp.getFoldersByName(name);
  return f.hasNext() ? f.next() : DriveApp.createFolder(name);
}
