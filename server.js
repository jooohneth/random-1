/********************************************************************************
 * BTI325 – Assignment 02
 *
 * I declare that this assignment is my own work in accordance with Seneca's
 * Academic Integrity Policy:
 *
 * https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
 *
 * Name: Thai Zyong Nguyen  Student ID: 153467220 Date: Sep 22, 2024
 *
 ********************************************************************************/

const projectData = require("./modules/projects");
const express = require("express");
const path = require("path");

const app = express();
const HTTP_PORT = 3000;

const main = async () => {
  await projectData.Initialize();

  app.listen(HTTP_PORT, () =>
    console.log(`listening: http://localhost:${HTTP_PORT}/`)
  );

  app.use(express.static(path.join(__dirname, "/public")));

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/home.html"));
  });

  app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"));
  });

  app.get("/solutions/projects", async (req, res) => {
    try {
      const sector = req.query.sector;
      if (sector) {
        const projectsBySector = await projectData.getProjectsBySector(sector);
        throw new Error(sector);
        res.json(projectsBySector);
      } else {
        const allProjects = await projectData.getAllProjects();
        res.json(allProjects);
      }
    } catch (error) {
      res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
    }
  });

  app.get("/solutions/projects/:id", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await projectData.getProjectsById(projectId);
      if (!project) {
        throw new Error("Project not found");
      }
      res.json(project);
    } catch (error) {
      res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
    }
  });

  // app.get("/solutions/projects/sector-demo", async (req, res) => {
  //   try {
  //     res.send(await projectData.getProjectsBySector("ind"));
  //   } catch (error) {
  //     res.send(new Error("Something went wrong"));
  //   }
  // });
};

main();
