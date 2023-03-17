function doGet(e) {
  return HtmlService.createHtmlOutputFromFile("frontend.html");
}

function generarNombre(nombre, lenguaje) {
  const hoy = new Date();
  const projectString =
    lenguaje === "es"
      ? "Proyecto de <tipo de proyecto> - Propuesta GCP"
      : "<project type> Project - GCP Proposal";
  return `${nombre} - ${hoy
    .toLocaleDateString()
    .replaceAll("/", "")} - ${projectString}`;
}

function buscarFolderExistente(folderPropuestasId, empresa) {
  const folderPropuestas = DriveApp.getFolderById(folderPropuestasId);
  const folders = folderPropuestas.getFoldersByName(empresa);
  let folderEmpresa;

  while (folders.hasNext()) {
    let folder = folders.next();
    if (folder.getName() == empresa) {
      folderEmpresa = folder;
      break;
    }
  }
  return folderEmpresa;
}

function crearNuevoFolder(folderPropuestasId, empresa) {
  const optionalArgs = { supportsAllDrives: true };
  const resource = {
    title: empresa,
    description: "",
    mimeType: "application/vnd.google-apps.folder",
    parents: [
      {
        id: folderPropuestasId,
      },
    ],
  };
  const nuevoFolder = Drive.Files.insert(resource, null, optionalArgs);
  return nuevoFolder;
}

function crearSlide(slideId, titulo, folderTarget) {
  const slides = DriveApp.getFileById(slideId);
  const slidesCopia = slides.makeCopy();
  slidesCopia.setName(titulo);
  slidesCopia.moveTo(folderTarget);
  return slidesCopia.getUrl();
}

function crearSheet(sheetId, titulo, folderTarget) {
  const sheet = DriveApp.getFileById(sheetId);
  const sheetCopia = sheet.makeCopy();
  sheetCopia.setName(titulo);
  sheetCopia.moveTo(folderTarget);
  return sheetCopia.getUrl();
}

function procesarFormulario(data) {
  const folderPropuestasId =
    PropertiesService.getScriptProperties().getProperty("folderPropuestasId");
  const spanishSlideId =
    PropertiesService.getScriptProperties().getProperty("spanishSlideId");
  const englishSlideId =
    PropertiesService.getScriptProperties().getProperty("englishSlideId");
  const sheetId =
    PropertiesService.getScriptProperties().getProperty("sheetId");
  let urlFolder;
  const nombre = generarNombre(data.empresa, data.lenguaje);
  let folderExistente = buscarFolderExistente(folderPropuestasId, data.empresa);
  if (!folderExistente) {
    folderExistente = crearNuevoFolder(folderPropuestasId, data.empresa);
    Utilities.sleep(100);
  }
  const folderTarget = DriveApp.getFolderById(folderExistente.getId());
  const slideByLanguage =
    data.lenguaje === "es" ? spanishSlideId : englishSlideId;
  crearSlide(slideByLanguage, nombre, folderTarget);
  crearSheet(sheetId, nombre, folderTarget);
  urlFolder = folderTarget.getUrl();
  data.url = urlFolder;
  if (!urlFolder) data.url = "N/A";
  return urlFolder;
}
