/** Mirroring Vault Pro v4.1 - Ultra Stable **/

function doGet() {
  const tmp = HtmlService.createTemplateFromFile('Index');
  return tmp.evaluate()
    .setTitle('Mirroring Vault Pro')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function startProcess(data) {
  const props = PropertiesService.getScriptProperties();
  props.deleteAllProperties(); 

  const rootFolder = getOrCreateFolder("Mirroring_Vault");
  const sessionFolder = rootFolder.createFolder(data.folderName || "Job_" + new Date().getTime());
  
  let allLinks = [];
  const targetUrl = data.targetUrl.trim();
  const extList = data.fileTypes.split(',').map(e => e.trim().toLowerCase().replace('.', ''));
  
  // Deteksi Direct Link (Case Insensitive)
  const currentExt = targetUrl.split('.').pop().toLowerCase().split(/[?#]/)[0];

  if (extList.includes(currentExt)) {
    allLinks.push(targetUrl);
  } else {
    allLinks = collectAllLinks(targetUrl, data.fileTypes);
  }
  
  if (allLinks.length === 0) return "Gagal: Tidak menemukan file " + data.fileTypes + " di URL tersebut.";

  props.setProperties({
    'FOLDER_ID': sessionFolder.getId(),
    'QUEUE': JSON.stringify(allLinks),
    'TOTAL_COUNT': allLinks.length.toString(),
    'LOGS': JSON.stringify(["📡 Mode: " + (allLinks.length === 1 ? "Direct" : "Batch ("+allLinks.length+" file)") + " dimulai..."]),
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
    if (new Date().getTime() - startTime > 300000) { // 5 Menit limit
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
        logs.push("✅ Selesai: " + decodeURIComponent(name));
      } else {
        logs.push("⚠️ Skip (HTTP " + resp.getResponseCode() + "): " + currentUrl.split('/').pop());
      }
    } catch (e) {
      logs.push("❌ Gagal: " + currentUrl.split('/').pop());
    }

    props.setProperties({
      'QUEUE': JSON.stringify(queue),
      'LOGS': JSON.stringify(logs.slice(-40))
    });
  }

  if (queue.length === 0) {
    props.setProperty('STATUS', 'FINISHED');
    deleteTriggers();
  }
}

function collectAllLinks(url, extensions) {
  try {
    const response = UrlFetchApp.fetch(url, { "headers": { "User-Agent": "Mozilla/5.0" }, "muteHttpExceptions": true });
    const html = response.getContentText();
    const extList = extensions.split(',').map(e => e.trim().toLowerCase().replace('.', ''));
    const regex = /href="([^"]+)"/gi; 
    let matches, links = [];
    const seen = new Set();

    while ((matches = regex.exec(html)) !== null) {
      let link = matches[1];
      if (link.includes('?C=') || link.includes('../')) continue;

      let fullUrl = link;
      if (!link.startsWith('http')) {
        const baseUrl = url.endsWith('/') ? url : url + '/';
        fullUrl = link.startsWith('/') ? url.split('/').slice(0, 3).join('/') + link : baseUrl + link;
      }

      const fileExt = fullUrl.split('.').pop().toLowerCase().split(/[?#]/)[0];
      if (extList.includes(fileExt) && !seen.has(fullUrl)) {
        links.push(fullUrl);
        seen.add(fullUrl);
      }
    }
    return links;
  } catch (e) { return []; }
}

function setStatus(status) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('STATUS', status);
  if (status === 'RUNNING') { createTrigger(); runBatch(); }
  else { deleteTriggers(); }
  return status;
}

function manualKick() {
  const props = PropertiesService.getScriptProperties();
  if(props.getProperty('STATUS') === 'RUNNING') runBatch();
  return "Kicked";
}

function getProgress() {
  const props = PropertiesService.getScriptProperties();
  const queue = JSON.parse(props.getProperty('QUEUE') || "[]");
  return {
    logs: JSON.parse(props.getProperty('LOGS') || "[]"),
    queueCount: queue.length,
    total: parseInt(props.getProperty('TOTAL_COUNT') || 0),
    status: props.getProperty('STATUS') || 'IDLE'
  };
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
