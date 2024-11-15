require("dotenv").config();
require("pg");
const Sequelize = require("sequelize");

// const projectData = require("../data/projectData.json");
// const sectorData = require("../data/sectorData.json");

// console.log(projectData);
// console.log(sectorData);

// let projects = [];

const sequelize = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  }
);

const Sector = sequelize.define(
  "Sector",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sector_name: Sequelize.STRING,
  },
  {
    createdAt: false,
    updatedAt: false,
  }
);

const Project = sequelize.define(
  "Project",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: Sequelize.STRING,
    feature_img_url: Sequelize.STRING,
    summary_short: Sequelize.TEXT,
    intro_short: Sequelize.TEXT,
    impact: Sequelize.TEXT,
    original_source_url: Sequelize.STRING,
  },
  {
    createdAt: false,
    updatedAt: false,
  }
);

Project.belongsTo(Sector, { foreignKey: "sector_id" });

const Initialize = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      await sequelize.sync();
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

// return new Promise((resolve, reject) => {
//   try {
//     projects = projectData.map((project) => {
//       const projectSector = sectorData.find(
//         (sector) => project.sector_id == sector.id
//       );
//       return { ...project, sector: projectSector.sector_name };
//     });
//     if (projects) {
//       resolve();
//     } else {
//       reject(new Error("Projects not found"));
//     }
//   } catch (error) {
//     reject(error);
//   }
//   });
// };

const getAllProjects = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await Project.findAll({ include: [Sector] });
      resolve(data);
    } catch (error) {
      reject(new Error("Projects not found"));
    }
  });
};
// return new Promise((resolve, reject) => {
//   if (projects) {
//     resolve(projects);
//   } else {
//     reject(new Error("Projects not found"));
//   }
// });
// };

const getProjectsById = (projectId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await Project.findAll({
        where: { id: projectId },
        include: [Sector],
      });
      resolve(data[0]);
    } catch (error) {
      reject(new Error("Project not found"));
    }
  });
};

// const getProjectsById = async (id) => {
//   return new Promise((resolve, reject) => {
//     const project = projects.find((project) => project.id === id);
//     if (project) {
//       resolve(project);
//     } else {
//       reject(new Error("Project not found"));
//     }
//   });
// };

const getProjectsBySector = async (sector) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await Project.findAll({
        include: [Sector],
        where: {
          "$Sector.sector_name$": {
            [Sequelize.Op.iLike]: `%${sector}%`,
          },
        },
      });
      resolve(data);
    } catch (error) {
      reject(new Error("Projects not found"));
    }
  });
  // const projectsBySector = projects.filter((project) =>
  //   project.sector.toLowerCase().includes(sector.toLowerCase())
  // );
  // if (projectsBySector.length > 0) {
  //   resolve(projectsBySector);
  // } else {
  //   reject(new Error("Projects not found"));
  // }
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

const addProject = async (projectData) => {
  return new Promise(async (resolve, reject) => {
    try {
      await Project.create({
        title: projectData.title,
        sector_id: parseInt(projectData.sector_id),
        feature_img_url: projectData.feature_img_url,
        summary_short: projectData.summary_short,
        intro_short: projectData.intro_short,
        impact: projectData.impact,
        original_source_url: projectData.original_source_url,
      });
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

const getAllSectors = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await Sector.findAll();
      resolve(data);
    } catch (err) {
      reject(err);
    }
  });
};

const editProject = async (id, projectData) => {
  return new Promise(async (resolve, reject) => {
    try {
      await Project.update(
        {
          title: projectData.title,
          sector_id: projectData.sector_id,
          feature_img_url: projectData.feature_img_url,
          summary_short: projectData.summary_short,
          intro_short: projectData.intro_short,
          impact: projectData.impact,
          original_source_url: projectData.original_source_url,
        },
        {
          where: { id: parseInt(id) },
        }
      );

      resolve();
    } catch (err) {
      reject(err);
    }
  });
};
const deleteProject = async (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      await Project.destroy({
        where: { id: parseInt(id) },
      });

      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  Initialize,
  getAllProjects,
  getProjectsById,
  getProjectsBySector,
  addProject,
  getAllSectors,
  editProject,
  deleteProject,
};

// sequelize
//   .sync()
//   .then(async () => {
//     try {
//       await Sector.bulkCreate(sectorData);
//       await Project.bulkCreate(projectData);

//       await sequelize.query(
//         `SELECT setval(pg_get_serial_sequence('"Sectors"', 'id'), (SELECT MAX(id) FROM "Sectors"))`
//       );
//       await sequelize.query(
//         `SELECT setval(pg_get_serial_sequence('"Projects"', 'id'), (SELECT MAX(id) FROM "Projects"))`
//       );

//       console.log("-----");
//       console.log("data inserted successfully");
//     } catch (err) {
//       console.log("-----");
//       console.log(err.message);

//       // NOTE: If you receive the error:

//       // insert or update on table "Projects" violates foreign key constraint "Projects_sector_id_fkey"
//       // it is because you have a "project" in your collection that has a "sector_id" that does not exist in "sectorData".
//       // To fix this, use PgAdmin to delete the newly created "Sectors" and "Projects" tables, fix the error in your .json files and re-run this code
//     }

//     process.exit();
//   })
//   .catch((err) => {
//     console.log("Unable to connect to the database:", err);
//   });
