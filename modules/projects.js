const projectData = require("../data/projectData.json");
const sectorData = require("../data/sectorData.json");

// console.log(projectData);
// console.log(sectorData);

let projects = [];

const Initialize = async () => {
  return new Promise((resolve, reject) => {
    try {
      projects = projectData.map((project) => {
        const projectSector = sectorData.find(
          (sector) => project.sector_id == sector.id
        );
        return { ...project, sector: projectSector.sector_name };
      });
      if (projects) {
        resolve();
      } else {
        reject(new Error("Projects not found"));
      }
    } catch (error) {
      reject(error);
    }
  });
};

const getAllProjects = async () => {
  return new Promise((resolve, reject) => {
    if (projects) {
      resolve(projects);
    } else {
      reject(new Error("Projects not found"));
    }
  });
};

const getProjectsById = async (id) => {
  return new Promise((resolve, reject) => {
    const project = projects.find((project) => project.id === id);
    if (project) {
      resolve(project);
    } else {
      reject(new Error("Project not found"));
    }
  });
};

const getProjectsBySector = async (sector) => {
  return new Promise((resolve, reject) => {
    const projectsBySector = projects.filter((project) =>
      project.sector.toLowerCase().includes(sector.toLowerCase())
    );
    if (projectsBySector) {
      resolve(projectsBySector);
    } else {
      reject(new Error("Projects not found"));
    }
  });
};

// const main = async () => {
//   await Initialize();
//   console.log(await getAllProjects());
//   console.log(
//     "-----------------------------------------------------------------------------"
//   );
//   console.log(await getProjectsById(2));
//   console.log(
//     "-----------------------------------------------------------------------------"
//   );
//   console.log(await getProjectsBySector("agriculture"));
// };

// main();

module.exports = {
  Initialize,
  getAllProjects,
  getProjectsById,
  getProjectsBySector,
};
